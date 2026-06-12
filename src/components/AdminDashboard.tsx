import React from 'react';
import { Customer, Invoice, RouterDevice, SupportTicket, SaaSPlan, Lead } from '../types';
import { translations, Language, formatCurrency } from '../lib/translations';
import { TrendingUp, Users, Wifi, AlertCircle, DollarSign, ArrowUpRight, Activity, Percent } from 'lucide-react';

interface AdminDashboardProps {
  customers: Customer[];
  invoices: Invoice[];
  routers: RouterDevice[];
  tickets: SupportTicket[];
  saasPlan?: SaaSPlan;
  leads: Lead[];
  lang?: Language;
  onNavigate: (section: string) => void;
}

export default function AdminDashboard({ customers, invoices, routers, tickets, saasPlan, leads, lang, onNavigate }: AdminDashboardProps) {
  const language = lang || 'pt';
  const t = translations[language];

  // Fallback SaaS plan if none supplied
  const resolvedSaasPlan = saasPlan || {
    id: 'saas-p2',
    name: 'Professional' as 'Professional' | 'Starter' | 'Enterprise',
    mrrCost: 149,
    limits: { maxCustomers: 500, maxRouters: 10, maxTechnicians: 5, aiFeaturesIncluded: true }
  };
  
  // Stats calculations
  const activeCount = customers.filter(c => c.status === 'active').length;
  const suspendedCount = customers.filter(c => c.status === 'suspended').length;
  const pendingCount = customers.filter(c => c.status === 'pending_installation').length;

  // Revenue (MRR based on active customers' plans)
  const paidInvoicesThisMonth = invoices.filter(inv => inv.status === 'paid');
  const mrr = paidInvoicesThisMonth.reduce((acc, inv) => acc + inv.amount, 0);
  const arr = mrr * 12;

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.amount + inv.penalty + inv.interest, 0);

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const networkUptime = '99.85%';
  const healthScore = 92;

  // Active routers
  const activeRouters = routers.filter(r => r.status === 'online').length;

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* SaaS Status Banner */}
      <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-500/25 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
              SaaS SaaS-ERP Active
            </span>
            <span className="text-xs text-slate-400">v1.2.0</span>
          </div>
          <h2 className="text-lg font-bold">Your Tenant: ISP Connect ERP</h2>
          <p className="text-xs text-slate-400">
            {t.runningOn} <strong className="text-blue-400">{resolvedSaasPlan.name} Plan</strong> ({resolvedSaasPlan.limits.maxCustomers} {t.subscribersCap})
          </p>
        </div>
        <button
          onClick={() => onNavigate('plans')}
          className="text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg px-4.5 py-2 transition-all cursor-pointer shadow-sm border border-slate-200"
        >
          {t.manageSubscription}
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.totalMrr}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(mrr, language)}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12.4%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">ARR projection: {formatCurrency(arr, language)}/yr</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.activeCustomersCount}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
              <span className="text-xs text-slate-500">{t.activeSubscribers} / {customers.length} {t.totalSubscribers}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {suspendedCount} {t.suspended} • {pendingCount} {t.pendingActivation}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Network State Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.networkHealth}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{healthScore}%</span>
              <span className="text-xs text-slate-500">{activeRouters}/{routers.length} {t.onlineRouters}</span>
            </div>
            <p className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
              <Activity className="w-3 h-3" /> Uptime: {networkUptime}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        {/* Open Invoices Outstanding Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.unpaidBilling}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding, language)}</span>
              <span className="text-xs font-medium text-rose-600 flex items-center gap-0.5">
                <Percent className="w-3 h-3" /> Churn: 2.1%
              </span>
            </div>
            <p className="text-[10px] text-rose-500 font-medium">{t.billingOverdue} ({t.actionsHeader})</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Growth SVG Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t.mrrDemandsChart}</h3>
              <p className="text-xs text-slate-400">Estimated throughput distribution and active clients bandwidth metrics</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-100">
              Live Feed
            </span>
          </div>

          {/* Core Custom SVG Line/Area Graph */}
          <div className="relative w-full h-[180px] bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden">
            <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Fill Area */}
              <path
                d="M 0 150 L 0 110 Q 100 80 200 120 T 400 50 L 500 30 L 500 150 Z"
                fill="url(#area-gradient)"
                opacity="0.15"
              />
              {/* Line */}
              <path
                d="M 0 110 Q 100 80 200 120 T 400 50 L 500 30"
                fill="none"
                stroke="#3182ce"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              
              {/* Dot Markers */}
              <circle cx="200" cy="120" r="5" fill="#3182ce" stroke="#ffffff" strokeWidth="2" />
              <circle cx="400" cy="50" r="5" fill="#3182ce" stroke="#ffffff" strokeWidth="2" />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3182ce" />
                  <stop offset="100%" stopColor="#63b3ed" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Legend Labels */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-slate-400">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
              <span className="font-semibold text-blue-600">08:00 PM (Peak)</span>
              <span>12:00 AM</span>
            </div>
            
            {/* Value popups */}
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 bg-slate-900/95 text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow border border-slate-700">
              120 Mbps mean
            </div>
            <div className="absolute top-8 right-12 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow">
              Peak: 450 Mbps
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 text-center font-sans">
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 block font-medium">{t.avgLatency}</span>
              <span className="font-bold text-slate-700 text-sm">8.4 ms</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 block font-medium">{t.activeQueues}</span>
              <span className="font-bold text-slate-700 text-sm">96 Profiles</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 block font-medium">{t.linkLoad}</span>
              <span className="font-bold text-slate-700 text-sm">34% mean</span>
            </div>
          </div>
        </div>

        {/* Priority Helpdesk Status Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">{t.urgentHelpdesk}</h3>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-rose-50 text-rose-600 border border-rose-100">
              {openTicketsCount} Unresolved
            </span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => onNavigate('helpdesk')}
                className="group border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 rounded-xl p-3 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 block truncate max-w-[140px] group-hover:text-blue-600">
                    {ticket.subject}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${
                      ticket.priority === 'critical'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : ticket.priority === 'high'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Client: {ticket.customerName}</span>
                  <span className="font-mono text-slate-400">SLA: {ticket.slaHours} hrs</span>
                </div>
              </div>
            ))}
            
            {tickets.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active service tickets left. Perfect network! 🎉
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('helpdesk')}
            className="w-full text-center text-xs py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 font-semibold border border-slate-200 block transition-colors cursor-pointer"
          >
            {t.allTicketsConsole}
          </button>
        </div>
      </div>

      {/* CRM Funnel Overview and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CRM Status Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t.prospectPipeline}</h3>
              <p className="text-xs text-slate-400 font-sans">Leads waiting conversion to contract installers</p>
            </div>
            <button
              onClick={() => onNavigate('crm')}
              className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
            >
              {t.fullFunnel}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-150/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-900">{t.conversionOpportunity}</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(leads.reduce((a, b) => a + b.pipelineValue, 0), language)} {t.potentialRevenue}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full w-2/3" />
            </div>
            <p className="text-[10px] text-slate-500">
              3 {t.proposalSentStage}
            </p>
          </div>
        </div>

        {/* Easy Action Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">{t.ispCommandPanel}</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('subscribers')}
              className="p-3 text-left border border-slate-200 hover:border-blue-200 hover:bg-blue-50/25 rounded-xl transition-all cursor-pointer group"
            >
              <Users className="w-4 h-4 text-emerald-500 mb-2" />
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600">{t.newCustomerAction}</span>
              <span className="text-[10px] text-slate-400">{t.newCustomerDesc}</span>
            </button>

            <button
              onClick={() => onNavigate('traffic')}
              className="p-3 text-left border border-slate-200 hover:border-blue-200 hover:bg-blue-50/25 rounded-xl transition-all cursor-pointer group"
            >
              <Wifi className="w-4 h-4 text-blue-500 mb-2" />
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600">{t.mikrotikAction}</span>
              <span className="text-[10px] text-slate-400">{t.mikrotikDesc}</span>
            </button>

            <button
              onClick={() => onNavigate('billing')}
              className="p-3 text-left border border-slate-200 hover:border-blue-200 hover:bg-blue-50/25 rounded-xl transition-all cursor-pointer group"
            >
              <DollarSign className="w-4 h-4 text-amber-500 mb-2" />
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600">{t.invoiceListAction}</span>
              <span className="text-[10px] text-slate-400">{t.invoiceListDesc}</span>
            </button>

            <button
              onClick={() => onNavigate('ai_advisor')}
              className="p-3 text-left border border-slate-200 hover:border-blue-200 hover:bg-blue-50/25 rounded-xl transition-all cursor-pointer group bg-gradient-to-br from-blue-500/5 to-sky-500/5"
            >
              <Activity className="w-4 h-4 text-blue-500 mb-2 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600">{t.smartProjectAction}</span>
              <span className="text-[10px] text-blue-500">{t.smartProjectDesc}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
