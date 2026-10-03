import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/temple_theme.dart';
import '../services/api_service.dart';

class ShippingScreen extends StatefulWidget {
  const ShippingScreen({super.key});

  @override
  State<ShippingScreen> createState() => _ShippingScreenState();
}

class _ShippingScreenState extends State<ShippingScreen> {
  // Gift Packaging State
  bool _giftPackagingEnabled = true;
  final _giftPackagingTextCtrl = TextEditingController(text: 'FREE');
  final _giftPackagingFeeCtrl = TextEditingController(text: '0');

  // Insured Express Shipping State
  final _expressShippingTextCtrl = TextEditingController(text: 'Insured Express Shipping');
  final _shippingFeeCtrl = TextEditingController(text: '99');
  final _freeShippingThresholdCtrl = TextEditingController(text: '999');

  // Storefront Simulator State
  final _simulatedCartCtrl = TextEditingController(text: '1');
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isSynced = true;

  @override
  void initState() {
    super.initState();
    _loadLiveSettings();
  }

  @override
  void dispose() {
    _giftPackagingTextCtrl.dispose();
    _giftPackagingFeeCtrl.dispose();
    _expressShippingTextCtrl.dispose();
    _shippingFeeCtrl.dispose();
    _freeShippingThresholdCtrl.dispose();
    _simulatedCartCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadLiveSettings() async {
    setState(() => _isLoading = true);
    try {
      final settings = await ApiService.getCheckoutSettings();
      if (settings != null && mounted) {
        setState(() {
          if (settings['giftPackagingEnabled'] != null) {
            _giftPackagingEnabled = settings['giftPackagingEnabled'] == true;
          }
          if (settings['giftPackagingText'] != null && settings['giftPackagingText'].toString().isNotEmpty) {
            _giftPackagingTextCtrl.text = settings['giftPackagingText'].toString();
          }
          if (settings['giftPackagingFee'] != null) {
            _giftPackagingFeeCtrl.text = settings['giftPackagingFee'].toString().replaceAll('.0', '');
          }
          if (settings['expressShippingText'] != null && settings['expressShippingText'].toString().isNotEmpty) {
            _expressShippingTextCtrl.text = settings['expressShippingText'].toString();
          }
          if (settings['shippingFee'] != null) {
            _shippingFeeCtrl.text = settings['shippingFee'].toString().replaceAll('.0', '');
          }
          if (settings['freeShippingThreshold'] != null) {
            _freeShippingThresholdCtrl.text = settings['freeShippingThreshold'].toString().replaceAll('.0', '');
          }
          _isSynced = true;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isSynced = false);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSettings() async {
    final shippingFee = double.tryParse(_shippingFeeCtrl.text.trim());
    if (shippingFee == null || shippingFee < 0) {
      _showError('Please enter a valid Standard Shipping Fee (₹0 or more)');
      return;
    }

    final threshold = double.tryParse(_freeShippingThresholdCtrl.text.trim());
    if (threshold == null || threshold < 0) {
      _showError('Please enter a valid Free Shipping Threshold (₹0 or more)');
      return;
    }

    final giftFee = double.tryParse(_giftPackagingFeeCtrl.text.trim()) ?? 0.0;
    final giftText = _giftPackagingTextCtrl.text.trim().isEmpty ? 'FREE' : _giftPackagingTextCtrl.text.trim();
    final expressText = _expressShippingTextCtrl.text.trim().isEmpty ? 'Insured Express Shipping' : _expressShippingTextCtrl.text.trim();

    setState(() => _isSaving = true);

    final payload = {
      'shippingFee': shippingFee,
      'freeShippingThreshold': threshold,
      'giftPackagingEnabled': _giftPackagingEnabled,
      'giftPackagingFee': giftFee,
      'giftPackagingText': giftText,
      'expressShippingText': expressText,
    };

    final success = await ApiService.updateCheckoutSettings(payload);

    if (!mounted) return;

    setState(() {
      _isSaving = false;
      _isSynced = success;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Expanded(child: Text('Checkout Shipping & Gift Packaging Master updated!')),
            ],
          ),
          backgroundColor: const Color(0xFF047857),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } else {
      _showError('Failed to sync settings with backend server.');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Simulation calculations
  double get _currentSubtotal => double.tryParse(_simulatedCartCtrl.text) ?? 1.0;
  double get _currentShippingFee => double.tryParse(_shippingFeeCtrl.text) ?? 99.0;
  double get _currentThreshold => double.tryParse(_freeShippingThresholdCtrl.text) ?? 999.0;
  double get _currentGiftFee => _giftPackagingEnabled ? (double.tryParse(_giftPackagingFeeCtrl.text) ?? 0.0) : 0.0;

  bool get _isFreeShippingApplied => _currentSubtotal >= _currentThreshold;
  double get _calculatedShippingCharge => _isFreeShippingApplied ? 0.0 : _currentShippingFee;
  double get _totalPayable => _currentSubtotal + _calculatedShippingCharge + _currentGiftFee;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'SHIPPING & PACKAGING',
          style: GoogleFonts.cinzel(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.8),
        ),
        centerTitle: true,
        backgroundColor: const Color(0xFF031910),
        foregroundColor: TempleColors.goldPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: TempleColors.goldPrimary, strokeWidth: 2),
                  )
                : const Icon(Icons.check_circle_outline_rounded, color: TempleColors.goldPrimary),
            tooltip: 'Save Settings',
            onPressed: _isSaving ? null : _saveSettings,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: TempleColors.goldPrimary))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeaderMasterCard(),
                  const SizedBox(height: 16),
                  _buildGiftPackagingCard(),
                  const SizedBox(height: 16),
                  _buildInsuredShippingCard(),
                  const SizedBox(height: 20),
                  _buildStorefrontSimulationCard(),
                  const SizedBox(height: 24),
                  _buildSaveSettingsButton(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  // 1. Master Header Card matching Web Admin (Image 4)
  Widget _buildHeaderMasterCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 10, offset: Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFED7AA)),
                ),
                child: const Icon(Icons.inventory_2_outlined, color: Color(0xFFD97706), size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'CHECKOUT SHIPPING & GIFT PACKAGING MASTER',
                      style: GoogleFonts.cinzel(fontSize: 14.5, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A), height: 1.3),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Live controls for delivery charges, free delivery thresholds, and gift packaging options across the checkout portal.',
                      style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B), height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _isSynced ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _isSynced ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isSynced ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                      size: 14,
                      color: _isSynced ? const Color(0xFF047857) : const Color(0xFFDC2626),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _isSynced ? 'PostgreSQL DB Synced' : 'Sync Needed',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _isSynced ? const Color(0xFF047857) : const Color(0xFFDC2626),
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveSettings,
                icon: _isSaving
                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.save_rounded, size: 16),
                label: Text('Save Settings', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF065F46),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. GIFT PACKAGING CONTROLS CARD (Image 4 - Card 1)
  Widget _buildGiftPackagingCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                const Icon(Icons.card_giftcard_rounded, color: Color(0xFF059669), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'GIFT PACKAGING',
                    style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), letterSpacing: 0.3),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                InkWell(
                  onTap: () {
                    setState(() => _giftPackagingEnabled = !_giftPackagingEnabled);
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Checkbox(
                        value: _giftPackagingEnabled,
                        onChanged: (val) => setState(() => _giftPackagingEnabled = val ?? true),
                        activeColor: const Color(0xFF059669),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        _giftPackagingEnabled ? 'Enabled at Checkout' : 'Disabled',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _giftPackagingEnabled ? const Color(0xFF059669) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Form Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _buildFormField(
                        label: 'Badge / Display Label',
                        controller: _giftPackagingTextCtrl,
                        hint: 'e.g. FREE, Complimentary',
                        subtext: 'Displayed on checkout row when fee is ₹0 (e.g. FREE)',
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildFormField(
                        label: 'Gift Packaging Fee (₹)',
                        controller: _giftPackagingFeeCtrl,
                        hint: '0',
                        subtext: 'Set to 0 for 100% complimentary packaging',
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 3. INSURED EXPRESS SHIPPING CONTROLS CARD (Image 4 - Card 2)
  Widget _buildInsuredShippingCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_shipping_outlined, color: Color(0xFFB45309), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'INSURED EXPRESS SHIPPING',
                    style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), letterSpacing: 0.3),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // Form Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFormField(
                  label: 'Shipping Display Label',
                  controller: _expressShippingTextCtrl,
                  hint: 'e.g. Insured Express Shipping',
                  subtext: 'Shown on checkout and order confirmation',
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 14),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _buildFormField(
                        label: 'Standard Shipping Fee (₹)',
                        controller: _shippingFeeCtrl,
                        hint: '99',
                        subtext: 'Default delivery fee (e.g. ₹99)',
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildFormField(
                        label: 'Free Shipping Min. Subtotal (₹)',
                        controller: _freeShippingThresholdCtrl,
                        hint: '999',
                        subtext: 'Orders equal to or above this amount get ₹0 delivery',
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Dynamic Amber Active Pricing Rule Banner (Image 4)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info_outline_rounded, color: Color(0xFFD97706), size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF92400E), height: 1.45),
                            children: [
                              const TextSpan(text: 'Pricing rule active: ', style: TextStyle(fontWeight: FontWeight.bold)),
                              TextSpan(text: 'If cart subtotal is under ₹${_currentThreshold.toStringAsFixed(0)}, customers are charged '),
                              TextSpan(text: '₹${_currentShippingFee.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              TextSpan(text: '. Cart totals of ₹${_currentThreshold.toStringAsFixed(0)} or more automatically get '),
                              const TextSpan(text: 'FREE delivery', style: TextStyle(fontWeight: FontWeight.bold)),
                              const TextSpan(text: '.'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4. LIVE STOREFRONT SIMULATION (Image 4 - Right Card)
  Widget _buildStorefrontSimulationCard() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF031910),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF0D5438)),
        boxShadow: const [BoxShadow(color: Color(0x1F000000), blurRadius: 16, offset: Offset(0, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar with Green Dot & Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF0B3B28))),
            ),
            child: Row(
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'LIVE STOREFRONT SIMULATION',
                    style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: TempleColors.goldPrimary, letterSpacing: 0.3),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF07291B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF0E5C3E)),
                  ),
                  child: Text(
                    '/checkout preview',
                    style: GoogleFonts.jetBrainsMono(fontSize: 9.5, color: const Color(0xFF6EE7B7)),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Quick Subtotal Selector
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Simulate Cart Subtotal:', style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
                    Text(
                      '₹${_currentSubtotal.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [1, 500, 999, 1499].map((amt) {
                    final isSelected = _currentSubtotal.toInt() == amt;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _simulatedCartCtrl.text = amt.toString();
                        });
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? TempleColors.goldPrimary : const Color(0xFF072B1D),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isSelected ? TempleColors.goldPrimary : const Color(0xFF135A3D)),
                        ),
                        child: Text(
                          '₹$amt',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? const Color(0xFF031910) : Colors.white70,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 18),
                const Divider(height: 1, color: Color(0xFF0E432E)),
                const SizedBox(height: 16),

                // ORDER SUMMARY Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ORDER SUMMARY',
                      style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
                    ),
                    Text('1 ITEM', style: GoogleFonts.inter(fontSize: 11, color: Colors.white54)),
                  ],
                ),
                const SizedBox(height: 14),

                // Product Row
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF052115),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF0B3D28)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0A3C28),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(Icons.workspace_premium_rounded, color: TempleColors.goldPrimary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Lord Ganesha Pendant', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: Colors.white)),
                            const SizedBox(height: 2),
                            Text('Qty: 1 × ₹${_currentSubtotal.toStringAsFixed(0)}', style: GoogleFonts.inter(fontSize: 11, color: Colors.white54)),
                          ],
                        ),
                      ),
                      Text(
                        '₹${_currentSubtotal.toStringAsFixed(0)}',
                        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Line Items
                _buildSummaryLineItem('Items Subtotal', '₹${_currentSubtotal.toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                _buildSummaryLineItem(
                  'Gift Packaging',
                  _giftPackagingEnabled
                      ? (_currentGiftFee == 0 ? (_giftPackagingTextCtrl.text.isEmpty ? 'FREE' : _giftPackagingTextCtrl.text) : '₹${_currentGiftFee.toStringAsFixed(0)}')
                      : 'Disabled',
                  highlight: _giftPackagingEnabled && _currentGiftFee == 0,
                ),
                const SizedBox(height: 8),
                _buildSummaryLineItem(
                  _expressShippingTextCtrl.text.isEmpty ? 'Insured Express Shipping' : _expressShippingTextCtrl.text,
                  _isFreeShippingApplied ? 'FREE' : '₹${_calculatedShippingCharge.toStringAsFixed(0)}',
                  highlight: _isFreeShippingApplied,
                ),
                const SizedBox(height: 14),
                const Divider(height: 1, color: Color(0xFF0E432E)),
                const SizedBox(height: 14),

                // Total Payable
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Payable', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                    Text(
                      '₹${_totalPayable.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: TempleColors.goldBright),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Proceed to Pay Button
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB45309),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text(
                      'Proceed to Pay ₹${_totalPayable.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Trust Badges
                Row(
                  children: const [
                    Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 14),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text('100% Certified Panchaloham (Govt Assay)', style: TextStyle(fontSize: 10.5, color: Colors.white60)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: const [
                    Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 14),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text('Tamper-Proof Insured All-India Transit', style: TextStyle(fontSize: 10.5, color: Colors.white60)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryLineItem(String label, String value, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(label, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70), overflow: TextOverflow.ellipsis),
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 12.5,
            fontWeight: highlight ? FontWeight.bold : FontWeight.w600,
            color: highlight ? const Color(0xFF34D399) : Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required String subtext,
    TextInputType keyboardType = TextInputType.text,
    ValueChanged<String>? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF334155)),
        ),
        const SizedBox(height: 6),
        Container(
          height: 42,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFCBD5E1)),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            onChanged: onChanged,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtext,
          style: GoogleFonts.inter(fontSize: 10.5, color: const Color(0xFF64748B), height: 1.3),
        ),
      ],
    );
  }

  Widget _buildSaveSettingsButton() {
    return SizedBox(
      height: 48,
      child: ElevatedButton.icon(
        onPressed: _isSaving ? null : _saveSettings,
        icon: _isSaving
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Icon(Icons.cloud_upload_outlined, size: 20),
        label: Text(
          _isSaving ? 'Saving to Database...' : 'Save Settings',
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF065F46),
          foregroundColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
