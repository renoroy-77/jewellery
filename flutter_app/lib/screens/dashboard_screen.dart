import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../widgets/lotus_flourish_divider.dart';
import 'login_screen.dart';
import 'cms_slides_screen.dart';
import 'categories_screen.dart';
import 'blog_screen.dart';
import 'shipping_screen.dart';
import 'referrals_screen.dart';
import 'inquiries_screen.dart';
import '../services/api_service.dart';
import '../widgets/sanctum_media_uploader.dart';
import '../utils/sanctum_launcher.dart';
import '../services/auth_storage.dart';
import '../services/notification_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  final int initialTab;
  final String? targetOrderId;
  final String? targetProductId;

  const AdminDashboardScreen({
    super.key,
    this.initialTab = 0,
    this.targetOrderId,
    this.targetProductId,
  });

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _selectedTabIndex = 0; // 0: Dashboard, 1: Products, 2: Orders, 3: Devotees, 4: More
  int _selectedCategoryIndex = 0;
  String _productSearchQuery = '';
  String _devoteeSearchQuery = '';
  String _orderStatusFilter = 'All';
  String _productStockFilter = 'ALL';
  String _productSortBy = 'Newest';
  final TextEditingController _productSearchCtrl = TextEditingController();
  bool _isSearchingBackend = false;

  bool _isLoadingBackend = false;
  bool _isBackendOnline = false;
  Map<String, dynamic> _metrics = {
    'totalRevenue': 0,
    'totalOrders': 0,
    'pendingOrders': 0,
    'consecratedOrders': 0,
    'totalProducts': 0,
    'inStockProducts': 0,
    'totalUsers': 0,
    'totalCategories': 0,
  };

  @override
  void initState() {
    super.initState();
    _selectedTabIndex = widget.initialTab;
    if (widget.targetProductId != null && widget.targetProductId!.isNotEmpty) {
      _productSearchQuery = widget.targetProductId!;
      _productSearchCtrl.text = widget.targetProductId!;
    }
    _fetchLiveDashboardStats();
    NotificationService.ensureDeviceRegistered();
  }

  @override
  void dispose() {
    _productSearchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchLiveDashboardStats() async {
    setState(() => _isLoadingBackend = true);
    try {
      // Execute all 6 FastPanel live API calls in parallel for optimal responsiveness
      final results = await Future.wait([
        ApiService.getDashboardStats(),
        ApiService.getProducts(),
        ApiService.getOrders(),
        ApiService.getDevotees(),
        ApiService.getCategories(),
        ApiService.getInquiries(),
      ]);

      final data = results[0] as Map<String, dynamic>?;
      final liveProds = results[1] as List<dynamic>?;
      final liveOrders = results[2] as List<dynamic>?;
      final liveUsers = results[3] as List<dynamic>?;
      final liveCats = results[4] as List<dynamic>?;
      final liveInqs = results[5] as List<dynamic>?;

      if (!mounted) return;

      setState(() {
        _isBackendOnline = true;

        // 1. Live store metrics
        if (data != null && data['metrics'] != null) {
          _metrics = Map<String, dynamic>.from(data['metrics']);
        }

        // 2. Live consecrated ornaments catalog
        if (liveProds != null) {
          _products.clear();
          _products.addAll(liveProds.map<Map<String, dynamic>>((p) {
            final imgList = p['images'] as List?;
            String prodImg = '';
            if (imgList != null && imgList.isNotEmpty) {
              prodImg = imgList[0].toString();
            } else if (p['image'] != null) {
              prodImg = p['image'].toString();
            }
            final priceVal = p['price'] ?? 0;
            final origVal = p['originalPrice'] ?? (priceVal * 1.3).round();
            final rawStock = p['stock'] ?? (p['inStock'] == true ? 25 : 0);
            final isFeaturedVal = p['featured'] == true;
            final isInStockVal = p['inStock'] ?? true;
            return {
              'id': p['id']?.toString() ?? '',
              'name': p['name'] ?? 'Panchaloham Ornament',
              'deity': p['deity'] ?? (p['category'] != null ? p['category'].toString().toUpperCase() : 'Sacred Deity'),
              'category': p['category'] ?? '',
              'price': '₹ ${priceVal.toString()}',
              'priceRaw': priceVal,
              'originalPrice': '₹ ${origVal.toString()}',
              'stock': rawStock,
              'isLowStock': rawStock < 5,
              'rating': (p['rating'] is num) ? (p['rating'] as num).toDouble() : 5.0,
              'image': prodImg,
              'isActive': isInStockVal,
              'inStock': isInStockVal,
              'featured': isFeaturedVal,
              'isFeatured': isFeaturedVal,
              'description': p['description'] ?? '',
            };
          }));
        }

        // 3. Live sacred orders pipeline
        if (liveOrders != null) {
          _orders.clear();
          _orders.addAll(liveOrders.map<Map<String, dynamic>>((o) {
            final itemsList = o['items'] as List?;
            final firstItem = itemsList != null && itemsList.isNotEmpty ? itemsList[0] : null;
            final itemName = firstItem?['name'] ?? firstItem?['productName'] ?? 'Consecrated Ornament';
            final itemCount = itemsList?.length ?? 1;
            final totalAmt = o['totalAmount'] ?? 0;
            final status = o['status']?.toString() ?? 'Pending';

            Color badgeColor = const Color(0xFFB45309);
            Color badgeBg = const Color(0xFFFEF3C7);
            if (status == 'Confirmed') {
              badgeColor = const Color(0xFF047857);
              badgeBg = const Color(0xFFD1FAE5);
            } else if (status == 'Shipped') {
              badgeColor = const Color(0xFF1D4ED8);
              badgeBg = const Color(0xFFEFF6FF);
            } else if (status == 'Delivered') {
              badgeColor = const Color(0xFF0D5438);
              badgeBg = const Color(0xFFECFDF5);
            } else if (status == 'Cancelled') {
              badgeColor = const Color(0xFFDC2626);
              badgeBg = const Color(0xFFFEE2E2);
            }

            String orderDate = 'Recent';
            if (o['createdAt'] != null) {
              try {
                final dt = DateTime.parse(o['createdAt'].toString()).toLocal();
                orderDate = '${dt.day}/${dt.month}/${dt.year}';
              } catch (_) {
                orderDate = o['createdAt'].toString();
              }
            }

            String itemImg = '';
            if (firstItem?['image'] != null && firstItem!['image'].toString().isNotEmpty) {
              itemImg = firstItem['image'].toString();
            }

            return {
              'id': o['id']?.toString() ?? 'ORD-00',
              'customer': o['devoteeName'] ?? o['customer'] ?? 'Sacred Devotee',
              'phone': o['phone'] ?? '+91 98000 00000',
              'email': o['email'] ?? 'devotee@temple.org',
              'address': o['shippingAddress'] ?? 'Sanctum Dispatch Address',
              'item': '$itemName • $itemCount item${itemCount > 1 ? 's' : ''}',
              'productName': itemName,
              'amount': '₹ ${totalAmt.toString()}',
              'status': status,
              'payment': o['paymentMethod'] ?? 'Verified Online',
              'date': orderDate,
              'badgeColor': badgeColor,
              'badgeBg': badgeBg,
              'image': itemImg,
              'items': itemsList ?? [],
            };
          }));
        }

        // 4. Live devotee customer accounts
        if (liveUsers != null) {
          _devotees.clear();
          _devotees.addAll(liveUsers.map<Map<String, dynamic>>((u) {
            final cleanName = (u['name'] ?? 'Devotee').toString().trim();
            final safeName = cleanName.isEmpty ? 'Devotee' : cleanName;
            final parts = safeName.split(' ').where((s) => s.isNotEmpty).toList();
            final initials = parts.length > 1
                ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
                : (safeName.length >= 2 ? safeName.substring(0, 2) : safeName).toUpperCase();
            return {
              'id': u['id'] ?? 'USR-00',
              'name': safeName,
              'email': u['email'] ?? '',
              'phone': (u['phone'] != null && u['phone'].toString().isNotEmpty) ? u['phone'].toString() : 'Not provided',
              'city': (u['shippingAddress'] ?? '').toString().contains(',')
                  ? (u['shippingAddress'] ?? '').toString().split(',')[1].trim()
                  : 'India',
              'state': 'India',
              'address': (u['shippingAddress'] != null && u['shippingAddress'].toString().isNotEmpty) ? u['shippingAddress'].toString() : 'On file',
              'ordersCount': u['ordersCount'] ?? 0,
              'totalSpent': '₹ ${u['totalSpent'] ?? 0}',
              'memberSince': u['memberSince'] ?? 'Sep 2026',
              'status': (u['ordersCount'] ?? 0) > 0 ? 'Verified Devotee' : 'Registered Member',
              'initials': initials,
              'referralCode': u['referralCode'] ?? '',
              'color': const Color(0xFF0D5438),
              'bg': const Color(0xFFECFDF5),
            };
          }));
        }

        // 5. Live deity categories
        if (liveCats != null) {
          final catNames = <String>['All'];
          for (final c in liveCats) {
            final cName = c['name']?.toString() ?? c['slug']?.toString();
            if (cName != null && cName.isNotEmpty && !catNames.contains(cName)) {
              catNames.add(cName);
            }
          }
          _categories.clear();
          _categories.addAll(catNames);
        }

        // 6. Live customer inquiries
        if (liveInqs != null) {
          _inquiries.clear();
          _inquiries.addAll(liveInqs.map<Map<String, dynamic>>((inq) {
            return {
              'id': inq['referenceId'] ?? inq['id'] ?? 'INQ-00',
              'name': inq['name'] ?? inq['devoteeName'] ?? 'Sacred Devotee',
              'email': inq['email'] ?? '',
              'phone': inq['phone'] ?? '',
              'request': inq['message'] ?? inq['request'] ?? inq['inquiryType'] ?? 'Devotee Inquiry',
              'status': inq['status'] ?? 'NEW',
              'date': inq['createdAt'] != null
                  ? (inq['createdAt'].toString().length >= 10
                      ? inq['createdAt'].toString().substring(0, 10)
                      : inq['createdAt'].toString())
                  : 'Recent',
              'notes': inq['notes'] ?? '',
              'budget': inq['budget'] ?? 'N/A',
            };
          }));
        }

        _populateLiveNotifications();
      });
    } catch (e) {
      debugPrint('[DashboardScreen] live fetch error: $e');
    } finally {
      if (mounted) setState(() => _isLoadingBackend = false);
    }
  }

  // Pure live state lists (no mock dummy items)
  final List<String> _categories = ['All'];
  final List<Map<String, dynamic>> _products = [];
  final List<Map<String, dynamic>> _orders = [];
  final List<Map<String, dynamic>> _devotees = [];
  final List<Map<String, dynamic>> _inquiries = [];
  final List<Map<String, dynamic>> _notifications = [];
  String _selectedNotifFilter = 'ALL';

  // Sanctum Live Pagination State
  int _productsCurrentPage = 1;
  int _productsPageSize = 6;
  int _ordersCurrentPage = 1;
  int _ordersPageSize = 6;
  int _devoteesCurrentPage = 1;
  int _devoteesPageSize = 6;

  int get _unreadNotificationsCount => _notifications.where((n) => n['isRead'] == false).length;

  void _populateLiveNotifications() {
    _notifications.clear();

    // 1. Live Orders
    for (final o in _orders.take(8)) {
      final status = (o['status'] ?? 'Pending').toString();
      _notifications.add({
        'id': 'notif-ord-${o['id']}',
        'title': 'Sacred Order #${o['id']}',
        'subtitle': 'Devotee ${o['name'] ?? 'Devotee'} • ${o['item'] ?? 'Consecrated Ornament'} • ${o['price']}',
        'status': status.toUpperCase(),
        'type': 'ORDER',
        'time': o['date'] ?? 'Recent',
        'isRead': status.toLowerCase() == 'delivered',
        'icon': Icons.shopping_bag_outlined,
        'iconColor': const Color(0xFF047857),
        'bgColor': const Color(0xFFECFDF5),
        'data': o,
      });
    }

    // 2. Low Stock Alerts
    for (final p in _products.where((p) => (p['stock'] is int && (p['stock'] as int) < 5)).take(4)) {
      _notifications.add({
        'id': 'notif-stock-${p['id']}',
        'title': 'Low Sanctum Stock: ${p['name']}',
        'subtitle': 'Only ${p['stock']} unit(s) remaining in holy inventory. Restock required.',
        'status': 'LOW STOCK',
        'type': 'PRODUCT',
        'time': 'Alert',
        'isRead': false,
        'icon': Icons.inventory_2_outlined,
        'iconColor': const Color(0xFFD97706),
        'bgColor': const Color(0xFFFFFBEB),
        'data': p,
      });
    }

    // 3. Devotee Custom Inquiries
    for (final inq in _inquiries.where((i) => i['status'] == 'NEW').take(4)) {
      _notifications.add({
        'id': 'notif-inq-${inq['id']}',
        'title': 'Custom Ornament Request: ${inq['name']}',
        'subtitle': '"${inq['request']}" • ${inq['phone']}',
        'status': 'NEW INQUIRY',
        'type': 'INQUIRY',
        'time': inq['date'] ?? 'Just now',
        'isRead': false,
        'icon': Icons.chat_bubble_outline_rounded,
        'iconColor': const Color(0xFF2563EB),
        'bgColor': const Color(0xFFEFF6FF),
        'data': inq,
      });
    }
  }

  Future<void> _testPushNotificationDirectly() async {
    final messenger = ScaffoldMessenger.of(context);
    messenger.showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
            SizedBox(width: 12),
            Text('Registering device token with server...'),
          ],
        ),
        duration: Duration(seconds: 2),
      ),
    );

    final token = await NotificationService.ensureDeviceRegistered();
    if (token == null || token.isEmpty) {
      messenger.hideCurrentSnackBar();
      messenger.showSnackBar(
        const SnackBar(
          content: Text('⚠️ Could not obtain device token. Please check Internet or Google Play Services.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final success = await ApiService.sendTestFcmNotification(
      title: '🪔 Sacred Notification Test',
      body: 'Sanctum push alerts verified on this device! Total: ₹5,400',
    );

    messenger.hideCurrentSnackBar();
    if (success) {
      messenger.showSnackBar(
        SnackBar(
          content: Text('✨ Push sent to this device! Check notification shade (Token: ${token.substring(0, 8)}...)'),
          backgroundColor: const Color(0xFF031910),
          duration: const Duration(seconds: 4),
        ),
      );
    } else {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('⚠️ Server was unable to dispatch push notification.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _openNotificationsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) {
          final filtered = _selectedNotifFilter == 'ALL'
              ? _notifications
              : _notifications.where((n) => n['type'] == _selectedNotifFilter).toList();

          return SafeArea(
            child: Container(
              constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
              padding: const EdgeInsets.only(top: 14, left: 18, right: 18, bottom: 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -6))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Header with Temple Gold Logo
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: TempleColors.goldPrimary, size: 18),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => Navigator.pop(ctx),
                            tooltip: 'Back',
                          ),
                          const SizedBox(width: 8),
                          Image.asset(
                            'assets/images/brand_logo_gold.png',
                            height: 24,
                            errorBuilder: (ctx, err, stack) => const Icon(Icons.temple_hindu_rounded, color: TempleColors.goldPrimary, size: 22),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'SANCTUM DISPATCH ALERTS',
                            style: GoogleFonts.cinzel(fontSize: 13.5, fontWeight: FontWeight.bold, color: const Color(0xFF03180F), letterSpacing: 0.8),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8), size: 22),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => Navigator.pop(ctx),
                        tooltip: 'Close',
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Real-time order dispatches, vault inventory alerts & devotee requests',
                    style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),
                  // 1-Tap Live Device Test Push Button
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _testPushNotificationDirectly();
                      },
                      icon: const Icon(Icons.notifications_active_rounded, size: 16, color: Color(0xFF031910)),
                      label: Text(
                        'Test Push Notification on This Phone',
                        style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700, color: const Color(0xFF031910)),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE2C475),
                        foregroundColor: const Color(0xFF031910),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),

                  // Sub-header controls (Unread count, Mark All Read, Clear)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${_notifications.where((n) => !n['isRead']).length} Unread',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF334155)),
                        ),
                      ),
                      Row(
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                for (final n in _notifications) {
                                  n['isRead'] = true;
                                }
                              });
                              setSheetState(() {});
                            },
                            icon: const Icon(Icons.done_all_rounded, size: 14, color: Color(0xFF047857)),
                            label: Text('Mark all read', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF047857))),
                            style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                          ),
                          const SizedBox(width: 8),
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _notifications.clear();
                              });
                              setSheetState(() {});
                            },
                            icon: const Icon(Icons.delete_sweep_outlined, size: 14, color: Color(0xFF94A3B8)),
                            label: Text('Clear', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF94A3B8))),
                            style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Filter Chips (ALL, ORDERS, PRODUCTS, INQUIRY)
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildNotifFilterChip('ALL', 'ALL (${_notifications.length})', setSheetState),
                        const SizedBox(width: 6),
                        _buildNotifFilterChip('ORDER', 'ORDERS (${_notifications.where((n) => n['type'] == 'ORDER').length})', setSheetState),
                        const SizedBox(width: 6),
                        _buildNotifFilterChip('PRODUCT', 'PRODUCTS (${_notifications.where((n) => n['type'] == 'PRODUCT').length})', setSheetState),
                        const SizedBox(width: 6),
                        _buildNotifFilterChip('INQUIRY', 'LEADS (${_notifications.where((n) => n['type'] == 'INQUIRY').length})', setSheetState),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 8),

                  // Notifications List
                  Expanded(
                    child: filtered.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFFFFBEB),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.notifications_active_outlined, color: TempleColors.goldPrimary, size: 30),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Sanctum Registry is Peaceful',
                                  style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'No new orders or inventory alerts requiring attention.',
                                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: filtered.length,
                            separatorBuilder: (sCtx, sIdx) => const SizedBox(height: 8),
                            itemBuilder: (lCtx, idx) {
                              final item = filtered[idx];
                              final isRead = item['isRead'] == true;
                              return InkWell(
                                onTap: () {
                                  setState(() => item['isRead'] = true);
                                  setSheetState(() {});
                                  Navigator.pop(ctx);
                                  if (item['type'] == 'ORDER') {
                                    setState(() => _selectedTabIndex = 2);
                                  } else if (item['type'] == 'PRODUCT') {
                                    setState(() => _selectedTabIndex = 1);
                                  } else if (item['type'] == 'INQUIRY') {
                                    Navigator.push(context, MaterialPageRoute(builder: (_) => const InquiriesScreen()));
                                  }
                                },
                                borderRadius: BorderRadius.circular(14),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isRead ? Colors.white : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: isRead ? const Color(0xFFE2E8F0) : TempleColors.goldPrimary.withValues(alpha: 0.5),
                                      width: isRead ? 1 : 1.5,
                                    ),
                                    boxShadow: [
                                      if (!isRead)
                                        BoxShadow(
                                          color: TempleColors.goldPrimary.withValues(alpha: 0.08),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                    ],
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 38,
                                        height: 38,
                                        decoration: BoxDecoration(
                                          color: item['bgColor'],
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(item['icon'], color: item['iconColor'], size: 20),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    item['title'],
                                                    style: GoogleFonts.inter(
                                                      fontSize: 13,
                                                      fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                                                      color: const Color(0xFF0F172A),
                                                    ),
                                                  ),
                                                ),
                                                if (!isRead)
                                                  Container(
                                                    width: 7,
                                                    height: 7,
                                                    margin: const EdgeInsets.only(right: 6),
                                                    decoration: const BoxDecoration(
                                                      color: Color(0xFFEF4444),
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                                Text(
                                                  item['time'],
                                                  style: GoogleFonts.inter(fontSize: 10.5, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 3),
                                            Text(
                                              item['subtitle'],
                                              style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF475569)),
                                            ),
                                            const SizedBox(height: 6),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                                  decoration: BoxDecoration(
                                                    color: item['bgColor'],
                                                    borderRadius: BorderRadius.circular(5),
                                                  ),
                                                  child: Text(
                                                    item['status'],
                                                    style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: item['iconColor']),
                                                  ),
                                                ),
                                                Text(
                                                  'Tap to view →',
                                                  style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w600, color: TempleColors.goldPrimary),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotifFilterChip(String value, String label, StateSetter setSheetState) {
    final isSelected = _selectedNotifFilter == value;
    return InkWell(
      onTap: () {
        setSheetState(() => _selectedNotifFilter = value);
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? TempleColors.emeraldMedium : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? TempleColors.emeraldMedium : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? TempleColors.goldBright : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogout() async {
    await AuthStorage.clearLogin();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  // ==========================================
  // MODALS & ACTIONS: PRODUCT
  // ==========================================
  void _openAddProductSheet() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final origPriceCtrl = TextEditingController();
    final deityCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: '15');
    final descCtrl = TextEditingController();
    String selectedImage = '';
    bool isFeatured = false;
    bool inStock = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5)),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4.5,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () => Navigator.pop(ctx),
                          tooltip: 'Back',
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Add Consecrated Product',
                          style: GoogleFonts.cinzel(
                            fontSize: 15.5,
                            fontWeight: FontWeight.w700,
                            color: TempleColors.textDark,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => Navigator.pop(ctx),
                      tooltip: 'Close',
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                _buildFormInput(nameCtrl, 'Product Name', Icons.inventory_2_outlined),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildFormInput(deityCtrl, 'Deity / Category', Icons.category_outlined),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFormInput(stockCtrl, 'Initial Stock', Icons.all_inbox_outlined, type: TextInputType.number),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildFormInput(priceCtrl, 'Selling Price (₹)', Icons.currency_rupee, type: TextInputType.number),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFormInput(origPriceCtrl, 'Original MRP (₹)', Icons.local_offer_outlined, type: TextInputType.number),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildFormInput(descCtrl, 'Consecration Details / Notes', Icons.description_outlined, maxLines: 2),
                const SizedBox(height: 16),
                SanctumMediaUploader(
                  label: 'CONSECRATED PRODUCT PHOTO',
                  initialImageUrl: selectedImage,
                  onImageChanged: (url) {
                    setSheetState(() => selectedImage = url);
                  },
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('Featured', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                            ),
                            Switch(
                              value: isFeatured,
                              onChanged: (v) => setSheetState(() => isFeatured = v),
                              activeThumbColor: TempleColors.emeraldMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('In Stock', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                            ),
                            Switch(
                              value: inStock,
                              onChanged: (v) => setSheetState(() => inStock = v),
                              activeThumbColor: TempleColors.emeraldMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    final name = nameCtrl.text.trim();
                    final priceStr = priceCtrl.text.trim();
                    final stockStr = stockCtrl.text.trim();

                    if (name.isEmpty) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(content: Text('Please enter a product name'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }
                    final cleanPrice = priceStr.replaceAll(RegExp(r'[^0-9]'), '');
                    final priceVal = int.tryParse(cleanPrice);
                    if (priceVal == null || priceVal <= 0) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(
                          content: Text('Please enter a valid numeric selling price (greater than ₹0)'),
                          backgroundColor: Color(0xFFDC2626),
                        ),
                      );
                      return;
                    }
                    final cleanStock = stockStr.replaceAll(RegExp(r'[^0-9]'), '');
                    final stockVal = int.tryParse(cleanStock) ?? 15;

                    final cleanOrig = origPriceCtrl.text.trim().replaceAll(RegExp(r'[^0-9]'), '');
                    final origPriceVal = int.tryParse(cleanOrig) ?? (priceVal * 1.3).round();

                    final deity = deityCtrl.text.trim().isEmpty ? 'General' : deityCtrl.text.trim();
                    final desc = descCtrl.text.trim().isEmpty ? 'Authentic 5-metal consecrated jewelry.' : descCtrl.text.trim();

                    setState(() {
                      _products.insert(0, {
                        'id': 'PROD-${_products.length + 10}',
                        'name': name,
                        'deity': deity,
                        'category': deity.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-'),
                        'price': '₹ $priceVal',
                        'priceRaw': priceVal,
                        'originalPrice': '₹ $origPriceVal',
                        'stock': stockVal,
                        'isLowStock': stockVal < 5,
                        'rating': 5.0,
                        'isFeatured': isFeatured,
                        'featured': isFeatured,
                        'isActive': inStock,
                        'inStock': inStock,
                        'image': selectedImage,
                        'images': selectedImage.isNotEmpty ? [selectedImage] : <String>[],
                        'description': desc,
                      });
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Product "$name" consecrated & listed!'),
                        backgroundColor: TempleColors.emeraldMedium,
                      ),
                    );

                    // Persist to backend
                    ApiService.createProduct({
                      'name': name,
                      'deity': deity,
                      'category': deity.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-'),
                      'price': priceVal,
                      'originalPrice': origPriceVal,
                      'stock': stockVal,
                      'description': desc,
                      'inStock': inStock,
                      'rating': 5.0,
                      'featured': isFeatured,
                      'isFeatured': isFeatured,
                      'images': selectedImage.isNotEmpty ? [selectedImage] : <String>[],
                      'image': selectedImage,
                    }).then((ok) {
                      if (ok) {
                        _fetchLiveDashboardStats();
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Failed to save product to backend database. Please check connection.'),
                            backgroundColor: Color(0xFFDC2626),
                          ),
                        );
                      }
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: TempleColors.emeraldMedium,
                    foregroundColor: TempleColors.goldBright,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    '+ CONSECRATE & ADD PRODUCT',
                    style: GoogleFonts.cinzel(fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openEditProductSheet(Map<String, dynamic> product) {
    final nameCtrl = TextEditingController(text: product['name']);
    final priceCtrl = TextEditingController(text: product['price'].toString().replaceAll('₹ ', '').replaceAll(',', ''));
    final origPriceCtrl = TextEditingController(text: product['originalPrice']?.toString().replaceAll('₹ ', '').replaceAll(',', '') ?? '');
    final stockCtrl = TextEditingController(text: product['stock'].toString());
    final deityCtrl = TextEditingController(text: product['deity']);
    final descCtrl = TextEditingController(text: product['description'] ?? product['desc'] ?? '');
    bool isFeatured = product['isFeatured'] == true || product['featured'] == true;
    bool isActive = product['isActive'] != false;
    String selectedImage = product['image']?.toString() ?? '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setSheetState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5)),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4.5,
                    decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(3)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () => Navigator.pop(ctx),
                          tooltip: 'Back',
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Edit Product • ${product['id']}',
                          style: GoogleFonts.cinzel(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: TempleColors.textDark,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => Navigator.pop(ctx),
                      tooltip: 'Close',
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                SanctumMediaUploader(
                  initialImageUrl: selectedImage,
                  label: 'PRODUCT SACRED PHOTOGRAPH',
                  onImageChanged: (newUrl) {
                    setSheetState(() {
                      selectedImage = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 14),
                _buildFormInput(nameCtrl, 'Product Title', Icons.title_rounded),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildFormInput(priceCtrl, 'Selling Price (₹)', Icons.currency_rupee, type: TextInputType.number),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFormInput(origPriceCtrl, 'Original MRP (₹)', Icons.local_offer_outlined, type: TextInputType.number),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildFormInput(stockCtrl, 'Stock Level', Icons.all_inbox_outlined, type: TextInputType.number),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildFormInput(deityCtrl, 'Deity / Collection', Icons.category_outlined),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildFormInput(descCtrl, 'Consecration Details / Notes', Icons.description_outlined, maxLines: 2),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('Featured', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                            ),
                            Switch(
                              value: isFeatured,
                              onChanged: (v) => setSheetState(() => isFeatured = v),
                              activeThumbColor: TempleColors.emeraldMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('In Stock', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                            ),
                            Switch(
                              value: isActive,
                              onChanged: (v) => setSheetState(() => isActive = v),
                              activeThumbColor: TempleColors.emeraldMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    final name = nameCtrl.text.trim();
                    final priceStr = priceCtrl.text.trim();
                    final stockStr = stockCtrl.text.trim();

                    if (name.isEmpty) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(content: Text('Please enter a product name'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }
                    final cleanPrice = priceStr.replaceAll(RegExp(r'[^0-9]'), '');
                    final priceInt = int.tryParse(cleanPrice);
                    if (priceInt == null || priceInt <= 0) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(
                          content: Text('Please enter a valid numeric selling price (greater than ₹0)'),
                          backgroundColor: Color(0xFFDC2626),
                        ),
                      );
                      return;
                    }
                    final cleanStock = stockStr.replaceAll(RegExp(r'[^0-9]'), '');
                    final stockInt = int.tryParse(cleanStock) ?? product['stock'];
                    if (stockInt < 0) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(content: Text('Please enter a valid stock level (0 or more)'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }

                    final desc = descCtrl.text.trim();
                    final cleanOrig = origPriceCtrl.text.trim().replaceAll(RegExp(r'[^0-9]'), '');
                    final origPriceVal = int.tryParse(cleanOrig) ?? (priceInt * 1.3).round();

                    setState(() {
                      product['name'] = name;
                      product['price'] = '₹ $priceInt';
                      product['priceRaw'] = priceInt;
                      product['originalPrice'] = '₹ $origPriceVal';
                      product['stock'] = stockInt;
                      product['deity'] = deityCtrl.text.trim();
                      product['image'] = selectedImage;
                      product['isLowStock'] = stockInt < 5;
                      product['description'] = desc;
                      product['isFeatured'] = isFeatured;
                      product['featured'] = isFeatured;
                      product['isActive'] = isActive;
                      product['inStock'] = isActive;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Updated "${product['name']}" successfully!'),
                        backgroundColor: TempleColors.emeraldMedium,
                      ),
                    );

                    // Persist to backend
                    ApiService.updateProduct(product['id'].toString(), {
                      'name': name,
                      'price': priceInt,
                      'originalPrice': origPriceVal,
                      'stock': stockInt,
                      'deity': deityCtrl.text.trim(),
                      'image': selectedImage,
                      'description': desc,
                      'featured': isFeatured,
                      'inStock': isActive,
                    }).then((ok) {
                      if (!ok && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to update product on backend database.'), backgroundColor: Color(0xFFDC2626)),
                        );
                      }
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: TempleColors.emeraldMedium,
                    foregroundColor: TempleColors.goldBright,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    'SAVE CHANGES',
                    style: GoogleFonts.cinzel(fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  ),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (dCtx) => AlertDialog(
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        title: Text('Remove Product?', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, fontSize: 16)),
                        content: Text('Are you sure you want to remove "${product['name']}" from the live store catalog?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(dCtx), child: const Text('Cancel')),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(dCtx);
                              Navigator.pop(ctx);
                              setState(() {
                                _products.removeWhere((p) => p['id'] == product['id']);
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Product "${product['name']}" removed.'), backgroundColor: Colors.redAccent),
                              );
                              ApiService.deleteProduct(product['id'].toString());
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                            child: const Text('Delete'),
                          ),
                        ],
                      ),
                    );
                  },
                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                  label: const Text('DELETE PRODUCT', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFCA5A5)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openViewProductDialog(Map<String, dynamic> product) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        clipBehavior: Clip.antiAlias,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.85),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: SanctumImage(
                    imageSource: product['image'],
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        product['name'],
                        style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      product['price'],
                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: TempleColors.emeraldMedium),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Deity: ${product['deity']} • Rating: ★ ${product['rating']}',
                  style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 8),
                Text(
                  product['description'] ?? 'Authentic Panchaloham crafted with sacred Vedic metallurgy and temple consecration.',
                  style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF334155), height: 1.4),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF059669)),
                      const SizedBox(width: 6),
                      Text(
                        'Assay Certified • ${product['stock']} units available',
                        style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF065F46)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Close'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _openEditProductSheet(product);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TempleColors.emeraldMedium,
                        foregroundColor: TempleColors.goldBright,
                      ),
                      child: const Text('Edit Item'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // MODALS & ACTIONS: ORDER DETAILS & STATUS
  // ==========================================
  void _openOrderDetailsModal(Map<String, dynamic> order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: const EdgeInsets.all(22),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(3)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order['id'],
                        style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800, color: TempleColors.emeraldMedium),
                      ),
                      Text(
                        order['date'],
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: order['badgeBg'], borderRadius: BorderRadius.circular(8)),
                    child: Text(
                      order['status'],
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: order['badgeColor']),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              Text('Devotee Information', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: Text(order['customer'], style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                  ),
                  InkWell(
                    onTap: () async {
                      final phone = order['phone']?.toString() ?? '';
                      if (phone.isNotEmpty && phone != 'Not provided') {
                        final launched = await SanctumLauncher.makePhoneCall(phone);
                        if (!launched && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open phone dialer for $phone')));
                        }
                      }
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFA7F3D0))),
                      child: Row(
                        children: [
                          const Icon(Icons.phone, size: 12, color: Color(0xFF047857)),
                          const SizedBox(width: 4),
                          Text('Call', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF047857))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  InkWell(
                    onTap: () async {
                      final phone = order['phone']?.toString() ?? '';
                      if (phone.isNotEmpty && phone != 'Not provided') {
                        final launched = await SanctumLauncher.openWhatsApp(
                          phone,
                          message: 'Namaste ${order['customer']}, regarding your sacred order ${order['id']} with Aamadappetti Panchaloham Jewellery...',
                        );
                        if (!launched && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not launch WhatsApp for $phone')));
                        }
                      }
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFF25D366), borderRadius: BorderRadius.circular(6)),
                      child: Row(
                        children: [
                          const Icon(Icons.chat_bubble_outline_rounded, size: 12, color: Colors.white),
                          const SizedBox(width: 4),
                          Text('WhatsApp', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text('${order['phone']} • ${order['email']}', style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF64748B)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        order['address'] ?? 'Temple address on file',
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF334155)),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 24),
              Text('Order Items & Payment', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SanctumImage(imageSource: order['image'], width: 44, height: 44, fit: BoxFit.cover),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(order['productName'] ?? order['item'], style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                        Text(order['payment'], style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF0D5438))),
                      ],
                    ),
                  ),
                  Text(order['amount'], style: GoogleFonts.cinzel(fontSize: 15, fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 20),
              Text('Update Sanctum Pipeline Status', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildStatusButton('Pending', const Color(0xFFB45309), const Color(0xFFFEF3C7), order, setModalState),
                  const SizedBox(width: 6),
                  _buildStatusButton('Confirmed', const Color(0xFF047857), const Color(0xFFD1FAE5), order, setModalState),
                  const SizedBox(width: 6),
                  _buildStatusButton('Shipped', const Color(0xFF1D4ED8), const Color(0xFFEFF6FF), order, setModalState),
                  const SizedBox(width: 6),
                  _buildStatusButton('Delivered', const Color(0xFF0D5438), const Color(0xFFECFDF5), order, setModalState),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusButton(String status, Color color, Color bg, Map<String, dynamic> order, StateSetter setModalState) {
    final isCurrent = order['status'] == status;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            order['status'] = status;
            order['badgeColor'] = color;
            order['badgeBg'] = bg;
          });
          setModalState(() {});
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Order ${order['id']} status updated to "$status"!'),
              backgroundColor: color,
            ),
          );
          // Persist status change to backend
          ApiService.updateOrderStatus(order['id'].toString(), status).then((ok) {
            if (!ok && mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Failed to sync status update to backend database.'), backgroundColor: Color(0xFFDC2626)),
              );
            }
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isCurrent ? color : bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.5)),
          ),
          child: Center(
            child: Text(
              status,
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: isCurrent ? Colors.white : color,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // MODALS & ACTIONS: DEVOTEES
  // ==========================================
  void _openCreateDevoteeSheet() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final addrCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          top: 20,
          left: 20,
          right: 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5)),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(3)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Register Devotee Profile',
                    style: GoogleFonts.cinzel(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: TempleColors.textDark,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _buildFormInput(nameCtrl, 'Full Devotee Name', Icons.person_outline),
              const SizedBox(height: 12),
              _buildFormInput(emailCtrl, 'Email Address', Icons.email_outlined, type: TextInputType.emailAddress),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildFormInput(phoneCtrl, 'Phone Number', Icons.phone_outlined, type: TextInputType.phone)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildFormInput(cityCtrl, 'City / Region', Icons.location_city_outlined)),
                ],
              ),
              const SizedBox(height: 12),
              _buildFormInput(addrCtrl, 'Delivery Address', Icons.home_outlined, maxLines: 2),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final name = nameCtrl.text.trim();
                  final email = emailCtrl.text.trim();
                  if (name.isEmpty) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Please enter devotee full name'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }
                  if (email.isEmpty || !email.contains('@')) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Please enter a valid email address'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }

                  final names = name.split(' ').where((s) => s.isNotEmpty).toList();
                  final initials = names.length > 1
                      ? '${names[0][0]}${names[1][0]}'.toUpperCase()
                      : (name.length >= 2 ? name.substring(0, 2) : name).toUpperCase();

                  setState(() {
                    _devotees.insert(0, {
                      'id': 'USR-${100 + _devotees.length + 1}',
                      'name': name,
                      'email': email,
                      'phone': phoneCtrl.text.trim().isEmpty ? '+91 98000 00000' : phoneCtrl.text.trim(),
                      'city': cityCtrl.text.trim().isEmpty ? 'Chennai' : cityCtrl.text.trim(),
                      'state': 'India',
                      'address': addrCtrl.text.trim().isEmpty ? 'Address on file' : addrCtrl.text.trim(),
                      'ordersCount': 0,
                      'totalSpent': '₹ 0',
                      'memberSince': 'Today',
                      'status': 'Registered Member',
                      'initials': initials,
                      'color': TempleColors.emeraldMedium,
                      'bg': const Color(0xFFECFDF5),
                    });
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Devotee "$name" registered successfully!'),
                      backgroundColor: TempleColors.emeraldMedium,
                    ),
                  );

                  // Persist devotee to backend
                  ApiService.createDevotee({
                    'name': name,
                    'email': email,
                    'phone': phoneCtrl.text.trim().isEmpty ? '+91 98000 00000' : phoneCtrl.text.trim(),
                    'shippingAddress': addrCtrl.text.trim().isEmpty ? '${cityCtrl.text.trim()}, India' : addrCtrl.text.trim(),
                    'memberSince': 'Sep 2026',
                  }).then((ok) {
                    if (ok) {
                      _fetchLiveDashboardStats();
                    } else if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Failed to save devotee to backend server.'), backgroundColor: Color(0xFFDC2626)),
                      );
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: TempleColors.emeraldMedium,
                  foregroundColor: TempleColors.goldBright,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  '+ CREATE DEVOTEE RECORD',
                  style: GoogleFonts.cinzel(fontWeight: FontWeight.w700, letterSpacing: 1.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openEditDevoteeSheet(Map<String, dynamic> devotee) {
    final nameCtrl = TextEditingController(text: devotee['name']);
    final emailCtrl = TextEditingController(text: devotee['email']);
    final phoneCtrl = TextEditingController(text: devotee['phone']);
    final cityCtrl = TextEditingController(text: devotee['city']);
    final addrCtrl = TextEditingController(text: devotee['address']);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          top: 20,
          left: 20,
          right: 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5)),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(3)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Edit Devotee Profile • ${devotee['id']}',
                    style: GoogleFonts.cinzel(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: TempleColors.textDark,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _buildFormInput(nameCtrl, 'Full Devotee Name', Icons.person_outline),
              const SizedBox(height: 12),
              _buildFormInput(emailCtrl, 'Email Address', Icons.email_outlined, type: TextInputType.emailAddress),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildFormInput(phoneCtrl, 'Phone Number', Icons.phone_outlined, type: TextInputType.phone)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildFormInput(cityCtrl, 'City / Region', Icons.location_city_outlined)),
                ],
              ),
              const SizedBox(height: 12),
              _buildFormInput(addrCtrl, 'Delivery Address', Icons.home_outlined, maxLines: 2),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final name = nameCtrl.text.trim();
                  final email = emailCtrl.text.trim();
                  if (name.isEmpty) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Please enter devotee full name'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }
                  if (email.isEmpty || !email.contains('@')) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Please enter a valid email address'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }

                  setState(() {
                    devotee['name'] = name;
                    devotee['email'] = email;
                    devotee['phone'] = phoneCtrl.text.trim();
                    devotee['city'] = cityCtrl.text.trim();
                    devotee['address'] = addrCtrl.text.trim();
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Devotee "${devotee['name']}" updated successfully!'),
                      backgroundColor: TempleColors.emeraldMedium,
                    ),
                  );

                  // Persist to backend
                  ApiService.updateDevotee(devotee['id'].toString(), {
                    'name': name,
                    'email': email,
                    'phone': phoneCtrl.text.trim(),
                    'shippingAddress': addrCtrl.text.trim(),
                  }).then((ok) {
                    if (!ok && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Failed to update devotee record on server.'), backgroundColor: Color(0xFFDC2626)),
                      );
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: TempleColors.emeraldMedium,
                  foregroundColor: TempleColors.goldBright,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  'SAVE PROFILE CHANGES',
                  style: GoogleFonts.cinzel(fontWeight: FontWeight.w700, letterSpacing: 1.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openDevoteeDetailsModal(Map<String, dynamic> devotee) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4.5,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(3)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: devotee['bg'],
                  child: Text(
                    devotee['initials'],
                    style: TextStyle(color: devotee['color'], fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(devotee['name'], style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.w700)),
                      Text('${devotee['id']} • Member since ${devotee['memberSince']}',
                          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: devotee['bg'], borderRadius: BorderRadius.circular(8)),
                  child: Text(
                    devotee['status'],
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: devotee['color']),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Orders Placed', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF94A3B8))),
                      Text('${devotee['ordersCount']} Orders', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Sacred Lifetime Spend', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF94A3B8))),
                      Text(devotee['totalSpent'],
                          style: GoogleFonts.cinzel(fontSize: 15, fontWeight: FontWeight.w700, color: TempleColors.goldDark)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('Contact & Location', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.email_outlined, size: 16, color: Color(0xFF64748B)),
                const SizedBox(width: 8),
                Text(devotee['email'], style: GoogleFonts.inter(fontSize: 13)),
              ],
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: () async {
                final phone = devotee['phone']?.toString() ?? '';
                if (phone.isNotEmpty && phone != 'Not provided') {
                  final launched = await SanctumLauncher.makePhoneCall(phone);
                  if (!launched && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Could not open phone dialer for $phone')),
                    );
                  }
                }
              },
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    const Icon(Icons.phone_outlined, size: 16, color: TempleColors.emeraldMedium),
                    const SizedBox(width: 8),
                    Text(
                      devotee['phone'],
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: devotee['phone'] != 'Not provided' ? TempleColors.emeraldMedium : const Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (devotee['phone'] != null && devotee['phone'] != 'Not provided') ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(4), border: Border.all(color: const Color(0xFFA7F3D0))),
                        child: Text('CALL NOW', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF047857))),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10)),
              child: Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 18, color: Color(0xFF64748B)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      devotee['address'],
                      style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF334155)),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy_rounded, size: 16, color: TempleColors.emeraldMedium),
                    tooltip: 'Copy Address',
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Address copied to clipboard!')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openEditDevoteeSheet(devotee);
                    },
                    icon: const Icon(Icons.edit_note_rounded, size: 18, color: TempleColors.emeraldMedium),
                    label: Text('Edit Profile', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: TempleColors.emeraldMedium)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: TempleColors.emeraldMedium),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      final phone = devotee['phone']?.toString() ?? '';
                      if (phone.isEmpty || phone == 'Not provided') {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('No phone number registered for this devotee')),
                        );
                        return;
                      }
                      final launched = await SanctumLauncher.openWhatsApp(
                        phone,
                        message: 'Namaste ${devotee['name']}, greeting from Aamadappetti Panchaloham Jewellery!',
                      );
                      if (!launched && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Could not open WhatsApp for $phone')),
                        );
                      }
                    },
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                    label: Text('WhatsApp', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildFormInput(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType type = TextInputType.text,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      keyboardType: type,
      inputFormatters: type == TextInputType.number ? [FilteringTextInputFormatter.digitsOnly] : null,
      maxLines: maxLines,
      style: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF0F172A), fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF475569)),
        prefixIcon: Icon(icon, size: 18, color: TempleColors.goldAmber),
        isDense: true,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: TempleColors.goldAmber, width: 1.8)),
      ),
    );
  }

  // ==========================================
  // ROOT BUILD
  // ==========================================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      drawer: _buildDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _buildCustomAppBar(),
            Expanded(
              child: IndexedStack(
                index: _selectedTabIndex,
                children: [
                  _buildDashboardTab(),
                  _buildProductsTab(),
                  _buildOrdersTab(),
                  _buildDevoteesTab(),
                  _buildMoreTab(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildCustomBottomNav(),
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildCustomAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Color(0xFF03180F),
        border: Border(bottom: BorderSide(color: Color(0x22D4AF37))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Builder(
            builder: (ctx) => IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 26),
              onPressed: () => Scaffold.of(ctx).openDrawer(),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ),
          Row(
            children: [
              InkWell(
                onTap: _openNotificationsSheet,
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
                      if (_unreadNotificationsCount > 0)
                        Positioned(
                          top: -3,
                          right: -3,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFF03180F), width: 1.5),
                            ),
                            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                            child: Center(
                              child: Text(
                                _unreadNotificationsCount > 9 ? '9+' : '$_unreadNotificationsCount',
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFDEC58D), width: 1.5),
                  color: const Color(0xFF052417),
                ),
                child: Center(
                  child: Text(
                    'A',
                    style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFFF9E7B3)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: DASHBOARD
  // ==========================================
  Widget _buildDashboardTab() {
    return RefreshIndicator(
      color: TempleColors.emeraldMedium,
      backgroundColor: Colors.white,
      onRefresh: _fetchLiveDashboardStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeBanner(),
            const SizedBox(height: 16),
            _buildMetricsGrid(),
            const SizedBox(height: 18),
            _buildContentCmsHubStrip(),
            const SizedBox(height: 18),
            _buildQuickActions(),
            const SizedBox(height: 20),
            _buildRecentOrdersSection(),
            const SizedBox(height: 20),
            _buildRecentDevoteesSection(),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeBanner() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF031910), Color(0xFF062B1D)],
        ),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Stack(
        children: [
          Positioned(
            right: 12,
            top: -10,
            bottom: -10,
            child: Opacity(
              opacity: 0.85,
              child: Image.asset(
                'assets/images/temple_sanctum_bg.jpg',
                width: 140,
                fit: BoxFit.cover,
                alignment: Alignment.topRight,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [const Color(0xFF031910), const Color(0xFF031910).withValues(alpha: 0.85), Colors.transparent],
                stops: const [0.0, 0.65, 1.0],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Executive Admin Sanctum', style: GoogleFonts.cinzel(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFFDFC488), letterSpacing: 1.2)),
                    GestureDetector(
                      onTap: _fetchLiveDashboardStats,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _isBackendOnline ? const Color(0xFF064E3B) : const Color(0xFF78350F),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _isBackendOnline ? const Color(0xFF34D399) : const Color(0xFFFBBF24)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: _isBackendOnline ? const Color(0xFF34D399) : const Color(0xFFFBBF24))),
                            const SizedBox(width: 5),
                            Text(
                              _isLoadingBackend
                                  ? 'Syncing...'
                                  : _isBackendOnline
                                      ? 'Live Online'
                                      : 'Offline Local',
                              style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 4),
                            Icon(_isLoadingBackend ? Icons.sync : Icons.refresh_rounded, size: 11, color: Colors.white70),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text('Admin Sanctum', style: GoogleFonts.cinzel(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.8)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const LotusFlourishDivider(width: 80, color: Color(0xFFDFC488), height: 10),
                    const SizedBox(width: 8),
                    Text('Panchaloham Temple Jewellery • Live Admin',
                        style: GoogleFonts.cormorantGaramond(fontSize: 12, fontStyle: FontStyle.italic, color: const Color(0xFFDFC488))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsGrid() {
    final int totalProds = _metrics['totalProducts'] ?? _products.length;
    final int inStock = _metrics['inStockProducts'] ?? _products.where((p) => p['isActive'] == true).length;
    final int totalCats = _metrics['totalCategories'] ?? (_categories.length > 1 ? _categories.length - 1 : 1);
    final int pendingOrders = _metrics['pendingOrders'] ?? _orders.where((o) => o['status'] == 'Pending').length;
    final int totalOrders = _metrics['totalOrders'] ?? _orders.length;
    final int rev = _metrics['totalRevenue'] ?? 0;
    final int totalUsers = _metrics['totalUsers'] ?? _devotees.length;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildWebAdminMetricCard(
                title: 'Consecrated Products',
                value: '$totalProds',
                subtitle: '$inStock in stock • Assay certified',
                icon: Icons.inventory_2_outlined,
                iconBg: const Color(0xFFFEF3C7),
                iconColor: const Color(0xFFB45309),
                onTap: () => setState(() => _selectedTabIndex = 1),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildWebAdminMetricCard(
                title: 'Divine Deities',
                value: '$totalCats',
                subtitle: '$totalCats active sanctum collections',
                icon: Icons.layers_outlined,
                iconBg: const Color(0xFFEFF6FF),
                iconColor: const Color(0xFF1D4ED8),
                valueColor: const Color(0xFF1D4ED8),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesScreen())),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildWebAdminMetricCard(
                title: 'Orders in Pipeline',
                value: '$pendingOrders',
                subtitle: '$totalOrders total • ₹${rev.toString()} revenue',
                icon: Icons.shopping_bag_outlined,
                iconBg: const Color(0xFFFEE2E2),
                iconColor: const Color(0xFFDC2626),
                valueColor: const Color(0xFFB45309),
                onTap: () => setState(() => _selectedTabIndex = 2),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildWebAdminMetricCard(
                title: 'Registered Devotees',
                value: '$totalUsers',
                subtitle: 'Active devotee accounts',
                icon: Icons.people_outline_rounded,
                iconBg: const Color(0xFFECFDF5),
                iconColor: const Color(0xFF0D5438),
                valueColor: const Color(0xFF0D5438),
                onTap: () => setState(() => _selectedTabIndex = 3),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWebAdminMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    Color? valueColor,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 134,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEFF2F5)),
          boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 8, offset: Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, size: 20, color: iconColor),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFFCBD5E1)),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: valueColor ?? const Color(0xFF0F172A),
                  ),
                ),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF64748B)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.shield_outlined, size: 18, color: Color(0xFF9E7326)),
                const SizedBox(width: 6),
                Text('Quick Actions', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
              ],
            ),
            Text('View All >', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF94A3B8))),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionButton(
                title: 'Add\nProduct',
                icon: Icons.add_circle_outline_rounded,
                isPrimary: true,
                onTap: _openAddProductSheet,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildQuickActionButton(
                title: 'New\nDevotee',
                icon: Icons.person_add_alt_1_outlined,
                onTap: _openCreateDevoteeSheet,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildQuickActionButton(
                title: 'Test\nTelegram',
                icon: Icons.send_outlined,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Telegram Sanctum notification test alert dispatched!'),
                      backgroundColor: TempleColors.emeraldMedium,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildQuickActionButton(
                title: 'View\nInquiries',
                icon: Icons.chat_bubble_outline_rounded,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const InquiriesScreen()),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionButton({
    required String title,
    required IconData icon,
    bool isPrimary = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        height: 86,
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: isPrimary
              ? const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF042618), Color(0xFF0C3E28)],
                )
              : null,
          color: isPrimary ? null : Colors.white,
          border: Border.all(
            color: isPrimary ? const Color(0xFFE2C475) : const Color(0xFFEFF2F5),
            width: isPrimary ? 1.2 : 1.0,
          ),
          boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 6, offset: Offset(0, 2))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22, color: isPrimary ? const Color(0xFFF9ECC5) : const Color(0xFF1E293B)),
            const SizedBox(height: 6),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isPrimary ? const Color(0xFFF9ECC5) : const Color(0xFF334155),
                height: 1.15,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContentCmsHubStrip() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.auto_awesome, color: Color(0xFF0D5438), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Content & Store CMS Hub', style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                    Text('Homepage slides, shipping policies & temple articles', style: GoogleFonts.inter(fontSize: 10.5, color: const Color(0xFF64748B))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                _buildCmsChip('Banners & Alerts', Icons.palette_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const CmsSlidesScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Shipping & Packaging', Icons.local_shipping_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ShippingScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Journal Articles', Icons.menu_book_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const BlogScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Product Catalog', Icons.inventory_2_outlined, () {
                  setState(() => _selectedTabIndex = 1);
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Deity Collections', Icons.category_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Referrals & Rewards', Icons.card_giftcard_rounded, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralsScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('Devotee Inquiries', Icons.mark_chat_unread_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const InquiriesScreen()));
                }),
                const SizedBox(width: 8),
                _buildCmsChip('+ Add Devotee', Icons.person_add_alt, _openCreateDevoteeSheet, isGold: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCmsChip(String title, IconData icon, VoidCallback onTap, {bool isGold = false}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: isGold ? const Color(0xFFFEF3C7) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isGold ? const Color(0xFFFDE68A) : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: isGold ? const Color(0xFF92400E) : const Color(0xFF475569)),
            const SizedBox(width: 6),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isGold ? const Color(0xFF92400E) : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDevoteeCard(Map<String, dynamic> d) {
    return InkWell(
      onTap: () => _openDevoteeDetailsModal(d),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEFF2F5)),
          boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 19,
              backgroundColor: d['bg'] ?? const Color(0xFFECFDF5),
              child: Text(d['initials'] ?? 'D', style: TextStyle(color: d['color'] ?? const Color(0xFF0D5438), fontWeight: FontWeight.bold, fontSize: 13)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(d['name'] ?? 'Sacred Devotee', style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                  Text('${d['phone']} • ${d['city']}', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B))),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
              child: Text(d['memberSince'] ?? 'Devotee', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF0D5438))),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentDevoteesSection() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.people_alt_outlined, size: 18, color: Color(0xFF0D5438)),
                const SizedBox(width: 6),
                Text('Recent Devotees & Users (${_devotees.length})', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
              ],
            ),
            GestureDetector(
              onTap: () => setState(() => _selectedTabIndex = 3),
              child: Text('View All >', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF94A3B8))),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_devotees.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFEFF2F5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.people_outline, color: Color(0xFF94A3B8), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No registered devotees yet. New accounts created by devotees will appear here.',
                    style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _devotees.take(3).length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final devotee = _devotees[idx];
              return _buildDevoteeCard(devotee);
            },
          ),
      ],
    );
  }

  Widget _buildRecentOrdersSection() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.inventory_2_outlined, size: 18, color: Color(0xFFB45309)),
                const SizedBox(width: 6),
                Text('Recent Orders (${_orders.length})', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
              ],
            ),
            GestureDetector(
              onTap: () => setState(() => _selectedTabIndex = 2),
              child: Text('View All >', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF94A3B8))),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_orders.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFEFF2F5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.inbox_outlined, color: Color(0xFF94A3B8), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No orders placed yet. Live orders from the storefront will appear here automatically.',
                    style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _orders.take(3).length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final order = _orders[idx];
              return _buildOrderListItem(order);
            },
          ),
      ],
    );
  }

  // ==========================================
  // TAB 2: PRODUCTS CATALOG
  // ==========================================
  Future<void> _searchProductsBackend(String query) async {
    setState(() {
      _productSearchQuery = query;
      _isSearchingBackend = true;
    });
    try {
      final liveProds = await ApiService.getProducts(search: query.trim());
      if (liveProds != null && mounted) {
        setState(() {
          _products.clear();
          _products.addAll(liveProds.map<Map<String, dynamic>>((p) {
            final imgList = p['images'] as List?;
            String prodImg = '';
            if (imgList != null && imgList.isNotEmpty) {
              prodImg = imgList[0].toString();
            } else if (p['image'] != null) {
              prodImg = p['image'].toString();
            }
            final priceVal = p['price'] ?? 0;
            final origVal = p['originalPrice'] ?? (priceVal * 1.3).round();
            final rawStock = p['stock'] ?? (p['inStock'] == true ? 25 : 0);
            final isFeaturedVal = p['featured'] == true;
            final isInStockVal = p['inStock'] ?? true;
            return {
              'id': p['id']?.toString() ?? '',
              'name': p['name'] ?? 'Panchaloham Ornament',
              'deity': p['deity'] ?? (p['category'] != null ? p['category'].toString().toUpperCase() : 'Sacred Deity'),
              'category': p['category'] ?? '',
              'price': '₹ ${priceVal.toString()}',
              'priceRaw': priceVal,
              'originalPrice': '₹ ${origVal.toString()}',
              'stock': rawStock,
              'isLowStock': rawStock < 5,
              'rating': (p['rating'] is num) ? (p['rating'] as num).toDouble() : 5.0,
              'image': prodImg,
              'isActive': isInStockVal,
              'inStock': isInStockVal,
              'featured': isFeaturedVal,
              'isFeatured': isFeaturedVal,
              'description': p['description'] ?? '',
            };
          }));
        });
      }
    } finally {
      if (mounted) setState(() => _isSearchingBackend = false);
    }
  }

  void _openProductFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) => Container(
          padding: const EdgeInsets.all(22),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Catalog Filter & Sort', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold, color: TempleColors.emeraldMedium)),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _productStockFilter = 'ALL';
                        _productSortBy = 'Newest';
                      });
                      setSheetState(() {});
                      Navigator.pop(ctx);
                    },
                    child: Text('Reset All', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFFDC2626))),
                  ),
                ],
              ),
              const Divider(height: 20),
              Text('STOCK AVAILABILITY', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF475569), letterSpacing: 0.8)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildFilterOption('ALL', 'All Items', _productStockFilter, (val) {
                    setState(() => _productStockFilter = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('IN_STOCK', 'In Stock Only', _productStockFilter, (val) {
                    setState(() => _productStockFilter = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('LOW_STOCK', 'Low Stock (< 5)', _productStockFilter, (val) {
                    setState(() => _productStockFilter = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('OUT_OF_STOCK', 'Out of Stock', _productStockFilter, (val) {
                    setState(() => _productStockFilter = val);
                    setSheetState(() {});
                  }),
                ],
              ),
              const SizedBox(height: 18),
              Text('SORT ORDER', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF475569), letterSpacing: 0.8)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildFilterOption('Newest', 'Newest First', _productSortBy, (val) {
                    setState(() => _productSortBy = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('Price: Low to High', 'Price: Low → High', _productSortBy, (val) {
                    setState(() => _productSortBy = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('Price: High to Low', 'Price: High → Low', _productSortBy, (val) {
                    setState(() => _productSortBy = val);
                    setSheetState(() {});
                  }),
                  _buildFilterOption('Name', 'Name (A-Z)', _productSortBy, (val) {
                    setState(() => _productSortBy = val);
                    setSheetState(() {});
                  }),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: TempleColors.emeraldMedium,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('APPLY FILTERS', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterOption(String value, String label, String currentSelected, Function(String) onSelect) {
    final isSelected = currentSelected == value;
    return InkWell(
      onTap: () => onSelect(value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF052417) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF052417) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }

  Widget _buildProductsTab() {
    final filtered = _products.where((p) {
      if (_productSearchQuery.isNotEmpty) {
        final q = _productSearchQuery.toLowerCase().trim();
        final nameMatch = (p['name'] ?? '').toString().toLowerCase().contains(q);
        final deityMatch = (p['deity'] ?? '').toString().toLowerCase().contains(q);
        final catMatch = (p['category'] ?? '').toString().toLowerCase().contains(q);
        final descMatch = (p['description'] ?? '').toString().toLowerCase().contains(q);
        if (!nameMatch && !deityMatch && !catMatch && !descMatch) return false;
      }
      if (_selectedCategoryIndex > 0 && _selectedCategoryIndex < _categories.length) {
        final catFilter = _categories[_selectedCategoryIndex].toLowerCase().trim();
        final deity = (p['deity'] ?? '').toString().toLowerCase();
        final cat = (p['category'] ?? '').toString().toLowerCase();
        final name = (p['name'] ?? '').toString().toLowerCase();
        if (!deity.contains(catFilter) && !cat.contains(catFilter) && !name.contains(catFilter)) {
          return false;
        }
      }
      if (_productStockFilter == 'IN_STOCK') {
        if ((p['stock'] is num && (p['stock'] as num) <= 0) || p['isActive'] == false) return false;
      } else if (_productStockFilter == 'LOW_STOCK') {
        if (p['isLowStock'] != true) return false;
      } else if (_productStockFilter == 'OUT_OF_STOCK') {
        if (p['stock'] is num && (p['stock'] as num) > 0 && p['isActive'] != false) return false;
      }
      return true;
    }).toList();

    num safeNum(dynamic val) {
      if (val is num) return val;
      if (val is String) {
        return num.tryParse(val.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 0;
      }
      return 0;
    }

    // Apply sorting
    if (_productSortBy == 'Price: Low to High') {
      filtered.sort((a, b) => safeNum(a['priceRaw']).compareTo(safeNum(b['priceRaw'])));
    } else if (_productSortBy == 'Price: High to Low') {
      filtered.sort((a, b) => safeNum(b['priceRaw']).compareTo(safeNum(a['priceRaw'])));
    } else if (_productSortBy == 'Name') {
      filtered.sort((a, b) => (a['name'] ?? '').toString().compareTo((b['name'] ?? '').toString()));
    }

    final activeFiltersCount = (_productStockFilter != 'ALL' ? 1 : 0) + (_productSortBy != 'Newest' ? 1 : 0);

    // Paginate filtered results
    final totalProductItems = filtered.length;
    final totalProductPages = (totalProductItems / _productsPageSize).ceil().clamp(1, 9999);
    if (_productsCurrentPage > totalProductPages) {
      _productsCurrentPage = totalProductPages;
    }
    final startProdIdx = (_productsCurrentPage - 1) * _productsPageSize;
    final endProdIdx = (startProdIdx + _productsPageSize).clamp(0, totalProductItems);
    final paginatedProducts = startProdIdx < totalProductItems ? filtered.sublist(startProdIdx, endProdIdx) : <Map<String, dynamic>>[];

    return RefreshIndicator(
      color: TempleColors.emeraldMedium,
      backgroundColor: Colors.white,
      onRefresh: _fetchLiveDashboardStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: const LinearGradient(colors: [Color(0xFF031910), Color(0xFF062D1F)]),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(text: 'Products ', style: GoogleFonts.cinzel(fontSize: 19, fontWeight: FontWeight.w700, color: Colors.white)),
                              TextSpan(
                                text: 'Catalog',
                                style: GoogleFonts.cormorantGaramond(fontSize: 21, fontStyle: FontStyle.italic, fontWeight: FontWeight.w700, color: const Color(0xFFE2C475)),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text('Manage your Panchaloham jewellery collection', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFFB5D4C7))),
                      ],
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _openAddProductSheet,
                    icon: const Icon(Icons.add, size: 16, color: Colors.black),
                    label: Text('Add Product', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.black)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE2C475),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _productSearchCtrl,
                      onChanged: (val) {
                        setState(() {
                          _productSearchQuery = val;
                          _productsCurrentPage = 1;
                        });
                        _searchProductsBackend(val);
                      },
                      style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF0F172A)),
                      decoration: InputDecoration(
                        hintText: 'Search products, deity, category...',
                        hintStyle: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF94A3B8)),
                        prefixIcon: _isSearchingBackend
                            ? const Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: TempleColors.emeraldMedium)),
                              )
                            : const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                        suffixIcon: _productSearchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close_rounded, size: 16, color: Color(0xFF64748B)),
                                onPressed: () {
                                  _productSearchCtrl.clear();
                                  setState(() => _productsCurrentPage = 1);
                                  _searchProductsBackend('');
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                InkWell(
                  onTap: _openProductFilterSheet,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.filter_list_rounded, size: 18, color: Color(0xFF1E293B)),
                        const SizedBox(width: 6),
                        Text('Filter', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600)),
                        if (activeFiltersCount > 0) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: const BoxDecoration(color: Color(0xFF052417), shape: BoxShape.circle),
                            child: Text('$activeFiltersCount', style: GoogleFonts.inter(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(_categories.length, (idx) {
                  final isSelected = _selectedCategoryIndex == idx;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(idx == 0 ? 'All (${_products.length})' : _categories[idx]),
                      selected: isSelected,
                      onSelected: (val) => setState(() {
                        _selectedCategoryIndex = idx;
                        _productsCurrentPage = 1;
                      }),
                      selectedColor: const Color(0xFF052417),
                      backgroundColor: Colors.white,
                      labelStyle: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFF475569),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(color: isSelected ? const Color(0xFF052417) : const Color(0xFFE2E8F0)),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${filtered.length} products', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFF64748B))),
                InkWell(
                  onTap: _openProductFilterSheet,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: Row(
                      children: [
                        Text('Sort: ', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF94A3B8))),
                        Text(_productSortBy, style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                        const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Color(0xFF64748B)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (filtered.isEmpty)
              _buildSacredEmptyProductsView()
            else ...[
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: paginatedProducts.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, idx) {
                  final product = paginatedProducts[idx];
                  return _buildProductCard(product);
                },
              ),
              const SizedBox(height: 16),
              _buildPaginationControls(
                currentPage: _productsCurrentPage,
                totalPages: totalProductPages,
                totalItems: totalProductItems,
                pageSize: _productsPageSize,
                pageSizeOptions: const [6, 12, 24, 48],
                onPageChanged: (newPage) {
                  setState(() => _productsCurrentPage = newPage);
                },
                onPageSizeChanged: (newSize) {
                  setState(() {
                    _productsPageSize = newSize;
                    _productsCurrentPage = 1;
                  });
                },
              ),
            ],
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> p) {
    final ratingStr = p['rating']?.toString() ?? '5.0';
    final nameStr = p['name']?.toString() ?? 'Panchaloham Ornament';
    final deityStr = p['deity']?.toString() ?? '';
    final priceStr = p['price']?.toString() ?? '₹ 0';
    final origPriceStr = p['originalPrice']?.toString() ?? '';
    final stockVal = p['stock'] ?? 0;
    final isLowStock = p['isLowStock'] == true;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEFF2F5)),
        boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: const Color(0xFF031C13),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2C475).withValues(alpha: 0.6)),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: SanctumImage(
                      imageSource: p['image'],
                      fit: BoxFit.cover,
                    ),
                  ),
                  if (p['isFeatured'] == true || p['featured'] == true)
                    Positioned(
                      top: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFD97706), Color(0xFFB45309)]),
                          borderRadius: BorderRadius.circular(4),
                          boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 2, offset: Offset(0, 1))],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.white, size: 9),
                            const SizedBox(width: 2),
                            Text('FEATURED', style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            nameStr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, size: 16, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 2),
                            Text(ratingStr, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                          ],
                        ),
                      ],
                    ),
                    Text(deityStr, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            priceStr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                          ),
                        ),
                        if (origPriceStr.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              origPriceStr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(fontSize: 11.5, decoration: TextDecoration.lineThrough, color: const Color(0xFF94A3B8)),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isLowStock ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          isLowStock ? 'Low Stock ($stockVal)' : 'In Stock ($stockVal)',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: isLowStock ? const Color(0xFFDC2626) : const Color(0xFF059669),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 8),
          Row(
            children: [
              // In Stock / Active Toggle Switch that NEVER overflows
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Transform.scale(
                    scale: 0.75,
                    child: Switch(
                      value: (p['inStock'] ?? p['isActive']) == true,
                      onChanged: (val) {
                        final cur = (p['inStock'] ?? p['isActive']) == true;
                        setState(() {
                          p['inStock'] = val;
                          p['isActive'] = val;
                        });
                        ApiService.toggleProductStock(p['id'].toString()).then((ok) {
                          if (!ok && mounted) {
                            setState(() {
                              p['inStock'] = cur;
                              p['isActive'] = cur;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Failed to update stock status on server')),
                            );
                          }
                        });
                      },
                      activeTrackColor: const Color(0xFFD1FAE5),
                      thumbColor: WidgetStateProperty.resolveWith(
                        (states) => states.contains(WidgetState.selected) ? const Color(0xFF0D5438) : Colors.white,
                      ),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  Text(
                    (p['inStock'] ?? p['isActive']) == true ? 'Active' : 'Off',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: (p['inStock'] ?? p['isActive']) == true ? const Color(0xFF0D5438) : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              // Featured Toggle Button
              InkWell(
                onTap: () {
                  final cur = (p['featured'] == true || p['isFeatured'] == true);
                  final next = !cur;
                  setState(() {
                    p['featured'] = next;
                    p['isFeatured'] = next;
                  });
                  ApiService.toggleProductFeatured(p['id'].toString()).then((ok) {
                    if (!ok && mounted) {
                      setState(() {
                        p['featured'] = cur;
                        p['isFeatured'] = cur;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Failed to update featured status on server')),
                      );
                    } else if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(next ? 'Marked "${p['name']}" as Featured on Storefront!' : 'Unmarked "${p['name']}" from Featured'),
                          backgroundColor: TempleColors.emeraldMedium,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  });
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: (p['featured'] == true || p['isFeatured'] == true) ? const Color(0xFFFEF3C7) : const Color(0xFFF8FAFC),
                    border: Border.all(
                      color: (p['featured'] == true || p['isFeatured'] == true) ? const Color(0xFFF59E0B) : const Color(0xFFE2E8F0),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        (p['featured'] == true || p['isFeatured'] == true) ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 13,
                        color: (p['featured'] == true || p['isFeatured'] == true) ? const Color(0xFFD97706) : const Color(0xFF94A3B8),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        (p['featured'] == true || p['isFeatured'] == true) ? 'Featured' : 'Feature',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: (p['featured'] == true || p['isFeatured'] == true) ? const Color(0xFFB45309) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              OutlinedButton.icon(
                onPressed: () => _openEditProductSheet(p),
                icon: const Icon(Icons.edit_outlined, size: 13, color: Color(0xFF854D0E)),
                label: Text('Edit', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF854D0E))),
                style: OutlinedButton.styleFrom(
                  backgroundColor: const Color(0xFFFEFCE8),
                  side: const BorderSide(color: Color(0xFFFEF08A)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(width: 6),
              OutlinedButton.icon(
                onPressed: () => _openViewProductDialog(p),
                icon: const Icon(Icons.remove_red_eye_outlined, size: 13, color: Color(0xFF854D0E)),
                label: Text('View', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF854D0E))),
                style: OutlinedButton.styleFrom(
                  backgroundColor: const Color(0xFFFEFCE8),
                  side: const BorderSide(color: Color(0xFFFEF08A)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 3: ORDERS TRACKER (Web Equivalence)
  // ==========================================
  Widget _buildOrdersTab() {
    final statusList = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'];
    final filtered = _orders.where((o) {
      if (_orderStatusFilter == 'All') return true;
      return o['status'] == _orderStatusFilter;
    }).toList();

    final totalOrderItems = filtered.length;
    final totalOrderPages = (totalOrderItems / _ordersPageSize).ceil().clamp(1, 9999);
    if (_ordersCurrentPage > totalOrderPages) {
      _ordersCurrentPage = totalOrderPages;
    }
    final startOrderIdx = (_ordersCurrentPage - 1) * _ordersPageSize;
    final endOrderIdx = (startOrderIdx + _ordersPageSize).clamp(0, totalOrderItems);
    final paginatedOrders = startOrderIdx < totalOrderItems ? filtered.sublist(startOrderIdx, endOrderIdx) : <Map<String, dynamic>>[];

    return RefreshIndicator(
      color: TempleColors.emeraldMedium,
      backgroundColor: Colors.white,
      onRefresh: _fetchLiveDashboardStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(colors: [Color(0xFF031910), Color(0xFF083A26)]),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Sacred Orders Pipeline', style: GoogleFonts.cinzel(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                      Text('Track consecration, courier & delivery', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFFB5D4C7))),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Testing Telegram notification dispatch...'), backgroundColor: TempleColors.emeraldMedium),
                    );
                  },
                  icon: const Icon(Icons.send_rounded, color: Color(0xFFE2C475)),
                  tooltip: 'Test Telegram Notification',
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: statusList.map((s) {
                final isSelected = _orderStatusFilter == s;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(s),
                    selected: isSelected,
                    onSelected: (val) => setState(() {
                      _orderStatusFilter = s;
                      _ordersCurrentPage = 1;
                    }),
                    selectedColor: TempleColors.emeraldMedium,
                    backgroundColor: Colors.white,
                    labelStyle: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? Colors.white : const Color(0xFF475569),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: isSelected ? TempleColors.emeraldMedium : const Color(0xFFE2E8F0)),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),
          if (filtered.isEmpty)
            _buildSacredEmptyOrdersView()
          else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: paginatedOrders.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, idx) {
                final order = paginatedOrders[idx];
                return _buildOrderListItem(order);
              },
            ),
            const SizedBox(height: 16),
            _buildPaginationControls(
              currentPage: _ordersCurrentPage,
              totalPages: totalOrderPages,
              totalItems: totalOrderItems,
              pageSize: _ordersPageSize,
              pageSizeOptions: const [6, 12, 24, 48],
              onPageChanged: (newPage) {
                setState(() => _ordersCurrentPage = newPage);
              },
              onPageSizeChanged: (newSize) {
                setState(() {
                  _ordersPageSize = newSize;
                  _ordersCurrentPage = 1;
                });
              },
            ),
          ],
          const SizedBox(height: 80),
        ],
      ),
    ),
  );
  }

  Widget _buildSacredEmptyOrdersView() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEFF2F5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: const Icon(Icons.receipt_long_outlined, size: 28, color: Color(0xFFB45309)),
          ),
          const SizedBox(height: 16),
          Text(
            'No Sacred Orders in Pipeline',
            style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            '0 live orders found on FastPanel VPS backend.\nWhen devotees place orders on the customer storefront, they will stream here live.',
            style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B), height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: _fetchLiveDashboardStats,
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: Text('Refresh Live Orders', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12.5)),
            style: ElevatedButton.styleFrom(
              backgroundColor: TempleColors.emeraldMedium,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSacredEmptyProductsView() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEFF2F5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: const Icon(Icons.inventory_2_outlined, size: 28, color: Color(0xFF047857)),
          ),
          const SizedBox(height: 16),
          Text(
            'No Products Found',
            style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'No products matching the active collection or query.\nAdd a new consecrated ornament to publish it to the live catalog.',
            style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B), height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: _openAddProductSheet,
            icon: const Icon(Icons.add, size: 16),
            label: Text('Add New Product', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12.5)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE2C475),
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSacredEmptyDevoteesView() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEFF2F5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: const Icon(Icons.people_outline_rounded, size: 28, color: Color(0xFF1D4ED8)),
          ),
          const SizedBox(height: 16),
          Text(
            'No Registered Devotees Found',
            style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Devotee customer accounts will appear here automatically when devotees register or check out.',
            style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B), height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: _openCreateDevoteeSheet,
            icon: const Icon(Icons.person_add_alt_1, size: 16),
            label: Text('Add Devotee Profile', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12.5)),
            style: ElevatedButton.styleFrom(
              backgroundColor: TempleColors.emeraldMedium,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderListItem(Map<String, dynamic> order) {
    return InkWell(
      onTap: () => _openOrderDetailsModal(order),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFEFF2F5)),
          boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFF072418),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFDCC188)),
              ),
              clipBehavior: Clip.antiAlias,
              child: SanctumImage(
                imageSource: order['image'],
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text((order['id'] ?? 'ORD-00').toString(), style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                      const SizedBox(width: 6),
                      Text('• ${(order['date'] ?? 'Recent').toString()}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8))),
                    ],
                  ),
                  Text((order['customer'] ?? 'Devotee').toString(), style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFF334155))),
                  Text((order['item'] ?? 'Consecrated Ornament').toString(), style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B))),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text((order['amount'] ?? '₹ 0').toString(), style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                const SizedBox(height: 3),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: (order['badgeBg'] as Color?) ?? const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                  child: Text(
                    (order['status'] ?? 'Pending').toString(),
                    style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: (order['badgeColor'] as Color?) ?? const Color(0xFFB45309)),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right_rounded, size: 20, color: Color(0xFFCBD5E1)),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TAB 4: DEVOTEES & USERS (Web Equivalence)
  // ==========================================
  Widget _buildDevoteesTab() {
    final filtered = _devotees.where((d) {
      if (_devoteeSearchQuery.isEmpty) return true;
      final q = _devoteeSearchQuery.toLowerCase();
      final name = (d['name'] ?? '').toString().toLowerCase();
      final email = (d['email'] ?? '').toString().toLowerCase();
      final phone = (d['phone'] ?? '').toString().toLowerCase();
      final city = (d['city'] ?? '').toString().toLowerCase();
      return name.contains(q) || email.contains(q) || phone.contains(q) || city.contains(q);
    }).toList();

    final totalDevoteeItems = filtered.length;
    final totalDevoteePages = (totalDevoteeItems / _devoteesPageSize).ceil().clamp(1, 9999);
    if (_devoteesCurrentPage > totalDevoteePages) {
      _devoteesCurrentPage = totalDevoteePages;
    }
    final startDevoteeIdx = (_devoteesCurrentPage - 1) * _devoteesPageSize;
    final endDevoteeIdx = (startDevoteeIdx + _devoteesPageSize).clamp(0, totalDevoteeItems);
    final paginatedDevotees = startDevoteeIdx < totalDevoteeItems ? filtered.sublist(startDevoteeIdx, endDevoteeIdx) : <Map<String, dynamic>>[];

    return RefreshIndicator(
      color: TempleColors.emeraldMedium,
      backgroundColor: Colors.white,
      onRefresh: _fetchLiveDashboardStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(
                colors: [Color(0xFF031910), Color(0xFF063321)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF031910).withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Devotee CRM & Directory',
                  style: GoogleFonts.cinzel(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage customer accounts & saved addresses',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFFB5D4C7),
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: _openCreateDevoteeSheet,
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 16, color: Color(0xFF031910)),
                  label: Text(
                    'New Devotee',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF031910),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE2C475),
                    foregroundColor: const Color(0xFF031910),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // 3 Metric Pills
          Row(
            children: [
              Expanded(
                child: _buildSmallDevoteeMetric('Total Devotees', '${_devotees.length}', Icons.people_outline, const Color(0xFF0D5438), const Color(0xFFECFDF5)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSmallDevoteeMetric('Total Orders', '${_metrics['totalOrders'] ?? _orders.length} Orders', Icons.shopping_bag_outlined, const Color(0xFF1D4ED8), const Color(0xFFEFF6FF)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSmallDevoteeMetric('Addresses', '${_devotees.where((d) => (d['address'] ?? '').toString().isNotEmpty && d['address'] != 'On file').length} Saved', Icons.location_on_outlined, const Color(0xFFB45309), const Color(0xFFFEF3C7)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Search Input
          Container(
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: TextField(
              onChanged: (val) => setState(() {
                _devoteeSearchQuery = val;
                _devoteesCurrentPage = 1;
              }),
              style: GoogleFonts.inter(fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search by name, email, phone or city...',
                hintStyle: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 11),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            '${filtered.length} Registered Devotees',
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF334155)),
          ),
          const SizedBox(height: 10),
          if (filtered.isEmpty)
            _buildSacredEmptyDevoteesView()
          else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: paginatedDevotees.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, idx) {
              final d = paginatedDevotees[idx];
              return InkWell(
                onTap: () => _openDevoteeDetailsModal(d),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEFF2F5)),
                    boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: (d['bg'] as Color?) ?? const Color(0xFFECFDF5),
                            child: Text((d['initials'] ?? 'D').toString(), style: TextStyle(color: (d['color'] as Color?) ?? const Color(0xFF0D5438), fontWeight: FontWeight.bold, fontSize: 13.5)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text((d['name'] ?? 'Devotee').toString(), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                                Text((d['email'] ?? '').toString(), style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: (d['bg'] as Color?) ?? const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
                            child: Text('${d['ordersCount'] ?? 0} Orders', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: (d['color'] as Color?) ?? const Color(0xFF0D5438))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 6),
                          Text((d['phone'] ?? 'Not provided').toString(), style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF475569))),
                          const Spacer(),
                          const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 4),
                          Text('${(d['city'] ?? 'India').toString()}, ${(d['state'] ?? 'India').toString()}', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF475569))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
                        child: Row(
                          children: [
                            const Icon(Icons.home_outlined, size: 14, color: Color(0xFF94A3B8)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                (d['address'] ?? 'On file').toString(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B)),
                              ),
                            ),
                            Text(
                              'Details →',
                              style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: TempleColors.emeraldMedium),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          _buildPaginationControls(
            currentPage: _devoteesCurrentPage,
            totalPages: totalDevoteePages,
            totalItems: totalDevoteeItems,
            pageSize: _devoteesPageSize,
            pageSizeOptions: const [6, 12, 24, 48],
            onPageChanged: (newPage) {
              setState(() => _devoteesCurrentPage = newPage);
            },
            onPageSizeChanged: (newSize) {
              setState(() {
                _devoteesPageSize = newSize;
                _devoteesCurrentPage = 1;
              });
            },
          ),
        ],
        const SizedBox(height: 80),
        ],
      ),
    ),
  );
  }

  Widget _buildSmallDevoteeMetric(String title, String value, IconData icon, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
          Text(title, style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF64748B))),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 5: MORE / SETTINGS / CMS / MODULES
  // ==========================================
  Widget _buildMoreTab() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      children: [
        // Sanctum Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(colors: [Color(0xFF031910), Color(0xFF062A1D)]),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFDFC488)),
                  color: const Color(0xFF0A3725),
                ),
                child: const Center(
                  child: Icon(Icons.shield_moon_rounded, color: Color(0xFFDFC488), size: 24),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Executive Admin Sanctum', style: GoogleFonts.cinzel(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text('Chief Administrator • Full Access', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFB5D4C7))),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0x33000000),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF34D399)),
                ),
                child: const Text('Live', style: TextStyle(fontSize: 11, color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Section 1: Storefront CMS & Content
        Text('STOREFRONT CMS & ASSETS', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8), letterSpacing: 0.8)),
        const SizedBox(height: 8),
        _buildSettingsTile(
          icon: Icons.view_carousel_outlined,
          title: 'Hero Slides & Banners',
          subtitle: '3 active promotional carousel slides',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const CmsSlidesScreen()));
          },
        ),
        _buildSettingsTile(
          icon: Icons.layers_outlined,
          title: 'Divine Collections & Deities',
          subtitle: 'Ganesha, Murugan, Shiva, Lakshmi categories',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesScreen()));
          },
        ),
        _buildSettingsTile(
          icon: Icons.menu_book_outlined,
          title: 'Vedic Metallurgy Journal',
          subtitle: 'Sacred articles, benefits & astrology insights',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const BlogScreen()));
          },
        ),

        const SizedBox(height: 18),

        // Section 2: Store Policies & Fulfillment
        Text('LOGISTICS & DEVOTEE RELATIONS', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8), letterSpacing: 0.8)),
        const SizedBox(height: 8),
        _buildSettingsTile(
          icon: Icons.local_shipping_outlined,
          title: 'Shipping & Velvet Packaging',
          subtitle: 'Worldwide insured transit & assay certificates',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ShippingScreen()));
          },
        ),
        _buildSettingsTile(
          icon: Icons.card_giftcard_rounded,
          title: 'Referrals & Devotee Rewards',
          subtitle: 'Sacred points, credits and temple blessings',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralsScreen()));
          },
        ),
        _buildSettingsTile(
          icon: Icons.chat_bubble_outline_rounded,
          title: 'Inquiries & Idol Custom Orders',
          subtitle: '${_inquiries.length} pending devotee requests',
          badge: '${_inquiries.length} New',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const InquiriesScreen()));
          },
        ),

        const SizedBox(height: 22),

        // Logout Button
        ElevatedButton.icon(
          onPressed: _handleLogout,
          icon: const Icon(Icons.lock_outline_rounded, size: 16),
          label: Text('LOCK SANCTUM (LOGOUT)', style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFEF2F2),
            foregroundColor: const Color(0xFFDC2626),
            side: const BorderSide(color: Color(0xFFFECACA)),
            elevation: 0,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }


  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    String? badge,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEFF2F5)),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: TempleColors.emeraldMedium, size: 20),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(title, style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A))),
            ),
            if (badge != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(6)),
                child: Text(badge, style: const TextStyle(fontSize: 10, color: Color(0xFFDC2626), fontWeight: FontWeight.bold)),
              ),
          ],
        ),
        subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B))),
        trailing: const Icon(Icons.chevron_right_rounded, size: 20, color: Color(0xFFCBD5E1)),
      ),
    );
  }

  // ==========================================
  // BOTTOM NAVIGATION BAR
  // ==========================================
  Widget _buildCustomBottomNav() {
    return Container(
      height: 68,
      decoration: const BoxDecoration(
        color: Color(0xFF031E13),
        border: Border(top: BorderSide(color: Color(0x33D4AF37))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_rounded, 'Dashboard'),
          _buildNavItem(1, Icons.inventory_2_outlined, 'Products'),
          _buildNavItem(2, Icons.shopping_bag_outlined, 'Orders'),
          _buildNavItem(3, Icons.people_outline_rounded, 'Devotees'),
          _buildNavItem(4, Icons.more_horiz_rounded, 'More'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _selectedTabIndex == index;
    return InkWell(
      onTap: () {
        setState(() => _selectedTabIndex = index);
        NotificationService.ensureDeviceRegistered();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: isSelected
            ? BoxDecoration(
                color: const Color(0xFF073824),
                borderRadius: BorderRadius.circular(16),
              )
            : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? const Color(0xFFDFC488) : const Color(0xFF85968E),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? const Color(0xFFDFC488) : const Color(0xFF85968E),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // SANCTUM GOLDEN PAGINATION CONTROLS
  // ==========================================
  Widget _buildPaginationControls({
    required int currentPage,
    required int totalPages,
    required int totalItems,
    required int pageSize,
    List<int> pageSizeOptions = const [6, 12, 24, 48],
    required ValueChanged<int> onPageChanged,
    ValueChanged<int>? onPageSizeChanged,
  }) {
    if (totalItems == 0) return const SizedBox.shrink();

    final startItem = (currentPage - 1) * pageSize + 1;
    final endItem = (startItem + pageSize - 1).clamp(1, totalItems);

    // Generate page numbers to show
    final List<int> pagesToShow = [];
    if (totalPages <= 7) {
      for (int i = 1; i <= totalPages; i++) {
        pagesToShow.add(i);
      }
    } else {
      pagesToShow.add(1);
      int startRange = (currentPage - 1).clamp(2, totalPages - 3);
      int endRange = (currentPage + 1).clamp(4, totalPages - 1);
      if (startRange > 2) pagesToShow.add(-1); // ellipsis
      for (int i = startRange; i <= endRange; i++) {
        if (!pagesToShow.contains(i)) pagesToShow.add(i);
      }
      if (endRange < totalPages - 1) pagesToShow.add(-2); // ellipsis
      if (!pagesToShow.contains(totalPages)) pagesToShow.add(totalPages);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isNarrow = constraints.maxWidth < 600;

          final infoAndPageSizeWidget = Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Showing ',
                style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
              ),
              Text(
                '$startItem-$endItem',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                ),
              ),
              Text(
                ' of ',
                style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
              ),
              Text(
                '$totalItems',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: TempleColors.emeraldMedium,
                ),
              ),
              if (onPageSizeChanged != null) ...[
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      value: pageSize,
                      isDense: true,
                      icon: const Icon(Icons.arrow_drop_down, size: 18, color: Color(0xFF64748B)),
                      items: pageSizeOptions.map((sz) {
                        return DropdownMenuItem<int>(
                          value: sz,
                          child: Text(
                            '$sz / page',
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF334155),
                            ),
                          ),
                        );
                      }).toList(),
                      onChanged: (newVal) {
                        if (newVal != null && newVal != pageSize) {
                          onPageSizeChanged(newVal);
                        }
                      },
                    ),
                  ),
                ),
              ],
            ],
          );

          final navigationButtons = Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Previous Button
              InkWell(
                onTap: currentPage > 1 ? () => onPageChanged(currentPage - 1) : null,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: currentPage > 1 ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: currentPage > 1 ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.chevron_left_rounded,
                        size: 16,
                        color: currentPage > 1 ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        'Prev',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: currentPage > 1 ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              // Page Pills
              ...pagesToShow.map((p) {
                if (p < 0) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4),
                    child: Text('…', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                  );
                }
                final isActive = p == currentPage;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: InkWell(
                    onTap: () => onPageChanged(p),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF03180F) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isActive ? const Color(0xFFDEC58D) : const Color(0xFFE2E8F0),
                          width: isActive ? 1.5 : 1.0,
                        ),
                      ),
                      child: Text(
                        '$p',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                          color: isActive ? const Color(0xFFDEC58D) : const Color(0xFF334155),
                        ),
                      ),
                    ),
                  ),
                );
              }),
              const SizedBox(width: 6),
              // Next Button
              InkWell(
                onTap: currentPage < totalPages ? () => onPageChanged(currentPage + 1) : null,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: currentPage < totalPages ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: currentPage < totalPages ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(
                        'Next',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: currentPage < totalPages ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        Icons.chevron_right_rounded,
                        size: 16,
                        color: currentPage < totalPages ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );

          if (isNarrow) {
            return Column(
              children: [
                infoAndPageSizeWidget,
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: navigationButtons,
                ),
              ],
            );
          }

          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              infoAndPageSizeWidget,
              navigationButtons,
            ],
          );
        },
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF03180F),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Image.asset(
                'assets/images/brand_logo_transparent.png',
                height: 48,
                fit: BoxFit.contain,
              ),
            ),
            const Divider(color: Color(0x33D4AF37)),
            ListTile(
              leading: const Icon(Icons.dashboard_outlined, color: Color(0xFFDFC488)),
              title: const Text('Dashboard', style: TextStyle(color: Colors.white)),
              onTap: () {
                setState(() => _selectedTabIndex = 0);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.inventory_2_outlined, color: Color(0xFFDFC488)),
              title: const Text('Products Catalog', style: TextStyle(color: Colors.white)),
              onTap: () {
                setState(() => _selectedTabIndex = 1);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_bag_outlined, color: Color(0xFFDFC488)),
              title: const Text('Orders Tracker', style: TextStyle(color: Colors.white)),
              onTap: () {
                setState(() => _selectedTabIndex = 2);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.people_outline_rounded, color: Color(0xFFDFC488)),
              title: const Text('Devotees & Users', style: TextStyle(color: Colors.white)),
              onTap: () {
                setState(() => _selectedTabIndex = 3);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.palette_outlined, color: Color(0xFFDFC488)),
              title: const Text('CMS Slides & Banners', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CmsSlidesScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.layers_outlined, color: Color(0xFFDFC488)),
              title: const Text('Divine Deities & Collections', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.menu_book_outlined, color: Color(0xFFDFC488)),
              title: const Text('Vedic Metallurgy Journal', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const BlogScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_shipping_outlined, color: Color(0xFFDFC488)),
              title: const Text('Shipping & Packaging', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ShippingScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.card_giftcard_rounded, color: Color(0xFFDFC488)),
              title: const Text('Referrals & Rewards', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFFDFC488)),
              title: const Text('Inquiries & Custom Leads', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const InquiriesScreen()));
              },
            ),
            const Spacer(),
            ListTile(
              leading: const Icon(Icons.lock_outline, color: Colors.redAccent),
              title: const Text('Lock Sanctum (Logout)', style: TextStyle(color: Colors.redAccent)),
              onTap: _handleLogout,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
