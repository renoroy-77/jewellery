import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';

class ReferralsScreen extends StatefulWidget {
  const ReferralsScreen({super.key});

  @override
  State<ReferralsScreen> createState() => _ReferralsScreenState();
}

class _ReferralsScreenState extends State<ReferralsScreen> {
  String _statusFilter = 'All';
  String _searchQuery = '';

  int _refereeDiscount = 50;
  int _referrerCredit = 100;
  int _minOrder = 500;

  @override
  void initState() {
    super.initState();
    _loadLiveReferralSettings();
  }

  Future<void> _loadLiveReferralSettings() async {
    final settings = await ApiService.getReferralSettings();
    if (settings != null && mounted) {
      setState(() {
        final refDisc = settings['refereeDiscountRupees'] ?? settings['refereeDiscount'];
        if (refDisc is num) {
          _refereeDiscount = refDisc.toInt();
        } else if (refDisc is String) {
          _refereeDiscount = int.tryParse(refDisc) ?? _refereeDiscount;
        }

        final refRew = settings['referrerRewardRupees'] ?? settings['referrerCredit'];
        if (refRew is num) {
          _referrerCredit = refRew.toInt();
        } else if (refRew is String) {
          _referrerCredit = int.tryParse(refRew) ?? _referrerCredit;
        }

        final minOrd = settings['minOrderSubtotal'] ?? settings['minOrderValue'];
        if (minOrd is num) {
          _minOrder = minOrd.toInt();
        } else if (minOrd is String) {
          _minOrder = int.tryParse(minOrd) ?? _minOrder;
        }
      });
    }

    // Load active devotee referral codes from backend
    final devotees = await ApiService.getDevotees();
    if (devotees != null && mounted) {
      final realReferrals = <Map<String, dynamic>>[];
      for (final d in devotees) {
        if (d['referralCode'] != null && d['referralCode'].toString().isNotEmpty) {
            final rawDate = d['createdAt']?.toString() ?? '';
            final dateStr = rawDate.length >= 10 ? rawDate.substring(0, 10) : (rawDate.isNotEmpty ? rawDate : 'Recent');
            realReferrals.add({
              'id': 'REF-${d['referralCode']}',
              'code': d['referralCode'].toString(),
              'referrer': d['name'] ?? 'Devotee',
              'referee': d['referredBy'] ?? 'Direct Member',
              'date': dateStr,
              'reward': '₹ $_referrerCredit Credit',
              'status': (d['ordersCount'] ?? 0) > 0 ? 'Completed' : 'Pending Order',
            });
        }
      }
      setState(() {
        _referrals.clear();
        _referrals.addAll(realReferrals);
      });
    }
  }

  final List<Map<String, dynamic>> _referrals = [];

  List<Map<String, dynamic>> get _filteredReferrals {
    return _referrals.where((r) {
      final matchesStatus = _statusFilter == 'All' ||
          (_statusFilter == 'Completed' && r['status'] == 'Completed') ||
          (_statusFilter == 'Pending' && r['status'] == 'Pending Order');
      final q = _searchQuery.trim().toLowerCase();
      final code = (r['code'] ?? '').toString().toLowerCase();
      final referrer = (r['referrer'] ?? '').toString().toLowerCase();
      final referee = (r['referee'] ?? '').toString().toLowerCase();
      final matchesQuery = q.isEmpty || code.contains(q) || referrer.contains(q) || referee.contains(q);
      return matchesStatus && matchesQuery;
    }).toList();
  }

