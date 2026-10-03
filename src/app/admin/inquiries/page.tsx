'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Trash2,
  Filter,
  Sparkles,
  RefreshCw,
  Send,
  UserCheck,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { InquiryItem, InquiryStatus } from '@/types/inquiries';
import { inquiriesService } from '@/services/inquiriesService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

export default function AdminInquiriesPage() {
  const { confirm } = useConfirm();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await inquiriesService.getAll();
      setInquiries(data);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      await inquiriesService.updateStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      toast.success(`Inquiry marked as ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await inquiriesService.updateStatus(
        id,
        inquiries.find((i) => i.id === id)?.status || 'NEW',
        notesInput
      );
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, notes: notesInput } : item))
      );
      setEditingNotesId(null);
      toast.success('Internal notes saved');
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const handleDelete = async (id: string, refId: string) => {
    const ok = await confirm({
      title: 'Delete Inquiry Record',
      message: `Are you sure you want to delete inquiry ${refId}?`,
      description: 'This record will be permanently removed from your consultation log.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    try {
      await inquiriesService.delete(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Deleted inquiry ${refId}`);
    } catch {
      toast.error('Failed to delete inquiry');
    }
  };

  // Helper for WhatsApp link
  const getWhatsAppLink = (inquiry: InquiryItem) => {
    const cleanPhone = inquiry.phone.replace(/[^0-9]/g, '');
    const prefill = encodeURIComponent(
      `Namaste ${inquiry.name}, this is regarding your sacred consultation inquiry ${inquiry.referenceId} for ${inquiry.inquiryType} at Aamadappetti Panchaloham Jewellery. Our temple advisor is here to assist you.`
    );
    return `https://wa.me/${cleanPhone}?text=${prefill}`;
  };

  // Filters
  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter !== 'ALL' && inq.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.referenceId.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.inquiryType.toLowerCase().includes(q) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Consultation Inquiries &amp; Devotee Leads
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Real-time inbox of consultation submissions from the Contact &amp; Inquiry page.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={loadInquiries}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            href="/contact"
            target="_blank"
            className="admin-btn admin-btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <span>View Public Contact Form</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div
          className="admin-stat-card"
          onClick={() => setStatusFilter('ALL')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'ALL' ? '2px solid #0d5438' : '1px solid var(--admin-card-border)',
            boxShadow: statusFilter === 'ALL' ? '0 4px 12px rgba(13,84,56,0.15)' : undefined,
          }}
        >
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#0d5438' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{totalCount}</div>
            <div className="admin-stat-label">Total Inquiries</div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          onClick={() => setStatusFilter('NEW')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'NEW' ? '2px solid #dfba6c' : '1px solid var(--admin-card-border)',
            background: newCount > 0 ? '#fffdf5' : '#ffffff',
            boxShadow: statusFilter === 'NEW' ? '0 4px 12px rgba(223,186,108,0.2)' : undefined,
          }}
        >
          <div className="admin-stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {newCount}
              {newCount > 0 && (
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              )}
            </div>
            <div className="admin-stat-label">New / Unaddressed</div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'IN_PROGRESS' ? '2px solid #3b82f6' : '1px solid var(--admin-card-border)',
            boxShadow: statusFilter === 'IN_PROGRESS' ? '0 4px 12px rgba(59,130,246,0.15)' : undefined,
          }}
        >
          <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#2563eb' }}>{inProgressCount}</div>
            <div className="admin-stat-label">In Progress</div>
          </div>
        </div>

        <div
          className="admin-stat-card"
          onClick={() => setStatusFilter('CONTACTED')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'CONTACTED' ? '2px solid #10b981' : '1px solid var(--admin-card-border)',
            boxShadow: statusFilter === 'CONTACTED' ? '0 4px 12px rgba(16,185,129,0.15)' : undefined,
          }}
        >
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="admin-stat-value" style={{ color: '#059669' }}>{contactedCount + resolvedCount}</div>
            <div className="admin-stat-label">Contacted / Completed</div>
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'ALL', label: `All (${totalCount})` },
                { id: 'NEW', label: `New (${newCount})` },
                { id: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
                { id: 'CONTACTED', label: `Contacted (${contactedCount})` },
                { id: 'RESOLVED', label: `Resolved (${resolvedCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`translation-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="search"
              placeholder="Search by name, ref ID, phone, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="admin-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <MessageSquare size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '8px' }}>
            No Consultation Inquiries Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery
              ? 'No submissions matched your search criteria. Try a different keyword.'
              : 'There are currently no inquiries in this category.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredInquiries.map((inq) => {
            const dateStr = new Date(inq.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={inq.id}
                className="admin-card"
                style={{
                  padding: '24px',
                  borderLeft:
                    inq.status === 'NEW'
                      ? '5px solid #f59e0b'
                      : inq.status === 'IN_PROGRESS'
                      ? '5px solid #3b82f6'
                      : inq.status === 'CONTACTED'
                      ? '5px solid #10b981'
                      : '5px solid #64748b',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        background: '#041d14',
                        color: '#f5d382',
                        padding: '4px 10px',
                        borderRadius: '4px',
                      }}
                    >
                      {inq.referenceId}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 600 }}>
                      {inq.name}
                    </h3>
                    <span
                      className={`admin-status-badge ${
                        inq.status === 'NEW'
                          ? 'admin-status-yellow'
                          : inq.status === 'IN_PROGRESS'
                          ? 'admin-status-blue'
                          : inq.status === 'CONTACTED'
                          ? 'admin-status-green'
                          : 'admin-status-gray'
                      }`}
                    >
                      {inq.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} />
                      {dateStr}
                    </span>

                    {/* Status Changer Select */}
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                      className="admin-select"
                      style={{ padding: '4px 10px', fontSize: '0.82rem', height: '32px' }}
                    >
                      <option value="NEW">Mark as NEW</option>
                      <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                      <option value="CONTACTED">Mark CONTACTED</option>
                      <option value="RESOLVED">Mark RESOLVED</option>
                    </select>

                    <button
                      onClick={() => handleDelete(inq.id, inq.referenceId)}
                      title="Delete Inquiry"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Devotee Info & Communication Preferences */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '0.86rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Phone / WhatsApp
                    </span>
                    <strong style={{ color: '#0f172a' }}>{inq.phone}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Email Address
                    </span>
                    <strong style={{ color: '#0f172a' }}>{inq.email || '—'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Inquiry Category
                    </span>
                    <strong style={{ color: '#0d5438' }}>{inq.inquiryType}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Preferred Response Via
                    </span>
                    <strong style={{ color: inq.preferredContact === 'WhatsApp' ? '#16a34a' : '#2563eb' }}>
                      {inq.preferredContact}
                    </strong>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                    Devotee Request / Custom Requirements:
                  </div>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '14px',
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      color: '#1e293b',
                    }}
                  >
                    {inq.message}
                  </div>
                </div>

                {/* Internal Notes Section */}
                <div style={{ marginBottom: '16px' }}>
                  {editingNotesId === inq.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Add internal notes (e.g. Called devotee, sent ring size guide)..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="admin-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => handleSaveNotes(inq.id)}
                        className="admin-btn admin-btn-gold"
                        style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ color: inq.notes ? '#334155' : '#94a3b8', fontStyle: inq.notes ? 'normal' : 'italic' }}>
                        <strong>Temple Notes:</strong> {inq.notes || 'No internal notes added yet.'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNotesId(inq.id);
                          setNotesInput(inq.notes || '');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0d5438',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                        }}
                      >
                        {inq.notes ? 'Edit Notes' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  {/* One-Click WhatsApp */}
                  <a
                    href={getWhatsAppLink(inq)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (inq.status === 'NEW') handleStatusChange(inq.id, 'CONTACTED');
                    }}
                    className="admin-btn"
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>Reply on WhatsApp</span>
                  </a>

                  {/* Send Email */}
                  {inq.email && (
                    <a
                      href={`mailto:${inq.email}?subject=${encodeURIComponent(
                        `Aamadappetti Consultation: ${inq.inquiryType} (${inq.referenceId})`
                      )}`}
                      onClick={() => {
                        if (inq.status === 'NEW') handleStatusChange(inq.id, 'CONTACTED');
                      }}
                      className="admin-btn admin-btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      <Mail size={15} />
                      <span>Email Devotee</span>
                    </a>
                  )}

                  {/* Call Phone */}
                  <a
                    href={`tel:${inq.phone}`}
                    className="admin-btn admin-btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={15} />
                    <span>Call ({inq.phone})</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
