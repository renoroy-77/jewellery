import 'package:flutter_test/flutter_test.dart';
import 'package:aamadappetti_admin/main.dart';

void main() {
  testWidgets('Sanctum Login screen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AamadappettiApp());
    expect(find.text('ADMIN  SANCTUM'), findsOneWidget);
    expect(find.text('SIGN IN'), findsOneWidget);
  });
}
