import React, { useState, useRef, useEffect } from 'react';
import { Customer, SupportTicket } from '../types';
import { translations, Language } from '../lib/translations';
import { MapPin, Navigation, Clipboard, CheckCircle, Signature, AlertTriangle } from 'lucide-react';

interface PortalTechnicianProps {
  tickets: SupportTicket[];
  lang?: Language;
}

export default function PortalTechnician({ tickets, lang }: PortalTechnicianProps) {
  const language = lang || 'pt';
  const t = translations[language];

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Check in/out simulator
  const [checkInLocation, setCheckInLocation] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [deviceSerialDeployed, setDeviceSerialDeployed] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Signature Pad state and canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const myAssignedTickets = tickets.filter(t => t.assignedTechnicianId === 'tech-01');

  const handleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setCheckInLocation(`Lat: ${lat} | Lng: ${lng} (${language === 'pt' ? 'Check-in on-site realizado com sucesso!' : language === 'es' ? '¡Check-in en el lugar realizado con éxito!' : 'Successfully verified on-site check-in!'})`);
          setIsCheckedIn(true);
        },
        () => {
          setCheckInLocation(`Lat: -23.5615 | Lng: -46.6560 (${language === 'pt' ? 'Check-in por aproximação Paulista verificado' : language === 'es' ? 'Check-in Paulista verificado' : 'Noc central Paulista verified fallback coordinates'})`);
          setIsCheckedIn(true);
        }
      );
    }
  };

  const handleFinishDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceSerialDeployed) return;
    setIsCompleted(true);
  };

  // Electronic Signature Drawing Logic on HTML Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [canvasRef.current, selectedTicket]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    
    // Get correct coordinates relative to the canvas bounding rect
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if (e.nativeEvent instanceof MouseEvent) {
      clientX = e.nativeEvent.clientX - rect.left;
      clientY = e.nativeEvent.clientY - rect.top;
    } else {
      // TouchEvent
      clientX = e.nativeEvent.touches[0].clientX - rect.left;
      clientY = e.nativeEvent.touches[0].clientY - rect.top;
    }

    ctx.moveTo(clientX, clientY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if (e.nativeEvent instanceof MouseEvent) {
      clientX = e.nativeEvent.clientX - rect.left;
      clientY = e.nativeEvent.clientY - rect.top;
    } else {
      clientX = e.nativeEvent.touches[0].clientX - rect.left;
      clientY = e.nativeEvent.touches[0].clientY - rect.top;
    }

    ctx.lineTo(clientX, clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div id="technician-portal-root" className="space-y-6">
      {/* Bio / Persona banner */}
      <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow text-white text-left">
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            {language === 'pt' ? 'PORTAL DO TÉCNICO DE CAMPO' : language === 'es' ? 'PORTAL DEL TÉCNICO DE CAMPO' : 'NOC FIELD CREW PORTAL DIRECT'}
          </span>
          <h3 className="font-bold text-base leading-none">{language === 'pt' ? 'Técnico: Lucas Rocha' : language === 'es' ? 'Técnico: Lucas Rocha' : 'Technician: Lucas Rocha'}</h3>
          <p className="text-[11px] text-slate-400">{language === 'pt' ? 'Zona Designada: Central Paulista São Paulo' : language === 'es' ? 'Zona Asignada: Central Paulista São Paulo' : 'Assigned Zone: Central Paulista São Paulo'}</p>
        </div>

        <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded border border-slate-700/50 uppercase">
          {language === 'pt' ? 'Escala Ativa' : language === 'es' ? 'Escala Activa' : 'Active Roster'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Selector column */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left space-y-3.5">
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">{language === 'pt' ? 'Chamados Atribuídos Hoje' : language === 'es' ? 'Casos Asignados Hoy' : "Today's Field Orders Queue"}</h4>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
            {myAssignedTickets.map(order => (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedTicket(order);
                  setIsCheckedIn(false);
                  setCheckInLocation(null);
                  setIsCompleted(false);
                  setDeviceSerialDeployed('');
                }}
                className={`border rounded-xl p-3 cursor-pointer hover:border-blue-200 transition ${
                  selectedTicket?.id === order.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[155px]">{order.subject}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                    order.priority === 'critical' ? 'bg-red-50 text-red-650' : 'bg-rose-50 text-rose-650'
                  }`}>
                    {order.priority}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Client: {order.customerName}</p>
              </div>
            ))}
            
            {myAssignedTickets.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No orders assigned to you today. Enjoy the sunset! 🌅
              </div>
            )}
          </div>
        </div>

        {/* Selected Order Execution Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTicket ? (
            <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm text-left space-y-4 animate-slideIn">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-500 font-mono block">{language === 'pt' ? 'Atividade de Deslocamento Ativa' : language === 'es' ? 'Tarea de Despacho Activa' : 'Active Dispatch Task'}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Holder: {selectedTicket.customerName}</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-50 text-slate-550 border border-slate-150 px-2.5 py-0.5 rounded font-bold uppercase">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Step 1: Geolocation check-in */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" /> {language === 'pt' ? 'Passo 1: Fazer Check-In Físico no Endereço do Cliente' : language === 'es' ? 'Paso 1: Realizar Check-In Físico en la Dirección del Cliente' : 'Step 1: Physical Check-In on Client Address'}
                </span>
                
                {isCheckedIn ? (
                  <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-150 rounded-xl text-xs flex items-center gap-1.5 font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Logged GPS bounds: {checkInLocation}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="w-full text-center text-xs py-2.5 bg-blue-600 hover:bg-blue-505 text-white rounded-xl shadow cursor-pointer font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-4 h-4" /> {language === 'pt' ? 'Validar Localização e Confirmar Presença' : language === 'es' ? 'Validar Ubicación y Confirmar Presencia' : 'Verify Coordinates & Handshake Check-In'}
                  </button>
                )}
              </div>

              {/* Step 2: installation Serial deployment */}
              {isCheckedIn && (
                <div className="space-y-3.5 border-t border-slate-100 pt-3 animate-slideIn">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                    <Clipboard className="w-4 h-4 text-blue-600" /> {language === 'pt' ? 'Passo 2: Provisionar Serial do Equipamento ONU' : language === 'es' ? 'Paso 2: Provisionar Serial del Equipo ONU' : 'Step 2: Provision Equipment serial numbers'}
                  </span>

                  {isCompleted ? (
                    <div className="p-3 bg-blue-50 text-blue-900 border border-blue-150 rounded-xl text-xs flex flex-col gap-1 inline font-mono">
                      <span className="font-bold text-blue-950 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" /> {language === 'pt' ? 'Vinculação de Hardware Concluída!' : language === 'es' ? '¡Vinculación de Hardware Finalizada!' : 'Hardware Binding Completed!'}
                      </span>
                      <span>Customer Router Serial Bound: {deviceSerialDeployed}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleFinishDeployment} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">{language === 'pt' ? 'Código MAC / Serial da ONU *' : language === 'es' ? 'Código MAC / Serial de la ONU *' : 'ONU Modem Serial / MAC Code *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="FH11AA22BB33"
                            value={deviceSerialDeployed}
                            onChange={(e) => setDeviceSerialDeployed(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">{language === 'pt' ? 'Atenuação Óptica Medida (dBm)' : language === 'es' ? 'Atenuación Óptica Medida (dBm)' : 'Optical Attenuation Test (dBm)'}</label>
                          <input
                            type="text"
                            placeholder="-19.4 dBm (Normal)"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl cursor-pointer"
                      >
                        {language === 'pt' ? 'Confirmar Registro do Equipamento' : language === 'es' ? 'Confirmar Registro del Equipo' : 'Confirm Equipment Registration'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Step 3: Draw signature canvas and save */}
              {isCompleted && (
                <div className="space-y-2 border-t border-slate-100 pt-3 animate-slideIn">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1 mb-1">
                    <Signature className="w-4 h-4 text-blue-600" /> {language === 'pt' ? 'Passo 3: Coletar Assinatura Digital do Cliente' : language === 'es' ? 'Paso 3: Recolectar Firma Digital del Cliente' : 'Step 3: Collect Client Digital Signature'}
                  </span>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-2">
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 bg-white cursor-crosshair border border-slate-100 rounded-lg"
                    />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-450 italic">{language === 'pt' ? 'Assine diretamente dentro do box quadrado branco.' : language === 'es' ? 'Firme directamente dentro de la caja blanca.' : 'Draw directly inside the white box above.'}</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition cursor-pointer"
                        >
                          {language === 'pt' ? 'Limpar tela' : language === 'es' ? 'Limpiar pantalla' : 'Clear canvas'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            alert(language === 'pt' ? 'Assinatura registrada! Ordem de serviço encerrada.' : language === 'es' ? '¡Firma guardada! Orden de servicio cerrada.' : 'Signature saved to system. Order closed successfully!');
                            setSelectedTicket(null);
                          }}
                          className="px-3 py-1 text-[10px] bg-emerald-600 font-bold text-white rounded hover:bg-emerald-500 transition cursor-pointer"
                        >
                          {language === 'pt' ? 'Salvar e Finalizar Chamado' : language === 'es' ? 'Guardar y Cerrar Caso' : 'Save & Settle Ticket'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-3 h-[420px]">
              <AlertTriangle className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-550">{language === 'pt' ? 'Escolha um chamado' : language === 'es' ? 'Seleccione una orden' : 'No Order Selected'}</p>
              <p className="text-[11px] max-w-sm">
                {language === 'pt' 
                  ? 'Por favor, selecione uma ordem de serviço de campo na lista à esquerda para verificar rotas, fazer o check-in GPS e registrar a ONU do cliente.'
                  : language === 'es'
                  ? 'Por favor seleccione una orden de servicio en la lista izquierda para verificar direcciones, validar coordenadas GPS y registrar el módem ONU.'
                  : 'Please select an assigned field service ticket from the scheduler list on the left to verify maps, verify current GPS check-ins, or register customer ONU equipment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
