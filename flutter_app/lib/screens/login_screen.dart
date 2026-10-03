import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../widgets/lotus_flourish_divider.dart';
import 'dashboard_screen.dart';
import '../services/api_service.dart';
import '../services/auth_storage.dart';

class LoginScreen extends StatefulWidget {
  final Future<void> Function(String username, String password)? onLogin;

  const LoginScreen({super.key, this.onLogin});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController(text: 'admin123');

  bool _rememberMe = true;
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    ));

    _animController.forward();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (widget.onLogin != null) {
        await widget.onLogin!(
          _usernameController.text.trim(),
          _passwordController.text,
        );
        await AuthStorage.saveLogin(username: _usernameController.text.trim());
      } else {
        final authResult = await ApiService.login(
          _usernameController.text.trim(),
          _passwordController.text,
        );
        if (authResult != null && (authResult['success'] == true || authResult['token'] != null)) {
          await AuthStorage.saveLogin(username: _usernameController.text.trim());
          if (mounted) {
            Navigator.pushReplacement(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    const AdminDashboardScreen(),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(opacity: animation, child: child);
                },
                transitionDuration: const Duration(milliseconds: 500),
              ),
            );
          }
        } else {
          final serverError = authResult?['error']?.toString() ??
              authResult?['message']?.toString() ??
              'Invalid password or credentials. Please verify and try again.';
          setState(() {
            _errorMessage = serverError;
          });
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TempleColors.sanctumDark,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Temple Sanctum Background Image
          Image.asset(
            'assets/images/temple_sanctum_bg.jpg',
            fit: BoxFit.cover,
            alignment: Alignment.center,
            errorBuilder: (context, error, stackTrace) {
              // Fallback deep emerald gradient if asset is loading
              return Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0xFF03140D),
                      Color(0xFF06291B),
                      Color(0xFF010B07),
                    ],
                  ),
                ),
              );
            },
          ),

          // 2. Cinematic Atmospheric Gradient Tint
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: const [0.0, 0.35, 0.75, 1.0],
                colors: [
                  Colors.black.withValues(alpha: 0.25),
                  Colors.black.withValues(alpha: 0.10),
                  Colors.black.withValues(alpha: 0.30),
                  Colors.black.withValues(alpha: 0.65),
                ],
              ),
            ),
          ),

          // 3. Main Content with Safe Area and Scrollable View
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: SingleChildScrollView(
                      physics: const ClampingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 12),

                          // Top Brand Logo with golden jewel box
                          _buildBrandHeader(),

                          const SizedBox(height: 18),

                          // Floating Off-White Login Card
                          _buildLoginCard(),

                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Top Brand Logo, Title & Tagline
  Widget _buildBrandHeader() {
    return Column(
      children: [
        // Brand Logo (Aamadappetti with traditional jewel chest)
        Container(
          constraints: const BoxConstraints(maxHeight: 120, maxWidth: 280),
          child: Image.asset(
            'assets/images/brand_logo_transparent.png',
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return Image.asset(
                'assets/images/brand_logo.png',
                fit: BoxFit.contain,
              );
            },
          ),
        ),
        const SizedBox(height: 14),

        // "A D M I N   S A N C T U M"
        Text(
          'ADMIN  SANCTUM',
          textAlign: TextAlign.center,
          style: GoogleFonts.cinzel(
            fontSize: 17.5,
            fontWeight: FontWeight.w600,
            letterSpacing: 4.8,
            color: TempleColors.textGoldLight,
            shadows: [
              Shadow(
                color: Colors.black.withValues(alpha: 0.8),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
              Shadow(
                color: TempleColors.goldMetallic.withValues(alpha: 0.4),
                blurRadius: 14,
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),

        // Gold Lotus Divider Line
        const LotusFlourishDivider(
          width: 175,
          color: TempleColors.goldBorder,
          height: 14,
        ),
        const SizedBox(height: 8),

        // "Preserving Tradition Digitally"
        Text(
          'Preserving Tradition Digitally',
          textAlign: TextAlign.center,
          style: GoogleFonts.cormorantGaramond(
            fontSize: 14.5,
            fontStyle: FontStyle.italic,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.8,
            color: const Color(0xFFE4C686),
            shadows: [
              Shadow(
                color: Colors.black.withValues(alpha: 0.8),
                blurRadius: 6,
                offset: const Offset(0, 1),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// The Ivory Rounded Card containing Input Fields and Actions
  Widget _buildLoginCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: TempleColors.cardBg,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: TempleColors.goldBorder,
          width: 1.4,
        ),
        boxShadow: [
          // Soft golden aura glow
          BoxShadow(
            color: TempleColors.goldMetallic.withValues(alpha: 0.22),
            blurRadius: 28,
            spreadRadius: 1,
            offset: const Offset(0, 8),
          ),
          // Deep elevation shadow
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 36,
            spreadRadius: 0,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 26),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Error Message (if any)
            if (_errorMessage != null) ...[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F0),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFFA39E)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded,
                        color: Color(0xFFCF1322), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          color: const Color(0xFFCF1322),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // 1. Username / Email Input Field
            _buildInputField(
              controller: _usernameController,
              hintText: 'Username / Email',
              prefixIcon: Icons.person_outline_rounded,
              keyboardType: TextInputType.emailAddress,
              validator: (val) {
                if (val == null || val.trim().isEmpty) {
                  return 'Please enter username or email';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // 2. Password Input Field
            _buildInputField(
              controller: _passwordController,
              hintText: 'Password',
              prefixIcon: Icons.lock_outline_rounded,
              obscureText: _obscurePassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: const Color(0xFF6B7280),
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
              validator: (val) {
                if (val == null || val.isEmpty) {
                  return 'Please enter password';
                }
                if (val.length < 4) {
                  return 'Password must be at least 4 characters';
                }
                return null;
              },
            ),

            const SizedBox(height: 14),

            // 3. Row: Remember Me Checkbox
            Align(
              alignment: Alignment.centerLeft,
              child: InkWell(
                onTap: () {
                  setState(() {
                    _rememberMe = !_rememberMe;
                  });
                },
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: _rememberMe
                              ? const Color(0xFF093723)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(
                            color: _rememberMe
                                ? const Color(0xFF093723)
                                : const Color(0xFF9CA3AF),
                            width: 1.5,
                          ),
                        ),
                        child: _rememberMe
                            ? const Icon(
                                Icons.check_rounded,
                                size: 14,
                                color: Colors.white,
                              )
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Remember me',
                        style: GoogleFonts.inter(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF374151),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 4. "SIGN IN  ->" Gradient Action Button
            _buildSignInButton(),

            const SizedBox(height: 20),

            // 5. Ornamental Divider Line
            const Center(
              child: LotusFlourishDivider(
                width: 210,
                color: Color(0xFFC7AD73),
                height: 14,
              ),
            ),

            const SizedBox(height: 14),

            // 6. Footer: "Authorized administrators only"
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.lock_outline_rounded,
                  size: 14.5,
                  color: Color(0xFF8C713B),
                ),
                const SizedBox(width: 6),
                Text(
                  'Authorized administrators only',
                  style: GoogleFonts.cormorantGaramond(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF5A636F),
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Reusable Input Field Widget
  Widget _buildInputField({
    required TextEditingController controller,
    required String hintText,
    required IconData prefixIcon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: TempleColors.cardFieldBg,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: TempleColors.cardFieldBorder,
          width: 1.1,
        ),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        style: GoogleFonts.inter(
          fontSize: 14.5,
          color: TempleColors.textDark,
          fontWeight: FontWeight.w400,
        ),
        decoration: InputDecoration(
          isDense: true,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          prefixIcon: Padding(
            padding: const EdgeInsets.only(left: 12, right: 10),
            child: Icon(
              prefixIcon,
              size: 20,
              color: const Color(0xFF3B4450),
            ),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 42),
          suffixIcon: suffixIcon,
          hintText: hintText,
          hintStyle: GoogleFonts.inter(
            fontSize: 14.5,
            color: TempleColors.textMuted,
            fontWeight: FontWeight.w400,
          ),
          border: InputBorder.none,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: const BorderSide(
              color: TempleColors.cardFieldBorderFocus,
              width: 1.4,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(13),
            borderSide: const BorderSide(
              color: Color(0xFFCF1322),
              width: 1.2,
            ),
          ),
        ),
        validator: validator,
      ),
    );
  }

  /// Sacred Emerald Gradient Sign-In Button with Gold Accent
  Widget _buildSignInButton() {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF042618),
            Color(0xFF0E432C),
          ],
        ),
        border: Border.all(
          color: const Color(0xFFE2C475),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF042618).withValues(alpha: 0.35),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: _isLoading ? null : _handleLogin,
          child: Center(
            child: _isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        TempleColors.goldBright,
                      ),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'SIGN IN',
                        style: GoogleFonts.cinzel(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 3.5,
                          color: const Color(0xFFF9ECC5),
                          shadows: [
                            Shadow(
                              color: Colors.black.withValues(alpha: 0.6),
                              blurRadius: 4,
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.arrow_forward_rounded,
                        size: 18,
                        color: Color(0xFFF9ECC5),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
