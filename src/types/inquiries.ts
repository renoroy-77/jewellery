export type InquiryStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'RESOLVED';

export interface InquiryItem {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  preferredContact: 'WhatsApp' | 'Phone Call' | 'Email';
  message: string;
  status: InquiryStatus;
  createdAt: string;
  notes?: string;
}
