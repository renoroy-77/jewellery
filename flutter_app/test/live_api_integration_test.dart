import 'package:flutter_test/flutter_test.dart';
import 'package:aamadappetti_admin/services/api_service.dart';

void main() {
  group('Live FastPanel VPS API Integration Tests (https://aamadappetti.com)', () {
    test('1. GET /api/dashboard/stats - Fetches live store metrics and data', () async {
      final stats = await ApiService.getDashboardStats();
      expect(stats, isNotNull);
      expect(stats!.containsKey('metrics'), isTrue);
      final metrics = stats['metrics'] as Map<String, dynamic>;
      expect(metrics.containsKey('totalRevenue'), isTrue);
      expect(metrics.containsKey('totalProducts'), isTrue);
      expect(metrics.containsKey('totalOrders'), isTrue);
      expect(metrics.containsKey('totalUsers'), isTrue);
    });

    test('2. GET /api/products - Fetches live consecrated ornaments catalog', () async {
      final products = await ApiService.getProducts();
      expect(products, isNotNull);
      expect(products is List, isTrue);
      if (products!.isNotEmpty) {
        final first = products.first as Map<String, dynamic>;
        expect(first.containsKey('id'), isTrue);
        expect(first.containsKey('name'), isTrue);
        expect(first.containsKey('price'), isTrue);
      }
    });

    test('3. GET /api/orders - Fetches live sacred orders pipeline', () async {
      final orders = await ApiService.getOrders();
      expect(orders, isNotNull);
      expect(orders is List, isTrue);
    });

    test('4. GET /api/users - Fetches live devotee customer accounts', () async {
      final devotees = await ApiService.getDevotees();
      expect(devotees, isNotNull);
      expect(devotees is List, isTrue);
      expect(devotees!.isNotEmpty, isTrue);
      final devotee = devotees.first as Map<String, dynamic>;
      expect(devotee.containsKey('email'), isTrue);
    });

    test('5. GET /api/categories - Fetches live deity and collection categories', () async {
      final categories = await ApiService.getCategories();
      expect(categories, isNotNull);
      expect(categories is List, isTrue);
      expect(categories!.isNotEmpty, isTrue);
      final cat = categories.first as Map<String, dynamic>;
      expect(cat.containsKey('name'), isTrue);
    });

    test('6. GET /api/cms/hero-slides - Fetches live CMS homepage banners', () async {
      final slides = await ApiService.getCmsHeroSlides();
      expect(slides, isNotNull);
      expect(slides is List, isTrue);
      expect(slides!.isNotEmpty, isTrue);
    });

    test('7. GET /api/blog - Fetches live sacred journal articles', () async {
      final articles = await ApiService.getBlogPosts();
      expect(articles, isNotNull);
      expect(articles is List, isTrue);
      expect(articles!.isNotEmpty, isTrue);
    });

    test('8. GET /api/inquiries - Fetches live customer leads & inquiries', () async {
      final inquiries = await ApiService.getInquiries();
      expect(inquiries, isNotNull);
      expect(inquiries is List, isTrue);
    });

    test('9. GET /api/cms/checkout-settings - Fetches live checkout & shipping settings', () async {
      final settings = await ApiService.getCheckoutSettings();
      expect(settings, isNotNull);
      expect(settings!.containsKey('shippingFee'), isTrue);
      expect(settings.containsKey('freeShippingThreshold'), isTrue);
    });

    test('10. GET /api/referrals/settings - Fetches live referral program configuration', () async {
      final referrals = await ApiService.getReferralSettings();
      expect(referrals, isNotNull);
      expect(referrals!.containsKey('enabled'), isTrue);
    });

    test('11. GET /api/products (Paginated) - Fetches paginated products envelope', () async {
      final paginated = await ApiService.getProductsPaginated(page: 1, limit: 3);
      expect(paginated, isNotNull);
      expect(paginated!.containsKey('data'), isTrue);
      expect(paginated['data'] is List, isTrue);
      expect(paginated.containsKey('total'), isTrue);
      expect(paginated.containsKey('page'), isTrue);
      expect(paginated.containsKey('limit'), isTrue);
      expect(paginated.containsKey('totalPages'), isTrue);
      expect(paginated['page'], 1);
      expect(paginated['limit'], 3);
    });

    test('12. GET /api/devotees (Paginated) - Fetches paginated devotees envelope', () async {
      final paginated = await ApiService.getDevoteesPaginated(page: 1, limit: 3);
      expect(paginated, isNotNull);
      expect(paginated!.containsKey('data'), isTrue);
      expect(paginated['data'] is List, isTrue);
      expect(paginated.containsKey('total'), isTrue);
    });

    test('13. GET /api/orders (Paginated) - Fetches paginated orders envelope', () async {
      final paginated = await ApiService.getOrdersPaginated(page: 1, limit: 3);
      expect(paginated, isNotNull);
      expect(paginated!.containsKey('data'), isTrue);
      expect(paginated['data'] is List, isTrue);
      expect(paginated.containsKey('total'), isTrue);
    });
  });
}
