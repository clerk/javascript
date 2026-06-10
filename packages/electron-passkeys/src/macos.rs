//! macOS passkey ceremonies via the AuthenticationServices framework.
//!
//! AuthenticationServices requires `performRequests` on the main thread. The
//! napi async entrypoints dispatch setup to the libdispatch main queue, then
//! await a oneshot resolved by the authorization delegate.

use std::cell::RefCell;
use std::ffi::c_void;

use objc2::rc::Retained;
use objc2::runtime::{AnyObject, ProtocolObject};
use objc2::{
    class, define_class, msg_send, sel, AnyThread, DefinedClass, MainThreadMarker, MainThreadOnly, Message,
};
use objc2_app_kit::{NSView, NSWindow};
use objc2_authentication_services::{
    ASAuthorization, ASAuthorizationController, ASAuthorizationControllerDelegate,
    ASAuthorizationControllerPresentationContextProviding,
    ASAuthorizationPlatformPublicKeyCredentialDescriptor, ASAuthorizationPlatformPublicKeyCredentialProvider,
    ASAuthorizationPublicKeyCredentialParameters, ASAuthorizationRequest,
    ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor,
    ASAuthorizationSecurityKeyPublicKeyCredentialProvider, ASPresentationAnchor,
};
use objc2_foundation::{
    NSArray, NSData, NSError, NSObject, NSObjectProtocol, NSOperatingSystemVersion, NSProcessInfo, NSString,
};
use tokio::sync::oneshot;

use crate::{b64url_decode, b64url_encode, err_envelope, ok_envelope, CreationOptions, RequestOptions};

/// Outcome of a ceremony: a credential JSON value, or an (error code, message) pair.
type CeremonyResult = Result<serde_json::Value, (String, String)>;

pub(crate) fn is_available() -> bool {
    // ASAuthorizationPlatformPublicKeyCredentialProvider is macOS 12+.
    let version = NSOperatingSystemVersion {
        majorVersion: 12,
        minorVersion: 0,
        patchVersion: 0,
    };
    NSProcessInfo::processInfo().isOperatingSystemAtLeastVersion(version)
}

pub(crate) fn capabilities() -> (bool, bool) {
    let available = is_available();
    // Security keys are supported through the same OS sheet whenever the
    // passkey API itself is available.
    (available, available)
}

// Raw libdispatch C ABI; `_dispatch_main_q` is the symbol behind
// `dispatch_get_main_queue()`.

#[repr(C)]
struct DispatchQueueOpaque {
    _private: [u8; 0],
}

extern "C" {
    static _dispatch_main_q: DispatchQueueOpaque;
    fn dispatch_async_f(
        queue: *const DispatchQueueOpaque,
        context: *mut c_void,
        work: extern "C" fn(*mut c_void),
    );
}

