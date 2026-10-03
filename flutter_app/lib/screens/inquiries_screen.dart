import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';
import '../utils/sanctum_launcher.dart';

class InquiriesScreen extends StatefulWidget {
  const InquiriesScreen({super.key});

  @override
  State<InquiriesScreen> createState() => _InquiriesScreenState();
}

class _InquiriesScreenState extends State<InquiriesScreen> {
  String _selectedStatus = 'ALL';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadLiveInquiries();
  }

  Future<void> _loadLiveInquiries() async {
    final live = await ApiService.getInquiries();
    if (live != null && mounted) {
      setState(() {
        final mapped = live.map<Map<String, dynamic>>((inq) {
          String dateStr = 'Recent';
          if (inq['createdAt'] != null) {
            try {
              final dt = DateTime.parse(inq['createdAt'].toString()).toLocal();
              dateStr = '${dt.day}/${dt.month}/${dt.year}';
            } catch (_) {
              dateStr = inq['createdAt'].toString();
            }
          }

          final rawId = (inq['id'] ?? '').toString();
          final rawRef = (inq['referenceId'] ?? rawId).toString();

          return {
            'id': rawId.isNotEmpty ? rawId : rawRef,
            'referenceId': rawRef.isNotEmpty ? rawRef : rawId,
            'name': inq['name'] ?? inq['devoteeName'] ?? 'Sacred Devotee',
            'email': inq['email'] ?? '',
            'phone': inq['phone'] ?? '',
            'request': inq['message'] ?? inq['request'] ?? inq['inquiryType'] ?? 'Devotee Inquiry',
            'status': inq['status'] ?? 'NEW',
            'date': dateStr,
            'notes': inq['notes'] ?? '',
            'budget': inq['budget'] ?? 'N/A',
          };
        }).toList();
        _inquiries.clear();
        _inquiries.addAll(mapped);
      });
    }
  }

  final List<Map<String, dynamic>> _inquiries = [];

  List<Map<String, dynamic>> get _filteredInquiries {
    return _inquiries.where((inq) {
      final matchesStatus = _selectedStatus == 'ALL' || inq['status'] == _selectedStatus;
      final q = _searchQuery.trim().toLowerCase();
      final name = (inq['name'] ?? '').toString().toLowerCase();
      final phone = (inq['phone'] ?? '').toString().toLowerCase();
      final request = (inq['request'] ?? '').toString().toLowerCase();
      final id = (inq['id'] ?? '').toString().toLowerCase();
      final matchesQuery = q.isEmpty ||
          name.contains(q) ||
          phone.contains(q) ||
          request.contains(q) ||
          id.contains(q);
      return matchesStatus && matchesQuery;
    }).toList();
  }

  void _openAddInquirySheet() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final requestCtrl = TextEditingController();
    final budgetCtrl = TextEditingController(text: '15000');
    final notesCtrl = TextEditingController();

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
          boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, -5))],
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
                  decoration: BoxDecoration(color: const Color(0xFF334155), borderRadius: BorderRadius.circular(3)),
                ),
              ),
              const SizedBox(height: 16),
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
                    child: Text('LOG DEVOTEE INQUIRY', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary), overflow: TextOverflow.ellipsis),
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
              _buildSheetField('DEVOTEE NAME', nameCtrl, hint: 'e.g. Ramesh Iyer'),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildSheetField('PHONE / WHATSAPP', phoneCtrl, hint: '+91 98xxx xxxxx')),
                  const SizedBox(width: 10),
                  Expanded(child: _buildSheetField('EMAIL', emailCtrl, hint: 'devotee@gmail.com')),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildSheetField('DEVOTEE BUDGET (₹)', budgetCtrl)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('PRIORITY', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8))),
                        const SizedBox(height: 5),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFF334155))),
                          child: const Text('High (Devotee Lead)', style: TextStyle(color: Color(0xFF34D399), fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildSheetField('CUSTOM ORNAMENT / IDOL REQUEST', requestCtrl, maxLines: 2, hint: 'e.g. 5-metal custom Shiva Lingam with Nandi base'),
              const SizedBox(height: 10),
              _buildSheetField('INITIAL STHAPATI NOTES & SPECS', notesCtrl, maxLines: 2, hint: 'Temple consecration details, special auspicious dates...'),
              const SizedBox(height: 22),
              ElevatedButton(
                onPressed: () {
                  final name = nameCtrl.text.trim();
                  final req = requestCtrl.text.trim();
                  if (name.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter devotee name'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }
                  if (req.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter custom ornament / inquiry details'), backgroundColor: Color(0xFFDC2626)),
                    );
                    return;
                  }

                  setState(() {
                    _inquiries.insert(0, {
                      'id': 'INQ-${DateTime.now().millisecondsSinceEpoch % 10000}',
                      'name': name,
                      'email': emailCtrl.text.trim().isEmpty ? 'contact@sanctum.in' : emailCtrl.text.trim(),
                      'phone': phoneCtrl.text.trim().isEmpty ? '+91 90000 00000' : phoneCtrl.text.trim(),
                      'request': req,
                      'status': 'NEW',
                      'date': 'Just Now',
                      'notes': notesCtrl.text.trim().isEmpty ? 'Inward inquiry received' : notesCtrl.text.trim(),
                      'budget': '₹ ${budgetCtrl.text.trim()}',
                    });
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Inquiry from "$name" logged successfully!'),
                      backgroundColor: TempleColors.sanctumGreen,
                    ),
                  );

                  // Persist to backend
                  ApiService.createInquiry({
                    'name': name,
                    'email': emailCtrl.text.trim().isEmpty ? 'contact@sanctum.in' : emailCtrl.text.trim(),
                    'phone': phoneCtrl.text.trim().isEmpty ? '+91 90000 00000' : phoneCtrl.text.trim(),
                    'message': req,
                    'budget': budgetCtrl.text.trim(),
                    'notes': notesCtrl.text.trim(),
                  }).then((ok) {
                    if (ok) {
                      _loadLiveInquiries();
                    } else if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Failed to save inquiry to backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                child: Text('LOG INQUIRY LEAD', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openInquiryDetailsSheet(Map<String, dynamic> inq) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
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
                child: Container(width: 44, height: 4.5, decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3))),
              ),
              const SizedBox(height: 16),
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
                      Text(inq['id'], style: GoogleFonts.cinzel(color: TempleColors.emeraldMedium, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Row(
                    children: [
                      _buildStatusBadge(inq['status']),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B), size: 22),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => Navigator.pop(ctx),
                        tooltip: 'Close',
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(inq['name'], style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
              const SizedBox(height: 4),
              Text('${inq['phone']} • ${inq['email']}', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('REQUESTED CUSTOM ORNAMENT', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFFB45309))),
                    const SizedBox(height: 4),
                    Text(inq['request'], style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF1E293B), fontWeight: FontWeight.w500)),
                    const SizedBox(height: 8),
                    Text('Devotee Budget: ${inq['budget'] ?? '₹ 25,000'}', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: TempleColors.goldDark)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text('SANCTUM NOTES:', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
              const SizedBox(height: 4),
              Text(inq['notes'], style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF334155))),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final phone = inq['phone']?.toString() ?? '';
                        final launched = await SanctumLauncher.makePhoneCall(phone);
                        if (!launched && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open phone dialer for $phone')));
                        }
                      },
                      icon: const Icon(Icons.phone_in_talk, size: 16, color: Color(0xFF047857)),
                      label: const Text('Call', style: TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF059669)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final phone = inq['phone']?.toString() ?? '';
                        final launched = await SanctumLauncher.openWhatsApp(
                          phone,
                          message: 'Namaste ${inq['name']}, regarding your custom ornament request "${inq['request']}" with Aamadappetti Panchaloham Jewellery...',
                        );
                        if (!launched && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not launch WhatsApp for $phone')));
                        }
                      },
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                      label: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          inq['status'] = inq['status'] == 'NEW'
                              ? 'IN_PROGRESS'
                              : inq['status'] == 'IN_PROGRESS'
                                  ? 'RESOLVED'
                                  : 'RESOLVED';
                        });
                        setSheetState(() {});
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Inquiry status updated to ${inq['status']}!'), backgroundColor: TempleColors.sanctumGreen),
                        );
                        // Persist to backend
                        ApiService.updateInquiryStatus(inq['id'].toString(), inq['status']).then((ok) {
                          if (!ok && mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Failed to sync status update to backend.'), backgroundColor: Color(0xFFDC2626)),
                            );
                          }
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TempleColors.sanctumGreen,
                        foregroundColor: TempleColors.goldPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(inq['status'] == 'NEW' ? 'Start' : inq['status'] == 'IN_PROGRESS' ? 'Resolve' : 'Done', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDeleteInquiry(Map<String, dynamic> inq) {
    final ref = (inq['referenceId'] ?? inq['id'] ?? 'Inquiry').toString();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Delete Inquiry?',
          style: GoogleFonts.cinzel(color: const Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        content: Text(
          'Are you sure you want to remove inquiry $ref from ${inq['name']}? This action will permanently remove it from the backend database.',
          style: GoogleFonts.inter(color: const Color(0xFF475569), fontSize: 13.5, height: 1.4),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(color: const Color(0xFF64748B), fontWeight: FontWeight.w600, fontSize: 13),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final targetId = (inq['id'] ?? inq['referenceId']).toString();
              setState(() {
                _inquiries.removeWhere((i) => i['id'] == inq['id'] || i['referenceId'] == inq['referenceId']);
              });
              Navigator.pop(ctx);

              final ok = await ApiService.deleteInquiry(targetId);
              if (mounted) {
                if (ok) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Inquiry $ref deleted from database.'), backgroundColor: TempleColors.sanctumGreen),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete inquiry from server.'), backgroundColor: Colors.redAccent),
                  );
                  _loadLiveInquiries();
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildSheetField(String label, TextEditingController ctrl, {int maxLines = 1, String? hint}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF475569), letterSpacing: 0.8)),
        const SizedBox(height: 5),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
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

  Widget _buildStatusBadge(dynamic status) {
    Color bg;
    Color fg;
    final st = (status ?? 'NEW').toString().toUpperCase();
    switch (st) {
      case 'NEW':
        bg = const Color(0xFFFEF2F2);
        fg = const Color(0xFFDC2626);
        break;
      case 'IN_PROGRESS':
        bg = const Color(0xFFEFF6FF);
        fg = const Color(0xFF2563EB);
        break;
      case 'RESOLVED':
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF059669);
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        fg = const Color(0xFF64748B);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(st.replaceAll('_', ' '), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: fg)),
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
            Text('INQUIRIES & IDOL CUSTOM ORDERS', style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 1.1)),
            Text('${_inquiries.length} devotee custom requests', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFCBD5E1))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 24),
            tooltip: 'Log Inquiry',
            onPressed: _openAddInquirySheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddInquirySheet,
        backgroundColor: TempleColors.sanctumGreen,
        icon: const Icon(Icons.support_agent_rounded, color: TempleColors.goldPrimary, size: 20),
        label: Text('LOG INQUIRY', style: GoogleFonts.cinzel(color: TempleColors.goldPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Column(
        children: [
          // Search & Filter
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Search inquiries by name, ID, or deity...',
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
                  children: ['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED'].map((st) {
                    final isSel = _selectedStatus == st;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text(st.replaceAll('_', ' '), style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: isSel ? Colors.white : const Color(0xFF475569))),
                        selected: isSel,
                        selectedColor: const Color(0xFF0D5438),
                        backgroundColor: const Color(0xFFF1F5F9),
                        onSelected: (_) => setState(() => _selectedStatus = st),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // List
          Expanded(
            child: RefreshIndicator(
              color: TempleColors.emeraldMedium,
              backgroundColor: Colors.white,
              onRefresh: _loadLiveInquiries,
              child: _filteredInquiries.isEmpty
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
                              decoration: const BoxDecoration(color: Color(0xFFECFDF5), shape: BoxShape.circle),
                              child: const Icon(Icons.mark_chat_unread_outlined, size: 28, color: Color(0xFF047857)),
                            ),
                            const SizedBox(height: 12),
                            Text('No Inquiries Found', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text('Custom idol requests and devotee questions submitted online will appear here.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _openAddInquirySheet,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Record New Lead'),
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
                      itemCount: _filteredInquiries.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                        final inq = _filteredInquiries[idx];
                return GestureDetector(
                  onTap: () => _openInquiryDetailsSheet(inq),
                  child: Container(
                    padding: const EdgeInsets.all(16),
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
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text((inq['referenceId'] ?? inq['id'] ?? 'INQ-00').toString(), style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF64748B))),
                            Row(
                              children: [
                                _buildStatusBadge(inq['status']),
                                const SizedBox(width: 8),
                                IconButton(
                                  constraints: const BoxConstraints(),
                                  padding: EdgeInsets.zero,
                                  icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                                  onPressed: () => _confirmDeleteInquiry(inq),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text((inq['name'] ?? 'Devotee Inquiry').toString(), style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                        const SizedBox(height: 3),
                        Text((inq['request'] ?? '').toString(), maxLines: 2, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF475569))),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text((inq['date'] ?? 'Recent').toString(), style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8))),
                            Text((inq['budget'] ?? '₹ 25,000').toString(), style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0D5438))),
                          ],
                        ),
                      ],
                    ),
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
}
