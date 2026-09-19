'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  Plus,
  Palette,
  ExternalLink,
  Users,
  BookOpen,
  UserPlus,
  Compass,
  X,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { INITIAL_ORDERS, OrderCMS, UserRecord, INITIAL_USERS } from '@/data/cmsData';
import { BLOG_POSTS } from '@/data/blog';
import { dashboardService, DashboardStatsResponse } from '@/services/dashboardService';
import { devoteesService } from '@/services/devoteesService';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderCMS[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New User Creation Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');

  useEffect(() => {
    setIsLoading(true);
    dashboardService
      .getStats()
      .then((data) => {
        if (data) {
          setStats(data);
          if (data.recentOrders && data.recentOrders.length > 0) {
            setOrders(data.recentOrders);
          }
          if (data.recentUsers && data.recentUsers.length > 0) {
            setUsers(data.recentUsers);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const nextIdNum = users.length + 101;
    const newUser: UserRecord = {
      id: `USR-${nextIdNum}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+91 98000 00000',
      shippingAddress: newUserAddress.trim() || 'Address on file',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    try {
      const created = await devoteesService.create(newUser);
      setUsers((prev) => [created, ...prev]);
      setToastMessage(`Created registered user "${created.name}" successfully!`);
    } catch {
      setUsers((prev) => [newUser, ...prev]);
      setToastMessage(`Created user "${newUser.name}" (local fallback)`);
    }

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserAddress('');
    setIsCreateUserModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingOrdersCount =
    stats?.metrics.pendingOrders ??
    orders.filter((o) => o.status === 'Pending' || o.status === 'Consecrated').length;

  const totalRevenue =
    stats?.metrics.totalRevenue ??
    orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Executive Store Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Store inventory, divine collections, registered users, orders, and content management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsCreateUserModalOpen(true)}
            className="admin-btn admin-btn-gold"
          >
            <UserPlus size={16} />
            <span>+ New User</span>
          </button>
          <Link href="/admin/cms" className="admin-btn admin-btn-secondary">
            <Palette size={16} />
            <span>CMS Banners</span>
          </Link>
          <Link href="/" target="_blank" className="admin-btn admin-btn-secondary">
            <span>View Storefront</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-box">
            <Package size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{stats?.metrics.totalProducts ?? PRODUCTS.length}</div>
            <div className="admin-stat-label">Consecrated Products</div>
            <div style={{ fontSize: '0.72rem', color: '#0d5438', marginTop: '4px', fontWeight: 600 }}>
              {stats?.metrics.inStockProducts ?? PRODUCTS.length} in stock • Assay certified
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#1d4ed8' }}>{stats?.metrics.totalCategories ?? CATEGORIES.length}</div>
            <div className="admin-stat-label">Divine Deities &amp; Collections</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Ganesha, Murugan, Shiva &amp; Lakshmi
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#b45309' }}>{pendingOrdersCount}</div>
            <div className="admin-stat-label">Orders in Sanctum Pipeline</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              {stats?.metrics.totalOrders ?? orders.length} total • ₹{totalRevenue.toLocaleString('en-IN')} revenue
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#0d5438' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{stats?.metrics.totalUsers ?? users.length}</div>
            <div className="admin-stat-label">Registered Customers</div>
            <div style={{ fontSize: '0.72rem', color: '#0d5438', marginTop: '4px', fontWeight: 600 }}>
              Live PostgreSQL devotee accounts
            </div>
          </div>
        </div>
      </div>

      {/* Content & CMS Quick Navigation Strip */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#0d5438', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>
              Content &amp; Store CMS Hub
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Direct access to homepage slides, promotional banners, articles, and product catalogs.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/admin/cms" className="admin-btn admin-btn-sm admin-btn-secondary">
            <Palette size={14} />
            <span>Banners &amp; Alerts</span>
          </Link>
          <Link href="/admin/blog" className="admin-btn admin-btn-sm admin-btn-secondary">
            <BookOpen size={14} />
            <span>Journal Articles</span>
          </Link>
          <Link href="/admin/products" className="admin-btn admin-btn-sm admin-btn-secondary">
            <Package size={14} />
            <span>Product Catalog</span>
          </Link>
          <Link href="/admin/users?action=new" className="admin-btn admin-btn-sm admin-btn-gold">
            <UserPlus size={14} />
            <span>+ Add User</span>
          </Link>
        </div>
      </div>

      {/* Two Columns Grid: Orders & Users */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Recent Orders Pipeline Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <ShoppingBag size={20} color="#0d5438" />
              Recent Consecrated Orders ({orders.length})
            </h2>
            <Link href="/admin/orders" className="admin-btn admin-btn-sm admin-btn-secondary">
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Items Ordered</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((ord) => {
                  const isDelivered = ord.status === 'Delivered';
                  const isPending = ord.status === 'Pending';
                  const isShipped = ord.status === 'Shipped';

                  return (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: '#0d5438', fontFamily: 'monospace' }}>
                          #{ord.id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{ord.devoteeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '240px' }}>
                          {ord.items.map((it) => `${it.productName} (×${it.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{ord.date}</td>
                      <td>
                        <span
                          className={`admin-status-badge ${
                            isDelivered
                              ? 'admin-status-green'
                              : isPending
                              ? 'admin-status-amber'
                              : isShipped
                              ? 'admin-status-blue'
                              : 'admin-status-gold'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <Link href="/admin/orders" className="admin-btn admin-btn-sm admin-btn-secondary">
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Users Table (NO PUNYAM) */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <Users size={20} color="#0d5438" />
              Registered Users
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="admin-btn admin-btn-sm admin-btn-gold"
              >
                <Plus size={14} />
                <span>+ New User</span>
              </button>
              <Link href="/admin/users" className="admin-btn admin-btn-sm admin-btn-secondary">
                <span>View All Users</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Delivery Address</th>
                  <th>Member Since</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong style={{ color: '#0d5438', fontFamily: 'monospace' }}>
                        #{user.id}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>📞 {user.phone}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>✉️ {user.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          color: '#334155',
                          maxWidth: '280px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={user.shippingAddress}
                      >
                        📍 {user.shippingAddress}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        {user.memberSince}
                      </span>
                    </td>
                    <td>
                      <Link href="/admin/users" className="admin-btn admin-btn-sm admin-btn-gold">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Access Tiles to CMS & Products & Blog */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="admin-card" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <Palette size={24} color="#0d5438" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>Hero Slider &amp; Banners</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '18px' }}>
              Customize dynamic cinematic slides, promotional story cards, and top announcement alerts.
            </p>
            <Link href="/admin/cms" className="admin-btn admin-btn-sm admin-btn-secondary" style={{ width: '100%' }}>
              <span>Edit CMS Banners</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-card" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <Package size={24} color="#0d5438" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>Product Inventory</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '18px' }}>
              Add new sacred talismans, update Panchaloham 5-metal compositions, pricing, and stock status.
            </p>
            <Link href="/admin/products" className="admin-btn admin-btn-sm admin-btn-secondary" style={{ width: '100%' }}>
              <span>Manage Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-card" style={{ margin: 0, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <BookOpen size={24} color="#0d5438" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>Journal &amp; Blog</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '18px' }}>
              Publish treatises on sacred Panchaloham metallurgy, temple consecration traditions, and Agamic rites.
            </p>
            <Link href="/admin/blog" className="admin-btn admin-btn-sm admin-btn-gold" style={{ width: '100%' }}>
              <span>Manage Articles</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* CREATE NEW USER MODAL (IN-DASHBOARD) */}
      {isCreateUserModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCreateUserModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#0d5438', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="admin-modal-title" style={{ margin: 0 }}>Create New User</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Quickly add a registered customer to the store database
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Radhika Sundaram"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. radhika@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 94443 89100"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Delivery Shipping Address *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 88, North Car Street, Madurai - 625001"
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserPlus size={16} />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