fn dispatch_to_main(f: impl FnOnce() + Send + 'static) {
    extern "C" fn trampoline(context: *mut c_void) {
        // Re-box the closure and run it. Never let a panic unwind across the
        // C trampoline frame.
        let closure = unsafe { Box::from_raw(context.cast::<Box<dyn FnOnce() + Send + 'static>>()) };
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(move || (*closure)()));
    }

    let boxed: Box<dyn FnOnce() + Send + 'static> = Box::new(f);
    let context = Box::into_raw(Box::new(boxed)).cast::<c_void>();
    unsafe { dispatch_async_f(std::ptr::addr_of!(_dispatch_main_q), context, trampoline) };
}

// ASAuthorizationController keeps weak references to its delegate and
// presentation provider, so active ceremonies retain their delegate in a
// main-thread registry until completion.
thread_local! {
    static ACTIVE_DELEGATES: RefCell<Vec<Retained<CeremonyDelegate>>> = const { RefCell::new(Vec::new()) };
}

struct DelegateIvars {
    window: Retained<NSWindow>,
    sender: RefCell<Option<oneshot::Sender<CeremonyResult>>>,
    // Strong reference for the weak delegate/presentation-provider relationship.
    controller: RefCell<Option<Retained<ASAuthorizationController>>>,
}

define_class!(
    // SAFETY:
    // - NSObject has no subclassing requirements.
    // - `CeremonyDelegate` does not implement `Drop`.
    // MainThreadOnly is required by ASAuthorizationControllerPresentationContextProviding.
    #[unsafe(super(NSObject))]
    #[thread_kind = MainThreadOnly]
    #[name = "ClerkElectronPasskeysDelegate"]
    #[ivars = DelegateIvars]
    struct CeremonyDelegate;

    unsafe impl NSObjectProtocol for CeremonyDelegate {}

    unsafe impl ASAuthorizationControllerDelegate for CeremonyDelegate {
        #[unsafe(method(authorizationController:didCompleteWithAuthorization:))]
        fn did_complete_with_authorization(
            &self,
            _controller: &ASAuthorizationController,
            authorization: &ASAuthorization,
        ) {
            let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| unsafe {
                let credential = authorization.credential();
                // SAFETY: ProtocolObject wraps a plain Objective-C object, so
                // reinterpreting the pointer as AnyObject is valid. We only
                // use it for `isKindOfClass:` checks and dynamic getters.
                let obj: &AnyObject = &*(Retained::as_ptr(&credential) as *const AnyObject);
                credential_to_json(obj)
            }))
            .unwrap_or_else(|_| {
                Err((
                    "unknown".to_string(),
                    "Panic while reading credential".to_string(),
                ))
            });
            self.complete(result);
        }

        #[unsafe(method(authorizationController:didCompleteWithError:))]
        fn did_complete_with_error(&self, _controller: &ASAuthorizationController, error: &NSError) {
            let (code, message) = map_nserror(error);
            self.complete(Err((code, message)));
        }
    }

    unsafe impl ASAuthorizationControllerPresentationContextProviding for CeremonyDelegate {
        #[unsafe(method_id(presentationAnchorForAuthorizationController:))]
        fn presentation_anchor(
            &self,
            _controller: &ASAuthorizationController,
        ) -> Retained<ASPresentationAnchor> {
            // ASPresentationAnchor is NSWindow on macOS, but the generated
            // bindings alias it to NSObject; upcast the window accordingly.
            let window = self.ivars().window.clone();
            unsafe { Retained::cast_unchecked::<ASPresentationAnchor>(window) }
        }
    }
);

impl CeremonyDelegate {
    fn new(mtm: MainThreadMarker, ivars: DelegateIvars) -> Retained<Self> {
        let this = Self::alloc(mtm).set_ivars(ivars);
        unsafe { msg_send![super(this), init] }
    }

    fn complete(&self, result: CeremonyResult) {
        if let Some(sender) = self.ivars().sender.borrow_mut().take() {
            let _ = sender.send(result);
        }
        // Release the controller and delegate now that callbacks are done.
        self.ivars().controller.borrow_mut().take();
        let this = self as *const Self;
        ACTIVE_DELEGATES.with(|delegates| {
            delegates.borrow_mut().retain(|d| Retained::as_ptr(d) != this);
        });
    }
}

fn map_nserror(error: &NSError) -> (String, String) {
    let domain = error.domain().to_string();
    let code = error.code();
    let message = error.localizedDescription().to_string();
    let lowered = message.to_lowercase();

    let mapped = if lowered.contains("timed out") || lowered.contains("timeout") {
        "timeout"
    } else if domain == "ASAuthorizationError" {
        match code {
            // ASAuthorizationError.canceled
            1001 => "cancelled",
            // ASAuthorizationError.failed also covers RP ID / associated-domain
            // mismatches, so use the localized description for classification.
            1004 if lowered.contains("not associated") || lowered.contains("associated domain") => {
                "invalid_rp"
            }
            _ => "unknown",
        }
    } else {
        "unknown"
    };
    (mapped.to_string(), message)
}

type BuildError = (String, String);

fn decode_b64(field: &str, value: &str) -> Result<Vec<u8>, BuildError> {
    b64url_decode(value).map_err(|e| {
        (
            "unknown".to_string(),
            format!("Invalid base64url in `{field}`: {e}"),
        )
    })
}

