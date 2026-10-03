import 'package:shared_preferences/shared_preferences.dart';

/// Manages persistent authentication state for the Aamadappetti Admin App.
/// The session persists permanently across app launches until explicit logout or app uninstallation.
class AuthStorage {
  static const String _keyIsLoggedIn = 'sanctum_is_logged_in';
  static const String _keyUsername = 'sanctum_admin_username';
  static const String _keyLoginTimestamp = 'sanctum_login_time';

  /// Returns true if the user previously authenticated successfully.
  static Future<bool> isLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_keyIsLoggedIn) ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Saves the active login session.
  static Future<void> saveLogin({required String username}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsLoggedIn, true);
      await prefs.setString(_keyUsername, username);
      await prefs.setString(_keyLoginTimestamp, DateTime.now().toIso8601String());
    } catch (_) {}
  }

  /// Clears the login session on user logout.
  static Future<void> clearLogin() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_keyIsLoggedIn);
      await prefs.remove(_keyUsername);
      await prefs.remove(_keyLoginTimestamp);
    } catch (_) {}
  }

  /// Retrieves the saved admin username.
  static Future<String> getUsername() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_keyUsername) ?? 'admin';
    } catch (_) {
      return 'admin';
    }
  }
}
