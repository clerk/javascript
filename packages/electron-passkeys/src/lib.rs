//! Native passkey (WebAuthn) support for Electron, exposed through napi-rs.
//!
//! Ceremony failures resolve to a JSON result envelope instead of rejecting, so
//! JS callers can handle user-facing WebAuthn failures without try/catch.
//! Invalid input uses the same error envelope.

#![deny(clippy::all)]

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use napi::bindgen_prelude::Buffer;
use napi_derive::napi;
use serde::Deserialize;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

// Binary fields are base64url without padding. Some fields are platform-specific,
// but the wire contract stays the same across targets.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RpEntity {
    pub id: String,
    #[allow(dead_code)]
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserEntity {
    /// base64url-encoded user handle.
    pub id: String,
    #[serde(default)]
    pub display_name: Option<String>,
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PubKeyCredParam {
    #[serde(rename = "type", default)]
    pub _type: Option<String>,
    pub alg: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AuthenticatorSelection {
    #[serde(default)]
    pub authenticator_attachment: Option<String>,
    #[serde(default)]
    pub require_resident_key: Option<bool>,
    #[serde(default)]
    pub resident_key: Option<String>,
    #[serde(default)]
    pub user_verification: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CredentialDescriptor {
    #[serde(rename = "type", default)]
    pub _type: Option<String>,
    /// base64url-encoded credential id.
    pub id: String,
    #[allow(dead_code)]
    #[serde(default)]
    pub transports: Option<Vec<String>>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreationOptions {
    pub rp: RpEntity,
    pub user: UserEntity,
    /// base64url-encoded challenge.
    pub challenge: String,
    #[serde(default)]
    pub pub_key_cred_params: Option<Vec<PubKeyCredParam>>,
    #[allow(dead_code)]
    #[serde(default)]
    pub timeout: Option<u32>,
    #[serde(default)]
    pub authenticator_selection: Option<AuthenticatorSelection>,
    #[serde(default)]
    pub attestation: Option<String>,
    #[serde(default)]
    pub exclude_credentials: Option<Vec<CredentialDescriptor>>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RequestOptions {
    /// base64url-encoded challenge.
    pub challenge: String,
    pub rp_id: String,
    #[allow(dead_code)]
    #[serde(default)]
    pub timeout: Option<u32>,
    #[serde(default)]
    pub user_verification: Option<String>,
    #[serde(default)]
    pub allow_credentials: Option<Vec<CredentialDescriptor>>,
}

pub(crate) fn ok_envelope(credential: serde_json::Value) -> String {
    serde_json::json!({ "ok": true, "credential": credential }).to_string()
}

pub(crate) fn err_envelope(code: &str, message: &str) -> String {
    serde_json::json!({
        "ok": false,
        "error": { "code": code, "message": message },
    })
    .to_string()
}

pub(crate) fn b64url_encode(bytes: &[u8]) -> String {
    URL_SAFE_NO_PAD.encode(bytes)
}

pub(crate) fn b64url_decode(input: &str) -> Result<Vec<u8>, base64::DecodeError> {
    URL_SAFE_NO_PAD.decode(input.trim_end_matches('='))
}

/// Reads the native pointer from Electron's `BrowserWindow#getNativeWindowHandle()`.
#[allow(dead_code)]
pub(crate) fn window_handle_from_bytes(bytes: &[u8]) -> Option<usize> {
    const PTR_LEN: usize = std::mem::size_of::<usize>();
    if bytes.len() < PTR_LEN {
        return None;
    }
    let mut raw = [0u8; PTR_LEN];
    raw.copy_from_slice(&bytes[..PTR_LEN]);
    Some(usize::from_le_bytes(raw))
}

#[napi(object)]
pub struct Capabilities {
    pub platform_authenticator: bool,
    pub security_keys: bool,
}

#[napi]
pub fn is_available() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::is_available()
    }
    #[cfg(target_os = "windows")]
    {
        windows::is_available()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

#[napi]
pub fn capabilities() -> Capabilities {
    #[cfg(target_os = "macos")]
    {
        let (platform_authenticator, security_keys) = macos::capabilities();
        Capabilities {
            platform_authenticator,
            security_keys,
        }
    }
    #[cfg(target_os = "windows")]
    {
        let (platform_authenticator, security_keys) = windows::capabilities();
        Capabilities {
            platform_authenticator,
            security_keys,
        }
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Capabilities {
            platform_authenticator: false,
            security_keys: false,
        }
    }
}

#[napi]
pub async fn create_credential(window_handle: Buffer, options_json: String) -> napi::Result<String> {
    // Do not hold JS-owned memory across await points or threads.
    let handle_bytes = window_handle.to_vec();
    Ok(create_credential_impl(handle_bytes, options_json).await)
}

#[napi]
pub async fn get_credential(window_handle: Buffer, options_json: String) -> napi::Result<String> {
    let handle_bytes = window_handle.to_vec();
    Ok(get_credential_impl(handle_bytes, options_json).await)
}

#[allow(unused_variables)]
async fn create_credential_impl(handle_bytes: Vec<u8>, options_json: String) -> String {
    let handle = match window_handle_from_bytes(&handle_bytes) {
        Some(h) => h,
        None => return err_envelope("unknown", "Invalid window handle buffer"),
    };
    let options: CreationOptions = match serde_json::from_str(&options_json) {
        Ok(o) => o,
        Err(e) => return err_envelope("unknown", &format!("Failed to parse creation options: {e}")),
    };

    #[cfg(target_os = "macos")]
    {
        macos::create_credential(handle, options).await
    }
    #[cfg(target_os = "windows")]
    {
        windows::create_credential(handle, options).await
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        err_envelope(
            "not_supported",
            "Native passkeys are not supported on this platform",
        )
    }
}

#[allow(unused_variables)]
async fn get_credential_impl(handle_bytes: Vec<u8>, options_json: String) -> String {
    let handle = match window_handle_from_bytes(&handle_bytes) {
        Some(h) => h,
        None => return err_envelope("unknown", "Invalid window handle buffer"),
    };
    let options: RequestOptions = match serde_json::from_str(&options_json) {
        Ok(o) => o,
        Err(e) => return err_envelope("unknown", &format!("Failed to parse request options: {e}")),
    };

    #[cfg(target_os = "macos")]
    {
        macos::get_credential(handle, options).await
    }
    #[cfg(target_os = "windows")]
    {
        windows::get_credential(handle, options).await
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        err_envelope(
            "not_supported",
            "Native passkeys are not supported on this platform",
        )
    }
}
