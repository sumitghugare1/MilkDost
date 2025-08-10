// Types for the DairyMate application

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  milkQuantity: number; // liters per delivery
  deliveryTime: string; // e.g., "08:00 AM"
  rate: number; // price per liter
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delivery {
  id: string;
  clientId: string;
  date: Date;
  quantity: number;
  isDelivered: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Buffalo {
  id: string;
  name: string;
  age: number;
  breed?: string;
  photo?: string;
  healthStatus: 'healthy' | 'sick' | 'pregnant' | 'dry';
  milkCapacity: number; // Daily milk production capacity in liters
  lastVetVisit?: Date;
  nextVetVisit?: Date;
  feedingSchedule: {
    morning: boolean;
    evening: boolean;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuffaloFeeding {
  id: string;
  buffaloId: string;
  date: Date;
  time: 'morning' | 'evening';
  feedType: string;
  quantity: number;
  isCompleted: boolean;
  notes?: string;
  createdAt: Date;
}

export interface MilkProduction {
  id: string;
  date: Date;
  totalProduced: number;
  totalSold: number;
  totalWasted: number;
  totalHomeCons: number;
  notes?: string;
  createdAt: Date;
}

export interface Bill {
  id: string;
  clientId: string;
  month: number;
  year: number;
  totalQuantity: number;
  totalAmount: number;
  isPaid: boolean;
  paidDate?: Date;
  dueDate: Date;
  deliveries: string[]; // delivery IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  billId: string;
  clientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  transactionId?: string;
  notes?: string;
  createdAt: Date;
}

export interface DashboardStats {
  todayDeliveries: {
    total: number;
    completed: number;
    pending: number;
  };
  monthlyRevenue: number;
  pendingPayments: number;
  totalClients: number;
  activeBuffaloes: number;
  todayMilkProduction: number;
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}
