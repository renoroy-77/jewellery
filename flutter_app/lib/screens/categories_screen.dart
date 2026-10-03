import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';
import '../widgets/sanctum_media_uploader.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadLiveCategories();
  }

  Future<void> _loadLiveCategories() async {
    final live = await ApiService.getCategories();
    if (live != null && mounted) {
      setState(() {
        final mapped = live.map<Map<String, dynamic>>((c) {
          final slug = (c['slug'] ?? c['id'] ?? 'collection').toString();
          String img = '';
          if (c['image'] != null && c['image'].toString().isNotEmpty) {
            img = c['image'].toString();
          }

          return {
            'id': c['id'] ?? 'cat-$slug',
            'name': c['name'] ?? 'Collection',
            'tamilName': c['tamilName'] ?? '',
            'slug': slug,
            'count': c['itemCount'] ?? c['count'] ?? 0,
            'desc': c['description'] ?? c['desc'] ?? '',
            'image': img,
          };
        }).toList();
        _categories.clear();
        _categories.addAll(mapped);
      });
    }
  }

  final List<Map<String, dynamic>> _categories = [];

  List<Map<String, dynamic>> get _filteredCategories {
    if (_searchQuery.trim().isEmpty) return _categories;
    final q = _searchQuery.toLowerCase();
    return _categories.where((c) {
      final name = (c['name'] ?? '').toString().toLowerCase();
      final tamil = (c['tamilName'] ?? '').toString().toLowerCase();
      final slug = (c['slug'] ?? '').toString().toLowerCase();
      final desc = (c['desc'] ?? '').toString().toLowerCase();
      return name.contains(q) || tamil.contains(q) || slug.contains(q) || desc.contains(q);
    }).toList();
  }

  void _openAddCategorySheet() {
    final nameCtrl = TextEditingController();
    final tamilCtrl = TextEditingController();
    final slugCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final countCtrl = TextEditingController(text: '0');
    String selectedImage = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => SafeArea(
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
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3)),
                    ),
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
                        child: Text(
                          'CONSECRATE NEW DEITY',
                          style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary),
                          overflow: TextOverflow.ellipsis,
                        ),
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
                _buildField('COLLECTION / DEITY NAME', nameCtrl, hint: 'e.g. Saraswati Collection', onChanged: (v) {
                  slugCtrl.text = v.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-|-$'), '');
                }),
                const SizedBox(height: 10),
                _buildField('TAMIL SACRED SCRIPT NAME', tamilCtrl, hint: 'e.g. கலைமகள் சரஸ்வதி'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _buildField('URL SLUG', slugCtrl, hint: 'saraswati')),
                    const SizedBox(width: 10),
                    Expanded(child: _buildField('INITIAL PIECES', countCtrl)),
                  ],
                ),
                const SizedBox(height: 10),
                _buildField('SACRED DESCRIPTION & BLESSINGS', descCtrl, maxLines: 2, hint: 'Wisdom, sacred learning, and five-metal consecrated pendants.'),
                const SizedBox(height: 14),
                SanctumMediaUploader(
                  initialImageUrl: selectedImage,
                  label: 'DEITY ARTWORK / EMBLEM',
                  onImageChanged: (newUrl) {
                    setSheetState(() {
                      selectedImage = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 18),
                ElevatedButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a collection name')),
                      );
                      return;
                    }
                    final name = nameCtrl.text.trim();
                    final slug = slugCtrl.text.trim().isEmpty ? name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-') : slugCtrl.text.trim();
                    final countVal = int.tryParse(countCtrl.text.trim()) ?? 0;
                    final desc = descCtrl.text.trim();
                    final tamil = tamilCtrl.text.trim().isEmpty ? name : tamilCtrl.text.trim();

                    setState(() {
                      _categories.add({
                        'id': 'cat-$slug',
                        'name': name,
                        'tamilName': tamil,
                        'slug': slug,
                        'count': countVal,
                        'desc': desc,
                        'image': selectedImage,
                      });
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Deity Collection "$name" consecrated successfully!'),
                        backgroundColor: TempleColors.sanctumGreen,
                      ),
                    );

                    // Persist category to backend
                    ApiService.createCategory({
                      'name': name,
                      'slug': slug,
                      'tamilName': tamil,
                      'itemCount': countVal,
                      'description': desc,
                      'image': selectedImage,
                    }).then((ok) {
                      if (ok) {
                        _loadLiveCategories();
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to save collection to backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                  child: Text('CONSECRATE COLLECTION', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _openEditCategorySheet(Map<String, dynamic> cat) {
    final nameCtrl = TextEditingController(text: cat['name']);
    final tamilCtrl = TextEditingController(text: cat['tamilName']);
    final slugCtrl = TextEditingController(text: cat['slug']);
    final descCtrl = TextEditingController(text: cat['desc']);
    final countCtrl = TextEditingController(text: '${cat['count']}');
    String selectedImage = cat['image']?.toString() ?? '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => SafeArea(
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
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(3)),
                    ),
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
                        child: Text(
                          'EDIT DEITY COLLECTION',
                          style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary),
                          overflow: TextOverflow.ellipsis,
                        ),
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
                SanctumMediaUploader(
                  initialImageUrl: selectedImage,
                  label: 'DEITY ARTWORK / EMBLEM',
                  onImageChanged: (newUrl) {
                    setSheetState(() {
                      selectedImage = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 14),
                _buildField('COLLECTION NAME', nameCtrl),
                const SizedBox(height: 10),
                _buildField('TAMIL NAME (வடிவம்)', tamilCtrl),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _buildField('URL SLUG', slugCtrl)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildField('ITEMS COUNT', countCtrl)),
                  ],
                ),
                const SizedBox(height: 10),
                _buildField('DESCRIPTION', descCtrl, maxLines: 2),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: () {
                    final name = nameCtrl.text.trim();
                    if (name.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a collection name'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }
                    final tamil = tamilCtrl.text.trim();
                    final slug = slugCtrl.text.trim();
                    final desc = descCtrl.text.trim();
                    final countVal = int.tryParse(countCtrl.text.trim()) ?? cat['count'];

                    setState(() {
                      cat['name'] = name;
                      cat['tamilName'] = tamil;
                      cat['slug'] = slug;
                      cat['desc'] = desc;
                      cat['count'] = countVal;
                      cat['image'] = selectedImage;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Collection "${cat['name']}" updated!'),
                        backgroundColor: TempleColors.sanctumGreen,
                      ),
                    );

                    // Persist update to backend
                    ApiService.updateCategory(cat['id'].toString(), {
                      'name': name,
                      'tamilName': tamil,
                      'slug': slug,
                      'description': desc,
                      'itemCount': countVal,
                      'image': selectedImage,
                    }).then((ok) {
                      if (!ok && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to update collection on backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                  child: Text('SAVE CHANGES', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _confirmDeleteCategory(Map<String, dynamic> cat) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 10),
            Text('Remove Collection?', style: GoogleFonts.cinzel(color: const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to remove "${cat['name']}" (${cat['count']} pieces)? This will unassign items from this category.',
          style: GoogleFonts.inter(color: const Color(0xFF475569), fontSize: 13.5),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _categories.removeWhere((c) => c['id'] == cat['id']);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Collection removed'), backgroundColor: Colors.redAccent),
              );

              // Persist delete to backend
              ApiService.deleteCategory(cat['id'].toString()).then((ok) {
                if (!ok && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete collection from backend server.'), backgroundColor: Colors.redAccent),
                  );
                }
              });
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {int maxLines = 1, String? hint, Function(String)? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF475569), letterSpacing: 0.8)),
        const SizedBox(height: 5),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
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
    final totalItems = _categories.fold<int>(0, (sum, c) {
      final cnt = c['count'];
      if (cnt is num) return sum + cnt.toInt();
      if (cnt is String) return sum + (int.tryParse(cnt) ?? 0);
      return sum;
    });

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
            Text('DIVINE DEITIES & COLLECTIONS', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 1.1)),
            Text('${_categories.length} categories • $totalItems consecrated items', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFCBD5E1))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 24),
            tooltip: 'Add Collection',
            onPressed: _openAddCategorySheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddCategorySheet,
        backgroundColor: TempleColors.sanctumGreen,
        icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 20),
        label: Text('ADD DEITY', style: GoogleFonts.cinzel(color: TempleColors.goldPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            color: Colors.white,
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Search deities, Tamil names, or symbols...',
                hintStyle: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // List
          Expanded(
            child: RefreshIndicator(
              color: TempleColors.emeraldMedium,
              backgroundColor: Colors.white,
              onRefresh: _loadLiveCategories,
              child: _filteredCategories.isEmpty
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
                              decoration: const BoxDecoration(color: Color(0xFFEFF6FF), shape: BoxShape.circle),
                              child: const Icon(Icons.category_outlined, size: 28, color: Color(0xFF1D4ED8)),
                            ),
                            const SizedBox(height: 12),
                            Text('No Collections Found', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text('Create a new deity collection to display in the temple catalog.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _openAddCategorySheet,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Add Deity Collection'),
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
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
                      itemCount: _filteredCategories.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                      final cat = _filteredCategories[idx];
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
                      SanctumImage(
                        imageSource: cat['image'],
                        width: 52,
                        height: 52,
                        fit: BoxFit.cover,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    (cat['name'] ?? 'Deity Category').toString(),
                                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (cat['tamilName'] != null && cat['tamilName'].toString().trim().isNotEmpty) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4)),
                                    child: Text(cat['tamilName'].toString(), style: const TextStyle(fontSize: 10, color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text((cat['desc'] ?? '').toString(), maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B))),
                            const SizedBox(height: 4),
                            Text('${cat['count'] ?? 0} consecrated pieces listed', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF0D5438))),
                          ],
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF854D0E)),
                            tooltip: 'Edit Collection',
                            onPressed: () => _openEditCategorySheet(cat),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.redAccent),
                            tooltip: 'Delete Collection',
                            onPressed: () => _confirmDeleteCategory(cat),
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
}
