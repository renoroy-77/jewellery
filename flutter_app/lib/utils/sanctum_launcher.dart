import 'package:url_launcher/url_launcher.dart';

/// Helper to launch WhatsApp and Phone calls on Android, iOS, and Web.
class SanctumLauncher {
  /// Opens WhatsApp to chat with [phone].
  static Future<bool> openWhatsApp(String phone, {String message = 'Namaste from Aamadappetti Panchaloham Jewellery!'}) async {
    final clean = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (clean.isEmpty || clean == '0000000000') return false;

    // Normalise phone number: strip + and ensure country code
    String number = clean;
    if (number.startsWith('+')) {
      number = number.substring(1);
    } else if (number.length == 10) {
      number = '91$number';
    }

    final query = message.isNotEmpty ? '?text=${Uri.encodeComponent(message)}' : '';
    final Uri uri = Uri.parse('https://wa.me/$number$query');

    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      try {
        return await launchUrl(uri);
      } catch (_) {
        return false;
      }
    }
  }

  /// Triggers native Android/iOS phone dialer for [phone].
  static Future<bool> makePhoneCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (clean.isEmpty || clean == '0000000000') return false;

    final Uri uri = Uri.parse('tel:$clean');
    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      try {
        return await launchUrl(uri);
      } catch (_) {
        return false;
      }
    }
  }
}
