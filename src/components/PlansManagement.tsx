import React, { useState } from 'react';
import { InternetPlan } from '../types';
import { Plus, Wifi, Layers, Flame, DollarSign, Clock, Check } from 'lucide-react';
import { formatCurrency } from '../lib/translations';

interface PlansManagementProps {
  plans: InternetPlan[];
  lang?: string;
  onAddPlan: (plan: Partial<InternetPlan>) => void;
}

export default function PlansManagement({ plans, lang, onAddPlan }: PlansManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    downloadSpeed: 100,
    uploadSpeed: 50,
    monthlyFee: 29.9,
    installationFee: 49.9,
    contractDuration: 12,
    activationFee: 0,
    dataLimitGb: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Partial<InternetPlan> = {
      name: formData.name,
      downloadSpeed: Number(formData.downloadSpeed),
      uploadSpeed: Number(formData.uploadSpeed),
      monthlyFee: Number(formData.monthlyFee),
      installationFee: Number(formData.installationFee),
      contractDuration: Number(formData.contractDuration),
      activationFee: Number(formData.activationFee),
      dataLimitGb: formData.dataLimitGb ? Number(formData.dataLimitGb) : null,
      status: 'active',
    };
    onAddPlan(newPlan);
    setShowForm(false);
    setFormData({
      name: '',
      downloadSpeed: 100,
      uploadSpeed: 50,
      monthlyFee: 29.9,
      installationFee: 49.9,
      contractDuration: 12,
      activationFee: 0,
      dataLimitGb: '',
    });
  };

  return (
    <div id="plans-mgmt-root" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Internet Connection Speeds & Rate Profiles</h2>
          <p className="text-xs text-slate-400">Configure PPPoE download limiters, upload bursts, and lease fees</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Rate Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Add New Carrier Rate Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Plan Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Fiber Giga Max"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Download Speed (Mbps) *</label>
              <input
                type="number"
                name="downloadSpeed"
                value={formData.downloadSpeed}
                onChange={handleInputChange}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Upload Speed (Mbps) *</label>
              <input
                type="number"
                name="uploadSpeed"
                value={formData.uploadSpeed}
                onChange={handleInputChange}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Fee ($) *</label>
              <input
                type="number"
                step="any"
                name="monthlyFee"
                value={formData.monthlyFee}
                onChange={handleInputChange}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Installation Fee ($)</label>
              <input
                type="number"
                step="any"
                name="installationFee"
                value={formData.installationFee}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Activation Fee ($)</label>
              <input
                type="number"
                step="any"
                name="activationFee"
                value={formData.activationFee}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Min Contract Duration (Months)</label>
              <input
                type="number"
                name="contractDuration"
                value={formData.contractDuration}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Data Cap Limits (GB - Optional)</label>
              <input
                type="number"
                name="dataLimitGb"
                value={formData.dataLimitGb}
                onChange={handleInputChange}
                placeholder="Unlimited"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition"
            >
              Save Rate Profile
            </button>
          </div>
        </form>
      )}

      {/* Plans Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(p => (
          <div
            key={p.id}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Dedicated Fiber
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-0.5 font-mono">
                  <Clock className="w-3 h-3" /> {p.contractDuration} Mos
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-base">{p.name}</h3>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Download</span>
                  <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4 text-orange-500" /> {p.downloadSpeed} M
                  </span>
                </div>
                <div className="border-l border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Upload Limit</span>
                  <span className="text-base font-bold text-slate-700">{p.uploadSpeed} M</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-baseline gap-1 justify-between">
                <span className="text-[11px] text-slate-400">Monthly Rec. Cost</span>
                <span className="text-2xl font-bold text-slate-900 flex items-center">
                  {formatCurrency(p.monthlyFee, lang)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Installation Setup Fee:</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(p.installationFee, lang)}</span>
                </div>
                {p.activationFee > 0 && (
                  <div className="flex justify-between">
                    <span>Carrier Activation Fee:</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(p.activationFee, lang)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Bandwidth Allowance:</span>
                  <span className="font-semibold text-slate-700">{p.dataLimitGb ? `${p.dataLimitGb} GB` : 'Unlimited GB'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