fn platform_descriptors(
    creds: &[crate::CredentialDescriptor],
) -> Result<Retained<NSArray<ASAuthorizationPlatformPublicKeyCredentialDescriptor>>, BuildError> {
    let mut out = Vec::with_capacity(creds.len());
    for cred in creds {
        let id = decode_b64("credential id", &cred.id)?;
        let data = NSData::with_bytes(&id);
        let descriptor: Retained<ASAuthorizationPlatformPublicKeyCredentialDescriptor> = unsafe {
            msg_send![
                ASAuthorizationPlatformPublicKeyCredentialDescriptor::alloc(),
                initWithCredentialID: &*data
            ]
        };
        out.push(descriptor);
    }
    Ok(NSArray::from_retained_slice(&out))
}

fn security_key_descriptors(
    creds: &[crate::CredentialDescriptor],
) -> Result<Retained<NSArray<ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor>>, BuildError> {
    let mut out = Vec::with_capacity(creds.len());
    for cred in creds {
        let id = decode_b64("credential id", &cred.id)?;
        let data = NSData::with_bytes(&id);
        // An empty transports array means "all transports".
        let transports: Retained<NSArray<NSString>> = NSArray::new();
        let descriptor: Retained<ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor> = unsafe {
            msg_send![
                ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor::alloc(),
                initWithCredentialID: &*data,
                transports: &*transports
            ]
        };
        out.push(descriptor);
    }
    Ok(NSArray::from_retained_slice(&out))
}

/// Sets a typed-NSString preference (e.g. user verification, resident key,
/// attestation) on a request. The WebAuthn JSON values ("required",
/// "preferred", "discouraged", "none", "direct", ...) are exactly the raw
/// values of the corresponding `ASAuthorizationPublicKeyCredential*` typed
/// string constants, so we can pass them straight through.
fn set_string_pref<T: Message>(target: &T, setter: objc2::runtime::Sel, value: &str) {
    let string = NSString::from_str(value);
    let responds: bool = unsafe { msg_send![target, respondsToSelector: setter] };
    if responds {
        // Dynamic dispatch keeps us compatible with older macOS versions
        // where some setters do not exist.
        let _: () = unsafe { objc2::runtime::MessageReceiver::send_message(target, setter, (&*string,)) };
    }
}

