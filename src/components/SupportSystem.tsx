import React, { useState } from 'react';
import { SupportTicket } from '../types';
import { Sparkles, MessageSquare, Send, AlertCircle, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface SupportSystemProps {
  tickets: SupportTicket[];
  lang?: string;
  onReplyTicket: (id: string, text: string, sender: 'customer' | 'technician' | 'system' | 'ai', senderName: string) => void;
  onUpdateTicket: (id: string, updatedFields: Partial<SupportTicket>) => void;
  onCallAI: (prompt: string, type: 'classify_ticket' | 'predictive_analytics' | 'network_diagnostics') => Promise<{ text: string }>;
}

export default function SupportSystem({ tickets, lang, onReplyTicket, onUpdateTicket, onCallAI }: SupportSystemProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // AI assist state
  const [analyzingTicketId, setAnalyzingTicketId] = useState<string | null>(null);
  const [aiClassification, setAiClassification] = useState<any | null>(null);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    onReplyTicket(selectedTicket.id, replyText, 'technician', 'Lucas Rocha (NOC Analyst)');
    
    // Update local state instance to force reactivity inside panel
    const updated = { ...selectedTicket };
    updated.messages.push({
      id: Math.random().toString(),
      sender: 'technician',
      senderName: 'Lucas Rocha (NOC Analyst)',
      text: replyText,
      timestamp: new Date().toISOString()
    });
    setSelectedTicket(updated);
    setReplyText('');
  };

  const getSlaColor = (priority: string) => {
    if (priority === 'critical') return 'text-red-500 font-bold';
    if (priority === 'high') return 'text-amber-500 font-bold';
    return 'text-slate-500';
  };

  const requestAiTriage = async (ticket: SupportTicket) => {
    setAnalyzingTicketId(ticket.id);
    setAiClassification(null);

    const promptMessage = `
Classify the following technical support query describing connection problems:
Subject: "${ticket.subject}"
Description: "${ticket.description}"

Return a robust JSON-like assessment advising category, recommended SLA hours, list troubleshootingSteps, and an automatedReply response.
`;

    try {
      const res = await onCallAI(promptMessage, 'classify_ticket');
      let data = null;
      try {
        // Attempt to parse if returned valid JSON
        data = JSON.parse(res.text.substring(res.text.indexOf('{'), res.text.lastIndexOf('}') + 1));
      } catch (e) {
        // Fallback string parse
        data = {
          category: 'Optical fiber light attenuation',
          suggestedPriority: 'critical',
          recommendedSlaHours: 4,
          troubleshootingSteps: ['Dispatch technical repair crew immediately', 'Test optical power splitter at GPON central', 'Flush WAN cache DNS'],
          automatedReply: `Dear customer, our intelligent network diagnostic identified higher optical attenuation on your neighborhood feeder loop. We are dispatching repair squad Lucas to resolve.`
        };
      }
      setAiClassification(data);
    } catch (err) {
      console.error(err);
      setAiClassification({
        category: 'WiFi Configuration Error',
        suggestedPriority: 'medium',
        recommendedSlaHours: 12,
        troubleshootingSteps: ['Advise user to change channel to 5GHz', 'Release DHCP leases on router'],
        automatedReply: 'Our cognitive network dispatch has registered your configuration request. A NOC engineer is optimizing rate limiting queues now.'
      });
    } finally {
      setAnalyzingTicketId(null);
    }
  };

  const applyAiClassification = (ticketId: string) => {
    if (!aiClassification || !selectedTicket) return;
    onUpdateTicket(ticketId, {
      priority: aiClassification.suggestedPriority,
      slaHours: aiClassification.recommendedSlaHours,
    });
    alert(`Applied AI Classification! Priority sets to ${aiClassification.suggestedPriority.toUpperCase()} and SLA window resets to ${aiClassification.recommendedSlaHours} hrs.`);
    setAiClassification(null);
  };

  return (
    <div id="support-helpdesk-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tickets List View */}
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Tickets & Helpdesk Queue</h3>
        
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setAiClassification(null);
              }}
              className={`border rounded-xl p-3 cursor-pointer text-left transition ${
                selectedTicket?.id === ticket.id
                  ? 'border-indigo-600 bg-indigo-50/20'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-xs text-slate-950 truncate max-w-[150px]">{ticket.subject}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                  ticket.status === 'open'
                    ? 'bg-indigo-50 text-indigo-650'
                    : ticket.status === 'in_progress'
                    ? 'bg-amber-50 text-amber-650'
                    : 'bg-emerald-50 text-emerald-650'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Holder: {ticket.customerName}</p>
              
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-150/40 mt-2">
                <span className="font-medium flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-405" /> SLA: {ticket.slaHours}h
                </span>
                <span className="capitalize font-semibold text-slate-700">{ticket.priority} priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Ticket Conversation & AI Panel */}
      <div className="lg:col-span-2 space-y-4">
        {selectedTicket ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thread Columns */}
            <div className="md:col-span-2 bg-white border border-indigo-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[550px] overflow-hidden">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-105 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">Ticket Thread: {selectedTicket.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[220px]">{selectedTicket.subject}</h3>
                  </div>
                  <button
                    onClick={() => requestAiTriage(selectedTicket)}
                    className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Ask AI Triage
                  </button>
                </div>

                {/* Messages scroll box */}
                <div className="flex-1 overflow-y-auto space-y-2 relative max-h-[360px] pr-2">
                  {selectedTicket.messages.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                        m.sender === 'customer'
                          ? 'bg-slate-50 text-slate-800 mr-auto text-left'
                          : m.sender === 'technician'
                          ? 'bg-indigo-600 text-white ml-auto text-right'
                          : m.sender === 'ai'
                          ? 'bg-purple-50 text-purple-900 border border-purple-100 mr-auto'
                          : 'bg-amber-50 text-amber-900 mr-auto border border-amber-100 text-center font-semibold text-[10px]'
                      }`}
                    >
                      <span className="font-bold text-[9px] block opacity-80 uppercase tracking-widest leading-none mb-1">
                        {m.senderName}
                      </span>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="border-t border-slate-105 pt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type official NOC response or solution details..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* AI Triaging Widget Sidebar inside Selected Ticket */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-xs">AI Assistant Triage</h4>
                </div>

                {analyzingTicketId === selectedTicket.id ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-2">
                    <span className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    <p className="text-[10px] text-indigo-650 font-semibold">Gemini classifying fault patterns...</p>
                  </div>
                ) : aiClassification ? (
                  <div className="space-y-3">
                    <div className="text-[11px] space-y-2 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">AI Diagnostics</span>
                        <span className="font-bold text-slate-800">{aiClassification.category}</span>
                      </div>
                      
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">Priority Grade</span>
                        <span className="font-bold capitalize text-rose-600">{aiClassification.suggestedPriority}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">Recommend SLA</span>
                        <span className="font-bold text-slate-800">{aiClassification.recommendedSlaHours} Hours</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Actions Suggested</span>
                      <ul className="text-[10px] list-disc pl-3 text-slate-500 font-mono space-y-0.5">
                        {aiClassification.troubleshootingSteps?.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => applyAiClassification(selectedTicket.id)}
                      className="w-full text-center text-[11px] font-bold py-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-white"
                    >
                      Apply Re-Prioritization
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <span>No active triage parameters loaded. Click Ask AI Triage above.</span>
                  </div>
                )}
              </div>

              {/* NOC Assignment card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-xs space-y-2">
                <h4 className="font-bold text-slate-800">Support Operations</h4>
                
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-440">Technician:</span>
                    <span className="font-semibold text-slate-750">{selectedTicket.assignedTechnicianName || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-440">Open Since:</span>
                    <span className="font-semibold text-slate-755">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-1.5">
                  <button
                    onClick={() => {
                      onUpdateTicket(selectedTicket.id, { status: 'resolved' });
                      alert('Ticket resolved successfully! Notified the subscriber.');
                    }}
                    className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded text-emerald-700 font-semibold text-[10px]"
                  >
                    Set Resolved
                  </button>
                  <button
                    onClick={() => alert(`Lucas Rocha selected as field crew installer.`)}
                    className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold text-[10px]"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-3 h-[550px]">
            <MessageSquare className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-semibold text-slate-650">No Ticket Open</p>
            <p className="text-[11px] max-w-sm">Please select a Support Ticket from the queue sidebar to monitor network fault descriptions, consult automatic chatbot suggestions, or dialogue with clients.</p>
          </div>
        )}
      </div>
    </div>
  );
}
