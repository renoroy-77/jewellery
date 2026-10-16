import 'package:shared_preferences/shared_preferences.dart';

/// Manages persistent authentication state for the Aamadappetti Admin App.
/// The session persists permanently across app launches until explicit logout or app uninstallation.
class AuthStorage {
  static const String _keyIsLoggedIn = 'sanctum_is_logged_in';
  static const String _keyUsername = 'sanctum_admin_username';
  static const String _keyAuthToken = 'sanctum_auth_token';
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

  /// Saves the active login session including the auth token.
  static Future<void> saveLogin({required String username, String? token}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsLoggedIn, true);
      await prefs.setString(_keyUsername, username);
      if (token != null && token.isNotEmpty) {
        await prefs.setString(_keyAuthToken, token);
      }
      await prefs.setString(_keyLoginTimestamp, DateTime.now().toIso8601String());
    } catch (_) {}
  }

  /// Saves or updates the active auth token.
  static Future<void> saveToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAuthToken, token);
    } catch (_) {}
  }

  /// Retrieves the saved auth token, or defaults to sanctum-master-token if logged in.
  static Future<String?> getToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_keyAuthToken);
      if (token != null && token.isNotEmpty) return token;
      final loggedIn = prefs.getBool(_keyIsLoggedIn) ?? false;
      return loggedIn ? 'sanctum-master-token' : null;
    } catch (_) {
      return 'sanctum-master-token';
    }
  }

  /// Clears the login session on user logout.
  static Future<void> clearLogin() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_keyIsLoggedIn);
      await prefs.remove(_keyUsername);
      await prefs.remove(_keyAuthToken);
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

