import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/temple_theme.dart';
import 'screens/splash_screen.dart';
import 'services/api_service.dart';
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

  // Pre-initialize auth credentials and FCM Push Notifications
  await ApiService.initAuth();
  await NotificationService.initialize();

  runApp(const AamadappettiApp());
}

class AamadappettiApp extends StatelessWidget {
  const AamadappettiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: NotificationService.navigatorKey,
      title: 'Aamadappetti Panchaloham Jewellery - Admin Sanctum',
      debugShowCheckedModeBanner: false,
      theme: TempleTheme.theme,
      home: const SplashScreen(),
    );
  }
}
