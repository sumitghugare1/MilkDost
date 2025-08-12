// Types for the DairyMate application

export interface Client {
  id: string;
  userId: string; // Owner of this client record
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
  userId: string; // Owner of this delivery record
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
  userId: string; // Owner of this buffalo record
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
  userId: string; // Owner of this feeding record
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
  userId: string; // Owner of this production record
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
  userId: string; // Owner of this bill record
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
  userId: string; // Owner of this payment record
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
