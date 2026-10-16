import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_fonts/google_fonts.dart';
import 'api_service.dart';
import '../screens/dashboard_screen.dart';
import '../screens/inquiries_screen.dart';

/// Top-level background message handler for Firebase Messaging
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
  if (kDebugMode) {
    print('[FCM Background] Handling message: ${message.messageId}');
  }
}

class NotificationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  static const MethodChannel _nativeChannel = MethodChannel('com.aamadappetti.aamadappetti_admin/notifications');
  static bool _isInitialized = false;

  /// Initializes Firebase and FCM push notification listeners.
  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      if (kIsWeb) {
        // Firebase web initialization
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: 'AIzaSyB5QasAj_7UvfrRnqCVArVuLJCYMRzznIs',
            appId: '1:57338864137:web:6320eb28ecfb7f04f74ed8',
            messagingSenderId: '57338864137',
            projectId: 'aamadappetti-sanctum',
            storageBucket: 'aamadappetti-sanctum.firebasestorage.app',
            authDomain: 'aamadappetti-sanctum.firebaseapp.com',
          ),
        );
      } else {
        // Android / iOS native initialization
        await Firebase.initializeApp();
      }

      final messaging = FirebaseMessaging.instance;

      // 1. Request notification permissions (critical for Android 13+ & iOS)
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: true,
        provisional: false,
        sound: true,
      );

      if (kDebugMode) {
        print('[FCM] User granted permission: ${settings.authorizationStatus}');
      }

      // 2. Set background message handler (Native Android / iOS only)
      if (!kIsWeb) {
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      }

      // 3. Retrieve and register device token with backend
      try {
        final token = await messaging.getToken();
        if (token != null && token.isNotEmpty) {
          if (kDebugMode) {
            print('[FCM] Device Token: $token');
          }
          await ApiService.registerFcmToken(
            token,
            deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
            platform: kIsWeb ? 'web' : 'android',
          );
        }
      } catch (err) {
        if (kDebugMode) {
          print('[FCM] Token fetch error: $err');
        }
      }

      // 4. Token refresh listener
      messaging.onTokenRefresh.listen((newToken) {
        ApiService.registerFcmToken(
          newToken,
          deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
          platform: kIsWeb ? 'web' : 'android',
        );
      });

      // 5. FOREGROUND Messages: Display golden Sanctum alert banner AND native Android system tray notification
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('[FCM Foreground] Got message: ${message.notification?.title}');
        }
        _showForegroundNotificationBanner(message);

        // Show native system notification in Android status bar & pull-down shade
        if (!kIsWeb) {
          try {
            final title = message.notification?.title ?? message.data['title'] ?? '🪔 Sacred Notification';
            final body = message.notification?.body ?? message.data['body'] ?? 'New Sanctum alert received.';
            final channelId = message.notification?.android?.channelId ?? 'sanctum_orders_channel';
            _nativeChannel.invokeMethod('showNotification', {
              'title': title,
              'body': body,
              'channelId': channelId,
            });
          } catch (e) {
            if (kDebugMode) {
              print('[Native Notification Error] $e');
            }
          }
        }
      });

      // 6. BACKGROUND Messages: User clicked notification while app was running in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('[FCM onMessageOpenedApp] Clicked notification: ${message.data}');
        }
        handleNotificationClick(message.data);
      });

      // 7. TERMINATED STATE: User clicked notification when app was closed/killed
      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        if (kDebugMode) {
          print('[FCM InitialMessage] Cold-launch from notification: ${initialMessage.data}');
        }
        WidgetsBinding.instance.addPostFrameCallback((_) {
          handleNotificationClick(initialMessage.data);
        });
      }

      _isInitialized = true;
    } catch (err) {
      if (kDebugMode) {
        print('[FCM Init Failed] Running in graceful mode: $err');
      }
    }
  }

  /// Ensures current device FCM token is retrieved and registered with the server
  static Future<String?> ensureDeviceRegistered() async {
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        criticalAlert: true,
      );

      final token = await messaging.getToken();
      if (token != null && token.isNotEmpty) {
        if (kDebugMode) {
          print('[FCM ensureDeviceRegistered] Token: $token');
        }
        await ApiService.registerFcmToken(
          token,
          deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
          platform: kIsWeb ? 'web' : 'android',
        );
        return token;
      }
    } catch (e) {
      if (kDebugMode) {
        print('[FCM ensureDeviceRegistered Error] $e');
      }
    }
    return null;
  }

  /// Deep Links and routes directly to the corresponding screen based on notification payload data
  static void handleNotificationClick(Map<String, dynamic> data) {
    final type = data['type']?.toString().toUpperCase() ?? '';
    final orderId = data['orderId']?.toString();
    final productId = data['productId']?.toString();

    final nav = navigatorKey.currentState;
    if (nav == null) return;

    if (type == 'ORDER' || orderId != null) {
      // Navigate directly to the Orders tab (index 2) with order target
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => AdminDashboardScreen(
            initialTab: 2,
            targetOrderId: orderId,
          ),
        ),
        (route) => false,
      );
    } else if (type == 'PRODUCT' || productId != null) {
      // Navigate directly to the Products tab (index 1) with product target
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => AdminDashboardScreen(
            initialTab: 1,
            targetProductId: productId,
          ),
        ),
        (route) => false,
      );
    } else if (type == 'INQUIRY') {
      // Navigate directly to Inquiries Screen
      nav.push(
        MaterialPageRoute(
          builder: (_) => const InquiriesScreen(),
        ),
      );
    } else {
      // General notification: open dashboard home
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => const AdminDashboardScreen(initialTab: 0),
        ),
        (route) => false,
      );
    }
  }

  static OverlayEntry? _currentBannerEntry;
  static Timer? _dismissTimer;

  /// Shows an authentic top slide-down Sanctum push notification banner
  static void showInAppNotification({
    BuildContext? context,
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) {
    final ctx = context ?? navigatorKey.currentContext;
    if (ctx == null) return;

    final overlay = Overlay.maybeOf(ctx) ?? navigatorKey.currentState?.overlay;
    if (overlay == null) return;

    // Remove any currently displayed banner
    _dismissTimer?.cancel();
    _currentBannerEntry?.remove();
    _currentBannerEntry = null;

    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) => _TopPushNotificationBanner(
        title: title,
        body: body,
        onTap: () {
          entry.remove();
          _currentBannerEntry = null;
          _dismissTimer?.cancel();
          if (data != null) {
            handleNotificationClick(data);
          }
        },
        onDismiss: () {
          entry.remove();
          _currentBannerEntry = null;
          _dismissTimer?.cancel();
        },
      ),
    );

    _currentBannerEntry = entry;
    overlay.insert(entry);

    // Auto dismiss after 6 seconds
    _dismissTimer = Timer(const Duration(seconds: 6), () {
      if (_currentBannerEntry == entry) {
        entry.remove();
        _currentBannerEntry = null;
      }
    });
  }

  /// Shows an elegant top-sliding in-app push notification banner when message arrives while app is open
  static void _showForegroundNotificationBanner(RemoteMessage message) {
    final title = message.notification?.title ?? message.data['title'] ?? '🪔 New Sacred Order';
    final body = message.notification?.body ?? message.data['body'] ?? 'Consecrated ornament order placed by devotee.';
    showInAppNotification(
      title: title,
      body: body,
      data: message.data,
    );
  }
}

