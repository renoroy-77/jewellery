import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';

/// Smart image renderer that safely displays:
/// 1. Network URLs (http:// or https://)
/// 2. Relative upload URLs (/uploads/...) by prepending backend baseUrl
/// 3. Web asset paths (/assets/hero_slide_1.webp)
/// 4. Flutter asset paths (assets/images/...)
/// 5. Automatically tries fallback extensions (.webp <-> .jpg <-> .png)
class SanctumImage extends StatelessWidget {
  final String? imageSource;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  const SanctumImage({
    super.key,
    required this.imageSource,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final raw = (imageSource ?? '').trim();

    Widget placeholder = Container(
      width: width,
      height: height,
      color: const Color(0xFF03180F),
      child: Center(
        child: Icon(
          Icons.temple_hindu_rounded,
          size: (width != null && width! < 60) ? 20 : 32,
          color: TempleColors.goldPrimary.withValues(alpha: 0.6),
        ),
      ),
    );

    if (raw.isEmpty) {
      return _wrap(placeholder);
    }

    // 1. Full Network URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return _wrap(Image.network(
        raw,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, _, _) => placeholder,
        loadingBuilder: (ctx, child, progress) {
          if (progress == null) return child;
          return Container(
            width: width,
            height: height,
            color: const Color(0xFF07261A),
            child: const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: TempleColors.goldPrimary),
              ),
            ),
          );
        },
      ));
    }

    // 2. Relative backend uploads path (/uploads/...)
    if (raw.startsWith('/uploads/')) {
      final fullUrl = '${ApiService.baseUrl}$raw';
      return _wrap(Image.network(
        fullUrl,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, _, _) => placeholder,
      ));
    }

    // 3. Asset path normalization (handling /assets/..., assets/..., hero_slide_1.webp, etc.)
    String filename = raw;
    if (filename.startsWith('/')) {
      filename = filename.substring(1);
    }
    if (filename.startsWith('assets/images/')) {
      filename = filename.substring(14);
    } else if (filename.startsWith('assets/')) {
      filename = filename.substring(7);
    } else if (filename.startsWith('images/')) {
      filename = filename.substring(7);
    }

    final primaryAsset = 'assets/images/$filename';

    return _wrap(Image.asset(
      primaryAsset,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (ctx, err, stack) {
        // Fallback 1: try alternate format (.webp <-> .jpg <-> .png)
        String alt = primaryAsset;
        if (primaryAsset.endsWith('.webp')) {
          alt = primaryAsset.replaceAll('.webp', '.jpg');
        } else if (primaryAsset.endsWith('.jpg')) {
          alt = primaryAsset.replaceAll('.jpg', '.webp');
        } else if (primaryAsset.endsWith('.png')) {
          alt = primaryAsset.replaceAll('.png', '.webp');
        }

        return Image.asset(
          alt,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (_, _, _) {
            // Fallback 2: try .png
            final pngAlt = primaryAsset.replaceAll(RegExp(r'\.(webp|jpg)$'), '.png');
            return Image.asset(
              pngAlt,
              width: width,
              height: height,
              fit: fit,
              errorBuilder: (_, _, _) {
                // Fallback 3: try network request from backend static server
                if (raw.startsWith('/')) {
                  return Image.network(
                    '${ApiService.baseUrl}$raw',
                    width: width,
                    height: height,
                    fit: fit,
                    errorBuilder: (_, _, _) => placeholder,
                  );
                }
                return placeholder;
              },
            );
          },
        );
      },
    ));
  }

  Widget _wrap(Widget child) {
    if (borderRadius != null) {
      return ClipRRect(borderRadius: borderRadius!, child: child);
    }
    return child;
  }
}

/// A clean, fully responsive media uploader for products, categories, hero slides, and blogs.
/// Direct actions:
/// - [📷 Camera] Take photo on mobile devices
/// - [🖼️ Gallery / Files] Pick from device gallery or web storage
/// - [🔗 Web Link] Attach public image link
/// - Real-time upload to NestJS backend (/api/media/upload)
/// - NO cluttered presets taking up screen real estate
class SanctumMediaUploader extends StatefulWidget {
  final String label;
  final String? initialImageUrl;
  final ValueChanged<String> onImageChanged;
  final double previewHeight;

  const SanctumMediaUploader({
    super.key,
    this.label = 'CONSECRATED PHOTO / ARTWORK',
    this.initialImageUrl,
    required this.onImageChanged,
    this.previewHeight = 150,
  });

  @override
  State<SanctumMediaUploader> createState() => _SanctumMediaUploaderState();
}

