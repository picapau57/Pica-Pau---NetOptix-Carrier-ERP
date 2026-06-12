import React, { useState } from 'react';
import { Equipment } from '../types';
import { Plus, Archive, Shield, AlertTriangle, Hammer, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/translations';

interface InventoryManagerProps {
  inventory: Equipment[];
  lang?: string;
  onAddEquipment: (eq: Partial<Equipment>) => void;
}

export default function InventoryManager({ inventory, lang, onAddEquipment }: InventoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'onu' as Equipment['type'],
    brand: '',
    model: '',
    serialNumber: '',
    supplier: '',
    cost: 35.0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEq: Partial<Equipment> = {
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      status: 'in_stock',
      supplier: formData.supplier || 'N/A',
      cost: Number(formData.cost),
    };
    onAddEquipment(newEq);
    setShowForm(false);
    setFormData({
      type: 'onu',
      brand: '',
      model: '',
      serialNumber: '',
      supplier: '',
      cost: 35.0,
    });
  };

  const lowStockOnuList = inventory.filter(eq => eq.type === 'onu' && eq.status === 'in_stock');
  const alertLowStock = lowStockOnuList.length <= 2;

  return (
    <div id="inventory-manager-root" className="space-y-6">
      {/* Metrics and Stock Watch alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Hardware Assets</span>
            <span className="font-bold text-slate-800 text-sm">{inventory.length} Devices</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">In-Stock ONU Modems</span>
            <span className={`font-bold text-sm ${alertLowStock ? 'text-red-650' : 'text-slate-800'}`}>
              {lowStockOnuList.length} Units {alertLowStock && '(RESERVES LOW)'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 block">Register new fiber OLT, CCR router or customer ONU modal</span>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 font-bold text-white rounded-xl text-xs cursor-pointer shadow transition"
          >
            <Plus className="w-3.5 h-3.5" /> Register Asset
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Add New Network Hardware Item</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Hardware Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
              >
                <option value="onu">ONU Fiber Bridge Modem</option>
                <option value="router">WiFi hAP Customer Router</option>
                <option value="olt">G-PON Optical Line OLT</option>
                <option value="sfp">Fiber Optical SFP Module</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Manufacturer / Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                placeholder="FiberHome / MikroTik"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Model Code Name *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="HG6145F"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Unique Serial Number / MAC *</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                required
                placeholder="HW123AABCC99"
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Asset Acquisition Cost ({lang === 'pt' ? 'R$' : lang === 'es' ? '€' : '$'})</label>
              <input
                type="number"
                step="any"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Acquisition Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="MKT Distribuidora SA"
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
              Save Hardware Asset
            </button>
          </div>
        </form>
      )}

      {/* Equipment Table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-slate-800 mb-4 text-sm">Fiber & NOC Hardware Ledger</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Equipment Specification</th>
                <th className="px-4 py-3">Unique ID / Serial Number</th>
                <th className="px-4 py-3">Import Supplier</th>
                <th className="px-4 py-3">Acq Contract Cost</th>
                <th className="px-4 py-3">Asset Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {item.type.toUpperCase().slice(0, 3)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block capitalize">{item.brand} - {item.model}</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">{item.type}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-slate-600 text-[11px]">{item.serialNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{item.supplier}</td>
                  <td className="px-4 py-3 font-bold font-mono text-slate-900">{formatCurrency(item.cost, lang)}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          : item.status === 'deployed'
                          ? 'bg-blue-50 text-blue-800 border-blue-10 border-blue-100'
                          : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}
                    >
                      {item.status === 'in_stock' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : item.status === 'deployed' ? (
                        <Shield className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Hammer className="w-3 h-3 text-rose-500" />
                      )}
                      <span className="capitalize ml-1">{item.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
