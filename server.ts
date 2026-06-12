import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { Customer, InternetPlan, Invoice, SupportTicket, RouterDevice, Lead, Equipment, AuditLog, SaaSPlan } from './src/types';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client lazily or directly check
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.log('Skipping Gemini API client initialization: GEMINI_API_KEY is not configured.');
}

// IN-MEMORY DATABASE (Server-Side State)
let internetPlans: InternetPlan[] = [
  { id: 'p1', name: 'Standard Fiber 100M', downloadSpeed: 100, uploadSpeed: 50, monthlyFee: 29.9, installationFee: 49.9, contractDuration: 12, activationFee: 0, dataLimitGb: null, status: 'active' },
  { id: 'p2', name: 'Premium Fiber 300M', downloadSpeed: 300, uploadSpeed: 150, monthlyFee: 49.9, installationFee: 29.9, contractDuration: 12, activationFee: 0, dataLimitGb: null, status: 'active' },
  { id: 'p3', name: 'Giga Enterprise 1G', downloadSpeed: 1000, uploadSpeed: 1000, monthlyFee: 129.9, installationFee: 0, contractDuration: 24, activationFee: 99.9, dataLimitGb: null, status: 'active' },
  { id: 'p4', name: 'Lite Rural Wireless 20M', downloadSpeed: 20, uploadSpeed: 10, monthlyFee: 19.9, installationFee: 99.9, contractDuration: 6, activationFee: 0, dataLimitGb: 500, status: 'active' },
];

let customers: Customer[] = [
  {
    id: 'c1',
    name: 'Robert Silva',
    companyName: 'Silva Tech Ltda',
    document: '123.456.789-00',
    address: 'Av. Paulista, 1000, São Paulo, Brazil',
    gpsCoordinates: { lat: -23.5615, lng: -46.656 },
    phone: '+55 11 98765-4321',
    email: 'picapauinformatica@gmail.com', // user email for convenience
    contractNumber: 'CNT-2026-001',
    planId: 'p2',
    status: 'active',
    connectionDetails: { protocol: 'PPPoE', ipAddress: '192.168.88.50', macAddress: '00:1B:44:11:3A:B7', username: 'robert_silva', secret: 'fiber123', routerBindingId: 'r1' },
    notes: 'Primary business connection. Needs high priority response.',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Ana Oliveira',
    document: '321.654.987-11',
    address: 'Rua das Flores, 45, Campinas, Brazil',
    gpsCoordinates: { lat: -22.9064, lng: -47.0616 },
    phone: '+55 19 97654-3210',
    email: 'ana.oliveira@outlook.com',
    contractNumber: 'CNT-2026-002',
    planId: 'p1',
    status: 'active',
    connectionDetails: { protocol: 'PPPoE', ipAddress: '192.168.88.51', macAddress: '00:1B:44:11:9C:0F', username: 'ana_flowers', secret: 'pass889', routerBindingId: 'r1' },
    notes: 'Residential client. Installed ONU on living room.',
    createdAt: '2026-02-15T14:30:00Z',
  },
  {
    id: 'c3',
    name: 'Carlos Santos',
    document: '456.789.012-34',
    address: 'Av. Brasil, 2345, Rio de Janeiro, Brazil',
    gpsCoordinates: { lat: -22.9068, lng: -43.1729 },
    phone: '+55 21 99999-8888',
    email: 'carlos.santos@gmail.com',
    contractNumber: 'CNT-2026-003',
    planId: 'p3',
    status: 'suspended',
    connectionDetails: { protocol: 'IP_Fixed', ipAddress: '200.150.12.3', macAddress: 'A4:12:35:88:FF:99', username: 'carlos_enterprise', secret: 'secure998', routerBindingId: 'r2' },
    notes: 'Temporarily suspended due to non-payment of invoice #INV-103.',
    createdAt: '2025-11-20T09:00:00Z',
  },
  {
    id: 'c4',
    name: 'Mariana Costa',
    document: '789.012.345-67',
    address: 'Alameda Santos, 1122, São Paulo, Brazil',
    gpsCoordinates: { lat: -23.564, lng: -46.652 },
    phone: '+55 11 91111-2222',
    email: 'mariana.costa@tech.com',
    contractNumber: 'CNT-2026-004',
    planId: 'p2',
    status: 'pending_installation',
    connectionDetails: { protocol: 'PPPoE', ipAddress: '192.168.88.52', macAddress: '11:22:33:44:55:66', username: 'mariana_co', secret: 'costa911', routerBindingId: 'r1' },
    notes: 'Installation scheduled for next Monday.',
    createdAt: '2026-06-10T11:00:00Z',
  },
];

