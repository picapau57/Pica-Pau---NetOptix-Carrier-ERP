import React, { useState } from 'react';
import { Customer, Invoice, Lead } from '../types';
import { Sparkles, BarChart, TrendingUp, HelpCircle, Users, Activity } from 'lucide-react';
import { formatCurrency } from '../lib/translations';

interface AIConsultantPanelProps {
  customers: Customer[];
  invoices: Invoice[];
  leads: Lead[];
  lang?: string;
  onCallAI: (prompt: string, type: 'classify_ticket' | 'predictive_analytics' | 'network_diagnostics') => Promise<{ text: string }>;
}

export default function AIConsultantPanel({ customers, invoices, leads, lang, onCallAI }: AIConsultantPanelProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Custom user advice prompt
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const triggerPredictiveAnalysis = async () => {
    setLoading(true);
    setReport(null);

    const subscriberContext = `
Active subscribers count: ${customers.filter(c => c.status === 'active').length}
Suspended connections count: ${customers.filter(c => c.status === 'suspended').length}
Leads waiting in funnel: ${leads.length}
Pending setup customers: ${customers.filter(c => c.status === 'pending_installation').length}
Outstanding billing amounts: ${formatCurrency(invoices.filter(i => i.status === 'overdue' || i.status === 'pending').reduce((a, b) => a + b.amount, 0), lang)}
Monthly recurring revenue: ${formatCurrency(invoices.filter(i => i.status === 'paid').reduce((a, b) => a + b.amount, 0), lang)}
    `;

    const promptMessage = `
Perform a high-level SaaS predictive analysis for this regional ISP network using the subscriber state:
${subscriberContext}

Provide segments on:
1. Churn Probability analysis for overdue/suspended accounts
2. Revenue Forecasting: potential ARR, MRR, lead pipeline value
3. Risk Mitigation: automated customer notifications or reactivation strategies
`;

    try {
      const res = await onCallAI(promptMessage, 'predictive_analytics');
      setReport(res.text);
    } catch {
      setReport('System error triggering model analysis. Please check Gemini API Key settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setCustomLoading(true);
    setCustomResponse(null);

    try {
      const res = await onCallAI(customPrompt, 'predictive_analytics');
      setCustomResponse(res.text);
    } catch {
      setCustomResponse('System failed to process query.');
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div id="ai-consultant-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left controls panel */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-white text-left space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">AI Regional ISP Strategist</h3>
          </div>

          <p className="text-xs text-slate-300">
            This module evaluates subscriber counts, overdue invoice logs, active leads values, and active carrier nodes to generate predictions:
          </p>

          <button
            onClick={triggerPredictiveAnalysis}
            className="w-full text-center text-xs py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl shadow cursor-pointer font-bold transition flex items-center justify-center gap-1.5"
          >
            <BarChart className="w-4 h-4" /> Run Predictive Forecaster
          </button>
        </div>

        {/* Custom advisor query form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left space-y-3">
          <h4 className="font-bold text-slate-800 text-xs">Consult Carrier Advisor</h4>
          
          <form onSubmit={handleCustomQuery} className="space-y-3">
            <textarea
              required
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g., How should I structure a 500Mbps fiber plan priced at $55/mo to achieve maximum margin in regional Paulista?"
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
            <button
              type="submit"
              className="w-full text-center text-xs py-2 bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Ask Strategy Engine
            </button>
          </form>
        </div>
      </div>

      {/* Right report view panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Forecaster report block */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs min-h-[450px] relative text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Strategic Performance Report</h3>
            </div>
            
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-mono flex items-center gap-1 uppercase">
              <Activity className="w-3 h-3 text-indigo-500 animate-pulse" /> Live Analysis
            </span>
          </div>

          {loading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center space-y-3">
              <span className="animate-spin h-8 w-8 border-3 border-indigo-650 border-t-transparent rounded-full" />
              <p className="text-xs text-indigo-600 font-semibold font-mono animate-pulse">Gemini-3.5-flash synthesizing regional subscriber metrics...</p>
            </div>
          ) : report ? (
            <div className="text-xs text-slate-700 leading-relaxed space-y-4 font-sans whitespace-pre-wrap max-h-[480px] overflow-y-auto">
              {report}
            </div>
          ) : customLoading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center space-y-3">
              <span className="animate-spin h-8 w-8 border-3 border-slate-900 border-t-transparent rounded-full" />
              <p className="text-xs text-slate-755 font-semibold font-mono animate-pulse">Running diagnostic consultant query...</p>
            </div>
          ) : customResponse ? (
            <div className="text-xs text-slate-700 leading-relaxed space-y-4 font-sans whitespace-pre-wrap max-h-[480px] overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono block">Custom Business Advisor Reply</span>
              {customResponse}
            </div>
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <Sparkles className="w-12 h-12 text-slate-300" />
              <p className="font-semibold text-slate-655 text-sm">Forecast Engine Standby</p>
              <p className="text-[11px] max-w-sm">Click standard forecaster option on the left or send customized prompt to compile immediate business forecasts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
