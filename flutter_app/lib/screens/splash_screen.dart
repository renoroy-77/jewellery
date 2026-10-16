import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_storage.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'dashboard_screen.dart';
import '../widgets/aamadappetti_chest_animation.dart';

/// Sacred Sanctum Splash Screen featuring an animated opening-and-closing
/// sacred temple logo emblem, glowing aura bloom, and automatic backend authentication sync.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  String _statusText = 'Opening Sacred Sanctum...';
  bool _isAuthComplete = false;
  bool _isChestOpened = false;
  bool _isNavigating = false;
  bool _isLoggedIn = false;
  Timer? _dwellTimer;

  @override
  void initState() {
    super.initState();

    // Entrance fade controller
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnimation = CurvedAnimation(parent: _fadeController, curve: Curves.easeOutCubic);
    _fadeController.forward();

    // Kick off sanctum authentication & background warm-up
    _initializeApp();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Warm up image cache so chest opening has 0 decode latency
    precacheImage(const AssetImage('assets/images/aamadappetti_closed.png'), context);
    precacheImage(const AssetImage('assets/images/aamadappetti_open.png'), context);
    precacheImage(const AssetImage('assets/images/temple_sanctum_bg.jpg'), context);
  }

  @override
  void dispose() {
    _dwellTimer?.cancel();
    _fadeController.dispose();
    super.dispose();
  }

  void _onChestOpened() {
    if (!mounted) return;
    setState(() {
      _isChestOpened = true;
      _statusText = 'Sacred Sanctum Unveiled';
    });
    _checkAndNavigate();
  }

  Future<void> _initializeApp() async {
    try {
      await ApiService.initAuth();
      if (mounted) {
        setState(() => _statusText = 'Synchronizing Sacred Database...');
      }

      _isLoggedIn = await AuthStorage.isLoggedIn();
      if (mounted) {
        setState(() {
          _isAuthComplete = true;
          if (_isChestOpened) {
            _statusText = 'Sanctum Verified • Live Online';
          }
        });
        _checkAndNavigate();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isAuthComplete = true;
        });
        _checkAndNavigate();
      }
    }
  }

  void _checkAndNavigate() {
    // CRITICAL REQUIREMENT: Only transition after the chest has completely opened!
    if (!_isChestOpened || !_isAuthComplete || _isNavigating || !mounted) {
      return;
    }
    _isNavigating = true;

    // Sacred pause after opening so devotee can admire the open chest of jewels
    _dwellTimer?.cancel();
    _dwellTimer = Timer(const Duration(milliseconds: 900), () {
      if (!mounted) return;
      final targetScreen = _isLoggedIn ? const AdminDashboardScreen() : const LoginScreen();
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 700),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF031C13),
      body: Stack(
        children: [
          // Background sacred temple sanctum image with rich darkening overlay
          Positioned.fill(
            child: Image.asset(
              'assets/images/temple_sanctum_bg.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(color: const Color(0xFF031C13)),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF02170E).withValues(alpha: 0.94),
                    const Color(0xFF052A1C).withValues(alpha: 0.88),
                    const Color(0xFF01120B).withValues(alpha: 0.97),
                  ],
                ),
              ),
            ),
          ),

          // Central animated opening and closing sacred logo emblem
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Sacred Aamadappetti (Traditional Jewel Chest) Opening Animation
                    AamadappettiChestAnimation(
                      size: 185,
                      mode: AamadappettiMode.openOnce,
                      openDuration: const Duration(milliseconds: 1400),
                      onOpened: _onChestOpened,
                      interactive: false,
                    ),

                    const SizedBox(height: 24),

                    // Sacred Brand Name
                    Text(
                      'AAMADAPPETTI',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.cinzel(
                        fontSize: 27,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 4.5,
                        color: const Color(0xFFF9ECC5),
                        shadows: const [
                          Shadow(
                            color: Color(0x66000000),
                            blurRadius: 10,
                            offset: Offset(0, 3),
                          ),
                          Shadow(
                            color: Color(0x55D4AF37),
                            blurRadius: 16,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Sacred Gold Flourish Divider
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 44,
                          height: 1,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.transparent, Color(0xFFE2C475)],
                            ),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: Icon(
                            Icons.auto_awesome,
                            size: 13,
                            color: Color(0xFFE2C475),
                          ),
                        ),
                        Container(
                          width: 44,
                          height: 1,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFFE2C475), Colors.transparent],
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // Subtitle
                    Text(
                      'PANCHALOHAM TEMPLE JEWELLERY',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.cormorantGaramond(
                        fontSize: 13.5,
                        letterSpacing: 2.4,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFDCC188),
                      ),
                    ),

                    const SizedBox(height: 3),

                    Text(
                      'EXECUTIVE ADMIN SANCTUM',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        letterSpacing: 1.8,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF94A3B8),
                      ),
                    ),

                    const SizedBox(height: 48),

                    // Live Status Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF042618).withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFFE2C475).withValues(alpha: 0.35),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFE2C475)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            _statusText,
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFFF9ECC5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom sacred watermark
          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'Assay Certified 5-Metal Sanctum Craftsmanship',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  color: const Color(0xFF64748B),
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