class _SanctumMediaUploaderState extends State<SanctumMediaUploader> {
  String? _currentImage;
  bool _isUploading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _currentImage = widget.initialImageUrl;
  }

  @override
  void didUpdateWidget(covariant SanctumMediaUploader oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialImageUrl != oldWidget.initialImageUrl) {
      _currentImage = widget.initialImageUrl;
    }
  }

  Future<void> _pickAndUpload(ImageSource source) async {
    try {
      Uint8List? bytes;
      String filename = 'upload_${DateTime.now().millisecondsSinceEpoch}.jpg';

      try {
        final XFile? file = await _picker.pickImage(
          source: source,
          maxWidth: 1920,
          maxHeight: 1920,
          imageQuality: 88,
        );
        if (file != null) {
          bytes = await file.readAsBytes();
          if (file.name.isNotEmpty) {
            filename = file.name;
          }
        }
      } catch (pickerErr) {
        debugPrint('[SanctumMediaUploader] ImagePicker notice: $pickerErr');
      }

      // If bytes still null (e.g. desktop/web file dialog), use FilePicker as fallback
      if (bytes == null) {
        final pickedFile = await FilePicker.pickFile(
          type: FileType.image,
        );
        if (pickedFile != null) {
          bytes = await pickedFile.readAsBytes();
          if (pickedFile.name.isNotEmpty) {
            filename = pickedFile.name;
          }
        }
      }

      if (bytes == null) return;

      setState(() => _isUploading = true);

      final uploadedUrl = await ApiService.uploadMedia(bytes, filename);

      setState(() {
        _isUploading = false;
        if (uploadedUrl != null) {
          _currentImage = uploadedUrl;
          widget.onImageChanged(uploadedUrl);
        }
      });

      if (!mounted) return;
      if (uploadedUrl != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sacred media uploaded successfully!'),
            backgroundColor: TempleColors.sanctumGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to upload image to backend.'),
            backgroundColor: Color(0xFFB45309),
          ),
        );
      }
    } catch (e) {
      setState(() => _isUploading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Upload permission error: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  void _showUrlInputDialog() {
    final urlCtrl = TextEditingController(text: _currentImage);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        title: Text(
          'Attach Public Image URL',
          style: GoogleFonts.cinzel(color: TempleColors.emeraldMedium, fontWeight: FontWeight.bold, fontSize: 15),
        ),
        content: TextField(
          controller: urlCtrl,
          style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'https://...',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: TempleColors.goldPrimary, width: 1.5)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () {
              final trimmed = urlCtrl.text.trim();
              if (trimmed.isNotEmpty) {
                setState(() => _currentImage = trimmed);
                widget.onImageChanged(trimmed);
              }
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: TempleColors.goldPrimary,
              foregroundColor: const Color(0xFF03180F),
            ),
            child: const Text('Attach URL'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = _currentImage != null && _currentImage!.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Text(
          widget.label,
          style: GoogleFonts.inter(
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF94A3B8),
            letterSpacing: 0.8,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 8),

        // Main preview container
        GestureDetector(
          onTap: () => _pickAndUpload(ImageSource.gallery),
          child: Container(
            height: widget.previewHeight,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF081C13),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: hasImage ? TempleColors.goldPrimary.withValues(alpha: 0.6) : const Color(0xFF1E3A2B),
                width: 1.5,
              ),
              boxShadow: const [
                BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 3)),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(13),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (hasImage)
                    SanctumImage(
                      imageSource: _currentImage,
                      fit: BoxFit.cover,
                    )
                  else
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF0E2F20),
                            border: Border.all(color: TempleColors.goldPrimary.withValues(alpha: 0.4)),
                          ),
                          child: const Icon(Icons.add_a_photo_outlined, color: TempleColors.goldPrimary, size: 26),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Upload Sacred Photograph',
                          style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'High-res photo for Mobile & Web display',
                          style: GoogleFonts.inter(fontSize: 10.5, color: const Color(0xFF64748B)),
                        ),
                      ],
                    ),

                  // Uploading overlay
                  if (_isUploading)
                    Container(
                      color: Colors.black54,
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const CircularProgressIndicator(color: TempleColors.goldPrimary),
                            const SizedBox(height: 10),
                            Text(
                              'Optimizing & uploading to backend...',
                              style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Status indicator badge (Top-Left)
                  if (hasImage && !_isUploading)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xE603180F),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: TempleColors.goldPrimary.withValues(alpha: 0.6)),
                          boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 4)],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle_rounded, color: TempleColors.goldPrimary, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              'Attached',
                              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Dedicated Remove Photo action button (Top-Right)
                  if (hasImage && !_isUploading)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _currentImage = null);
                          widget.onImageChanged('');
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                          decoration: BoxDecoration(
                            color: const Color(0xEB7F1D1D),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.redAccent.withValues(alpha: 0.8)),
                            boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 4)],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 13),
                              const SizedBox(width: 4),
                              Text(
                                'Remove Photo',
                                style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 10),

        // Quick Action Buttons Row (Camera, Gallery, URL)
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                icon: Icons.camera_alt_outlined,
                label: 'Camera',
                onTap: () => _pickAndUpload(ImageSource.camera),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildActionButton(
                icon: Icons.photo_library_outlined,
                label: 'Gallery',
                onTap: () => _pickAndUpload(ImageSource.gallery),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildActionButton(
                icon: Icons.link_rounded,
                label: 'Link',
                onTap: _showUrlInputDialog,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: TempleColors.goldPrimary, size: 15),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
