import React, { useState } from 'react';
import { Customer, InternetPlan } from '../types';
import { Plus, Search, MapPin, Shield, ToggleLeft, ToggleRight, Info, Check, Eye } from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  plans: InternetPlan[];
  lang?: string;
  onAddCustomer: (customer: Partial<Customer>) => void;
  onToggleStatus: (id: string) => void;
}

export default function CustomerManagement({ customers, plans, lang, onAddCustomer, onToggleStatus }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    document: '',
    address: '',
    phone: '',
    email: '',
    planId: plans[0]?.id || '',
    protocol: 'PPPoE' as 'PPPoE' | 'Hotspot' | 'IP_Fixed',
    ipAddress: '192.168.88.100',
    macAddress: '',
    username: '',
    secret: '',
    lat: -23.55052,
    lng: -46.633308,
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordinateTrigger = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6))
          }));
        },
        (error) => {
          console.warn("Unable to fetch browser GPS coordinates due to frame constraints. Using fallback São Paulo core coordinate.");
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Partial<Customer> = {
      name: formData.name,
      companyName: formData.companyName || undefined,
      document: formData.document,
      address: formData.address,
      gpsCoordinates: { lat: Number(formData.lat), lng: Number(formData.lng) },
      phone: formData.phone,
      email: formData.email,
      contractNumber: 'CNT-2026-0' + (customers.length + 5),
      planId: formData.planId,
      status: 'active',
      connectionDetails: {
        protocol: formData.protocol,
        ipAddress: formData.ipAddress,
        macAddress: formData.macAddress || '11:22:33:AA:BB:CC',
        username: formData.username || formData.name.toLowerCase().replace(/\s+/g, '_'),
        secret: formData.secret || 'pass8899',
        routerBindingId: 'r1',
      },
      notes: formData.notes,
    };
    onAddCustomer(newCust);
    setShowAddForm(false);
    // Reset Form
    setFormData({
      name: '',
      companyName: '',
      document: '',
      address: '',
      phone: '',
      email: '',
      planId: plans[0]?.id || '',
      protocol: 'PPPoE',
      ipAddress: '192.168.88.100',
      macAddress: '',
      username: '',
      secret: '',
      lat: -23.55052,
      lng: -46.633308,
      notes: '',
    });
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="customer-mgmt-root" className="space-y-6">
      {/* Search and Title */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ISP Customers Directory</h2>
          <p className="text-xs text-slate-400">Manage client connection states, WAN protocols, and contract statuses</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, doc or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register Client
          </button>
        </div>
      </div>

      {/* Add Customer Form Modal overlay or slide down */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Register Carrier Tenant Subscriber</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field: Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Subscriber Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Carlos Santana"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field: Corp Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Company Name (Optional)</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Santana Enterprises"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field: Document */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Doc Code (CPF / CNPJ) *</label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
                required
                placeholder="123.456.789-00"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field: Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="carlos@example.com"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field: Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+55 11 98765-4321"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field: Selected Plan */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Subscription Plan *</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-none focus:border-indigo-500"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.monthlyFee}/mo</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Physical Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Rua Consolação, 1500, Apt 42"
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* GPS coordinates with current browser lookup option */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                <span>GPS Coordinates *</span>
                <button
                  type="button"
                  onClick={handleCoordinateTrigger}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  <MapPin className="w-3 h-3" /> Use Current Geolocation
                </button>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  required
                  placeholder="Lat"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  required
                  placeholder="Lng"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider block">MikroTik Connection & Authentication Details</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Authentication Protocol</label>
                <select
                  name="protocol"
                  value={formData.protocol}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="PPPoE">PPPoE (Dial Up Secrets)</option>
                  <option value="IP_Fixed">IP Fixed (Fixed IP route)</option>
                  <option value="Hotspot">WiFi Hotspot (Cookie tokens)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Static IP Address</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">MAC Binding</label>
                <input
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleInputChange}
                  placeholder="00:1B:44:6C:FF:E2"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">WAN Username / Secret Code</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="User"
                    className="w-1/2 text-xs border border-slate-200 rounded-lg p-2"
                  />
                  <input
                    type="password"
                    name="secret"
                    value={formData.secret}
                    onChange={handleInputChange}
                    placeholder="Secret Pass"
                    className="w-1/2 text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition"
            >
              Save Subscriber Contract
            </button>
          </div>
        </form>
      )}

      {/* Directory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Subscriber</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Plan / Rate Limit</th>
                  <th className="px-4 py-3">PPPoE Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map(c => {
                  const clientPlan = plans.find(p => p.id === c.planId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 ${
                            c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold block text-slate-900">{c.name}</span>
                            <span className="text-[10px] text-slate-400 block">{c.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{c.document}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold block">{clientPlan?.name || 'Unknown Plan'}</span>
                        <span className="text-[10px] text-indigo-500 font-mono block">
                          ↑{clientPlan?.uploadSpeed}M / ↓{clientPlan?.downloadSpeed}M Profile
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : c.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'active' ? 'bg-emerald-500' : c.status === 'suspended' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Quick Toggle Connection Switch"
                            onClick={() => onToggleStatus(c.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              c.status === 'active'
                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {c.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          
                          <button
                            title="Interactive View WAN Details"
                            onClick={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg hover:bg-indigo-50/50 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      No matching carrier subscribers located.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Side Detailed Card */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-xs space-y-4 animate-slideIn">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono block">Contract ID: {selectedCustomer.contractNumber}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  selectedCustomer.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {selectedCustomer.status}
                </span>
              </div>

              {/* WAN details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Provision Link Protocol</span>
                  <span className="font-bold text-indigo-600 font-mono flex items-center gap-0.5">
                    <Shield className="w-3 h-3 text-indigo-500" /> {selectedCustomer.connectionDetails.protocol}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-medium">Assigned Static WAN</span>
                  <span className="font-semibold text-slate-700 font-mono">{selectedCustomer.connectionDetails.ipAddress}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-medium">Bnd MAC Address</span>
                  <span className="font-semibold text-slate-700 font-mono">{selectedCustomer.connectionDetails.macAddress}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-medium">PPPoE User</span>
                  <span className="font-semibold text-slate-700 font-mono">{selectedCustomer.connectionDetails.username}</span>
                </div>
              </div>

              {/* Geographic Coordinates Map Placeholder */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Installer GPS Grid
                </span>
                <div className="h-28 bg-slate-100 hover:bg-slate-200/80 transition rounded-xl relative border border-slate-200/60 overflow-hidden flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[11px] font-semibold text-slate-700">Paulista Node Map Block</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    LAT: {selectedCustomer.gpsCoordinates.lat} | LNG: {selectedCustomer.gpsCoordinates.lng}
                  </span>
                  
                  {/* Subtle Target Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </div>
                </div>
              </div>

              {/* Contract Documents Section */}
              <div className="border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold block text-slate-800">Digital Fiber Lease Contract</span>
                  <span className="text-[10px] text-slate-400">PDF standard doc signed in-system</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Signed
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <Info className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Subscriber Selected</p>
              <p className="text-[11px]">Click the view icon (<Eye className="w-3 h-3 inline text-slate-400" />) to inspect dial-up profiles, optical GPS coordinates, mac bindings, and dynamic link leases.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