fn build_create_requests(
    options: &CreationOptions,
) -> Result<Vec<Retained<ASAuthorizationRequest>>, BuildError> {
    let challenge = decode_b64("challenge", &options.challenge)?;
    let user_id = decode_b64("user.id", &options.user.id)?;
    let rp_id = NSString::from_str(&options.rp.id);
    let challenge_data = NSData::with_bytes(&challenge);
    let user_id_data = NSData::with_bytes(&user_id);
    let name = NSString::from_str(
        options
            .user
            .name
            .as_deref()
            .or(options.user.display_name.as_deref())
            .unwrap_or(""),
    );
    let display_name = NSString::from_str(
        options
            .user
            .display_name
            .as_deref()
            .or(options.user.name.as_deref())
            .unwrap_or(""),
    );

    let selection = options.authenticator_selection.as_ref();
    let attachment = selection.and_then(|s| s.authenticator_attachment.as_deref());
    let user_verification = selection.and_then(|s| s.user_verification.as_deref());
    let resident_key = selection.and_then(|s| {
        s.resident_key.as_deref().map(str::to_string).or_else(|| {
            s.require_resident_key
                .map(|required| if required { "required" } else { "discouraged" }.to_string())
        })
    });

    let mut requests: Vec<Retained<ASAuthorizationRequest>> = Vec::new();

    if attachment != Some("cross-platform") {
        let provider = unsafe {
            ASAuthorizationPlatformPublicKeyCredentialProvider::initWithRelyingPartyIdentifier(
                ASAuthorizationPlatformPublicKeyCredentialProvider::alloc(),
                &rp_id,
            )
        };
        let request = unsafe {
            provider.createCredentialRegistrationRequestWithChallenge_name_userID(
                &challenge_data,
                &name,
                &user_id_data,
            )
        };
        if let Some(uv) = user_verification {
            set_string_pref(&*request, sel!(setUserVerificationPreference:), uv);
        }
        // iCloud Keychain passkeys fail when attestation is requested. Browsers
        // downgrade these registrations to fmt "none", so do not forward the RP
        // attestation preference for platform passkeys.
        if let Some(exclude) = options.exclude_credentials.as_deref() {
            if !exclude.is_empty() {
                // `excludedCredentials` only exists on macOS 14+.
                let responds: bool =
                    unsafe { msg_send![&*request, respondsToSelector: sel!(setExcludedCredentials:)] };
                if responds {
                    let descriptors = platform_descriptors(exclude)?;
                    let _: () = unsafe { msg_send![&*request, setExcludedCredentials: &*descriptors] };
                }
            }
        }
        requests.push(unsafe { Retained::cast_unchecked::<ASAuthorizationRequest>(request) });
    }

    if attachment != Some("platform") {
        let provider = unsafe {
            ASAuthorizationSecurityKeyPublicKeyCredentialProvider::initWithRelyingPartyIdentifier(
                ASAuthorizationSecurityKeyPublicKeyCredentialProvider::alloc(),
                &rp_id,
            )
        };
        let request = unsafe {
            provider.createCredentialRegistrationRequestWithChallenge_displayName_name_userID(
                &challenge_data,
                &display_name,
                &name,
                &user_id_data,
            )
        };

        // Security key registrations require explicit COSE algorithms.
        let algorithms: Vec<i64> = options
            .pub_key_cred_params
            .as_deref()
            .map(|params| params.iter().map(|p| p.alg).collect())
            .filter(|algs: &Vec<i64>| !algs.is_empty())
            .unwrap_or_else(|| vec![-7 /* ES256 */]);
        let mut parameters = Vec::with_capacity(algorithms.len());
        for alg in algorithms {
            let parameter: Retained<ASAuthorizationPublicKeyCredentialParameters> = unsafe {
                msg_send![
                    ASAuthorizationPublicKeyCredentialParameters::alloc(),
                    initWithAlgorithm: alg as isize
                ]
            };
            parameters.push(parameter);
        }
        let parameters = NSArray::from_retained_slice(&parameters);
        let _: () = unsafe { msg_send![&*request, setCredentialParameters: &*parameters] };

        if let Some(uv) = user_verification {
            set_string_pref(&*request, sel!(setUserVerificationPreference:), uv);
        }
        if let Some(rk) = resident_key.as_deref() {
            set_string_pref(&*request, sel!(setResidentKeyPreference:), rk);
        }
        if let Some(att) = options.attestation.as_deref() {
            set_string_pref(&*request, sel!(setAttestationPreference:), att);
        }
        if let Some(exclude) = options.exclude_credentials.as_deref() {
            if !exclude.is_empty() {
                let descriptors = security_key_descriptors(exclude)?;
                let _: () = unsafe { msg_send![&*request, setExcludedCredentials: &*descriptors] };
            }
        }
        requests.push(unsafe { Retained::cast_unchecked::<ASAuthorizationRequest>(request) });
    }

    if requests.is_empty() {
        return Err((
            "not_supported".to_string(),
            "No usable authenticator type requested".to_string(),
        ));
    }
    Ok(requests)
}

