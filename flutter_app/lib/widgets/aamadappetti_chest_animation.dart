import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

enum AamadappettiMode {
  openOnce,      // Opens once smoothly and stays open (used in Splash Screen)
  breathingLoop, // Opens, holds, closes, holds, and loops (used in Login Screen)
  interactive,   // User can tap to toggle open/closed
}

/// Photorealistic Animated Aamadappetti (Traditional Sacred Kerala Temple Jewellery Chest)
/// Seamlessly animates between closed and open states with radiant divine light beams,
/// floating sparkling jewels, and authentic temple sanctum aesthetics.
class AamadappettiChestAnimation extends StatefulWidget {
  final double size;
  final AamadappettiMode mode;
  final Duration openDuration;
  final VoidCallback? onOpened;
  final VoidCallback? onClosed;
  final bool autoPlay;
  final bool interactive;

  const AamadappettiChestAnimation({
    super.key,
    this.size = 170,
    this.mode = AamadappettiMode.breathingLoop,
    this.openDuration = const Duration(milliseconds: 1400),
    this.onOpened,
    this.onClosed,
    this.autoPlay = true,
    this.interactive = true,
  });

  @override
  State<AamadappettiChestAnimation> createState() => AamadappettiChestAnimationState();
}

class AamadappettiChestAnimationState extends State<AamadappettiChestAnimation>
    with TickerProviderStateMixin {
  late AnimationController _openController;
  late Animation<double> _openAnimation;

  late AnimationController _raysController;
  late AnimationController _sparklesController;

  Timer? _loopTimer;
  bool _isManuallyToggled = false;

  /// External access to trigger open programmatically
  Future<void> openChest() async {
    if (!mounted) return;
    await _openController.forward();
  }

  /// External access to trigger close programmatically
  Future<void> closeChest() async {
    if (!mounted) return;
    await _openController.reverse();
  }

  @override
  void initState() {
    super.initState();

    // 1. Primary opening and closing controller
    _openController = AnimationController(
      vsync: this,
      duration: widget.openDuration,
    );

    _openAnimation = CurvedAnimation(
      parent: _openController,
      curve: Curves.easeInOutCubic,
      reverseCurve: Curves.easeInOutCubic,
    );

    _openController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onOpened?.call();
      } else if (status == AnimationStatus.dismissed) {
        widget.onClosed?.call();
      }
    });

    // 2. Continuous rotating divine sunburst rays
    _raysController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();

    // 3. Floating sparkle jewels controller
    _sparklesController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat();

    // 4. Initialize animation based on mode & autoPlay
    if (widget.autoPlay) {
      if (widget.mode == AamadappettiMode.openOnce) {
        _startOpenOnceSequence();
      } else if (widget.mode == AamadappettiMode.breathingLoop) {
        _startBreathingLoop();
      }
    }
  }

  void _startOpenOnceSequence() {
    _loopTimer?.cancel();
    _loopTimer = Timer(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      _openController.forward();
    });
  }

  void _startBreathingLoop() {
    _loopTimer?.cancel();
    _loopTimer = Timer(const Duration(milliseconds: 900), () {
      if (!mounted || _isManuallyToggled) return;

      // Open chest
      _openController.forward().then((_) {
        if (!mounted || _isManuallyToggled) return;

        // Keep open so jewels and rays radiate
        _loopTimer?.cancel();
        _loopTimer = Timer(const Duration(milliseconds: 2400), () {
          if (!mounted || _isManuallyToggled) return;

          // Close chest
          _openController.reverse().then((_) {
            if (mounted && widget.mode == AamadappettiMode.breathingLoop && !_isManuallyToggled) {
              _startBreathingLoop();
            }
          });
        });
      });
    });
  }

  void _handleTap() {
    if (!widget.interactive || widget.mode == AamadappettiMode.openOnce) return;
    _loopTimer?.cancel();
    _isManuallyToggled = true;

    if (_openController.value > 0.5) {
      _openController.reverse().then((_) {
        _scheduleResumeLoop();
      });
    } else {
      _openController.forward().then((_) {
        _scheduleResumeLoop();
      });
    }
  }

  void _scheduleResumeLoop() {
    _loopTimer?.cancel();
    _loopTimer = Timer(const Duration(milliseconds: 3000), () {
      if (mounted && widget.mode == AamadappettiMode.breathingLoop) {
        _isManuallyToggled = false;
        _startBreathingLoop();
      }
    });
  }

  @override
  void dispose() {
    _loopTimer?.cancel();
    _openController.dispose();
    _raysController.dispose();
    _sparklesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.size;

    return RepaintBoundary(
      child: GestureDetector(
        onTap: _handleTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedBuilder(
          animation: Listenable.merge([_openController, _raysController, _sparklesController]),
          builder: (context, _) {
            final progress = _openAnimation.value;
            final rayAngle = _raysController.value * 2 * math.pi;
            final sparklePhase = _sparklesController.value;

            return SizedBox(
              width: s * 1.15,
              height: s * 1.15,
              child: Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  // Layer 0: Ambient Sacred Golden Aura
                  Container(
                    width: s * (0.85 + (progress * 0.25)),
                    height: s * (0.85 + (progress * 0.25)),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.25 + (progress * 0.45)),
                          blurRadius: 36 + (progress * 28),
                          spreadRadius: 8 + (progress * 16),
                        ),
                        BoxShadow(
                          color: const Color(0xFFFFE57F).withValues(alpha: progress * 0.35),
                          blurRadius: 60,
                          spreadRadius: 12,
                        ),
                      ],
                    ),
                  ),

                  // Layer 1: Divine Sunburst Rays (Emerging when chest opens)
                  if (progress > 0.05)
                    Positioned(
                      top: -s * 0.1,
                      child: RepaintBoundary(
                        child: Opacity(
                          opacity: (progress * 1.3).clamp(0.0, 1.0),
                          child: Transform.rotate(
                            angle: rayAngle,
                            child: CustomPaint(
                              size: Size(s * 1.35, s * 1.35),
                              painter: _PhotorealisticSunburstPainter(progress: progress),
                            ),
                          ),
                        ),
                      ),
                    ),

                  // Layer 2: Closed Aamadappetti Chest
                  // Fades out smoothly as the lid opens
                  Opacity(
                    opacity: (1.0 - progress).clamp(0.0, 1.0),
                    child: Transform.scale(
                      scale: 1.0 - (progress * 0.02),
                      child: Image.asset(
                        'assets/images/aamadappetti_closed.png',
                        width: s,
                        height: s,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),

                  // Layer 3: Open Aamadappetti Chest with Sparkling Jewels & Light
                  // Fades in smoothly as the lid opens
                  Opacity(
                    opacity: progress.clamp(0.0, 1.0),
                    child: Transform.scale(
                      scale: 0.98 + (progress * 0.02),
                      child: Image.asset(
                        'assets/images/aamadappetti_open.png',
                        width: s,
                        height: s,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),

                  // Layer 4: Floating Sparkling Gems & Stars
                  if (progress > 0.15)
                    Positioned(
                      top: -s * 0.14,
                      child: RepaintBoundary(
                        child: Opacity(
                          opacity: progress.clamp(0.0, 1.0),
                          child: CustomPaint(
                            size: Size(s * 0.95, s * 0.7),
                            painter: _PhotorealisticSparklesPainter(
                              phase: sparklePhase,
                              openProgress: progress,
                            ),
                          ),
                        ),
                      ),
                    ),

                // Layer 5: Latch Unlock Golden Flash Pulse
                if (progress > 0.05 && progress < 0.45)
                  Positioned(
                    top: s * 0.48,
                    child: Opacity(
                      opacity: (math.sin(progress / 0.45 * math.pi)).clamp(0.0, 1.0),
                      child: Container(
                        width: s * 0.25,
                        height: s * 0.25,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Color(0xFFFFFBE8),
                              blurRadius: 24,
                              spreadRadius: 8,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

// =========================================================================
// CUSTOM PAINTER: DIVINE RAYS (Golden sunlight streaming upwards)
// =========================================================================
class _PhotorealisticSunburstPainter extends CustomPainter {
  final double progress;

  _PhotorealisticSunburstPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;
    const rayCount = 16;

    for (int i = 0; i < rayCount; i++) {
      final angle = (i * 2 * math.pi) / rayCount;
      final sweep = (math.pi / rayCount) * 0.65;

      final path = Path()
        ..moveTo(center.dx, center.dy)
        ..arcTo(
          Rect.fromCircle(center: center, radius: maxRadius),
          angle - sweep / 2,
          sweep,
          false,
        )
        ..close();

      final rayPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0xFFFFDF7A).withValues(alpha: 0.38 * progress),
            const Color(0xFFD4AF37).withValues(alpha: 0.18 * progress),
            Colors.transparent,
          ],
          stops: const [0.0, 0.55, 1.0],
        ).createShader(Rect.fromCircle(center: center, radius: maxRadius));

      canvas.drawPath(path, rayPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _PhotorealisticSunburstPainter oldDelegate) =>
      oldDelegate.progress != progress;
}

// =========================================================================
// CUSTOM PAINTER: DIVINE SPARKLES (Floating glittering diamond particles)
// =========================================================================
class _PhotorealisticSparklesPainter extends CustomPainter {
  final double phase;
  final double openProgress;

  _PhotorealisticSparklesPainter({required this.phase, required this.openProgress});

  static const List<_SparkleSpec> _particles = [
    _SparkleSpec(Offset(0.20, 0.65), 5.5, Color(0xFFFFF8D6), 0.0),
    _SparkleSpec(Offset(0.35, 0.35), 6.5, Color(0xFFFFD700), 0.25),
    _SparkleSpec(Offset(0.50, 0.20), 8.0, Color(0xFFFFFFFF), 0.5),
    _SparkleSpec(Offset(0.65, 0.38), 6.0, Color(0xFFFFE082), 0.75),
    _SparkleSpec(Offset(0.80, 0.60), 5.0, Color(0xFFFFF176), 0.15),
    _SparkleSpec(Offset(0.42, 0.55), 4.5, Color(0xFFFFD54F), 0.6),
    _SparkleSpec(Offset(0.58, 0.50), 5.0, Color(0xFFFFF8E1), 0.35),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    for (final spec in _particles) {
      final particlePhase = (phase + spec.phaseOffset) % 1.0;
      final floatY = math.sin(particlePhase * 2 * math.pi) * 8.0;
      final pulseScale = 0.5 + 0.5 * math.sin(particlePhase * 2 * math.pi);
      final alpha = (math.sin(particlePhase * math.pi) * openProgress).clamp(0.0, 1.0);

      final pos = Offset(
        size.width * spec.relOffset.dx,
        size.height * spec.relOffset.dy + floatY,
      );

      final pSize = spec.baseRadius * (0.6 + 0.6 * pulseScale);

      // Star 4-point sparkle cross
      final starPaint = Paint()
        ..color = spec.color.withValues(alpha: alpha * 0.9)
        ..style = PaintingStyle.fill;

      final path = Path()
        ..moveTo(pos.dx, pos.dy - pSize)
        ..quadraticBezierTo(pos.dx, pos.dy, pos.dx + pSize, pos.dy)
        ..quadraticBezierTo(pos.dx, pos.dy, pos.dx, pos.dy + pSize)
        ..quadraticBezierTo(pos.dx, pos.dy, pos.dx - pSize, pos.dy)
        ..quadraticBezierTo(pos.dx, pos.dy, pos.dx, pos.dy - pSize)
        ..close();

      // Outer glow
      canvas.drawCircle(
        pos,
        pSize * 1.5,
        Paint()
          ..color = spec.color.withValues(alpha: alpha * 0.35)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
      );

      canvas.drawPath(path, starPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _PhotorealisticSparklesPainter oldDelegate) =>
      oldDelegate.phase != phase || oldDelegate.openProgress != openProgress;
}

class _SparkleSpec {
  final Offset relOffset;
  final double baseRadius;
  final Color color;
  final double phaseOffset;

  const _SparkleSpec(this.relOffset, this.baseRadius, this.color, this.phaseOffset);
}
