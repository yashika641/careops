export interface Lead {
  id: string;
  name: string;
  phone: string;
  serviceType: string;
  message: string;
  preferredDate?: string;
  status: 'new' | 'contacted' | 'qualified' | 'booked';
  timestamp: Date;
  aiSummary?: string;
}

export interface Booking {
  id: string;
  leadId: string;
  leadName: string;
  serviceType: string;
  date: string;
  time: string;
  staff?: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  status: 'good' | 'low' | 'out';
  lastUpdated: Date;
  usageTrend: number[];
}

export interface ActivityEvent {
  id: string;
  type: 'lead' | 'followup' | 'booking' | 'inventory';
  message: string;
  timestamp: Date;
  highlight?: boolean;
}