/// Floating Top Slide-Down In-App Push Notification Banner
class _TopPushNotificationBanner extends StatefulWidget {
  final String title;
  final String body;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const _TopPushNotificationBanner({
    required this.title,
    required this.body,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  State<_TopPushNotificationBanner> createState() => _TopPushNotificationBannerState();
}

class _TopPushNotificationBannerState extends State<_TopPushNotificationBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<Offset> _offsetAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    _offsetAnim = Tween<Offset>(
      begin: const Offset(0, -1.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack));
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
  }

  Future<void> _dismiss() async {
    await _ctrl.reverse();
    widget.onDismiss();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Positioned(
      top: topPadding + 10,
      left: 16,
      right: 16,
      child: SlideTransition(
        position: _offsetAnim,
        child: FadeTransition(
          opacity: _fadeAnim,
          child: Material(
            color: Colors.transparent,
            child: GestureDetector(
              onTap: widget.onTap,
              onVerticalDragUpdate: (details) {
                if (details.primaryDelta != null && details.primaryDelta! < -6) {
                  _dismiss();
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFA072B1E),
                      Color(0xFA03180F),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: const Color(0xFFD4AF37).withValues(alpha: 0.8),
                    width: 1.4,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.5),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                    BoxShadow(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Glowing Diya / Temple Bell Emblem
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const RadialGradient(
                          colors: [
                            Color(0x44D4AF37),
                            Color(0x05047857),
                          ],
                        ),
                        border: Border.all(
                          color: const Color(0xFFE2C475).withValues(alpha: 0.7),
                          width: 1.2,
                        ),
                      ),
                      child: const Center(
                        child: Text(
                          '🪔',
                          style: TextStyle(fontSize: 20),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Notification Title, Subtitle, & Details
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'AAMADAPPETTI SANCTUM',
                                style: GoogleFonts.cinzel(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                  color: const Color(0xFFE2C475),
                                ),
                              ),
                              const Spacer(),
                              Text(
                                'Just Now',
                                style: GoogleFonts.inter(
                                  fontSize: 9.5,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            widget.title,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFFFFBE8),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.body,
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              color: const Color(0xFFCBD5E1),
                              height: 1.25,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 10),

                    // Gold "VIEW" Pill Action Button
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFFE2C475),
                            Color(0xFFC5A049),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFD4AF37).withValues(alpha: 0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'VIEW',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF031910),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 2),
                          const Icon(
                            Icons.arrow_outward_rounded,
                            size: 12,
                            color: Color(0xFF031910),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
