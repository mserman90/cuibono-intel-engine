import React, { useState } from 'react';
import { Compass, Edit3 } from 'lucide-react';
import { Tooltip, InfoTooltip } from './Tooltip';

export const FuturesMatrix = () => {
  const [factorA, setFactorA] = useState('Siber Saldırı Yoğunluğu');
  const [factorB, setFactorB] = useState('Uluslararası Regülasyon Baskısı');

  const [scenarios, setScenarios] = useState({
    q1: 'Aktörler yoğun siber yıpratma savaşı yürütürken ağır yaptırım ve regülatif izolasyon ile karşılaşırlar.',
    q2: 'Diplomatik ve ekonomik yaptırımlar egemen olur; aktörler doğrudan eylemler yerine örtülü ve proxy yöntemleri tercih eder.',
    q3: 'Statüko korunur veya dondurulmuş çatışma evresine geçilir; istihbari faaliyetler düşük yoğunluklu izleme ile sınırlı kalır.',
    q4: 'Hukuki ve uluslararası denetimin olmadığı serbest bir dijital gri alan; aktörlerin maksimum kazanım sağladığı vahşi dönem.',
  });

  const updateScenario = (quadrant, text) => {
    setScenarios((prev) => ({ ...prev, [quadrant]: text }));
  };

  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Compass className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#06</span> Alternatif Gelecekler Matrisi (Futures Matrix)
            <InfoTooltip text="İki bağımsız temel belirsizlik faktörünü eksen alarak (X ve Y) 4 farklı stratejik gelecek senaryosu kurgulayan SATs tekniği." />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            İki temel stratejik belirsizlik ekseni belirleyerek 4 farklı olası senaryo kadranı kurgulayın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
            Yatay Eksen (X Faktörü / Birincil Belirsizlik)
            <InfoTooltip text="Olayın seyrini en çok etkileyecek birinci kritik belirsizlik parametresi (Örn: 'Siber Saldırı Şiddeti', 'Askeri Gerilim')." />
          </label>
          <input
            type="text"
            value={factorA}
            onChange={(e) => setFactorA(e.target.value)}
            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
            Dikey Eksen (Y Faktörü / İkincil Belirsizlik)
            <InfoTooltip text="Birinci faktörden bağımsız ikinci kritik parametre (Örn: 'Uluslararası Yaptırımlar', 'İttifak Dayanışması')." />
          </label>
          <input
            type="text"
            value={factorB}
            onChange={(e) => setFactorB(e.target.value)}
            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Kadran 1 */}
        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-cyber-accent">
            <Tooltip content="Her iki faktörün de en yüksek derecede gerçekleştiği senaryo.">
              <span className="cursor-help">Kadran I: Yüksek {factorA} & Yüksek {factorB}</span>
            </Tooltip>
          </div>
          <textarea
            rows={2}
            value={scenarios.q1}
            onChange={(e) => updateScenario('q1', e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border/60 rounded p-2 text-[11px] text-gray-200 focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Kadran 2 */}
        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-cyber-warning">
            <Tooltip content="Birincil faktörün düşük, ikincil faktörün yüksek olduğu senaryo.">
              <span className="cursor-help">Kadran II: Düşük {factorA} & Yüksek {factorB}</span>
            </Tooltip>
          </div>
          <textarea
            rows={2}
            value={scenarios.q2}
            onChange={(e) => updateScenario('q2', e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border/60 rounded p-2 text-[11px] text-gray-200 focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Kadran 3 */}
        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-gray-400">
            <Tooltip content="Her iki belirsizlik faktörünün de sönümlendiği statüko senaryosu.">
              <span className="cursor-help">Kadran III: Düşük {factorA} & Düşük {factorB}</span>
            </Tooltip>
          </div>
          <textarea
            rows={2}
            value={scenarios.q3}
            onChange={(e) => updateScenario('q3', e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border/60 rounded p-2 text-[11px] text-gray-200 focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Kadran 4 */}
        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-cyber-winner">
            <Tooltip content="Birincil faktörün yüksek, ikincil faktörün denetimsiz/düşük kaldığı asimetrik kazanç senaryosu.">
              <span className="cursor-help">Kadran IV: Yüksek {factorA} & Düşük {factorB}</span>
            </Tooltip>
          </div>
          <textarea
            rows={2}
            value={scenarios.q4}
            onChange={(e) => updateScenario('q4', e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border/60 rounded p-2 text-[11px] text-gray-200 focus:outline-none focus:border-cyber-accent"
          />
        </div>
      </div>
    </div>
  );
};
