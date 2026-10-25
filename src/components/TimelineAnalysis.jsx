import React from 'react';
import { useOsint } from '../context/OsintContext';
import { Clock, Calendar, FileText } from 'lucide-react';
import { Tooltip, InfoTooltip } from './Tooltip';

export const TimelineAnalysis = () => {
  const { caseData } = useOsint();

  const events = [];

  if (caseData.event && caseData.event.incidentDate) {
    events.push({
      id: 'event_main',
      date: caseData.event.incidentDate,
      title: caseData.event.title,
      desc: caseData.event.summary,
      type: 'INCIDENT',
    });
  }

  (caseData.evidences || []).forEach((ev) => {
    events.push({
      id: ev.id,
      date: ev.timestamp ? ev.timestamp.split('T')[0] : 'Tarih Yok',
      title: ev.title,
      desc: ev.description,
      type: 'EVIDENCE',
      source: ev.sourceType,
      ref: ev.referenceUrlOrHash,
    });
  });

  events.sort((a, b) => (a.date > b.date ? 1 : -1));

  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Clock className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#08</span> Zaman Çizelgesi & Olay Kronolojisi
            <InfoTooltip text="Ana güvenlik olayı ile toplanan istihbarat kanıtlarının kronolojik dikey zaman çizelgesi üzerindeki akışı." />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Olayların ve tespit edilen istihbarat kanıtlarının kronolojik akışı.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">
          Kronoloji oluşturmak için olay tarihi belirleyin ve kanıt ekleyin.
        </p>
      ) : (
        <div className="border-l-2 border-cyber-accent/60 ml-2 pl-4 space-y-4 my-2">
          {events.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-cyber-bg border-2 border-cyber-accent group-hover:bg-cyber-accent transition-colors" />

              <div className="bg-cyber-bg p-3 rounded border border-cyber-border/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyber-accent flex items-center gap-1.5">
                    <Calendar size={12} /> {item.date}
                  </span>
                  <Tooltip content={item.type === 'INCIDENT' ? 'Ana kriz / olay tarihi' : 'Tespit edilen delil veya teknik iz tarihi'}>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-help ${
                        item.type === 'INCIDENT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {item.type === 'INCIDENT' ? 'ANA OLAY' : 'KANIT / İSTİHBARAT'}
                    </span>
                  </Tooltip>
                </div>

                <div className="text-xs font-semibold text-white font-mono">{item.title}</div>
                {item.desc && <p className="text-[11px] text-gray-300 font-sans">{item.desc}</p>}
                {item.ref && (
                  <div className="text-[10px] text-gray-400 font-mono truncate" title={item.ref}>
                    Ref: {item.ref}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