let invoices: Invoice[] = [
  { id: 'INV-101', customerId: 'c1', customerName: 'Robert Silva', issueDate: '2026-05-01', dueDate: '2026-05-10', amount: 49.9, discount: 0, penalty: 0, interest: 0, status: 'paid', pixCode: '00020101021226850014br.gov.pix0114picapauisp101', paymentMethod: 'pix', paymentDate: '2026-05-09' },
  { id: 'INV-102', customerId: 'c1', customerName: 'Robert Silva', issueDate: '2026-06-01', dueDate: '2026-06-10', amount: 49.9, discount: 0, penalty: 0, interest: 0, status: 'pending', pixCode: '00020101021226850014br.gov.pix0114picapauisp102' },
  { id: 'INV-103', customerId: 'c3', customerName: 'Carlos Santos', issueDate: '2026-05-10', dueDate: '2026-05-20', amount: 129.9, discount: 0, penalty: 2.6, interest: 1.3, status: 'overdue', pixCode: '00020101021226850014br.gov.pix0114picapauisp103' },
  { id: 'INV-104', customerId: 'c2', customerName: 'Ana Oliveira', issueDate: '2026-06-01', dueDate: '2026-06-10', amount: 29.9, discount: 2.0, penalty: 0, interest: 0, status: 'paid', pixCode: '00020101021226850014br.gov.pix0114picapauisp104', paymentMethod: 'credit_card', paymentDate: '2026-06-08' },
];

let supportTickets: SupportTicket[] = [
  {
    id: 't1',
    customerId: 'c1',
    customerName: 'Robert Silva',
    subject: 'Slow internet speed during peak hours',
    description: 'Since last Monday, my network download drops from 300 Mbps to around 15 Mbps in the evening (8 PM to 10 PM). Please check router health.',
    status: 'in_progress',
    priority: 'high',
    slaHours: 24,
    assignedTechnicianId: 'tech-01',
    assignedTechnicianName: 'Lucas Rocha',
    messages: [
      { id: 'm1', sender: 'customer', senderName: 'Robert Silva', text: 'Slow internet speed during peak hours. Drops to 15 Mbps.', timestamp: '2026-06-11T12:00:00Z' },
      { id: 'm2', sender: 'system', senderName: 'AI Dispatcher', text: 'Ticket automatically assigned to Lucas Rocha. Priority determined: High. Triggering auto-analysis...', timestamp: '2026-06-11T12:01:00Z' },
      { id: 'm3', sender: 'technician', senderName: 'Lucas Rocha', text: 'Hello Robert, I am monitoring client queue r1. Realtime traffic reports check out, we might be experiencing an external carrier link congestion. Getting back soon.', timestamp: '2026-06-11T14:30:00Z' },
    ],
    createdAt: '2026-06-11T12:00:00Z',
    updatedAt: '2026-06-11T14:30:00Z',
  },
  {
    id: 't2',
    customerId: 'c2',
    customerName: 'Ana Oliveira',
    subject: 'ONU LOS Red Light Flashing',
    description: 'My optical light modem is shows a flashing red light on LOS indicator. Totally disconnected.',
    status: 'open',
    priority: 'critical',
    slaHours: 4,
    messages: [
      { id: 'm4', sender: 'customer', senderName: 'Ana Oliveira', text: 'LOS LED is blinking red! I have no internet access and need it for home work.', timestamp: '2026-06-11T16:20:00Z' },
    ],
    createdAt: '2026-06-11T16:20:00Z',
    updatedAt: '2026-06-11T16:20:00Z',
  },
];

let routers: RouterDevice[] = [
  { id: 'r1', name: 'Core_CCR2004_Central', ipAddress: '10.0.0.1', model: 'MikroTik CCR2004-16G-2S+', firmware: 'RouterOS v7.14', status: 'online', uptime: '14 days 3 hours', cpuUsage: 14, ramUsage: 35, activeQueues: 84, activePPPoEConnections: 72 },
  { id: 'r2', name: 'Edge_CHR_NOC_Rio', ipAddress: '200.150.12.1', model: 'MikroTik CHR (VM)', firmware: 'RouterOS v7.12', status: 'online', uptime: '120 days 6 hours', cpuUsage: 8, ramUsage: 18, activeQueues: 12, activePPPoEConnections: 8 },
  { id: 'r3', name: 'NOC_Wireless_TowerB', ipAddress: '10.50.0.5', model: 'MikroTik NetMetal 5', firmware: 'RouterOS v6.49', status: 'offline', uptime: '0s', cpuUsage: 0, ramUsage: 0, activeQueues: 0, activePPPoEConnections: 0 },
];

