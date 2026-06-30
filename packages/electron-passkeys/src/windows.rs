//! Windows passkey ceremonies via the WebAuthn API (webauthn.dll).
//!
//! WebAuthN* calls block while the system dialog is open, so ceremonies run in
//! `spawn_blocking`. The HWND is only used as the dialog owner and can be
//! passed from that worker thread.

use std::ffi::c_void;

use windows::core::{w, BOOL, PCWSTR};
use windows::Win32::Foundation::HWND;
use windows::Win32::Networking::WindowsWebServices::{
    WebAuthNAuthenticatorGetAssertion, WebAuthNAuthenticatorMakeCredential, WebAuthNFreeAssertion,
    WebAuthNFreeCredentialAttestation, WebAuthNGetApiVersionNumber, WebAuthNGetErrorName,
    WebAuthNIsUserVerifyingPlatformAuthenticatorAvailable, WEBAUTHN_AUTHENTICATOR_GET_ASSERTION_OPTIONS,
    WEBAUTHN_AUTHENTICATOR_MAKE_CREDENTIAL_OPTIONS, WEBAUTHN_CLIENT_DATA, WEBAUTHN_COSE_CREDENTIAL_PARAMETER,
    WEBAUTHN_COSE_CREDENTIAL_PARAMETERS, WEBAUTHN_CREDENTIAL_EX, WEBAUTHN_CREDENTIAL_LIST,
    WEBAUTHN_RP_ENTITY_INFORMATION, WEBAUTHN_USER_ENTITY_INFORMATION,
};
use windows::Win32::System::LibraryLoader::LoadLibraryW;

use crate::{b64url_decode, b64url_encode, err_envelope, ok_envelope, CreationOptions, RequestOptions};

// WebAuthn API constants from <webauthn.h>, defined here to avoid binding renames.
const CLIENT_DATA_VERSION_1: u32 = 1;
const RP_ENTITY_VERSION_1: u32 = 1;
const USER_ENTITY_VERSION_1: u32 = 1;
const COSE_PARAMETER_VERSION_1: u32 = 1;
const CREDENTIAL_EX_VERSION_1: u32 = 1;
/// Matches WEBAUTHN_AUTHENTICATOR_MAKE_CREDENTIAL_OPTIONS v3; newer fields stay zeroed.
const MAKE_CREDENTIAL_OPTIONS_VERSION_3: u32 = 3;
/// Matches WEBAUTHN_AUTHENTICATOR_GET_ASSERTION_OPTIONS v4; newer fields stay zeroed.
const GET_ASSERTION_OPTIONS_VERSION_4: u32 = 4;

const ATTACHMENT_ANY: u32 = 0;
const ATTACHMENT_PLATFORM: u32 = 1;
const ATTACHMENT_CROSS_PLATFORM: u32 = 2;

const UV_ANY: u32 = 0;
const UV_REQUIRED: u32 = 1;
const UV_PREFERRED: u32 = 2;
const UV_DISCOURAGED: u32 = 3;

const ATTESTATION_ANY: u32 = 0;
const ATTESTATION_NONE: u32 = 1;
const ATTESTATION_INDIRECT: u32 = 2;
const ATTESTATION_DIRECT: u32 = 3;

// dwUsedTransport bit flags.
const TRANSPORT_USB: u32 = 0x1;
const TRANSPORT_NFC: u32 = 0x2;
const TRANSPORT_BLE: u32 = 0x4;
const TRANSPORT_INTERNAL: u32 = 0x10;
const TRANSPORT_HYBRID: u32 = 0x20;

// HRESULTs of interest.
const E_CANCELLED: u32 = 0x800704C7; // ERROR_CANCELLED
const NTE_USER_CANCELLED: u32 = 0x80090036;
const E_TIMEOUT: u32 = 0x800705B4; // ERROR_TIMEOUT

pub(crate) fn is_available() -> bool {
    // webauthn.dll exists on Windows 10 1903+. If it is missing the import
    // can't be satisfied at all, so probe with LoadLibrary first.
    if unsafe { LoadLibraryW(w!("webauthn.dll")) }.is_err() {
        return false;
    }
    (unsafe { WebAuthNGetApiVersionNumber() }) >= 1
}

