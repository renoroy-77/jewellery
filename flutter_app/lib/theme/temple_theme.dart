import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TempleColors {
  // Deep Sacred Sanctum Greens
  static const Color sanctumDark = Color(0xFF03140D);
  static const Color emeraldDeep = Color(0xFF052417);
  static const Color emeraldMedium = Color(0xFF0D412B);
  static const Color emeraldLight = Color(0xFF135A3B);

  // Regal Panchaloham Golds
  static const Color goldBright = Color(0xFFF9E7B3);
  static const Color goldMetallic = Color(0xFFD4AF37);
  static const Color goldPrimary = Color(0xFFD4AF37);
  static const Color goldAmber = Color(0xFFB88E39);
  static const Color goldDark = Color(0xFF8A661D);
  static const Color goldBorder = Color(0xFFDEC58D);
  static const Color goldAccent = Color(0xFFA17424);

  // App Theme Accents
  static const Color headerBg = Color(0xFF03180F);
  static const Color sanctumGreen = Color(0xFF0D5438);

  // Card Surfaces
  static const Color cardBg = Color(0xFFFAF8F5);
  static const Color cardFieldBg = Color(0xFFF4F5F7);
  static const Color cardFieldBorder = Color(0xFFD6DBE2);
  static const Color cardFieldBorderFocus = Color(0xFFB88E39);

  // Typography Colors
  static const Color textDark = Color(0xFF1A222B);
  static const Color textMuted = Color(0xFF8A93A0);
  static const Color textBody = Color(0xFF374151);
  static const Color textFooter = Color(0xFF5B6470);
  static const Color textGoldLight = Color(0xFFF8E7BE);
}

class TempleTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: TempleColors.sanctumDark,
      colorScheme: const ColorScheme.dark(
        primary: TempleColors.goldMetallic,
        secondary: TempleColors.emeraldMedium,
        surface: TempleColors.cardBg,
      ),
      textTheme: TextTheme(
        headlineMedium: GoogleFonts.cinzel(
          fontSize: 18,
          letterSpacing: 4.5,
          fontWeight: FontWeight.w600,
          color: TempleColors.textGoldLight,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: TempleColors.textBody,
        ),
      ),
    );
  }
}
