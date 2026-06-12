export interface InternetPlan {
  id: string;
  name: string;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  monthlyFee: number;
  installationFee: number;
  contractDuration: number; // in months
  activationFee: number;
  dataLimitGb: number | null; // null for unlimited
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  document: string; // CPF or CNPJ
  address: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  contractNumber: string;
  planId: string;
  status: 'active' | 'suspended' | 'pending_installation';
  connectionDetails: {
    protocol: 'PPPoE' | 'Hotspot' | 'IP_Fixed';
    ipAddress: string;
    macAddress: string;
    username?: string;
    secret?: string;
    routerBindingId: string;
  };
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  discount: number;
  penalty: number;
  interest: number;
  status: 'paid' | 'overdue' | 'pending';
  pixCode: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'bank_transfer';
  paymentDate?: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  slaHours: number;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  messages: Array<{
    id: string;
    sender: 'customer' | 'technician' | 'system' | 'ai';
    senderName: string;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface RouterDevice {
  id: string;
  name: string;
  ipAddress: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline';
  uptime: string;
  cpuUsage: number;
  ramUsage: number;
  activeQueues: number;
  activePPPoEConnections: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'converted' | 'lost';
  pipelineValue: number;
  notes: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  type: 'router' | 'onu' | 'fiber_drop' | 'sfp' | 'olt';
  brand: string;
  model: string;
  serialNumber: string;
  status: 'in_stock' | 'deployed' | 'damaged' | 'reserved';
  supplier: string;
  cost: number;
}

export interface SaaSPlan {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise';
  mrrCost: number;
  limits: {
    maxCustomers: number;
    maxRouters: number;
    maxTechnicians: number;
    aiFeaturesIncluded: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}