pub(crate) fn capabilities() -> (bool, bool) {
    if !is_available() {
        return (false, false);
    }
    let platform = unsafe { WebAuthNIsUserVerifyingPlatformAuthenticatorAvailable() }
        .map(|b| b.as_bool())
        .unwrap_or(false);
    (platform, true)
}

/// NUL-terminated UTF-16 buffer; must stay alive while its PCWSTR is in use.
fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

fn pcwstr(buf: &[u16]) -> PCWSTR {
    PCWSTR(buf.as_ptr())
}

fn bytes_from_raw(ptr: *mut u8, len: u32) -> Vec<u8> {
    if ptr.is_null() || len == 0 {
        return Vec::new();
    }
    unsafe { std::slice::from_raw_parts(ptr, len as usize) }.to_vec()
}

/// The caller constructs clientDataJSON on Windows; the OS hashes it with the
/// algorithm named in WEBAUTHN_CLIENT_DATA.
fn build_client_data_json(ceremony_type: &str, challenge_b64url: &str, rp_id: &str) -> Vec<u8> {
    serde_json::json!({
        "type": ceremony_type,
        "challenge": challenge_b64url,
        "origin": format!("https://{rp_id}"),
        "crossOrigin": false,
    })
    .to_string()
    .into_bytes()
}

fn map_user_verification(value: Option<&str>) -> u32 {
    match value {
        Some("required") => UV_REQUIRED,
        Some("preferred") => UV_PREFERRED,
        Some("discouraged") => UV_DISCOURAGED,
        _ => UV_ANY,
    }
}

fn transports_from_mask(mask: u32) -> Vec<&'static str> {
    let mut out = Vec::new();
    if mask & TRANSPORT_USB != 0 {
        out.push("usb");
    }
    if mask & TRANSPORT_NFC != 0 {
        out.push("nfc");
    }
    if mask & TRANSPORT_BLE != 0 {
        out.push("ble");
    }
    if mask & TRANSPORT_INTERNAL != 0 {
        out.push("internal");
    }
    if mask & TRANSPORT_HYBRID != 0 {
        out.push("hybrid");
    }
    out
}

fn attachment_from_mask(mask: u32) -> &'static str {
    if mask & TRANSPORT_INTERNAL != 0 {
        "platform"
    } else {
        "cross-platform"
    }
}

fn map_error(error: &windows::core::Error) -> (String, String) {
    let hr = error.code();
    let hr_u32 = hr.0 as u32;
    let message = error.message();

    if hr_u32 == E_CANCELLED || hr_u32 == NTE_USER_CANCELLED {
        return ("cancelled".to_string(), message);
    }
    if hr_u32 == E_TIMEOUT {
        return ("timeout".to_string(), message);
    }

    // WebAuthNGetErrorName maps HRESULTs to WebAuthn DOMException names.
    let name = unsafe { WebAuthNGetErrorName(hr) };
    let name = if name.is_null() {
        String::new()
    } else {
        unsafe { name.to_string() }.unwrap_or_default()
    };
    let code = match name.as_str() {
        "NotAllowedError" => "cancelled",
        "SecurityError" => "invalid_rp",
        "NotSupportedError" | "ConstraintError" => "not_supported",
        _ => "unknown",
    };
    (code.to_string(), message)
}

/// Owns the buffers behind a WEBAUTHN_CREDENTIAL_LIST so the pointers stay
/// valid for the duration of the FFI call.
struct CredentialList {
    _ids: Vec<Vec<u8>>,
    _credentials: Vec<WEBAUTHN_CREDENTIAL_EX>,
    pointers: Vec<*mut WEBAUTHN_CREDENTIAL_EX>,
    list: WEBAUTHN_CREDENTIAL_LIST,
}

