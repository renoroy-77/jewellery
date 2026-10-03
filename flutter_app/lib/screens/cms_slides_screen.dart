import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';
import '../widgets/sanctum_media_uploader.dart';

class CmsSlidesScreen extends StatefulWidget {
  const CmsSlidesScreen({super.key});

  @override
  State<CmsSlidesScreen> createState() => _CmsSlidesScreenState();
}

class _CmsSlidesScreenState extends State<CmsSlidesScreen> {
  @override
  void initState() {
    super.initState();
    _loadLiveSlides();
  }

  Future<void> _loadLiveSlides() async {
    final live = await ApiService.getCmsHeroSlides();
    if (live != null && mounted) {
      setState(() {
        final mapped = live.map<Map<String, dynamic>>((s) {
          return {
            'id': s['id'] ?? DateTime.now().millisecondsSinceEpoch,
            'kicker': s['kicker'] ?? 'DIVINE BEAUTY, TIMELESS TRADITION',
            'titleLine1': s['titleLine1'] ?? s['title'] ?? 'Sacred Panchaloham',
            'titleLine2': s['titleLine2'] ?? '',
            'subtitle': s['subtitle'] ?? 'Handmade by traditional Sthapatis.',
            'ctaText': s['ctaText'] ?? 'Explore Jewels',
            'ctaLink': s['ctaLink'] ?? '/collections',
            'tag': s['tag'] ?? 'FAITH IN EVERY DETAIL',
            'image': s['image'] ?? '',
            'mobileImage': s['mobileImage'] ?? s['image'] ?? '',
            'isActive': s['isActive'] ?? true,
          };
        }).toList();
        _slides.clear();
        _slides.addAll(mapped);
      });
    }
  }

  final List<Map<String, dynamic>> _slides = [];

