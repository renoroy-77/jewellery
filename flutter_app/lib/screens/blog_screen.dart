import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';
import '../widgets/sanctum_media_uploader.dart';

class BlogScreen extends StatefulWidget {
  const BlogScreen({super.key});

  @override
  State<BlogScreen> createState() => _BlogScreenState();
}

class _BlogScreenState extends State<BlogScreen> {
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadLiveArticles();
  }

  Future<void> _loadLiveArticles() async {
    final live = await ApiService.getBlogPosts();
    if (live != null && mounted) {
      setState(() {
        final mapped = live.map<Map<String, dynamic>>((b) {
          String contentStr = '';
          if (b['content'] is Map) {
            contentStr = (b['content'] as Map)['lead']?.toString() ?? b['excerpt']?.toString() ?? '';
          } else if (b['content'] != null) {
            contentStr = b['content'].toString();
          } else {
            contentStr = b['excerpt']?.toString() ?? '';
          }

          return {
            'id': b['id'] ?? b['slug'] ?? 'art-${DateTime.now().millisecondsSinceEpoch}',
            'title': b['title'] ?? 'Sacred Article',
            'subtitle': b['subtitle'] ?? b['excerpt'] ?? '',
            'author': b['authorName'] ?? b['author'] ?? 'Chief Sthapati',
            'readTime': b['readTime'] ?? '5 min read',
            'tag': (b['tag'] ?? 'WISDOM').toString().toUpperCase(),
            'date': b['date'] ?? 'Recent',
            'image': b['image'] ?? '',
            'isPublished': b['isPublished'] ?? true,
            'content': contentStr,
          };
        }).toList();
        _articles.clear();
        _articles.addAll(mapped);
      });
    }
  }

  final List<Map<String, dynamic>> _articles = [];

  List<Map<String, dynamic>> get _filteredArticles {
    if (_searchQuery.trim().isEmpty) return _articles;
    final q = _searchQuery.toLowerCase();
    return _articles.where((a) {
      final title = (a['title'] ?? '').toString().toLowerCase();
      final subtitle = (a['subtitle'] ?? '').toString().toLowerCase();
      final tag = (a['tag'] ?? '').toString().toLowerCase();
      final author = (a['author'] ?? '').toString().toLowerCase();
      return title.contains(q) || subtitle.contains(q) || tag.contains(q) || author.contains(q);
    }).toList();
  }

  void _openAddArticleSheet() {
    final titleCtrl = TextEditingController();
    final subCtrl = TextEditingController();
    final authorCtrl = TextEditingController(text: 'Chief Sthapati');
    final tagCtrl = TextEditingController(text: 'VEDIC METALLURGY');
    final readTimeCtrl = TextEditingController(text: '5 min read');
    final contentCtrl = TextEditingController();
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
                          'WRITE JOURNAL ARTICLE',
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
                  label: 'SACRED ARTICLE COVER PHOTOGRAPH',
                  onImageChanged: (newUrl) {
                    setSheetState(() {
                      selectedImage = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 14),
                _buildField('ARTICLE TITLE', titleCtrl, hint: 'e.g. Agamic Secrets of Swarna Bhasma'),
                const SizedBox(height: 10),
                _buildField('VEDIC SUBTITLE & SUMMARY', subCtrl, maxLines: 2, hint: 'Brief spiritual summary for devotees.'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _buildField('AUTHOR / STHAPATI', authorCtrl)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildField('CATEGORY / TAG', tagCtrl)),
                  ],
                ),
                const SizedBox(height: 10),
                _buildField('READ TIME', readTimeCtrl),
                const SizedBox(height: 10),
                _buildField('ARTICLE CONTENT', contentCtrl, maxLines: 5, hint: 'Write full spiritual text, Agamic citations, and benefits...'),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: () {
                    if (titleCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter an article title')),
                      );
                      return;
                    }
                    final title = titleCtrl.text.trim();
                    final subtitle = subCtrl.text.trim();
                    final author = authorCtrl.text.trim();
                    final tag = tagCtrl.text.trim().toUpperCase();
                    final content = contentCtrl.text.trim().isEmpty ? subtitle : contentCtrl.text.trim();
                    final slug = title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-|-$'), '');

                    setState(() {
                      _articles.insert(0, {
                        'id': 'art-${DateTime.now().millisecondsSinceEpoch}',
                        'title': title,
                        'subtitle': subtitle,
                        'author': author,
                        'readTime': readTimeCtrl.text.trim(),
                        'tag': tag,
                        'date': 'Today',
                        'image': selectedImage,
                        'isPublished': true,
                        'content': content,
                      });
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Sacred Article "$title" published to Journal!'),
                        backgroundColor: TempleColors.sanctumGreen,
                      ),
                    );

                    // Persist to backend
                    ApiService.createBlogPost({
                      'title': title,
                      'subtitle': subtitle,
                      'excerpt': subtitle,
                      'content': content,
                      'author': author,
                      'tag': tag,
                      'slug': slug,
                      'readTime': '5 min read',
                      'image': selectedImage,
                      'isPublished': true,
                    }).then((ok) {
                      if (ok) {
                        _loadLiveArticles();
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to save article to backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                  child: Text('PUBLISH SACRED ARTICLE', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _openEditArticleSheet(Map<String, dynamic> art) {
    final titleCtrl = TextEditingController(text: art['title']);
    final subCtrl = TextEditingController(text: art['subtitle']);
    final authorCtrl = TextEditingController(text: art['author']);
    final tagCtrl = TextEditingController(text: art['tag']);
    final readTimeCtrl = TextEditingController(text: art['readTime'] ?? '5 min read');
    final contentCtrl = TextEditingController(text: art['content']);
    String selectedImage = art['image']?.toString() ?? '';

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
                          'EDIT SACRED ARTICLE',
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
                  label: 'SACRED ARTICLE COVER PHOTOGRAPH',
                  onImageChanged: (newUrl) {
                    setSheetState(() {
                      selectedImage = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 14),
                _buildField('ARTICLE TITLE', titleCtrl),
                const SizedBox(height: 10),
                _buildField('SUBTITLE', subCtrl, maxLines: 2),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _buildField('AUTHOR', authorCtrl)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildField('TAG', tagCtrl)),
                  ],
                ),
                const SizedBox(height: 10),
                _buildField('READ TIME', readTimeCtrl),
                const SizedBox(height: 10),
                _buildField('CONTENT', contentCtrl, maxLines: 5),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: () {
                    final title = titleCtrl.text.trim();
                    if (title.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter an article title'), backgroundColor: Color(0xFFDC2626)),
                      );
                      return;
                    }
                    final subtitle = subCtrl.text.trim();
                    final author = authorCtrl.text.trim();
                    final tag = tagCtrl.text.trim().toUpperCase();
                    final readTime = readTimeCtrl.text.trim().isEmpty ? '5 min read' : readTimeCtrl.text.trim();
                    final content = contentCtrl.text.trim();

                    setState(() {
                      art['title'] = title;
                      art['subtitle'] = subtitle;
                      art['author'] = author;
                      art['tag'] = tag;
                      art['readTime'] = readTime;
                      art['content'] = content;
                      art['image'] = selectedImage;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Article "${art['title']}" updated!'), backgroundColor: TempleColors.sanctumGreen),
                    );

                    // Persist to backend
                    ApiService.updateBlogPost(art['id'].toString(), {
                      'title': title,
                      'subtitle': subtitle,
                      'excerpt': subtitle,
                      'content': content,
                      'author': author,
                      'tag': tag,
                      'image': selectedImage,
                    }).then((ok) {
                      if (!ok && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to update article on backend server.'), backgroundColor: Color(0xFFDC2626)),
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
                  child: Text('SAVE ARTICLE EDITS', style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }

  void _confirmDeleteArticle(Map<String, dynamic> art) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 10),
            Text('Remove Article?', style: GoogleFonts.cinzel(color: const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to remove "${art['title']}" from the Vedic Metallurgy Journal?',
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
                _articles.removeWhere((a) => a['id'] == art['id']);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Article removed'), backgroundColor: Colors.redAccent),
              );

              // Persist to backend
              ApiService.deleteBlogPost(art['id'].toString()).then((ok) {
                if (!ok && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete article from backend server.'), backgroundColor: Colors.redAccent),
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

  void _showFullArticleDialog(Map<String, dynamic> art) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF07261A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFFD4AF37), width: 1.5)),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: const Color(0x33D4AF37), borderRadius: BorderRadius.circular(4)),
              child: Text(art['tag'], style: const TextStyle(fontSize: 10.5, color: Color(0xFFDFC488), fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 8),
            Text(art['title'], style: GoogleFonts.cinzel(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('By ${art['author']} • ${art['readTime']}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8))),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (art['image'] != null && art['image'].toString().isNotEmpty) ...[
                SanctumImage(
                  imageSource: art['image'],
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  borderRadius: BorderRadius.circular(12),
                ),
                const SizedBox(height: 14),
              ],
              Text(art['content'], style: GoogleFonts.inter(fontSize: 13, height: 1.6, color: const Color(0xFFE2E8F0))),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Close Sanctum Reader', style: GoogleFonts.cinzel(color: const Color(0xFFDFC488), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
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
            Text('VEDIC METALLURGY JOURNAL', style: GoogleFonts.cinzel(fontSize: 14, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 1.1)),
            Text('${_articles.length} published spiritual scrolls', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFCBD5E1))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: TempleColors.goldPrimary, size: 24),
            tooltip: 'Write Article',
            onPressed: _openAddArticleSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddArticleSheet,
        backgroundColor: TempleColors.sanctumGreen,
        icon: const Icon(Icons.edit_note_rounded, color: TempleColors.goldPrimary, size: 20),
        label: Text('WRITE ARTICLE', style: GoogleFonts.cinzel(color: TempleColors.goldPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Column(
        children: [
          // Search
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            color: Colors.white,
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Search Vedic articles, authors, or topics...',
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

          // Articles List
          Expanded(
            child: RefreshIndicator(
              color: TempleColors.emeraldMedium,
              backgroundColor: Colors.white,
              onRefresh: _loadLiveArticles,
              child: _filteredArticles.isEmpty
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
                              child: const Icon(Icons.menu_book_rounded, size: 28, color: Color(0xFFB45309)),
                            ),
                            const SizedBox(height: 12),
                            Text('No Articles Found', style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text('Publish spiritual wisdom, metallurgy treatises, or temple rituals to your journal.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B))),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _openAddArticleSheet,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Write Sacred Article'),
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
                      itemCount: _filteredArticles.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 14),
                      itemBuilder: (context, idx) {
                      final art = _filteredArticles[idx];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEFF2F5)),
                    boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 8, offset: Offset(0, 3))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (art['image'] != null && art['image'].toString().isNotEmpty) ...[
                        SanctumImage(
                          imageSource: art['image'],
                          height: 125,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        const SizedBox(height: 12),
                      ],
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
                            child: Text((art['tag'] ?? 'ARTICLE').toString(), style: const TextStyle(fontSize: 10, color: Color(0xFF047857), fontWeight: FontWeight.bold)),
                          ),
                          Row(
                            children: [
                              Text((art['readTime'] ?? '').toString(), style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8))),
                              const SizedBox(width: 8),
                              IconButton(
                                constraints: const BoxConstraints(),
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.edit_outlined, size: 17, color: Color(0xFF64748B)),
                                onPressed: () => _openEditArticleSheet(art),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                constraints: const BoxConstraints(),
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.delete_outline, size: 17, color: Colors.redAccent),
                                onPressed: () => _confirmDeleteArticle(art),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text((art['title'] ?? 'Sacred Article').toString(), style: GoogleFonts.cinzel(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A), height: 1.3)),
                      const SizedBox(height: 6),
                      Text((art['subtitle'] ?? '').toString(), maxLines: 2, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), height: 1.4)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'By ${(art['author'] ?? 'Admin').toString()}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              visualDensity: VisualDensity.compact,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            onPressed: () => _showFullArticleDialog(art),
                            icon: const Icon(Icons.menu_book, size: 14, color: Color(0xFF065F46)),
                            label: Text('Read Full Article', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF065F46))),
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