fn build_credential_list(
    creds: &[crate::CredentialDescriptor],
) -> Result<Option<Box<CredentialList>>, (String, String)> {
    if creds.is_empty() {
        return Ok(None);
    }
    let mut ids: Vec<Vec<u8>> = Vec::with_capacity(creds.len());
    for cred in creds {
        let id = b64url_decode(&cred.id).map_err(|e| {
            (
                "unknown".to_string(),
                format!("Invalid base64url credential id: {e}"),
            )
        })?;
        ids.push(id);
    }
    let mut credentials: Vec<WEBAUTHN_CREDENTIAL_EX> = ids
        .iter()
        .map(|id| WEBAUTHN_CREDENTIAL_EX {
            dwVersion: CREDENTIAL_EX_VERSION_1,
            cbId: id.len() as u32,
            pbId: id.as_ptr() as *mut u8,
            pwszCredentialType: w!("public-key"),
            // 0 == no transport restriction.
            dwTransports: 0,
        })
        .collect();
    let pointers: Vec<*mut WEBAUTHN_CREDENTIAL_EX> = credentials
        .iter_mut()
        .map(|c| c as *mut WEBAUTHN_CREDENTIAL_EX)
        .collect();

    let mut boxed = Box::new(CredentialList {
        _ids: ids,
        _credentials: credentials,
        pointers,
        list: WEBAUTHN_CREDENTIAL_LIST {
            cCredentials: 0,
            ppCredentials: std::ptr::null_mut(),
        },
    });
    boxed.list = WEBAUTHN_CREDENTIAL_LIST {
        cCredentials: boxed.pointers.len() as u32,
        ppCredentials: boxed.pointers.as_mut_ptr(),
    };
    Ok(Some(boxed))
}

pub(crate) async fn create_credential(handle: usize, options: CreationOptions) -> String {
    tokio::task::spawn_blocking(move || make_credential_blocking(handle, &options))
        .await
        .unwrap_or_else(|e| err_envelope("unknown", &format!("Passkey task failed: {e}")))
}

pub(crate) async fn get_credential(handle: usize, options: RequestOptions) -> String {
    tokio::task::spawn_blocking(move || get_assertion_blocking(handle, &options))
        .await
        .unwrap_or_else(|e| err_envelope("unknown", &format!("Passkey task failed: {e}")))
}

