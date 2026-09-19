'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Eye,
  Plus,
  Copy,
  UserPlus,
} from 'lucide-react';
import { INITIAL_ORDERS, OrderCMS, UserRecord, INITIAL_USERS } from '@/data/cmsData';
import { devoteesService, DevoteeWithOrders } from '@/services/devoteesService';
import { ordersService } from '@/services/ordersService';

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<OrderCMS[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');

  // Load live devotees and orders from PostgreSQL
  useEffect(() => {
    setIsLoading(true);
    Promise.all([devoteesService.getAll(), ordersService.getAll()])
      .then(([fetchedUsers, fetchedOrders]) => {
        if (fetchedUsers && fetchedUsers.length > 0) setUsers(fetchedUsers);
        if (fetchedOrders && fetchedOrders.length > 0) setOrders(fetchedOrders);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Check if query param requests new user modal
    if (searchParams?.get('action') === 'new') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyAddress = (id: string, addr: string) => {
    navigator.clipboard?.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPhone.trim()) return;

    const newRecord: UserRecord = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      shippingAddress: newUserAddress.trim() || 'Address not specified',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    try {
      const created = await devoteesService.create(newRecord);
      setUsers((prev) => [created, ...prev]);
      showToast(`Created devotee profile "${created.name}" (#${created.id}) successfully!`);
    } catch (err: any) {
      // Fallback local update
      setUsers((prev) => [newRecord, ...prev]);
      showToast(err.message || 'Saved devotee locally');
    }

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserAddress('');
    setIsCreateModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.shippingAddress.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  // Helper to get user's past orders
  const getUserOrders = (u: UserRecord) => {
    return orders.filter(
      (o) =>
        o.email.toLowerCase() === u.email.toLowerCase() ||
        o.phone.replace(/\s+/g, '') === u.phone.replace(/\s+/g, '') ||
        o.devoteeName.toLowerCase().includes(u.name.toLowerCase()) ||
        u.name.toLowerCase().includes(o.devoteeName.toLowerCase())
    );
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Users
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage registered customer accounts, delivery addresses, and orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="search"
              placeholder="Search users by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="admin-btn admin-btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>+ New User</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-box">
            <Users size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{users.length}</div>
            <div className="admin-stat-label">Total Users</div>
            <div style={{ fontSize: '0.72rem', color: '#0d5438', marginTop: '4px', fontWeight: 600 }}>
              Registered customer profiles
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#1d4ed8' }}>{orders.length}</div>
            <div className="admin-stat-label">Total Orders Placed</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Across all user accounts
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>
            <MapPin size={22} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#047857' }}>
              {users.filter((u) => u.shippingAddress && u.shippingAddress !== 'Address not specified').length}
            </div>
            <div className="admin-stat-label">Verified Delivery Addresses</div>
            <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
              Ready for parcel dispatch
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Users size={20} color="#0d5438" />
              Users ({filteredUsers.length})
            </h2>
            <p className="admin-card-subtitle">
              Browse registered customer accounts, delivery addresses, and past order records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="admin-btn admin-btn-sm admin-btn-gold"
          >
            <Plus size={14} />
            <span>Add User</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Details</th>
                <th>Delivery Address</th>
                <th>Member Since</th>
                <th>Orders Placed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No users found matching your search term.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userOrders = getUserOrders(user);
                  const isCopied = copiedId === user.id;

                  return (
                    <tr key={user.id}>
                      {/* Name & ID */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                          ID: #{user.id}
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>📞 {user.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>✉️ {user.email}</div>
                      </td>

                      {/* Delivery Address */}
                      <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={14} color="#0d5438" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div>{user.shippingAddress}</div>
                            {user.shippingAddress && user.shippingAddress !== 'Address not specified' && (
                              <button
                                type="button"
                                onClick={() => handleCopyAddress(user.id, user.shippingAddress)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '4px',
                                  fontSize: '0.72rem',
                                  color: isCopied ? '#059669' : '#0d5438',
                                  background: isCopied ? '#ecfdf5' : '#f1f5f9',
                                  border: `1px solid ${isCopied ? '#a7f3d0' : '#cbd5e1'}`,
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                {isCopied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                                <span>{isCopied ? 'Copied' : 'Copy Address'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Member Since */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#475569', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {user.memberSince}
                        </span>
                      </td>

                      {/* Past Orders count */}
                      <td>
                        <span className="admin-status-badge admin-status-purple">
                          {userOrders.length} Order{userOrders.length === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-gold"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={13} />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#0d5438', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="admin-modal-title" style={{ margin: 0 }}>Create New User</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Add a registered customer to the store database
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
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
                    placeholder="e.g. Ramesh Krishnan"
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
                      placeholder="e.g. ramesh.k@example.com"
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
                      placeholder="e.g. +91 98450 12345"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Delivery / Shipping Address *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Flat 402, Sai Sannidhi Apartments, T. Nagar, Chennai - 600017"
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-gold">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE & ORDERS MODAL */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Customer: {selectedUser.name}</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Customer #{selectedUser.id} · Registered {selectedUser.memberSince}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Profile Details Header Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Contact Information
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '6px' }}>
                      <strong>Phone:</strong> {selectedUser.phone}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '2px' }}>
                      <strong>Email:</strong> {selectedUser.email}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Account Overview
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '6px' }}>
                      <strong>Member Since:</strong> {selectedUser.memberSince}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0d5438', fontWeight: 600, marginTop: '2px' }}>
                      <strong>Total Orders:</strong> {getUserOrders(selectedUser).length} placed
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><strong>Delivery Shipping Address:</strong> {selectedUser.shippingAddress}</div>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(selectedUser.id, selectedUser.shippingAddress)}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      {copiedId === selectedUser.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* PAST ORDERS */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="#0d5438" />
                  <span>Orders History</span>
                </h3>

                {getUserOrders(selectedUser).length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem' }}>
                    No orders placed yet by this user.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {getUserOrders(selectedUser).map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0d5438', fontFamily: 'monospace' }}>
                            #{ord.id}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                            {ord.items.map((it) => `${it.productName} (×${it.quantity})`).join(', ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {ord.date} · {ord.paymentMethod}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <span
                            className={`admin-status-badge ${
                              ord.status === 'Delivered'
                                ? 'admin-status-green'
                                : ord.status === 'Pending'
                                ? 'admin-status-amber'
                                : 'admin-status-blue'
                            }`}
                            style={{ marginTop: '4px' }}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Devotee Records...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
