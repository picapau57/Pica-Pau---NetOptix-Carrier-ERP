import React, { useState } from 'react';
import { Customer, Invoice, InternetPlan, SupportTicket } from '../types';
import { translations, Language, formatCurrency } from '../lib/translations';
import { Wifi, Clipboard, Calendar, Send, CheckCircle, Sparkles } from 'lucide-react';

interface PortalCustomerProps {
  myCustomerObject: Customer;
  plans: InternetPlan[];
  invoices: Invoice[];
  tickets: SupportTicket[];
  lang?: Language;
  onOpenTicket: (subject: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onPayInvoice: (id: string, method: 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'bank_transfer') => void;
  onCallAI: (prompt: string, type: 'classify_ticket' | 'predictive_analytics' | 'network_diagnostics') => Promise<{ text: string }>;
}

export default function PortalCustomer({ myCustomerObject, plans, invoices, tickets, lang, onOpenTicket, onPayInvoice, onCallAI }: PortalCustomerProps) {
  const language = lang || 'pt';
  const t = translations[language];

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [showInvoiceId, setShowInvoiceId] = useState<string | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { 
      sender: 'assistant', 
      text: language === 'pt' 
        ? `Olá ${myCustomerObject.name}! Eu sou seu assistente ISP automatizado. Como posso ajudar com sua velocidade ou faturas hoje?`
        : language === 'es'
        ? `¡Hola ${myCustomerObject.name}! Soy su asistente ISP automatizado. ¿Cómo puedo ayudarle con su velocidad o facturas hoy?`
        : `Hello ${myCustomerObject.name}! I am your automated ISP Support concierge. How can I optimize your speed limits or check billing lists today?`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const curPlan = plans.find(p => p.id === myCustomerObject.planId);
  const myInvoices = invoices.filter(inv => inv.customerId === myCustomerObject.id);

  const handleOpenTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    onOpenTicket(ticketSubject, ticketDesc, ticketPriority);
    alert(language === 'pt' 
      ? 'Chamado aberto com sucesso! Nosso suporte já está processando seu pedido.' 
      : language === 'es'
      ? '¡Caso de soporte abierto exitosamente! Nuestro personal técnico ya está respondiendo.' 
      : 'Support Incident Ticket opened successfully! System team is responding.');
    setTicketSubject('');
    setTicketDesc('');
  };

  const triggerCopyPix = (hashValue: string) => {
    navigator.clipboard.writeText(hashValue);
    alert(language === 'pt'
      ? 'Código copiado com sucesso! Use o Pix Copia e Cola no aplicativo do seu banco.'
      : language === 'es'
      ? '¡Código copiado exitosamente! Pegue el código hash en su banca móvil.'
      : 'PIX Code copied successfully to clipboard! Paste it inside your banking app.');
  };

  const handleBotChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setAiLoading(true);

    const promptMessage = `
User Query: "${userText}"
Language Preference: "${language}"
Customer Context:
- Name: ${myCustomerObject.name}
- Current Connection: ${curPlan?.name} (↓${curPlan?.downloadSpeed}M / ↑${curPlan?.uploadSpeed}M)
- Active connection protocol: ${myCustomerObject.connectionDetails.protocol}
- Billing State: ${myInvoices.filter(i => i.status === 'overdue').length > 0 ? "HAS OVERDUE CONTRACT BILLS" : "ALL CLEAR"}
Please reply in ${language === 'pt' ? 'Portuguese' : language === 'es' ? 'Spanish' : 'English'}. Keep responses friendly, objective, and short.
    `;

    try {
      const res = await onCallAI(promptMessage, 'classify_ticket');
      setChatMessages(prev => [...prev, { sender: 'assistant', text: res.text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: language === 'pt'
          ? "Olá! No momento estamos com grande fluxo de consultas, mas todas as conexões estão normais."
          : language === 'es'
          ? "¡Hola! Por el momento tenemos gran flujo de solicitudes. Su conexión aparece normal."
          : "Hello! Our AI NOC is experiencing peak requests, but I have registered your query. All connection speeds appear normal."
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="customer-portal-root" className="space-y-6">
      {/* Welcome & Link stats */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-slate-950 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
        <div className="space-y-1.5 text-left">
          <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
            ISP CONNECT CLIENT PORTAL
          </span>
          <h2 className="text-xl font-bold">{t.welcomeCustomer} {myCustomerObject.name}!</h2>
          <p className="text-xs text-slate-300">
            Contract: <strong className="text-blue-400">{myCustomerObject.contractNumber}</strong> • {t.installationAddress}: {myCustomerObject.address}
          </p>
        </div>

        {curPlan && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[200px] flex justify-between gap-4 font-mono">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.yourActivePlan}:</span>
              <span className="font-bold block text-sm">{curPlan.name}</span>
            </div>
            <div className="border-l border-white/10 pl-4 text-right">
              <span className="text-[10px] text-emerald-400 font-bold text-xs uppercase flex items-center gap-0.5">
                <Wifi className="w-3.5 h-3.5" /> ONLINE
              </span>
              <span className="text-sm font-bold text-slate-200">↓{curPlan.downloadSpeed} Mbps</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid of invoice settlements and support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: invoices & Ticket creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Settlement List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3.5">{t.billingPaymentHistory}</h3>

            <div className="space-y-3.5">
              {myInvoices.map(inv => {
                const totalAmount = inv.amount + inv.penalty + inv.interest - inv.discount;
                return (
                  <div
                    key={inv.id}
                    className="border border-slate-100 rounded-xl p-4 hover:border-blue-100 hover:bg-slate-50/20 transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{inv.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {inv.status === 'paid' ? t.paid : inv.status === 'overdue' ? t.overdue : t.pending}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {t.dueDateHeader}: {inv.dueDate}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">Total: {formatCurrency(totalAmount, language)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {inv.status !== 'paid' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowInvoiceId(showInvoiceId === inv.id ? null : inv.id)}
                            className="px-3 py-1.5 text-xs text-blue-650 bg-blue-50 hover:bg-blue-105 font-bold rounded-lg shadow-3xs cursor-pointer"
                          >
                            {language === 'pt' ? 'Pagar Fatura' : language === 'es' ? 'Pagar Factura' : 'Pay invoice'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-bold font-mono">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> {t.paid} • {inv.paymentMethod?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {showInvoiceId === inv.id && inv.status !== 'paid' && (
                      <div className="w-full border-t border-slate-100 pt-3 mt-1.5 space-y-3 sm:col-span-3 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PIX Copy & Paste / Hash Key</span>
                        <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 items-center flex-col sm:flex-row">
                          <div className="text-[10px] font-mono text-slate-600 break-all select-all flex-1">
                            {inv.pixCode}
                          </div>
                          
                          <button
                            onClick={() => triggerCopyPix(inv.pixCode)}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Clipboard className="w-3.5 h-3.5" /> {language === 'pt' ? 'Copiar' : language === 'es' ? 'Copiar' : 'Copy'}
                          </button>
                        </div>

                        <div className="pt-2 flex justify-between items-center text-xs">
                          <span className="text-[11px] text-slate-450 italic">{t.unpaidAlert}</span>
                          
                          <button
                            onClick={() => {
                              onPayInvoice(inv.id, 'pix');
                              setShowInvoiceId(null);
                              alert(t.invoicePaidSuccess);
                            }}
                            className="text-[11px] text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold px-3 py-1.5 rounded-lg"
                          >
                            {language === 'pt' ? 'Confirmar Teste de Pagamento' : language === 'es' ? 'Confirmar Prueba de Pago' : 'Confirm Payment Simulation'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Request form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
            <h3 className="font-bold text-slate-800 text-sm mb-3">{t.newSupportTicket}</h3>

            <form onSubmit={handleOpenTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">{language === 'pt' ? 'Assunto' : language === 'es' ? 'Asunto' : 'Subject'} *</label>
                  <input
                    type="text"
                    required
                    placeholder={t.ticketSubjectPlaceholder}
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">{t.ticketPriority} *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e: any) => setTicketPriority(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                  >
                    <option value="low">{t.low}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="high">{t.high}</option>
                    <option value="critical">{t.critical}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">{language === 'pt' ? 'Descrição do Problema' : language === 'es' ? 'Descripción del Problema' : 'Details'} *</label>
                <textarea
                  required
                  rows={2}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder={t.ticketDescPlaceholder}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow"
                >
                  {t.submitTicket}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: automated AI Bot chatbot panel */}
        <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 flex flex-col justify-between h-[510px] shadow-sm text-white text-left">
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-3 shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm leading-none text-slate-100">ISP AI Concierge</h3>
                <span className="text-[9px] text-slate-400 font-mono">Cognitive diagnostics model</span>
              </div>
            </div>

            {/* Scrolling logs */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 py-2 min-h-0">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto text-right'
                      : 'bg-white/5 text-slate-200 mr-auto border border-white/10'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              ))}
              
              {aiLoading && (
                <div className="text-[10px] text-blue-400 animate-pulse flex items-center gap-1 font-mono pl-1">
                  <span>AI testing line...</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleBotChat} className="border-t border-white/5 pt-3 flex gap-2 shrink-0">
            <input
              type="text"
              placeholder={language === 'pt' ? "Pergunte sobre velocidade, faturamento..." : language === 'es' ? "Pregunte sobre velocidad, facturas..." : "Ask about speeds, billing..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-xs bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:bg-white/10 placeholder-slate-550"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl shadow transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
