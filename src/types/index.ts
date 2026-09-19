export interface Product {
  id: string;
  slug: string;
  name: string;
  deity: string;
  category: 'pendants' | 'chains' | 'rings' | 'bracelets' | 'pooja-items';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  featured?: boolean;
  description: string;
  metalComposition: {
    gold: string;
    silver: string;
    copper: string;
    zinc: string;
    iron: string;
    purityCertificate: string;
  };
  dimensions?: string;
  weight?: string;
  consecrationDetails?: string;
  images: string[];
  benefits: string[];
  tags: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tamilName?: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ConsultationService {
  id: string;
  title: string;
  tamilTitle?: string;
  subtitle: string;
  duration: string;
  mode: 'video' | 'in-person' | 'phone';
  specialist: string;
  icon: string;
  description: string;
  badge?: string;
}

export interface BookingItem {
  id: string;
  referenceCode: string; // e.g. BK-78912
  serviceId: string;
  serviceName: string;
  devoteeName: string;
  email: string;
  phone: string;
  deity: string;
  nakshatra?: string;
  mode: 'video' | 'in-person' | 'phone';
  date: string;
  timeSlot: string;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  meetingLink?: string;
  assignedConsultant?: string;
  createdAt: string;
}