let leads: Lead[] = [
  { id: 'l1', name: 'John Peterson', email: 'john.peterson@yahoo.com', phone: '+55 11 96543-9999', source: 'Google Ads', status: 'proposal_sent', pipelineValue: 80, notes: 'Interested in Premium 300M. Sent custom contract proposal.', createdAt: '2026-06-08T09:00:00Z' },
  { id: 'l2', name: 'Amanda Brown', email: 'amanda.brown@gmail.com', phone: '+55 11 98888-7777', source: 'Instagram Ad', status: 'new', pipelineValue: 30, notes: 'Residential customer looking for fast internet with TV options.', createdAt: '2026-06-11T15:20:00Z' },
  { id: 'l3', name: 'Tech Solutions Corp', email: 'bids@techsolutions.com', phone: '+55 11 3333-0000', source: 'Direct Referral', status: 'negotiation', pipelineValue: 350, notes: 'Requires symmetrical 1Gbps IP transit link. Price and SLA negotiations ongoing.', createdAt: '2026-05-25T11:45:00Z' },
];

let inventoryList: Equipment[] = [
  { id: 'eq1', type: 'router', brand: 'MikroTik', model: 'hAP ax2', serialNumber: 'MT7110AAB998', status: 'in_stock', supplier: 'MKT Distribuidora SA', cost: 75.0 },
  { id: 'eq2', type: 'onu', brand: 'FiberHome', model: 'HG6145F GPON', serialNumber: 'FH1A8823BC88', status: 'deployed', supplier: 'ZTE/FH Imports', cost: 35.0 },
  { id: 'eq3', type: 'onu', brand: 'Huawei', model: 'HG8546M', serialNumber: 'HW892211CFAF', status: 'in_stock', supplier: 'ZTE/FH Imports', cost: 42.0 },
  { id: 'eq4', type: 'olt', brand: 'ZTE', model: 'C320 Modular', serialNumber: 'ZTE9022AA11C', status: 'deployed', supplier: 'ZTE/FH Imports', cost: 1200.0 },
];

let auditLogs: AuditLog[] = [
  { id: 'log1', timestamp: '2026-06-11T15:00:00Z', user: 'admin', role: 'admin', action: 'PPPoE Client Active status changed', details: 'User Robert Silva PPPoE profile reactivated on Core_CCR2004', ipAddress: '192.168.1.100' },
  { id: 'log2', timestamp: '2026-06-11T16:22:00Z', user: 'system', role: 'system', action: 'Invoice status check', details: 'Automated invoice cron identified Carlos Santos INV-103 overdue', ipAddress: '127.0.0.1' },
];

// Active SaaS Information for the hosting ISP ERP
let saasPlan: SaaSPlan = {
  id: 'saas-p2',
  name: 'Professional',
  mrrCost: 149.0,
  limits: {
    maxCustomers: 500,
    maxRouters: 10,
    maxTechnicians: 5,
    aiFeaturesIncluded: true,
  },
};

// HELPER FOR AUDIT LOGGING
const createAuditLog = (user: string, role: string, action: string, details: string) => {
  const newLog: AuditLog = {
    id: 'log' + (auditLogs.length + 1),
    timestamp: new Date().toISOString(),
    user,
    role,
    action,
    details,
    ipAddress: '192.168.1.42',
  };
  auditLogs.unshift(newLog);
};

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Active SaaS detail
app.get('/api/saas/subscription', (req, res) => {
  res.json({ saasPlan });
});

app.post('/api/saas/subscription/upgrade', (req, res) => {
  const { newPlanName } = req.body;
  if (newPlanName === 'Starter') {
    saasPlan = { id: 'saas-p1', name: 'Starter', mrrCost: 49.0, limits: { maxCustomers: 100, maxRouters: 3, maxTechnicians: 2, aiFeaturesIncluded: false } };
  } else if (newPlanName === 'Professional') {
    saasPlan = { id: 'saas-p2', name: 'Professional', mrrCost: 149.0, limits: { maxCustomers: 500, maxRouters: 10, maxTechnicians: 5, aiFeaturesIncluded: true } };
  } else if (newPlanName === 'Enterprise') {
    saasPlan = { id: 'saas-p3', name: 'Enterprise', mrrCost: 299.0, limits: { maxCustomers: 10000, maxRouters: 100, maxTechnicians: 30, aiFeaturesIncluded: true } };
  }
  createAuditLog('admin', 'admin', 'SaaS Plan Upgrade', `SaaS subscription upgraded to ${newPlanName}`);
  res.json({ success: true, saasPlan });
});