fn build_get_requests(options: &RequestOptions) -> Result<Vec<Retained<ASAuthorizationRequest>>, BuildError> {
    let challenge = decode_b64("challenge", &options.challenge)?;
    let rp_id = NSString::from_str(&options.rp_id);
    let challenge_data = NSData::with_bytes(&challenge);
    let allow = options.allow_credentials.as_deref().unwrap_or(&[]);

    let mut requests: Vec<Retained<ASAuthorizationRequest>> = Vec::new();

    // Platform (passkey) assertion.
    {
        let provider = unsafe {
            ASAuthorizationPlatformPublicKeyCredentialProvider::initWithRelyingPartyIdentifier(
                ASAuthorizationPlatformPublicKeyCredentialProvider::alloc(),
                &rp_id,
            )
        };
        let request = unsafe { provider.createCredentialAssertionRequestWithChallenge(&challenge_data) };
        if let Some(uv) = options.user_verification.as_deref() {
            set_string_pref(&*request, sel!(setUserVerificationPreference:), uv);
        }
        if !allow.is_empty() {
            let descriptors = platform_descriptors(allow)?;
            let _: () = unsafe { msg_send![&*request, setAllowedCredentials: &*descriptors] };
        }
        requests.push(unsafe { Retained::cast_unchecked::<ASAuthorizationRequest>(request) });
    }

    // Security key assertion, offered in the same OS sheet.
    {
        let provider = unsafe {
            ASAuthorizationSecurityKeyPublicKeyCredentialProvider::initWithRelyingPartyIdentifier(
                ASAuthorizationSecurityKeyPublicKeyCredentialProvider::alloc(),
                &rp_id,
            )
        };
        let request = unsafe { provider.createCredentialAssertionRequestWithChallenge(&challenge_data) };
        if let Some(uv) = options.user_verification.as_deref() {
            set_string_pref(&*request, sel!(setUserVerificationPreference:), uv);
        }
        if !allow.is_empty() {
            let descriptors = security_key_descriptors(allow)?;
            let _: () = unsafe { msg_send![&*request, setAllowedCredentials: &*descriptors] };
        }
        requests.push(unsafe { Retained::cast_unchecked::<ASAuthorizationRequest>(request) });
    }

    Ok(requests)
}

// Dynamic getters let platform and security-key credential classes share this path.

unsafe fn credential_to_json(obj: &AnyObject) -> CeremonyResult {
    let is_platform_reg: bool =
        msg_send![obj, isKindOfClass: class!(ASAuthorizationPlatformPublicKeyCredentialRegistration)];
    let is_security_reg: bool = msg_send![
        obj,
        isKindOfClass: class!(ASAuthorizationSecurityKeyPublicKeyCredentialRegistration)
    ];
    let is_platform_assertion: bool =
        msg_send![obj, isKindOfClass: class!(ASAuthorizationPlatformPublicKeyCredentialAssertion)];
    let is_security_assertion: bool = msg_send![
        obj,
        isKindOfClass: class!(ASAuthorizationSecurityKeyPublicKeyCredentialAssertion)
    ];

    if is_platform_reg || is_security_reg {
        registration_to_json(obj, is_platform_reg)
    } else if is_platform_assertion || is_security_assertion {
        assertion_to_json(obj, is_platform_assertion)
    } else {
        Err((
            "unknown".to_string(),
            "Unexpected ASAuthorization credential type".to_string(),
        ))
    }
}

unsafe fn registration_to_json(obj: &AnyObject, platform: bool) -> CeremonyResult {
    let credential_id: Retained<NSData> = msg_send![obj, credentialID];
    let client_data: Retained<NSData> = msg_send![obj, rawClientDataJSON];
    let attestation: Option<Retained<NSData>> = msg_send![obj, rawAttestationObject];
    let attestation = attestation.ok_or_else(|| {
        (
            "unknown".to_string(),
            "Authenticator returned no attestation object".to_string(),
        )
    })?;

    let id = b64url_encode(&credential_id.to_vec());
    let transports: Vec<&str> = if platform {
        vec!["internal", "hybrid"]
    } else {
        vec!["usb", "nfc", "ble"]
    };

    Ok(serde_json::json!({
        "id": id,
        "rawId": id,
        "type": "public-key",
        "authenticatorAttachment": if platform { "platform" } else { "cross-platform" },
        "response": {
            "clientDataJSON": b64url_encode(&client_data.to_vec()),
            "attestationObject": b64url_encode(&attestation.to_vec()),
            "transports": transports,
        },
    }))
}