  void _openAddSlideSheet() {
    final kickerCtrl = TextEditingController(text: 'DIVINE BLESSINGS & AUSPICIOUSNESS');
    final title1Ctrl = TextEditingController();
    final title2Ctrl = TextEditingController();
    final subCtrl = TextEditingController();
    final ctaCtrl = TextEditingController(text: 'Explore Sacred Jewels');
    final linkCtrl = TextEditingController(text: '/collections');
    final tagCtrl = TextEditingController(text: 'NEW CONSECRATION');
    String selectedDesktopImage = '';
    String selectedMobileImage = '';

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
                          'ADD NEW HERO BANNER SLIDE',
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
                  const SizedBox(height: 14),
                  _buildField('KICKER TOP TEXT', kickerCtrl),
                  const SizedBox(height: 10),
                  _buildField('TITLE LINE 1', title1Ctrl, hint: 'e.g. Divine Grace'),
                  const SizedBox(height: 10),
                  _buildField('TITLE LINE 2 (GOLD EMPHASIS)', title2Ctrl, hint: 'e.g. Panchaloham Idols'),
                  const SizedBox(height: 10),
                  _buildField('SUBTITLE / BLESSING MESSAGE', subCtrl, maxLines: 2, hint: 'Sacred craftsmanship imbued with Agamic mantras.'),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _buildField('CTA BUTTON', ctaCtrl)),
                      const SizedBox(width: 10),
                      Expanded(child: _buildField('TAG BADGE', tagCtrl)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildField('TARGET ROUTE', linkCtrl),
                  const SizedBox(height: 16),
                  
                  // Dual Banner Image Uploaders: Desktop (16:9) & Mobile (9:16)
                  SanctumMediaUploader(
                    initialImageUrl: selectedDesktopImage,
                    label: 'DESKTOP BANNER (16:9 Widescreen)',
                    onImageChanged: (newUrl) {
                      setSheetState(() {
                        selectedDesktopImage = newUrl;
                        if (selectedMobileImage.isEmpty) {
                          selectedMobileImage = newUrl;
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 14),
                  SanctumMediaUploader(
                    initialImageUrl: selectedMobileImage,
                    label: 'MOBILE BANNER (9:16 Portrait)',
                    onImageChanged: (newUrl) {
                      setSheetState(() {
                        selectedMobileImage = newUrl;
                      });
                    },
                  ),
                const SizedBox(height: 18),
                ElevatedButton(
                  onPressed: () {
                    if (title1Ctrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter at least Title Line 1')),
                      );
                      return;
                    }
                    final kicker = kickerCtrl.text.trim().isEmpty ? 'DIVINE BEAUTY, TIMELESS TRADITION' : kickerCtrl.text.trim();
                    final title1 = title1Ctrl.text.trim();
                    final title2 = title2Ctrl.text.trim().isEmpty ? 'Your Faith' : title2Ctrl.text.trim();
                    final subtitle = subCtrl.text.trim().isEmpty ? 'Authentic Panchaloham jewellery.' : subCtrl.text.trim();
                    final ctaText = ctaCtrl.text.trim().isEmpty ? 'Shop Now' : ctaCtrl.text.trim();
                    final ctaLink = linkCtrl.text.trim().isEmpty ? '/collections' : linkCtrl.text.trim();
                    final tag = tagCtrl.text.trim().isEmpty ? 'FAITH IN EVERY DETAIL' : tagCtrl.text.trim();

                    final desktopImg = selectedDesktopImage.isNotEmpty ? selectedDesktopImage : selectedMobileImage;
                    final mobileImg = selectedMobileImage.isNotEmpty ? selectedMobileImage : selectedDesktopImage;

                    setState(() {
                      _slides.add({
                        'id': DateTime.now().millisecondsSinceEpoch,
                        'kicker': kicker,
                        'titleLine1': title1,
                        'titleLine2': title2,
                        'subtitle': subtitle,
                        'ctaText': ctaText,
                        'ctaLink': ctaLink,
                        'tag': tag,
                        'image': desktopImg,
                        'mobileImage': mobileImg,
                        'isActive': true,
                      });
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Sacred Slide "$title1" consecrated & published!'),
                        backgroundColor: TempleColors.sanctumGreen,
                      ),
                    );

                    // Persist to backend
                    ApiService.createHeroSlide({
                      'kicker': kicker,
                      'titleLine1': title1,
                      'titleLine2': title2,
                      'subtitle': subtitle,
                      'ctaText': ctaText,
                      'ctaLink': ctaLink,
                      'tag': tag,
                      'image': desktopImg,
                      'mobileImage': mobileImg,
                      'isActive': true,
                    }).then((ok) {
                      if (ok) {
                        _loadLiveSlides();
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to save slide to backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                  child: Text('CONSECRATE & ADD SLIDE', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _openEditSlideSheet(Map<String, dynamic> slide) {
    final kickerCtrl = TextEditingController(text: slide['kicker']);
    final title1Ctrl = TextEditingController(text: slide['titleLine1']);
    final title2Ctrl = TextEditingController(text: slide['titleLine2']);
    final subCtrl = TextEditingController(text: slide['subtitle']);
    final ctaCtrl = TextEditingController(text: slide['ctaText']);
    final linkCtrl = TextEditingController(text: slide['ctaLink'] ?? slide['link'] ?? '/collections');
    final tagCtrl = TextEditingController(text: slide['tag']);
    String selectedDesktopImage = slide['image']?.toString() ?? '';
    String selectedMobileImage = slide['mobileImage']?.toString() ?? selectedDesktopImage;

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
                          'EDIT STOREFRONT HERO SLIDE',
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
                  const SizedBox(height: 14),
                  _buildField('KICKER TOP TEXT', kickerCtrl),
                  const SizedBox(height: 10),
                  _buildField('TITLE LINE 1', title1Ctrl),
                  const SizedBox(height: 10),
                  _buildField('TITLE LINE 2 (GOLD)', title2Ctrl),
                  const SizedBox(height: 10),
                  _buildField('SUBTITLE / COPY', subCtrl, maxLines: 2),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _buildField('CTA BUTTON LABEL', ctaCtrl)),
                      const SizedBox(width: 10),
                      Expanded(child: _buildField('TAG BADGE', tagCtrl)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildField('TARGET ROUTE', linkCtrl),
                  const SizedBox(height: 16),

                  // Dual Banner Image Uploaders: Desktop (16:9) & Mobile (9:16)
                  SanctumMediaUploader(
                    initialImageUrl: selectedDesktopImage,
                    label: 'DESKTOP BANNER (16:9 Widescreen)',
                    onImageChanged: (newUrl) {
                      setSheetState(() {
                        selectedDesktopImage = newUrl;
                        if (selectedMobileImage.isEmpty) {
                          selectedMobileImage = newUrl;
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 14),
                  SanctumMediaUploader(
                    initialImageUrl: selectedMobileImage,
                    label: 'MOBILE BANNER (9:16 Portrait)',
                    onImageChanged: (newUrl) {
                      setSheetState(() {
                        selectedMobileImage = newUrl;
                      });
                    },
                  ),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: () {
                    final title1 = title1Ctrl.text.trim();
                    if (title1.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter at least Title Line 1'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }
                    final ctaLink = linkCtrl.text.trim().isEmpty ? '/collections' : linkCtrl.text.trim();

                    final desktopImg = selectedDesktopImage.isNotEmpty ? selectedDesktopImage : selectedMobileImage;
                    final mobileImg = selectedMobileImage.isNotEmpty ? selectedMobileImage : selectedDesktopImage;

                    setState(() {
                      slide['kicker'] = kickerCtrl.text.trim();
                      slide['titleLine1'] = title1;
                      slide['titleLine2'] = title2Ctrl.text.trim();
                      slide['subtitle'] = subCtrl.text.trim();
                      slide['ctaText'] = ctaCtrl.text.trim();
                      slide['ctaLink'] = ctaLink;
                      slide['link'] = ctaLink;
                      slide['tag'] = tagCtrl.text.trim();
                      slide['image'] = desktopImg;
                      slide['mobileImage'] = mobileImg;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Banner slide "${slide['titleLine1']}" updated!'),
                        backgroundColor: TempleColors.sanctumGreen,
                      ),
                    );

                    // Persist update to backend
                    ApiService.updateHeroSlide(slide['id'], {
                      'kicker': slide['kicker'],
                      'titleLine1': slide['titleLine1'],
                      'titleLine2': slide['titleLine2'],
                      'subtitle': slide['subtitle'],
                      'ctaText': slide['ctaText'],
                      'ctaLink': ctaLink,
                      'link': ctaLink,
                      'tag': slide['tag'],
                      'image': desktopImg,
                      'mobileImage': mobileImg,
                    }).then((ok) {
                      if (!ok && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to update slide on backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _confirmDeleteSlide(slide);
                  },
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                  label: Text('REMOVE SLIDE', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, color: Colors.redAccent, letterSpacing: 1.1)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFCA5A5)),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _confirmDeleteSlide(Map<String, dynamic> slide) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 10),
            Text('Remove Slide?', style: GoogleFonts.cinzel(color: const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to remove "${slide['titleLine1']} ${slide['titleLine2']}" from the customer storefront hero carousel?',
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
                _slides.removeWhere((s) => s['id'] == slide['id']);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Slide removed from carousel'), backgroundColor: Colors.redAccent),
              );

              // Persist delete to backend
              ApiService.deleteHeroSlide(slide['id']).then((ok) {
                if (!ok && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete slide from backend server.'), backgroundColor: Colors.redAccent),
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

  void _moveSlide(int index, int delta) {
    final newIndex = index + delta;
    if (newIndex < 0 || newIndex >= _slides.length) return;
    setState(() {
      final item = _slides.removeAt(index);
      _slides.insert(newIndex, item);
    });
  }

  Widget _buildField(String label, TextEditingController ctrl, {int maxLines = 1, String? hint}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: const Color(0xFF475569), letterSpacing: 0.8)),
        const SizedBox(height: 5),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
          style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF0F172A), fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
            filled: true,
            fillColor: Colors.white,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 11, vertical: 10),
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
            Text('HERO SLIDES & BANNERS', style: GoogleFonts.cinzel(fontSize: 14.5, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 1.1)),
            Text('${_slides.length} active promotional banners', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFCBD5E1))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 24),
            tooltip: 'Add Slide',
            onPressed: _openAddSlideSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddSlideSheet,
        backgroundColor: TempleColors.sanctumGreen,
        icon: const Icon(Icons.add_photo_alternate_rounded, color: TempleColors.goldPrimary, size: 20),
        label: Text('ADD SLIDE', style: GoogleFonts.cinzel(color: TempleColors.goldPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: RefreshIndicator(
        color: TempleColors.emeraldMedium,
        backgroundColor: Colors.white,
        onRefresh: _loadLiveSlides,
        child: _slides.isEmpty
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
                        child: const Icon(Icons.view_carousel_rounded, size: 28, color: Color(0xFFB45309)),
                      ),
                      const SizedBox(height: 12),
                      Text('No Hero Slides Configured', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text('Add hero slides to display promotional banners on the customer storefront.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _openAddSlideSheet,
                        icon: const Icon(Icons.add_photo_alternate_rounded, size: 16),
                        label: const Text('Add Hero Slide'),
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
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                itemCount: _slides.length,
                separatorBuilder: (context, index) => const SizedBox(height: 16),
                itemBuilder: (context, idx) {
                final slide = _slides[idx];
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 10, offset: Offset(0, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Banner Image Preview with Tag
                Stack(
                  children: [
                    SanctumImage(
                      imageSource: slide['image'],
                      height: 160,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    ),
                    Positioned(
                      top: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xCC000000),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: TempleColors.goldPrimary.withValues(alpha: 0.6)),
                        ),
                        child: Text(
                          slide['tag'] ?? 'FEATURED',
                          style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Row(
                        children: [
                          if (idx > 0)
                            GestureDetector(
                              onTap: () => _moveSlide(idx, -1),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                margin: const EdgeInsets.only(right: 4),
                                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(6)),
                                child: const Icon(Icons.arrow_upward, size: 14, color: Colors.white),
                              ),
                            ),
                          if (idx < _slides.length - 1)
                            GestureDetector(
                              onTap: () => _moveSlide(idx, 1),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                margin: const EdgeInsets.only(right: 4),
                                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(6)),
                                child: const Icon(Icons.arrow_downward, size: 14, color: Colors.white),
                              ),
                            ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: (slide['isActive'] == true) ? const Color(0xFF065F46) : const Color(0xFF475569),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              (slide['isActive'] == true) ? 'Active' : 'Hidden',
                              style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        slide['kicker'],
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFFB45309), letterSpacing: 0.8),
                      ),
                      const SizedBox(height: 3),
                      RichText(
                        text: TextSpan(
                          style: GoogleFonts.cinzel(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                          children: [
                            TextSpan(text: '${slide['titleLine1']} '),
                            TextSpan(text: slide['titleLine2'], style: const TextStyle(color: Color(0xFF854D0E))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        slide['subtitle'],
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), height: 1.35),
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                const Icon(Icons.link_rounded, size: 14, color: Color(0xFF94A3B8)),
                                const SizedBox(width: 4),
                                Flexible(
                                  child: Text(
                                    '${slide['ctaText']} • ${slide['ctaLink']}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Transform.scale(
                            scale: 0.8,
                            child: Switch(
                              value: slide['isActive'],
                              activeTrackColor: const Color(0xFF065F46),
                              activeThumbColor: TempleColors.goldPrimary,
                              onChanged: (val) {
                                setState(() => slide['isActive'] = val);
                                ApiService.updateHeroSlide(slide['id'], {'isActive': val});
                              },
                            ),
                          ),
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: const EdgeInsets.all(6),
                            icon: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF1E293B)),
                            tooltip: 'Edit Slide',
                            onPressed: () => _openEditSlideSheet(slide),
                          ),
                          IconButton(
                            constraints: const BoxConstraints(),
                            padding: const EdgeInsets.all(6),
                            icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.redAccent),
                            tooltip: 'Delete Slide',
                            onPressed: () => _confirmDeleteSlide(slide),
                          ),
                        ],
                      ),
                    ],
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