// Customers
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomerObj: Customer = {
    id: 'c' + (customers.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomerObj);
  createAuditLog('admin', 'admin', 'Register Customer', `Added customer ${newCustomerObj.name}`);
  res.json(newCustomerObj);
});

app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...req.body };
    createAuditLog('admin', 'admin', 'Update Customer', `Updated profile of ${customers[index].name}`);
    res.json(customers[index]);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Suspend / Reactivate PPPoE
app.post('/api/customers/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    const cust = customers[index];
    const newStatus = cust.status === 'active' ? 'suspended' : 'active';
    cust.status = newStatus;
    createAuditLog('admin', 'admin', 'Toggle Customer Status', `Customer ${cust.name} connection status set to ${newStatus}`);
    res.json({ success: true, customer: cust });
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Internet plans
app.get('/api/plans', (req, res) => {
  res.json(internetPlans);
});

app.post('/api/plans', (req, res) => {
  const plan: InternetPlan = {
    id: 'p' + (internetPlans.length + 1),
    ...req.body,
  };
  internetPlans.push(plan);
  createAuditLog('admin', 'admin', 'Create Plan', `Created connection plan ${plan.name}`);
  res.json(plan);
});

// Invoices
app.get('/api/invoices', (req, res) => {
  res.json(invoices);
});

app.post('/api/invoices/:id/pay', (req, res) => {
  const { id } = req.params;
  const { method } = req.body;
  const index = invoices.findIndex(inv => inv.id === id);
  if (index !== -1) {
    invoices[index].status = 'paid';
    invoices[index].paymentMethod = method || 'pix';
    invoices[index].paymentDate = new Date().toISOString().split('T')[0];
    
    // Auto reactivate customer connection if it was suspended
    const custId = invoices[index].customerId;
    const custIdx = customers.findIndex(c => c.id === custId);
    if (custIdx !== -1 && customers[custIdx].status === 'suspended') {
      customers[custIdx].status = 'active';
      createAuditLog('system', 'system', 'Auto Reactivation', `Customer ${customers[custIdx].name} automatically reactivated on billing resolver`);
    }

    createAuditLog('customer', 'visitor', 'Invoice Payment', `Paid invoice ${id} via ${method}`);
    res.json({ success: true, invoice: invoices[index] });
  } else {
    res.status(404).json({ error: 'Invoice not found' });
  }
});

// CRM Leads
app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.post('/api/leads', (req, res) => {
  const lead: Lead = {
    id: 'l' + (leads.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  res.json(lead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const index = leads.findIndex(l => l.id === id);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...req.body };
    res.json(leads[index]);
  } else {
    res.status(404).json({ error: 'Lead not found' });
  }
});

// Support tickets
app.get('/api/tickets', (req, res) => {
  res.json(supportTickets);
});

app.post('/api/tickets', (req, res) => {
  const newTicket: SupportTicket = {
    id: 't' + (supportTickets.length + 1),
    customerId: req.body.customerId,
    customerName: req.body.customerName || 'Anonymous Client',
    subject: req.body.subject,
    description: req.body.description,
    status: 'open',
    priority: req.body.priority || 'medium',
    slaHours: req.body.priority === 'critical' ? 4 : (req.body.priority === 'high' ? 12 : 24),
    messages: [
      { id: 'm-init', sender: 'customer', senderName: req.body.customerName || 'Client', text: req.body.description, timestamp: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  supportTickets.push(newTicket);
  createAuditLog('customer', 'visitor', 'Opened support ticket', `Ticket ${newTicket.id} created: ${newTicket.subject}`);
  res.json(newTicket);
});

app.post('/api/tickets/:id/message', (req, res) => {
  const { id } = req.params;
  const { text, sender, senderName } = req.body;
  const index = supportTickets.findIndex(t => t.id === id);
  if (index !== -1) {
    const newMessage = {
      id: 'm-' + (supportTickets[index].messages.length + 1),
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    supportTickets[index].messages.push(newMessage);
    supportTickets[index].updatedAt = new Date().toISOString();
    res.json(supportTickets[index]);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const index = supportTickets.findIndex(t => t.id === id);
  if (index !== -1) {
    supportTickets[index] = { ...supportTickets[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(supportTickets[index]);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Network Routers
app.get('/api/routers', (req, res) => {
  res.json(routers);
});

app.post('/api/routers/:id/action', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'reboot', 'optimize', 'flush_queues'
  const index = routers.findIndex(r => r.id === id);
  if (index !== -1) {
    const rt = routers[index];
    if (action === 'reboot') {
      rt.status = 'offline';
      setTimeout(() => {
        rt.status = 'online';
        rt.cpuUsage = 10;
        rt.uptime = '0 min';
      }, 5000);
      createAuditLog('admin', 'admin', 'Router Command', `Triggered Router Reboot command for ${rt.name}`);
    } else if (action === 'optimize') {
      rt.cpuUsage = Math.max(2, rt.cpuUsage - 5);
      rt.ramUsage = Math.max(10, rt.ramUsage - 10);
      createAuditLog('admin', 'admin', 'Router Command', `Triggered Router queue optimization command for ${rt.name}`);
    }
    res.json({ success: true, router: rt });
  } else {
    res.status(404).json({ error: 'Router not found' });
  }
});

// Equipment / Inventory
app.get('/api/inventory', (req, res) => {
  res.json(inventoryList);
});

app.post('/api/inventory', (req, res) => {
  const eq: Equipment = {
    id: 'eq' + (inventoryList.length + 1),
    ...req.body,
  };
  inventoryList.push(eq);
  res.json(eq);
});

// Audit Logs
app.get('/api/logs', (req, res) => {
  res.json(auditLogs);
});


// -------------------------------------------------------------
// AI ADVANCED CHATBOT & SERVER-SIDE COGNITIVE CAPABILITIES
// -------------------------------------------------------------

// Comprehensive prompt endpoint for ISP Smart Dashboard + Chatbot
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt, type, context } = req.body; // Context can carry CRM data, invoice counts, ticket desc etc.

  if (!ai) {
    // If API key is missing or not configured, return smart mock insights
    return res.json({
      text: `[DEBUG MOCK MODE - GEMINI KEY CONFIGURED IN SECRETS WILL OVERWRITE THIS MOCK]
      
Welcome to the ISP ERP AI Assistant!
I have analyzed the current network state, client metrics, and CRM queues:

💡 Quick Diagnostic Summary:
• Active Customers: ${customers.filter(c => c.status === 'active').length}
• Pending Installs: ${customers.filter(c => c.status === 'pending_installation').length}
• Network Status: Stable health score at 92%. Core router r1 CPU is normal at 14%.
• Churn Risk Forecast: Standard prediction indicates a low 2.4% churn risk this weekend. Carlos Santos (suspended status) should be targeted with automated SMS promotion.

How can I help you configure custom billing parameters, MikroTik rate bounds, or analyze technical Support SLAs today?`,
    });
  }

  try {
    let systemInstruction = 'You are an advanced neural ISP consultant ERP engine, helping tech operators manage fiber connections, billing disputes, ticket categories, and MikroTik RouterOS controls. Keep answers highly professional, technical, clear, and focused on telecom diagnostics.';

    if (type === 'classify_ticket') {
      systemInstruction = `You are an automated support ticket router for an ISP ERP.
Based on the client's description, classify the technical failure.
Return a structured JSON output with fields:
- category (e.g., "Physical line fiber cut", "Modem/ONU hardware issue", "Billing suspension", "WiFi Configuration mismatch")
- suggestedPriority ("low", "medium", "high", "critical")
- recommendedSlaHours (number, e.g., 4, 12, 24)
- troubleshootingSteps (array of strings)
- automatedReply (friendly notification template for the customer)`;
    } else if (type === 'predictive_analytics') {
      systemInstruction = `You are a regional telecom strategist and data forecaster.
Analyze the provided customer connection records, suspended billing IDs, CRM leads pipeline, and subscription plan fees.
Formulate a predictive report outlining:
1. Churn Analytics: Predict which clients are at high risk of cancelation.
2. Financial Projections: Calculate current MRR, potential ARR with conversion rates on active Leads, and revenue losses from suspended clients.
3. Network Traffic Diagnostics: Forecast peak capacity demand based on subscriber velocity.
Answer in clear Markdown segments containing professional telecom terminology.`;
    } else if (type === 'network_diagnostics') {
      systemInstruction = `You are a Senior MikroTik Certified Network Engineer (MTCINE).
Analyze the router telemetry (CPU usage, RAM allocation, active queues, PPPoE pools).
Flag any anomalies (congested buffers, queue drops, high CHR VM RAM thresholds).
Provide terminal console / Command snippets if appropriate (e.g., bandwidth test or queue tweaks).`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || 'Cognitive task invocation failed.' });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC BUILD MIDDLEWARE
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ISP ERP Server listening on port ${PORT}`);
  });
}

startServer();