unsafe fn assertion_to_json(obj: &AnyObject, platform: bool) -> CeremonyResult {
    let credential_id: Retained<NSData> = msg_send![obj, credentialID];
    let client_data: Retained<NSData> = msg_send![obj, rawClientDataJSON];
    let authenticator_data: Retained<NSData> = msg_send![obj, rawAuthenticatorData];
    let signature: Retained<NSData> = msg_send![obj, signature];
    // The user handle may be absent (non-resident security key credentials).
    let user_id: Option<Retained<NSData>> = msg_send![obj, userID];

    let id = b64url_encode(&credential_id.to_vec());
    let mut response = serde_json::json!({
        "clientDataJSON": b64url_encode(&client_data.to_vec()),
        "authenticatorData": b64url_encode(&authenticator_data.to_vec()),
        "signature": b64url_encode(&signature.to_vec()),
    });
    if let Some(user_id) = user_id {
        let bytes = user_id.to_vec();
        if !bytes.is_empty() {
            response["userHandle"] = serde_json::Value::String(b64url_encode(&bytes));
        }
    }

    Ok(serde_json::json!({
        "id": id,
        "rawId": id,
        "type": "public-key",
        "authenticatorAttachment": if platform { "platform" } else { "cross-platform" },
        "response": response,
    }))
}

async fn run_ceremony<F>(handle: usize, build: F) -> String
where
    F: FnOnce() -> Result<Vec<Retained<ASAuthorizationRequest>>, BuildError> + Send + 'static,
{
    let (sender, receiver) = oneshot::channel::<CeremonyResult>();

    dispatch_to_main(move || {
        let mut sender = Some(sender);
        let setup = (|| -> Result<(), BuildError> {
            let mtm = MainThreadMarker::new()
                .ok_or_else(|| ("unknown".to_string(), "Not on the main thread".to_string()))?;

            // The buffer from BrowserWindow#getNativeWindowHandle() holds an
            // NSView*; the OS sheet is anchored to the view's window.
            let view = handle as *mut NSView;
            if view.is_null() {
                return Err(("unknown".to_string(), "Window handle is null".to_string()));
            }
            // SAFETY: Electron guarantees the handle is a live NSView* for
            // the BrowserWindow, and we are on the main thread.
            let view: &NSView = unsafe { &*view };
            let window = view.window().ok_or_else(|| {
                (
                    "unknown".to_string(),
                    "NSView is not attached to a window".to_string(),
                )
            })?;

            let requests = build()?;
            let request_array = NSArray::from_retained_slice(&requests);
            let controller = unsafe {
                ASAuthorizationController::initWithAuthorizationRequests(
                    ASAuthorizationController::alloc(),
                    &request_array,
                )
            };

            let delegate = CeremonyDelegate::new(
                mtm,
                DelegateIvars {
                    window,
                    sender: RefCell::new(sender.take()),
                    controller: RefCell::new(Some(controller.clone())),
                },
            );

            unsafe {
                controller.setDelegate(Some(ProtocolObject::from_ref(&*delegate)));
                controller.setPresentationContextProvider(Some(ProtocolObject::from_ref(&*delegate)));
                controller.performRequests();
            }

            // Keep the delegate alive until a completion callback fires (the
            // controller only references it weakly).
            ACTIVE_DELEGATES.with(|delegates| delegates.borrow_mut().push(delegate));
            Ok(())
        })();

        if let Err((code, message)) = setup {
            if let Some(sender) = sender.take() {
                let _ = sender.send(Err((code, message)));
            }
        }
    });

    match receiver.await {
        Ok(Ok(credential)) => ok_envelope(credential),
        Ok(Err((code, message))) => err_envelope(&code, &message),
        Err(_) => err_envelope("unknown", "Passkey ceremony was dropped without completing"),
    }
}

// Note: AuthenticationServices has no per-request timeout on macOS, so the
// `timeout` option is intentionally ignored here; the OS sheet stays open
// until the user completes or cancels it.
pub(crate) async fn create_credential(handle: usize, options: CreationOptions) -> String {
    run_ceremony(handle, move || build_create_requests(&options)).await
}

pub(crate) async fn get_credential(handle: usize, options: RequestOptions) -> String {
    run_ceremony(handle, move || build_get_requests(&options)).await
}
