import React, { useState } from 'react';
import { Invoice, Customer } from '../types';
import { CreditCard, DollarSign, RefreshCw, Calendar, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { formatCurrency } from '../lib/translations';

interface BillingManagementProps {
  invoices: Invoice[];
  customers: Customer[];
  lang?: string;
  onPayInvoice: (id: string, method: 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'bank_transfer') => void;
  onGenerateRecurringInvoices: () => void;
}

export default function BillingManagement({ invoices, customers, lang, onPayInvoice, onGenerateRecurringInvoices }: BillingManagementProps) {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'bank_slip'>('pix');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const triggerPayment = (invoiceId: string) => {
    onPayInvoice(invoiceId, selectedMethod);
    setPayingInvoiceId(null);
  };

  const revenueSuccessThisMonth = invoices.filter(inv => inv.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const outstandingOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((a, b) => a + b.amount + b.penalty + b.interest, 0);

  return (
    <div id="billing-mgmt-root" className="space-y-6">
      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-emerald-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Collection Successes</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(revenueSuccessThisMonth, lang)}</h3>
            <p className="text-[10px] text-slate-400">Total cleared revenue logs this batch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/5 to-red-500/5 border border-rose-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">Overdue Outstanding</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(outstandingOverdue, lang)}</h3>
            <p className="text-[10px] text-slate-400">Including automated lease interest and penalties</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-center space-y-2.5">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800 text-xs">Run Recurring Billing Cron</span>
              <span className="text-[10px] text-slate-400 block">Trigger monthly automated invoice dispatch</span>
            </div>
            
            <button
              onClick={onGenerateRecurringInvoices}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all"
            >
              Run Cron
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-slate-800 mb-4 text-sm">Automated Billing Ledger ({invoices.length} entries)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Invoice / Client</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amounts Grid ({lang === 'pt' ? 'R$' : lang === 'es' ? '€' : '$'})</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {invoices.map(inv => {
                const totalAmount = inv.amount + inv.penalty + inv.interest - inv.discount;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/20 transition">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.id}</span>
                        <span className="text-[10px] text-slate-405 block">Holder: {inv.customerName}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {inv.dueDate}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-bold block">{formatCurrency(totalAmount, lang)}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          Base: {formatCurrency(inv.amount, lang)} | Pen: +{formatCurrency(inv.penalty, lang)} | Disc: -{formatCurrency(inv.discount, lang)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-500' : inv.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {inv.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {inv.status !== 'paid' ? (
                        <div>
                          {payingInvoiceId === inv.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={selectedMethod}
                                onChange={(e: any) => setSelectedMethod(e.target.value)}
                                className="text-[11px] border border-slate-200 rounded-lg p-1 bg-white focus:outline-none"
                              >
                                <option value="pix">PIX Inst.</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="bank_slip">Bank Slip</option>
                              </select>
                              <button
                                onClick={() => triggerPayment(inv.id)}
                                className="px-2 py-1 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-semibold shadow-xs"
                              >
                                Settle
                              </button>
                              <button
                                onClick={() => setPayingInvoiceId(null)}
                                className="text-slate-400 px-1 text-[10px] font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setPayingInvoiceId(inv.id);
                                  setSelectedMethod('pix');
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition"
                              >
                                Collect Payment
                              </button>

                              <button
                                title="Auto Send Notification Reminder"
                                onClick={() => alert(`Billing system triggered SMS & WhatsApp invoice reminder to customer for Invoice ID ${inv.id}`)}
                                className="p-1 text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 rounded-lg hover:bg-indigo-50/30 transition shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-medium text-slate-400 block pr-2">
                          Cleared {inv.paymentMethod?.toUpperCase()} on {inv.paymentDate}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
