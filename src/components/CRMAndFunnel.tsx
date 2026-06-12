import React, { useState } from 'react';
import { Lead } from '../types';
import { Plus, ArrowRight, UserPlus, DollarSign, Archive, Mail, Phone, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/translations';

interface CRMAndFunnelProps {
  leads: Lead[];
  lang?: string;
  onAddLead: (lead: Partial<Lead>) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
  onConvertLeadToClient: (lead: Lead) => void;
}

export default function CRMAndFunnel({ leads, lang, onAddLead, onUpdateLeadStatus, onConvertLeadToClient }: CRMAndFunnelProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Google Ads',
    pipelineValue: 49.9,
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Partial<Lead> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      pipelineValue: Number(formData.pipelineValue),
      notes: formData.notes,
      status: 'new',
    };
    onAddLead(newLead);
    setShowForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: 'Google Ads',
      pipelineValue: 49.9,
      notes: '',
    });
  };

  const columns: { label: string; status: Lead['status']; color: string }[] = [
    { label: 'New Pros', status: 'new', color: 'border-slate-200' },
    { label: 'Contacted', status: 'contacted', color: 'border-indigo-200' },
    { label: 'Proposal Sent', status: 'proposal_sent', color: 'border-blue-200' },
    { label: 'In Negotiation', status: 'negotiation', color: 'border-amber-200' },
    { label: 'Converted 🎉', status: 'converted', color: 'border-emerald-200' },
  ];

  const totalPipeline = leads.reduce((a, b) => a + b.pipelineValue, 0);

  return (
    <div id="crm-funnel-root" className="space-y-6">
      {/* Sales Pipeline Metrics Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">CRM Sales pipeline & Lead Funnel</h2>
          <p className="text-xs text-slate-400">Convert prospective regional users to active fiber installation tenants</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 rounded-xl px-3.5 py-1.5 border border-emerald-100 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[9px] text-emerald-600 block leading-none uppercase font-bold">Leads Pipeline Value</span>
              <span className="text-sm font-bold text-emerald-800">{formatCurrency(totalPipeline, lang)}/mo</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold px-3 py-2 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" /> Add Prospect
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Add Lead Prospect</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Contact Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Amanda Silva"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="amanda@yahoo.com"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+55 11 96541-0000"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Lead Traffic Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Instagram Ad">Instagram Ad</option>
                <option value="Direct Referral">Direct Referral</option>
                <option value="Organic Search">Organic Search</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Est. Monthly Subscription Revenue ({lang === 'pt' ? 'R$' : lang === 'es' ? '€' : '$'}) *</label>
              <input
                type="number"
                step="any"
                name="pipelineValue"
                value={formData.pipelineValue}
                onChange={handleInputChange}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Strategic Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ready to convert, needs router installation"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow transition"
            >
              Save Prospect
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status === col.status);
          return (
            <div
              key={col.status}
              className={`bg-slate-50/50 border rounded-2xl p-3 space-y-4 min-w-[210px] flex flex-col ${col.color}`}
            >
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-slate-800 text-xs">{col.label}</span>
                <span className="bg-slate-200/60 text-slate-700 font-bold px-1.5 py-0.5 rounded-md text-[10px] leading-none">
                  {colLeads.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-0.5">
                {colLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs space-y-2 hover:border-indigo-100 transition-all text-left"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs block">{lead.name}</h4>
                      <span className="text-[9px] font-bold text-indigo-500 font-mono block">Source: {lead.source}</span>
                    </div>

                    <p className="text-[10px] text-slate-450 line-clamp-2 italic">"{lead.notes || 'No description'}"</p>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 font-mono text-xs">
                        {formatCurrency(lead.pipelineValue, lang)}
                      </span>
                      
                      {lead.status !== 'converted' ? (
                        <div className="flex items-center gap-1.5">
                          {/* Convert directly */}
                          <button
                            title="Directly Provision Connection Tenant Profile"
                            onClick={() => onConvertLeadToClient(lead)}
                            className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-100 transition shadow-3xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Right column */}
                          <button
                            title="Promote lead state"
                            onClick={() => {
                              const order: Lead['status'][] = ['new', 'contacted', 'proposal_sent', 'negotiation', 'converted'];
                              const currIdx = order.indexOf(lead.status);
                              if (currIdx !== -1 && currIdx < order.length - 1) {
                                onUpdateLeadStatus(lead.id, order[currIdx + 1]);
                              }
                            }}
                            className="p-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded hover:bg-indigo-100 transition shadow-3xs cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                          PROVISIONED
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="text-center py-10 text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                    No leads here.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
