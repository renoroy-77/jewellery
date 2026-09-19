'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  X,
  Package,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Send,
  Bell,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { INITIAL_ORDERS, OrderCMS } from '@/data/cmsData';
import { ordersService } from '@/services/ordersService';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderCMS[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderCMS | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    ordersService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    try {
      const res = await ordersService.testTelegram();
      if (res.success) {
        showToast(`Telegram Connected! ${res.message}`);
      } else {
        showToast(`Telegram Alert: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Telegram test failed: ${err.message}`);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleCreateSampleOrder = async () => {
    const sampleDevotees = [
      { name: 'Ramanathan Swamy', email: 'ramanathan@templetrust.org', phone: '+91 98401 55667', city: 'Chennai' },
      { name: 'Dr. Gayatri Sundaram', email: 'gayatri.s@vedicarts.in', phone: '+91 94440 22119', city: 'Madurai' },
      { name: 'Karthikeyan Balaji', email: 'karthik.b@agamasthapatis.org', phone: '+91 97909 33445', city: 'Coimbatore' },
    ];
    const dev = sampleDevotees[Math.floor(Math.random() * sampleDevotees.length)];
    const sampleOrder: Partial<OrderCMS> = {
      devoteeName: dev.name,
      email: dev.email,
      phone: dev.phone,
      items: [
        {
          productId: 'prod-001',
          productName: 'Lord Ganesha Panchaloham Pendant',
          price: 2499,
          quantity: 1,
        },
      ],
      totalAmount: 2499,
      status: 'Pending',
      shippingAddress: `42, Car Street, Sannadhi Post, ${dev.city}, Tamil Nadu`,
      paymentMethod: 'UPI Verified (Instant)',
    };

    try {
      const created = await ordersService.create(sampleOrder);
      setOrders((prev) => [created, ...prev]);
      showToast(`Order #${created.id} placed! Telegram notification dispatched.`);
    } catch (err: any) {
      showToast(`Order creation failed: ${err.message}`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: OrderCMS['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    showToast(`Order #${id} updated to ${newStatus} (Telegram alerted)`);

    ordersService.updateStatus(id, newStatus).catch(() => {
      showToast(`Warning: Could not sync status for #${id} to backend`);
    });
  };

  const handleCancelOrder = (id: string) => {
    const reason = prompt(
      `Enter cancellation reason for order #${id} (dispatched via Telegram alert):`,
      'Devotee requested cancellation',
    );
    if (reason !== null) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'Cancelled' } : o))
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
      }
      showToast(`Order #${id} marked as Cancelled (Telegram alert dispatched)`);

      ordersService
        .updateStatus(id, 'Cancelled', undefined, reason || 'Devotee requested cancellation')
        .catch(() => {
          showToast(`Warning: Could not sync cancellation for #${id} to backend`);
        });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm(`Are you sure you want to permanently delete order #${id} from the database?`)) {
      try {
        await ordersService.delete(id);
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
        showToast(`Order #${id} deleted successfully.`);
      } catch (err: any) {
        showToast(`Failed to delete order: ${err.message}`);
      }
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      showToast('Shipping address copied to clipboard!');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.devoteeName.toLowerCase().includes(q);
      const matchEmail = order.email.toLowerCase().includes(q);
      const matchPhone = order.phone.toLowerCase().includes(q);
      const matchAddress = order.shippingAddress.toLowerCase().includes(q);
      return matchId || matchName || matchEmail || matchPhone || matchAddress;
    }
    return true;
  });

  // Calculate counts
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const consecratedCount = orders.filter((o) => o.status === 'Consecrated').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const getStatusBadgeClass = (status: OrderCMS['status']) => {
    switch (status) {
      case 'Pending':
        return 'admin-status-amber';
      case 'Consecrated':
        return 'admin-status-purple';
      case 'Packed':
      case 'Shipped':
        return 'admin-status-blue';
      case 'Delivered':
        return 'admin-status-green';
      case 'Cancelled':
        return 'admin-status-red';
      default:
        return 'admin-status-blue';
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} color="#0d5438" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif, "Cinzel", serif)',
                fontSize: '1.75rem',
                color: '#0f172a',
                margin: 0,
                fontWeight: 700,
              }}
            >
              Orders Tracker &amp; Delivery Management
            </h1>
            <span
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block',
                }}
              />
              Telegram Bot Connected
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>
            Inspect devotee orders, delivery addresses, dispatch status, and mark parcels as Delivered with 1 click.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={isTestingTelegram}
            className="admin-btn admin-btn-secondary"
            title="Send a live test ping message to your Telegram channel"
          >
            <Bell size={15} color="#2563eb" />
            <span>{isTestingTelegram ? 'Pinging Bot...' : '🔔 Test Telegram Bot'}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateSampleOrder}
            className="admin-btn admin-btn-gold"
            title="Place a sample devotee order to test instant real-time Telegram notification"
          >
            <Plus size={15} />
            <span>+ Test Sacred Order</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-box">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{totalCount}</div>
            <div className="admin-stat-label">Total Devotee Orders</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              All lifetime orders
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#b45309' }}>{pendingCount + consecratedCount}</div>
            <div className="admin-stat-label">In Sanctum Preparation</div>
            <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '4px' }}>
              Pending crucible / consecration
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
            <Truck size={22} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#1d4ed8' }}>{shippedCount}</div>
            <div className="admin-stat-label">Dispatched &amp; In Transit</div>
            <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginTop: '4px' }}>
              With temple postal courier
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#047857' }}>{deliveredCount}</div>
            <div className="admin-stat-label">Successfully Delivered</div>
            <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '4px' }}>
              Received with holy prasadam
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Status Filter Tabs */}
          <div className="admin-tabs" style={{ marginBottom: 0 }}>
            {[
              { id: 'all', label: 'All Orders', count: totalCount },
              { id: 'Pending', label: 'Pending', count: pendingCount },
              { id: 'Consecrated', label: 'Consecrated', count: consecratedCount },
              { id: 'Shipped', label: 'Shipped', count: shippedCount },
              { id: 'Delivered', label: 'Delivered', count: deliveredCount },
              { id: 'Cancelled', label: 'Cancelled', count: cancelledCount },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`admin-tab-btn ${statusFilter === st.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(st.id)}
              >
                <span>{st.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: statusFilter === st.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: statusFilter === st.id ? '#ffffff' : '#475569',
                    fontWeight: 600,
                  }}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="search"
              placeholder="Search order ID, devotee, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <ShoppingBag size={20} color="#0d5438" />
              Devotee Orders List ({filteredOrders.length})
            </h2>
            <p className="admin-card-subtitle">
              Click &quot;✓ Mark Delivered&quot; or update status dropdown directly for any order.
            </p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID &amp; Date</th>
                <th>Devotee Contact</th>
                <th>Delivery Address</th>
                <th>Items Ordered</th>
                <th>Total Amount</th>
                <th>Delivery Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No orders match your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isDelivered = order.status === 'Delivered';

                  return (
                    <tr key={order.id}>
                      {/* Order ID & Date */}
                      <td>
                        <strong style={{ color: '#0d5438', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          #{order.id}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {order.date}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 500,
                          }}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Devotee Contact */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.devoteeName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                          📞 {order.phone}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          ✉️ {order.email}
                        </div>
                      </td>

                      {/* Delivery Address (Prominent & Clear) */}
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={15} color="#0d5438" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.4 }}>
                              {order.shippingAddress}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.shippingAddress)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0d5438',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: 0,
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Copy size={11} />
                              <span>Copy Address</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Items Ordered */}
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {order.items.map((it) => (
                            <div key={it.productId} style={{ marginBottom: '2px' }}>
                              <strong style={{ color: '#0f172a' }}>{it.productName}</strong>{' '}
                              <span style={{ color: '#0d5438', fontWeight: 600 }}>×{it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </strong>
                      </td>

                      {/* Delivery Status with quick switcher */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderCMS['status'])}
                            className="admin-form-select"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              width: 'auto',
                              cursor: 'pointer',
                              borderRadius: '6px',
                            }}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Consecrated">🕉️ Consecrated</option>
                            <option value="Packed">📦 Packed</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Delivered">✅ Delivered</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>

                          {/* Quick Delivered Shortcut */}
                          {!isDelivered && order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                              className="admin-btn admin-btn-sm"
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                width: '100%',
                                display: 'flex',
                                justifySelf: 'stretch',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                              title="1-Click Mark as Delivered"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            onClick={() => setSelectedOrder(order)}
                            title="View order details and shipping coordinates"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          {order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-sm"
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                padding: '3px 8px',
                              }}
                              onClick={() => handleCancelOrder(order.id)}
                              title="Cancel order and send Telegram alert"
                            >
                              <AlertTriangle size={12} />
                              <span>Cancel</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#64748b',
                              padding: '3px 7px',
                            }}
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Permanently delete order"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Shipping Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Order Details #{selectedOrder.id}</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Placed on {selectedOrder.date} · Paid via {selectedOrder.paymentMethod}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Status Stepper Card */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  CURRENT DELIVERY &amp; CONSECRATION STATUS
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d5438' }}>
                    {selectedOrder.status}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(['Pending', 'Consecrated', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                        className={`admin-btn admin-btn-sm ${
                          selectedOrder.status === st
                            ? st === 'Cancelled'
                              ? 'admin-btn-danger'
                              : 'admin-btn-gold'
                            : 'admin-btn-secondary'
                        }`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          background:
                            selectedOrder.status === st && st === 'Cancelled'
                              ? '#dc2626'
                              : undefined,
                          color:
                            selectedOrder.status === st && st === 'Cancelled'
                              ? '#ffffff'
                              : undefined,
                        }}
                      >
                        {st === 'Delivered' && <CheckCircle2 size={12} />}
                        {st === 'Cancelled' && <AlertTriangle size={12} />}
                        <span>{st}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address Box (Prominent) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    <MapPin size={16} color="#0d5438" />
                    <span>Shipping &amp; Delivery Address</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedOrder.shippingAddress)}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    {copiedAddress ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  {selectedOrder.shippingAddress}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Devotee:</strong> {selectedOrder.devoteeName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Phone:</strong> {selectedOrder.phone}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Email:</strong> {selectedOrder.email}
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      <strong>Tracking Number:</strong> <code style={{ color: '#0d5438', fontWeight: 600 }}>{selectedOrder.trackingNumber}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Sacred Items */}
              <div>
                <h3 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                  Consecrated Jewellery in Package
                </h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff',
                        borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{it.productName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Unit Price: ₹{it.price.toLocaleString('en-IN')} · Qty: <strong>{it.quantity}</strong>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                        ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '14px 16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#334155' }}>Total Order Value:</span>
                    <span style={{ color: '#0d5438', fontSize: '1.2rem' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedOrder.status !== 'Cancelled' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    <AlertTriangle size={14} />
                    <span>Cancel Order</span>
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-sm"
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#64748b' }}
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                >
                  <Trash2 size={14} />
                  <span>Delete Order</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!selectedOrder.status.includes('Delivered') && selectedOrder.status !== 'Cancelled' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-gold"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'Delivered');
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark as Delivered</span>
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
