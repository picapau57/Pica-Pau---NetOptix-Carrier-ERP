import React, { useState, useEffect } from 'react';
import { Customer, InternetPlan, Invoice, SupportTicket, RouterDevice, Lead, Equipment } from './types';
import { translations, Language } from './lib/translations';

// Component Imports
import AdminDashboard from './components/AdminDashboard';
import CustomerManagement from './components/CustomerManagement';
import PlansManagement from './components/PlansManagement';
import BillingManagement from './components/BillingManagement';
import NetworkManager from './components/NetworkManager';
import SupportSystem from './components/SupportSystem';
import CRMAndFunnel from './components/CRMAndFunnel';
import InventoryManager from './components/InventoryManager';
import PortalCustomer from './components/PortalCustomer';
import PortalTechnician from './components/PortalTechnician';
import AIConsultantPanel from './components/AIConsultantPanel';

// Icons Import
import {
  Shield,
  Users,
  Grid,
  Wifi,
  DollarSign,
  Tv,
  HelpCircle,
  TrendingUp,
  Inbox,
  Sparkles,
  RefreshCw,
  LogOut,
  Sliders,
  Settings,
  ChevronDown,
  Globe
} from 'lucide-react';

export default function App() {
  // Active Language selection: 'pt' | 'en' | 'es'
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('isp_language') as Language) || 'pt';
  });

  // Top-Level Role selection: 'admin' | 'customer' | 'technician'
  const [roleMode, setRoleMode] = useState<'admin' | 'customer' | 'technician'>('admin');
  
  // Admin selected view switcher
  const [adminView, setAdminView] = useState<'dashboard' | 'subscribers' | 'plans' | 'billing' | 'traffic' | 'helpdesk' | 'crm' | 'inventory' | 'ai_advisor'>('dashboard');

  useEffect(() => {
    localStorage.setItem('isp_language', language);
  }, [language]);

  const t = translations[language];

  // Unified State from server
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [routers, setRouters] = useState<RouterDevice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state from server on mount
  const syncState = async () => {
    try {
      setLoading(true);
      const [resC, resP, resI, resT, resR, resL, resInv] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/plans').then(r => r.json()),
        fetch('/api/invoices').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/routers').then(r => r.json()),
        fetch('/api/leads').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
      ]);

      setCustomers(resC);
      setPlans(resP);
      setInvoices(resI);
      setTickets(resT);
      setRouters(resR);
      setLeads(resL);
      setInventory(resInv);
    } catch (err) {
      console.error("State loading error: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  // Shared server integration calls
  const handleAddCustomer = async (newCustomerFields: Partial<Customer>) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerFields),
      });
      if (res.ok) {
        const result = await res.json();
        setCustomers(prev => [result, ...prev]);
        syncState(); // reload related invoices/configs
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCustomerStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}/toggle`, { method: 'PUT' });
      if (res.ok) {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c));
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPlan = async (newPlanFields: Partial<InternetPlan>) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanFields),
      });
      if (res.ok) {
        const result = await res.json();
        setPlans(prev => [...prev, result]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayInvoice = async (invoiceId: string, paymentMethod: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: paymentMethod }),
      });
      if (res.ok) {
        setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid', paymentMethod, paymentDate: new Date().toISOString().split('T')[0] } : i));
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRecurringInvoices = async () => {
    try {
      const res = await fetch('/api/invoices/generate-billing-batch', { method: 'POST' });
      if (res.ok) {
        alert('Billing cron executed! Checked active subscriptions and populated monthly invoices.');
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyTicket = async (ticketId: string, text: string, sender: any, senderName: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender, senderName }),
      });
      if (res.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTicket = async (ticketId: string, updatedFields: Partial<SupportTicket>) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLead = async (newLeadFields: Partial<Lead>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadFields),
      });
      if (res.ok) {
        const result = await res.json();
        setLeads(prev => [...prev, result]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: any) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLeadToClient = async (leadObject: Lead) => {
    try {
      const res = await fetch(`/api/leads/${leadObject.id}/convert`, { method: 'POST' });
      if (res.ok) {
        alert(`Successfully converted Lead: "${leadObject.name}" to Active Subscriber! Created service order ticket.`);
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEquipment = async (newEqFields: Partial<Equipment>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEqFields),
      });
      if (res.ok) {
        const result = await res.json();
        setInventory(prev => [...prev, result]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRouterCommand = async (id: string, action: 'reboot' | 'optimize') => {
    try {
      const res = await fetch(`/api/routers/${id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dedicated AI request handler
  const handleCallAI = async (promptMsg: string, type: string) => {
    const response = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptMsg, type }),
    });
    if (!response.ok) {
      throw new Error('AI analysis offline');
    }
    return response.json();
  };

  // Simulator customer ticket opening channel
  const handleCustomerPortalOpenTicket = async (subject: string, description: string, priority: any) => {
    const cust = customers[0]; // mock as Santana
    if (!cust) return;
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust.id,
          customerName: cust.name,
          subject,
          description,
          priority,
        }),
      });
      syncState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 antialiased">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-16 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            Ω
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 tracking-tight text-sm leading-none flex items-center gap-1.5 matches-clean-minimalism">
              NetOptix Carrier ERP <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full uppercase border border-slate-205">Enterprise</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Multi-Tenant NOC Orchestration Suite</p>
          </div>
        </div>

        {/* Dynamic Portal Role switcher & Language Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 hidden sm:flex items-center">
            <button
              onClick={() => { setRoleMode('admin'); setAdminView('dashboard'); }}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                roleMode === 'admin'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.systemAdmin}
            </button>
            <button
              onClick={() => setRoleMode('customer')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                roleMode === 'customer'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.subscriberPortal}
            </button>
            <button
              onClick={() => setRoleMode('technician')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                roleMode === 'technician'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.technicianDispatch}
            </button>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-550 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-[11px] font-bold text-slate-705 focus:outline-none border-none cursor-pointer pr-1"
            >
              <option value="pt">Português (PT)</option>
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
            </select>
          </div>

          {/* Quick status indicator or refresh bar */}
          <button
            onClick={syncState}
            title={t.refreshState}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Core Container */}
      {roleMode === 'admin' ? (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Admin Sidebar */}
          <aside className="w-full md:w-64 bg-slate-900 flex flex-col p-5 shrink-0 text-left border-r border-slate-950">
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block pl-3">{t.orchestration}</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => setAdminView('dashboard')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'dashboard'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Grid className="w-4 h-4 opacity-75" /> {t.nocKpiDashboard}
                  </button>

                  <button
                    onClick={() => setAdminView('subscribers')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'subscribers'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Users className="w-4 h-4 opacity-75" /> {t.subscribersContract}
                  </button>

                  <button
                    onClick={() => setAdminView('plans')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'plans'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Wifi className="w-4 h-4 opacity-75" /> {t.fiberSpeedProfiles}
                  </button>

                  <button
                    onClick={() => setAdminView('billing')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'billing'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 opacity-75" /> {t.billingInvoices}
                  </button>
                </nav>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block pl-3">{t.nocOperations}</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => setAdminView('traffic')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'traffic'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Settings className="w-4 h-4 opacity-75" /> {t.mikrotikRouterOS}
                  </button>

                  <button
                    onClick={() => setAdminView('helpdesk')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'helpdesk'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 opacity-75" /> {t.ticketsSlaQueue}
                  </button>

                  <button
                    onClick={() => setAdminView('crm')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'crm'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 opacity-75" /> {t.crmLeadFunnel}
                  </button>

                  <button
                    onClick={() => setAdminView('inventory')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'inventory'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Inbox className="w-4 h-4 opacity-75" /> {t.hardwareInventory}
                  </button>
                </nav>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block pl-3">{t.executiveAi}</span>
                <nav className="space-y-1">
                  <button
                    onClick={() => setAdminView('ai_advisor')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                      adminView === 'ai_advisor'
                        ? 'bg-slate-800 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-blue-400 opacity-90" /> {t.aiBusinessAdvisor}
                  </button>
                </nav>
              </div>
            </div>

            {/* Quick switcher list info */}
            <div className="pt-6 border-t border-slate-800 mt-auto">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase pl-1">Paulista Tenant Node</span>
                <span className="text-[9px] font-semibold text-emerald-500 block flex items-center gap-1.5 pl-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                  {t.gatewayConnected}
                </span>
              </div>
            </div>
          </aside>

          {/* Admin Content Container */}
          <main className="flex-1 p-6 overflow-y-auto">
            {loading && customers.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                <span className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
                <p className="text-xs text-blue-600 font-semibold font-mono">{t.loadingState}</p>
              </div>
            ) : (
              <div>
                {adminView === 'dashboard' && (
                  <AdminDashboard
                    customers={customers}
                    routers={routers}
                    invoices={invoices}
                    tickets={tickets}
                    leads={leads}
                    lang={language}
                    onNavigate={(target) => setAdminView(target as any)}
                  />
                )}

                {adminView === 'subscribers' && (
                  <CustomerManagement
                    customers={customers}
                    plans={plans}
                    lang={language}
                    onAddCustomer={handleAddCustomer}
                    onToggleStatus={handleToggleCustomerStatus}
                  />
                )}

                {adminView === 'plans' && (
                  <PlansManagement
                    plans={plans}
                    lang={language}
                    onAddPlan={handleAddPlan}
                  />
                )}

                {adminView === 'billing' && (
                  <BillingManagement
                    invoices={invoices}
                    customers={customers}
                    lang={language}
                    onPayInvoice={handlePayInvoice}
                    onGenerateRecurringInvoices={handleGenerateRecurringInvoices}
                  />
                )}

                {adminView === 'traffic' && (
                  <NetworkManager
                    routers={routers}
                    lang={language}
                    onTriggerCommand={handleRouterCommand}
                    onCallAI={handleCallAI}
                  />
                )}

                {adminView === 'helpdesk' && (
                  <SupportSystem
                    tickets={tickets}
                    lang={language}
                    onReplyTicket={handleReplyTicket}
                    onUpdateTicket={handleUpdateTicket}
                    onCallAI={handleCallAI}
                  />
                )}

                {adminView === 'crm' && (
                  <CRMAndFunnel
                    leads={leads}
                    lang={language}
                    onAddLead={handleAddLead}
                    onUpdateLeadStatus={handleUpdateLeadStatus}
                    onConvertLeadToClient={handleConvertLeadToClient}
                  />
                )}

                {adminView === 'inventory' && (
                  <InventoryManager
                    inventory={inventory}
                    lang={language}
                    onAddEquipment={handleAddEquipment}
                  />
                )}

                {adminView === 'ai_advisor' && (
                  <AIConsultantPanel
                    customers={customers}
                    invoices={invoices}
                    leads={leads}
                    lang={language}
                    onCallAI={handleCallAI}
                  />
                )}
              </div>
            )}
          </main>
        </div>
      ) : roleMode === 'customer' ? (
        // Client portal ( Carlos Santana mode)
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {customers.length > 0 ? (
            <PortalCustomer
              myCustomerObject={customers[0]} // simulate first client
              plans={plans}
              invoices={invoices}
              tickets={tickets}
              lang={language}
              onOpenTicket={handleCustomerPortalOpenTicket}
              onPayInvoice={handlePayInvoice}
              onCallAI={handleCallAI}
            />
          ) : (
            <div className="py-24 text-center text-slate-400">Loading active database...</div>
          )}
        </main>
      ) : (
        // Technician Portal
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <PortalTechnician
            tickets={tickets}
            lang={language}
          />
        </main>
      )}

      {/* Clean Global footer */}
      <footer className="bg-slate-900 border-t border-slate-950 px-6 py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-slate-400">© 2026 RouterOS SaaS Integration Suite INC. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Carrier: IPv4/IPv6 Dual Block</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-mono">BGP Node active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
