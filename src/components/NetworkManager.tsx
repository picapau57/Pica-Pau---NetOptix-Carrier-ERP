import React, { useState } from 'react';
import { RouterDevice } from '../types';
import { Activity, ShieldAlert, Cpu, HardDrive, Wifi, Radio, Zap, AlertCircle, Sparkles } from 'lucide-react';

interface NetworkManagerProps {
  routers: RouterDevice[];
  lang?: string;
  onTriggerCommand: (id: string, action: 'reboot' | 'optimize') => void;
  onCallAI: (prompt: string, type: 'classify_ticket' | 'predictive_analytics' | 'network_diagnostics') => Promise<{ text: string }>;
}

export default function NetworkManager({ routers, lang, onTriggerCommand, onCallAI }: NetworkManagerProps) {
  const [analyzingRouterId, setAnalyzingRouterId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const runSmartDiagnostics = async (router: RouterDevice) => {
    setAnalyzingRouterId(router.id);
    setAiReport(null);

    const promptMessage = `
Analyze the following active central router telemetries and advise:
- Router: ${router.name}
- IP Address: ${router.ipAddress}
- Model: ${router.model}
- Status: ${router.status}
- CPU Load: ${router.cpuUsage}%
- RAM Usage: ${router.ramUsage}%
- Active PPPoE Users: ${router.activePPPoEConnections}
- Active Queues: ${router.activeQueues}

Identify if CPU bounds or lease timeouts have anomalies. Suggest terminal block actions.
`;

    try {
      const res = await onCallAI(promptMessage, 'network_diagnostics');
      setAiReport(res.text);
    } catch (err) {
      setAiReport('System error. RouterOS API is fully locked via secondary firewall rules.');
    } finally {
      setAnalyzingRouterId(null);
    }
  };

  return (
    <div id="network-manager-root" className="space-y-6">
      {/* Topology / Health Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Active ISP Towers</span>
            <span className="font-bold text-slate-800 text-sm">4 Sectors</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total PPPoE Dial-Ups</span>
            <span className="font-bold text-slate-800 text-sm">80 Active Tunnels</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Mean Core CPU Load</span>
            <span className="font-bold text-slate-800 text-sm">11% Mean</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Active Link Faults</span>
            <span className="font-bold text-rose-600 text-sm">{routers.filter(r => r.status === 'offline').length} Router Off</span>
          </div>
        </div>
      </div>

      {/* Main Routers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routers List Component */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">MikroTik RouterOS Central Integrations</h3>
          
          <div className="space-y-4">
            {routers.map(router => (
              <div
                key={router.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-sm transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                      router.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-450'
                    }`}>
                      RT
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{router.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>IP: {router.ipAddress}</span>
                        <span>•</span>
                        <span>{router.model}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      router.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      router.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    {router.status}
                  </span>
                </div>

                {router.status === 'online' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">CPU Usage</span>
                      <span className="text-sm font-bold text-slate-800 block flex items-center justify-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-blue-500" /> {router.cpuUsage}%
                      </span>
                    </div>

                    <div className="border-l border-slate-200/60">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">RAM Usage</span>
                      <span className="text-sm font-bold text-slate-700 block flex items-center justify-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-indigo-500" /> {router.ramUsage}%
                      </span>
                    </div>

                    <div className="border-l border-slate-200/60">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">PPPoE Tunnels</span>
                      <span className="text-sm font-bold text-slate-700 block">{router.activePPPoEConnections} clients</span>
                    </div>

                    <div className="border-l border-slate-200/60 font-mono">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Uptime</span>
                      <span className="text-[11px] font-semibold text-slate-700 block truncate">{router.uptime}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    disabled={router.status !== 'online'}
                    onClick={() => onTriggerCommand(router.id, 'optimize')}
                    className="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 font-semibold rounded-lg transition"
                  >
                    Optimize Queues
                  </button>
                  <button
                    disabled={router.status !== 'online'}
                    onClick={() => onTriggerCommand(router.id, 'reboot')}
                    className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 font-semibold rounded-lg transition"
                  >
                    Reboot Router
                  </button>
                  <button
                    disabled={router.status !== 'online'}
                    onClick={() => runSmartDiagnostics(router)}
                    className="px-3 py-1.5 text-xs text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 font-semibold rounded-lg transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" /> AI Diagnostic
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Diagnostic sidebar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Router AI Diagnostic Engine</h3>
          </div>

          <p className="text-xs text-slate-400">
            Analyses dynamic queue allocations, active PPPoE bounds, and RouterOS system parameters synchronously via Gemini-3.5-flash.
          </p>

          {analyzingRouterId ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <span className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-xs text-indigo-600 font-semibold">Gemini processing telemetry stream...</p>
            </div>
          ) : aiReport ? (
            <div className="p-3.5 bg-indigo-50 text-indigo-950 text-xs rounded-xl border border-indigo-150 space-y-2 font-mono whitespace-pre-wrap max-h-[380px] overflow-y-auto">
              {aiReport}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">No active scan report loaded</p>
              <p className="text-[11px]">Click the AI Diagnostic button on any online router to command an automated cognitive threat & load assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