fn make_credential_blocking(handle: usize, options: &CreationOptions) -> String {
    let hwnd = HWND(handle as *mut c_void);

    let challenge = match b64url_decode(&options.challenge) {
        Ok(c) => c,
        Err(e) => return err_envelope("unknown", &format!("Invalid base64url challenge: {e}")),
    };
    let user_id = match b64url_decode(&options.user.id) {
        Ok(u) => u,
        Err(e) => return err_envelope("unknown", &format!("Invalid base64url user id: {e}")),
    };

    // Keep every wide-string buffer alive until after the FFI call.
    let rp_id_w = wide(&options.rp.id);
    let rp_name_w = wide(options.rp.name.as_deref().unwrap_or(&options.rp.id));
    let user_name_w = wide(
        options
            .user
            .name
            .as_deref()
            .or(options.user.display_name.as_deref())
            .unwrap_or(""),
    );
    let display_name_w = wide(
        options
            .user
            .display_name
            .as_deref()
            .or(options.user.name.as_deref())
            .unwrap_or(""),
    );

    let rp = WEBAUTHN_RP_ENTITY_INFORMATION {
        dwVersion: RP_ENTITY_VERSION_1,
        pwszId: pcwstr(&rp_id_w),
        pwszName: pcwstr(&rp_name_w),
        pwszIcon: PCWSTR::null(),
    };
    let user = WEBAUTHN_USER_ENTITY_INFORMATION {
        dwVersion: USER_ENTITY_VERSION_1,
        cbId: user_id.len() as u32,
        pbId: user_id.as_ptr() as *mut u8,
        pwszName: pcwstr(&user_name_w),
        pwszIcon: PCWSTR::null(),
        pwszDisplayName: pcwstr(&display_name_w),
    };

    let algorithms: Vec<i64> = options
        .pub_key_cred_params
        .as_deref()
        .map(|params| params.iter().map(|p| p.alg).collect::<Vec<_>>())
        .filter(|algs| !algs.is_empty())
        .unwrap_or_else(|| vec![-7 /* ES256 */, -257 /* RS256 */]);
    let cose_params: Vec<WEBAUTHN_COSE_CREDENTIAL_PARAMETER> = algorithms
        .iter()
        .map(|alg| WEBAUTHN_COSE_CREDENTIAL_PARAMETER {
            dwVersion: COSE_PARAMETER_VERSION_1,
            pwszCredentialType: w!("public-key"),
            lAlg: *alg as i32,
        })
        .collect();
    let cose = WEBAUTHN_COSE_CREDENTIAL_PARAMETERS {
        cCredentialParameters: cose_params.len() as u32,
        pCredentialParameters: cose_params.as_ptr() as *mut WEBAUTHN_COSE_CREDENTIAL_PARAMETER,
    };

    let challenge_b64 = b64url_encode(&challenge);
    let client_data_json = build_client_data_json("webauthn.create", &challenge_b64, &options.rp.id);
    let client_data = WEBAUTHN_CLIENT_DATA {
        dwVersion: CLIENT_DATA_VERSION_1,
        cbClientDataJSON: client_data_json.len() as u32,
        pbClientDataJSON: client_data_json.as_ptr() as *mut u8,
        pwszHashAlgId: w!("SHA-256"),
    };

    let selection = options.authenticator_selection.as_ref();
    let attachment = match selection.and_then(|s| s.authenticator_attachment.as_deref()) {
        Some("platform") => ATTACHMENT_PLATFORM,
        Some("cross-platform") => ATTACHMENT_CROSS_PLATFORM,
        _ => ATTACHMENT_ANY,
    };
    let require_resident_key = selection
        .and_then(|s| s.require_resident_key)
        .or_else(|| selection.and_then(|s| s.resident_key.as_deref().map(|rk| rk == "required")))
        .unwrap_or(false);
    let attestation = match options.attestation.as_deref() {
        Some("none") => ATTESTATION_NONE,
        Some("indirect") => ATTESTATION_INDIRECT,
        Some("direct") | Some("enterprise") => ATTESTATION_DIRECT,
        _ => ATTESTATION_ANY,
    };

    let exclude_list = match build_credential_list(options.exclude_credentials.as_deref().unwrap_or(&[])) {
        Ok(list) => list,
        Err((code, message)) => return err_envelope(&code, &message),
    };

    let mut make_options = WEBAUTHN_AUTHENTICATOR_MAKE_CREDENTIAL_OPTIONS {
        dwVersion: MAKE_CREDENTIAL_OPTIONS_VERSION_3,
        dwTimeoutMilliseconds: options.timeout.unwrap_or(60_000),
        dwAuthenticatorAttachment: attachment,
        bRequireResidentKey: BOOL::from(require_resident_key),
        dwUserVerificationRequirement: map_user_verification(
            selection.and_then(|s| s.user_verification.as_deref()),
        ),
        dwAttestationConveyancePreference: attestation,
        ..Default::default()
    };
    if let Some(list) = exclude_list.as_deref() {
        make_options.pExcludeCredentialList =
            &list.list as *const WEBAUTHN_CREDENTIAL_LIST as *mut WEBAUTHN_CREDENTIAL_LIST;
    }

    let result = unsafe {
        WebAuthNAuthenticatorMakeCredential(hwnd, &rp, &user, &cose, &client_data, Some(&make_options))
    };

    match result {
        Ok(attestation_ptr) => {
            if attestation_ptr.is_null() {
                return err_envelope("unknown", "WebAuthn returned a null attestation");
            }
            let envelope = {
                let att = unsafe { &*attestation_ptr };
                let credential_id = bytes_from_raw(att.pbCredentialId, att.cbCredentialId);
                let attestation_object = bytes_from_raw(att.pbAttestationObject, att.cbAttestationObject);
                let id = b64url_encode(&credential_id);
                ok_envelope(serde_json::json!({
                    "id": id,
                    "rawId": id,
                    "type": "public-key",
                    "authenticatorAttachment": attachment_from_mask(att.dwUsedTransport),
                    "response": {
                        "clientDataJSON": b64url_encode(&client_data_json),
                        "attestationObject": b64url_encode(&attestation_object),
                        "transports": transports_from_mask(att.dwUsedTransport),
                    },
                }))
            };
            unsafe { WebAuthNFreeCredentialAttestation(Some(attestation_ptr)) };
            envelope
        }
        Err(error) => {
            let (code, message) = map_error(&error);
            err_envelope(&code, &message)
        }
    }
}

