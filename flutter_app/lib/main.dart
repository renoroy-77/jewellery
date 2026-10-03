import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/temple_theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/auth_storage.dart';
import 'services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set immersive status bar colors for Android / iOS
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );

  // Initialize FCM Push Notifications and Deep Link routing
  await NotificationService.initialize();

  // Check persistent login state: stays logged in until explicit logout or uninstall
  final isLoggedIn = await AuthStorage.isLoggedIn();

  runApp(AamadappettiApp(isLoggedIn: isLoggedIn));
}

class AamadappettiApp extends StatelessWidget {
  final bool isLoggedIn;

  const AamadappettiApp({super.key, this.isLoggedIn = false});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: NotificationService.navigatorKey,
      title: 'Aamadappetti Panchaloham Jewellery - Admin Sanctum',
      debugShowCheckedModeBanner: false,
      theme: TempleTheme.theme,
      home: isLoggedIn ? const AdminDashboardScreen() : const LoginScreen(),
    );
  }
}
