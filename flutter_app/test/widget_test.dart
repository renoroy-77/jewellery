import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aamadappetti_admin/main.dart';

void main() {
  testWidgets('Sanctum Splash screen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AamadappettiApp());
    expect(find.text('AAMADAPPETTI'), findsOneWidget);
    expect(find.text('EXECUTIVE ADMIN SANCTUM'), findsOneWidget);
    // Unmount so repeating ticker stops cleanly
    await tester.pumpWidget(const SizedBox());
  });
}