fn get_assertion_blocking(handle: usize, options: &RequestOptions) -> String {
    let hwnd = HWND(handle as *mut c_void);

    let challenge = match b64url_decode(&options.challenge) {
        Ok(c) => c,
        Err(e) => return err_envelope("unknown", &format!("Invalid base64url challenge: {e}")),
    };

    let rp_id_w = wide(&options.rp_id);
    let challenge_b64 = b64url_encode(&challenge);
    let client_data_json = build_client_data_json("webauthn.get", &challenge_b64, &options.rp_id);
    let client_data = WEBAUTHN_CLIENT_DATA {
        dwVersion: CLIENT_DATA_VERSION_1,
        cbClientDataJSON: client_data_json.len() as u32,
        pbClientDataJSON: client_data_json.as_ptr() as *mut u8,
        pwszHashAlgId: w!("SHA-256"),
    };

    let allow_list = match build_credential_list(options.allow_credentials.as_deref().unwrap_or(&[])) {
        Ok(list) => list,
        Err((code, message)) => return err_envelope(&code, &message),
    };

    let mut assertion_options = WEBAUTHN_AUTHENTICATOR_GET_ASSERTION_OPTIONS {
        dwVersion: GET_ASSERTION_OPTIONS_VERSION_4,
        dwTimeoutMilliseconds: options.timeout.unwrap_or(60_000),
        dwAuthenticatorAttachment: ATTACHMENT_ANY,
        dwUserVerificationRequirement: map_user_verification(options.user_verification.as_deref()),
        ..Default::default()
    };
    if let Some(list) = allow_list.as_deref() {
        assertion_options.pAllowCredentialList =
            &list.list as *const WEBAUTHN_CREDENTIAL_LIST as *mut WEBAUTHN_CREDENTIAL_LIST;
    }

    let result = unsafe {
        WebAuthNAuthenticatorGetAssertion(hwnd, pcwstr(&rp_id_w), &client_data, Some(&assertion_options))
    };

    match result {
        Ok(assertion_ptr) => {
            if assertion_ptr.is_null() {
                return err_envelope("unknown", "WebAuthn returned a null assertion");
            }
            let envelope = {
                let assertion = unsafe { &*assertion_ptr };
                let credential_id = bytes_from_raw(assertion.Credential.pbId, assertion.Credential.cbId);
                let authenticator_data =
                    bytes_from_raw(assertion.pbAuthenticatorData, assertion.cbAuthenticatorData);
                let signature = bytes_from_raw(assertion.pbSignature, assertion.cbSignature);
                let user_handle = bytes_from_raw(assertion.pbUserId, assertion.cbUserId);

                let id = b64url_encode(&credential_id);
                let mut response = serde_json::json!({
                    "clientDataJSON": b64url_encode(&client_data_json),
                    "authenticatorData": b64url_encode(&authenticator_data),
                    "signature": b64url_encode(&signature),
                });
                if !user_handle.is_empty() {
                    response["userHandle"] = serde_json::Value::String(b64url_encode(&user_handle));
                }
                ok_envelope(serde_json::json!({
                    "id": id,
                    "rawId": id,
                    "type": "public-key",
                    "authenticatorAttachment": attachment_from_mask(assertion.dwUsedTransport),
                    "response": response,
                }))
            };
            unsafe { WebAuthNFreeAssertion(assertion_ptr) };
            envelope
        }
        Err(error) => {
            let (code, message) = map_error(&error);
            err_envelope(&code, &message)
        }
    }
}
