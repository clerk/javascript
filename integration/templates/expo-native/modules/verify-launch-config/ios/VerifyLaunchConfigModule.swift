import ExpoModulesCore
import Security

public class VerifyLaunchConfigModule: Module {
  private static let storageScopeKey = "VerifyLaunchConfig.storageScope"

  public func definition() -> ModuleDefinition {
    Name("VerifyLaunchConfig")

    Function("readLaunchInputs") { () -> [String: String] in
      UserDefaults.standard
        .volatileDomain(forName: UserDefaults.argumentDomain)
        .filter { $0.key.hasPrefix("verify") }
        .compactMapValues { $0 as? String }
    }

    Function("applyStorageScope") { (scope: String) in
      let defaults = UserDefaults.standard
      guard defaults.string(forKey: Self.storageScopeKey) != scope else {
        return
      }

      SecItemDelete([kSecClass: kSecClassGenericPassword] as CFDictionary)
      defaults.set(scope, forKey: Self.storageScopeKey)
    }
  }
}
