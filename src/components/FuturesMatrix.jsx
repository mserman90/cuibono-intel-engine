import React, { useState } from 'react';
import { Compass } from 'lucide-react';

export const FuturesMatrix = () => {
  const [factorA, setFactorA] = useState('Siber Saldırı Yoğunluğu');
  const [factorB, setFactorB] = useState('Uluslararası Regülasyon Baskısı');

  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Compass className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#06</span> Alternatif Gelecekler Matrisi (Futures Matrix)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            İki temel belirsizlik ekseni belirleyerek 4 farklı olası senaryo kadranı oluşturun.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono text-gray-400 block mb-1">
            Yatay Eksen (X Faktörü):
          </label>
          <input
            type="text"
            value={factorA}
            onChange={(e) => setFactorA(e.target.value)}
            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono text-gray-400 block mb-1">
            Dikey Eksen (Y Faktörü):
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
        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-1">
          <div className="text-xs font-mono font-bold text-cyber-accent">
            Kadran I: Yüksek {factorA} & Yüksek {factorB}
          </div>
          <p className="text-[11px] text-gray-300">
            Aktörler yoğun siber yıpratma savaşı yürütürken ağır yaptırım ve regülatif izolasyon ile karşılaşırlar.
          </p>
        </div>

        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-1">
          <div className="text-xs font-mono font-bold text-cyber-warning">
            Kadran II: Düşük {factorA} & Yüksek {factorB}
          </div>
          <p className="text-[11px] text-gray-300">
            Diplomatik ve ekonomik yaptırımlar egemen olur; aktörler doğrudan eylemler yerine örtülü ve proxy yöntemleri tercih eder.
          </p>
        </div>

        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-1">
          <div className="text-xs font-mono font-bold text-gray-400">
            Kadran III: Düşük {factorA} & Düşük {factorB}
          </div>
          <p className="text-[11px] text-gray-300">
            Statüko korunur veya dondurulmuş çatışma evresine geçilir; istihbari faaliyetler düşük yoğunluklu istihbarat toplama ile sınırlı kalır.
          </p>
        </div>

        <div className="bg-cyber-bg p-3.5 rounded border border-cyber-border/70 space-y-1">
          <div className="text-xs font-mono font-bold text-cyber-winner">
            Kadran IV: Yüksek {factorA} & Düşük {factorB}
          </div>
          <p className="text-[11px] text-gray-300">
            Hukuki ve uluslararası denetimin olmadığı serbest bir dijital gri alan; aktörlerin maksimum kazanım sağladığı vahşi dönem.
          </p>
        </div>
      </div>
    </div>
  );
};