  void _openGenerateCodeSheet() {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final discountCtrl = TextEditingController(text: '$_refereeDiscount');
    final creditCtrl = TextEditingController(text: '$_referrerCredit');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SafeArea(
        child: Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            top: 16,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5))],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(width: 44, height: 4.5, decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3))),
                ),
                const SizedBox(height: 14),
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
                    Expanded(
                      child: Text('GENERATE REFERRAL CODE', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary), overflow: TextOverflow.ellipsis),
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
              const SizedBox(height: 16),
              _buildSheetField('DEVOTEE NAME', nameCtrl, hint: 'e.g. Ramesh Iyer', onChanged: (v) {
                if (v.trim().isNotEmpty) {
                  final clean = v.replaceAll(RegExp(r'[^a-zA-Z]'), '').toUpperCase();
                  codeCtrl.text = '${clean.length > 6 ? clean.substring(0, 6) : clean}108';
                }
              }),
              const SizedBox(height: 10),
              _buildSheetField('REFERRAL CODE (COUPON)', codeCtrl, hint: 'e.g. RAMESH108'),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildSheetField('REFEREE DISCOUNT (₹)', discountCtrl)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildSheetField('REFERRER CREDIT (₹)', creditCtrl)),
                ],
              ),
              const SizedBox(height: 22),
              ElevatedButton(
                onPressed: () {
                  final code = codeCtrl.text.trim().toUpperCase();
                  if (code.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter or generate a referral code'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }
                  setState(() {
                    _referrals.insert(0, {
                      'id': 'REF-${DateTime.now().millisecondsSinceEpoch % 1000}',
                      'code': codeCtrl.text.trim().toUpperCase(),
                      'referrer': nameCtrl.text.trim().isEmpty ? 'Temple Sanctum' : nameCtrl.text.trim(),
                      'referee': 'Pending Devotee',
                      'date': 'Just Now',
                      'reward': '₹ ${creditCtrl.text.trim()} Credit',
                      'status': 'Pending Order',
                    });
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Sacred Referral Code "${codeCtrl.text}" generated!'),
                      backgroundColor: TempleColors.sanctumGreen,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: TempleColors.goldPrimary,
                  foregroundColor: const Color(0xFF03180F),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('CONSECRATE & GENERATE CODE', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  }

  void _openEditRewardRulesSheet() {
    final refDisCtrl = TextEditingController(text: '$_refereeDiscount');
    final refCredCtrl = TextEditingController(text: '$_referrerCredit');
    final minOrdCtrl = TextEditingController(text: '$_minOrder');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SafeArea(
        child: Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            top: 16,
            left: 20,
            right: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5))],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(width: 44, height: 4.5, decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3))),
              ),
              const SizedBox(height: 14),
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
                  Expanded(
                    child: Text('EDIT REFERRAL REWARDS', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary), overflow: TextOverflow.ellipsis),
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
            const SizedBox(height: 16),
            _buildSheetField('REFEREE INSTANT DISCOUNT (₹)', refDisCtrl),
            const SizedBox(height: 10),
            _buildSheetField('REFERRER STORE CREDIT (₹)', refCredCtrl),
            const SizedBox(height: 10),
            _buildSheetField('MINIMUM ORDER SPEND (₹)', minOrdCtrl),
            const SizedBox(height: 22),
            ElevatedButton(
              onPressed: () {
                final disStr = refDisCtrl.text.trim();
                final credStr = refCredCtrl.text.trim();
                final minOrdStr = minOrdCtrl.text.trim();

                final refDis = int.tryParse(disStr);
                if (refDis == null || refDis < 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid referee discount (₹0 or more)'), backgroundColor: Color(0xFFDC2626)),
                  );
                  return;
                }
                final refCred = int.tryParse(credStr);
                if (refCred == null || refCred < 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid referrer credit (₹0 or more)'), backgroundColor: Color(0xFFDC2626)),
                  );
                  return;
                }
                final minOrd = int.tryParse(minOrdStr);
                if (minOrd == null || minOrd < 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid minimum order spend (₹0 or more)'), backgroundColor: Color(0xFFDC2626)),
                  );
                  return;
                }

                setState(() {
                  _refereeDiscount = refDis;
                  _referrerCredit = refCred;
                  _minOrder = minOrd;
                });
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Referral reward rules updated!'), backgroundColor: TempleColors.sanctumGreen),
                );

                // Persist to backend
                ApiService.updateReferralSettings({
                  'refereeDiscountRupees': refDis,
                  'referrerRewardRupees': refCred,
                  'minOrderSubtotal': minOrd,
                  'refereeDiscount': refDis,
                  'referrerCredit': refCred,
                  'minOrderValue': minOrd,
                  'enabled': true,
                }).then((ok) {
                  if (!ok && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Failed to update referral settings on backend server.'), backgroundColor: Color(0xFFDC2626)),
                    );
                  }
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: TempleColors.goldPrimary,
                foregroundColor: const Color(0xFF03180F),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('SAVE REWARD RULES', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
            ),
          ],
        ),
      ),
    ),
  );
  }

  Widget _buildSheetField(String label, TextEditingController ctrl, {String? hint, Function(String)? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF475569), letterSpacing: 0.8)),
        const SizedBox(height: 5),
        TextField(
          controller: ctrl,
          onChanged: onChanged,
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF0F172A), fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            filled: true,
            fillColor: Colors.white,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: TempleColors.goldPrimary, width: 1.5)),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: TempleColors.headerBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: TempleColors.goldPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('DEVOTEE REFERRALS', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 0.8)),
            Text('${_referrals.length} devotee blessing invitations', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFCBD5E1))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: TempleColors.goldPrimary, size: 22),
            tooltip: 'Configure Rules',
            onPressed: _openEditRewardRulesSheet,
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 24),
            tooltip: 'Generate Code',
            onPressed: _openGenerateCodeSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openGenerateCodeSheet,
        backgroundColor: TempleColors.sanctumGreen,
        icon: const Icon(Icons.confirmation_number_outlined, color: TempleColors.goldPrimary, size: 20),
        label: Text('GENERATE CODE', style: GoogleFonts.cinzel(color: TempleColors.goldPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Column(
        children: [
          // Reward Rules Quick Summary
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            color: const Color(0xFF07261A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildRuleChip('Referee Gets', '₹ $_refereeDiscount OFF', Icons.discount_outlined),
                _buildRuleChip('Referrer Gets', '₹ $_referrerCredit CREDIT', Icons.stars_rounded),
                _buildRuleChip('Min Order', '₹ $_minOrder', Icons.shopping_bag_outlined),
              ],
            ),
          ),

          // Search Bar & Filter Chips
          Container(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Search referral codes or devotee names...',
                    hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: ['All', 'Completed', 'Pending'].map((st) {
                    final isSel = _statusFilter == st;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(st, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSel ? Colors.white : const Color(0xFF475569))),
                        selected: isSel,
                        selectedColor: const Color(0xFF0D5438),
                        backgroundColor: const Color(0xFFF1F5F9),
                        onSelected: (_) => setState(() => _statusFilter = st),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Referrals List
          Expanded(
            child: RefreshIndicator(
              color: TempleColors.emeraldMedium,
              backgroundColor: Colors.white,
              onRefresh: _loadLiveReferralSettings,
              child: _filteredReferrals.isEmpty
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
                        alignment: Alignment.center,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: const BoxDecoration(color: Color(0xFFFEF3C7), shape: BoxShape.circle),
                              child: const Icon(Icons.card_giftcard_rounded, size: 28, color: Color(0xFFB45309)),
                            ),
                            const SizedBox(height: 12),
                            Text('No Referral Records Yet', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text('When devotees share their sacred referral codes and friends place orders, they will appear here.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _openGenerateCodeSheet,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Issue Referral Code'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: TempleColors.emeraldMedium,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                      itemCount: _filteredReferrals.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, idx) {
                      final ref = _filteredReferrals[idx];
                final isCompleted = ref['status'] == 'Completed';

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEFF2F5)),
                    boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2))],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Text(
                          ref['code'],
                          style: GoogleFonts.cinzel(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF92400E)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${ref['referrer']} ➔ ${ref['referee']}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                            const SizedBox(height: 2),
                            Text('${ref['date']} • Reward: ${ref['reward']}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B))),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isCompleted ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              ref['status'],
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isCompleted ? const Color(0xFF047857) : const Color(0xFFB45309),
                              ),
                            ),
                          ),
                          if (!isCompleted)
                            TextButton(
                              style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                              onPressed: () {
                                setState(() => ref['status'] = 'Completed');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Reward credit blessed for ${ref['referrer']}!'), backgroundColor: TempleColors.sanctumGreen),
                                );
                              },
                              child: const Text('Credit Reward', style: TextStyle(fontSize: 10.5, color: Color(0xFF0D5438), fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ],
    ),
  );
  }

  Widget _buildRuleChip(String title, String val, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 16, color: TempleColors.goldPrimary),
        const SizedBox(height: 2),
        Text(val, style: GoogleFonts.cinzel(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
        Text(title, style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF94A3B8))),
      ],
    );
  }
}
