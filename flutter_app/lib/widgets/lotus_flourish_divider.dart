import 'package:flutter/material.dart';
import '../theme/temple_theme.dart';

class LotusFlourishDivider extends StatelessWidget {
  final double width;
  final Color? color;
  final double height;

  const LotusFlourishDivider({
    super.key,
    this.width = 240,
    this.color,
    this.height = 16,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(
        painter: _LotusFlourishPainter(
          tint: color ?? TempleColors.goldAmber,
        ),
      ),
    );
  }
}

class _LotusFlourishPainter extends CustomPainter {
  final Color tint;

  _LotusFlourishPainter({required this.tint});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = tint
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // Draw central tall petal
    final centerPetal = Path();
    centerPetal.moveTo(center.dx, center.dy - 6.5);
    centerPetal.quadraticBezierTo(
      center.dx + 3.2,
      center.dy - 1.0,
      center.dx,
      center.dy + 4.0,
    );
    centerPetal.quadraticBezierTo(
      center.dx - 3.2,
      center.dy - 1.0,
      center.dx,
      center.dy - 6.5,
    );
    canvas.drawPath(centerPetal, paint);

    // Draw left angled petal
    final leftPetal = Path();
    leftPetal.moveTo(center.dx - 1.5, center.dy + 3.0);
    leftPetal.quadraticBezierTo(
      center.dx - 7.5,
      center.dy - 4.5,
      center.dx - 6.0,
      center.dy - 1.5,
    );
    leftPetal.quadraticBezierTo(
      center.dx - 4.5,
      center.dy + 2.0,
      center.dx - 1.5,
      center.dy + 3.0,
    );
    canvas.drawPath(leftPetal, paint);

    // Draw right angled petal
    final rightPetal = Path();
    rightPetal.moveTo(center.dx + 1.5, center.dy + 3.0);
    rightPetal.quadraticBezierTo(
      center.dx + 7.5,
      center.dy - 4.5,
      center.dx + 6.0,
      center.dy - 1.5,
    );
    rightPetal.quadraticBezierTo(
      center.dx + 4.5,
      center.dy + 2.0,
      center.dx + 1.5,
      center.dy + 3.0,
    );
    canvas.drawPath(rightPetal, paint);

    // Small golden side diamonds/dots
    canvas.drawCircle(Offset(center.dx - 12.0, center.dy + 1.5), 1.3, paint);
    canvas.drawCircle(Offset(center.dx + 12.0, center.dy + 1.5), 1.3, paint);

    // Left tapering line
    final linePaint = Paint()
      ..shader = LinearGradient(
        colors: [
          tint.withValues(alpha: 0.0),
          tint.withValues(alpha: 0.75),
          tint,
        ],
        stops: const [0.0, 0.6, 1.0],
      ).createShader(Rect.fromLTRB(0, 0, center.dx - 16, size.height))
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(10, center.dy + 1.5),
      Offset(center.dx - 16, center.dy + 1.5),
      linePaint,
    );

    // Right tapering line
    final rightLinePaint = Paint()
      ..shader = LinearGradient(
        colors: [
          tint,
          tint.withValues(alpha: 0.75),
          tint.withValues(alpha: 0.0),
        ],
        stops: const [0.0, 0.4, 1.0],
      ).createShader(
        Rect.fromLTRB(center.dx + 16, 0, size.width, size.height),
      )
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(center.dx + 16, center.dy + 1.5),
      Offset(size.width - 10, center.dy + 1.5),
      rightLinePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _LotusFlourishPainter oldDelegate) =>
      oldDelegate.tint != tint;
}
