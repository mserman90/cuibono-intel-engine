import React, { useState } from 'react';
import { useOsint } from '../context/OsintContext';
import { Award, AlertCircle, Edit3, HelpCircle } from 'lucide-react';
import { Tooltip, InfoTooltip } from './Tooltip';

export const IncentiveMatrix = () => {
  const { caseData, upsertBenefitScore, getRankedActors } = useOsint();
  const [selectedCell, setSelectedCell] = useState(null);

  const CATEGORIES = [
    {
      key: 'FINANCIAL',
      label: 'Finansal (FININT)',
      desc: 'Ekonomik kazanç, varlık transferi, borsa, fonlama',
      tooltip: 'Finansal İstihbarat (FININT): Hisse senedi açığa satış, döviz dalgalanmaları, enerji kontratları ve kaynak transferlerinden sağlanan net ekonomik kar veya zarar.',
    },
    {
      key: 'GEOPOLITICAL',
      label: 'Politik / Jeopolitik',
      desc: 'Bölgesel etki, güç dengesi, seçim, rejim çıkarı',
      tooltip: 'Politik / Jeopolitik Çıkar: Bölgesel nüfuz alanı genişlemesi, seçim manipülasyonu, ittifak dengeleri ve rejim gücünün pekişmesi.',
    },
    {
      key: 'CYBER_DATA',
      label: 'Siber / Veri',
      desc: 'Fikri mülkiyet, sızdırılan veriler, casusluk avantajı',
      tooltip: 'Siber & Veri İstihbaratı: Fikri mülkiyet hırsızlığı, kritik altyapı zaafiyeti oluşturma, casusluk üstünlüğü ve veri sızıntısı kazançları.',
    },
    {
      key: 'REPUTATION',
      label: 'İtibar / Algı',
      desc: 'Dezenformasyon, algı operasyonu, caydırıcılık',
      tooltip: 'İtibar & Algı Yönetimi: Dezenformasyon başarısı, rakip aktörün küresel itibarının çökertilmesi ve caydırıcılık algısı.',
    },
  ];

  if (!caseData.actors || caseData.actors.length === 0) {
    return (
      <div className="bg-cyber-panel border border-cyber-border rounded-lg p-8 text-center my-4">
        <AlertCircle className="mx-auto text-cyber-warning mb-2" size={28} />
        <h3 className="text-base font-mono font-semibold text-gray-200">Aktör Tanımlanmadı</h3>
        <p className="text-xs text-gray-400 mt-1">Cui Bono çıkar matrisini hesaplamak için en az bir aktör ekleyin.</p>
      </div>
    );
  }

  const rankedActors = getRankedActors();
  const maxAbsScore = Math.max(1, ...rankedActors.map((i) => Math.abs(i.netScore)));

  const getCellData = (actorId, category) => {
    return (
      (caseData.matrix?.scores || []).find(
        (s) => s.actorId === actorId && s.category === category
      ) || { actorId, category, rawScore: 0, evidenceIds: [], justification: '' }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 overflow-x-auto shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <span className="text-cyber-accent">#03</span> Cui Bono Matris Motoru
              <InfoTooltip text="Aktörlerin 4 ana boyuttaki kazanç ve kayıplarını (-5 ile +5) puanlayarak ağırlıklı net çıkar skorunu hesaplar." />
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ham skorlar (-5 ile +5), kanıtların güvenilirlik çarpanları ile tartılarak net ağırlıklı skora dönüştürülür.
            </p>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-cyber-border text-xs font-mono text-gray-300">
              <th className="py-3 px-4 bg-cyber-bg/60 w-1/4">
                <span className="flex items-center gap-1">
                  Aktör
                  <InfoTooltip text="İncelenen vaka ile doğrudan veya dolaylı ilişkili taraflar." />
                </span>
              </th>
              {CATEGORIES.map((c) => (
                <th key={c.key} className="py-3 px-4 bg-cyber-bg/60">
                  <Tooltip content={c.tooltip}>
                    <div className="cursor-help flex items-center gap-1">
                      <span className="font-semibold text-white">{c.label}</span>
                      <HelpCircle size={11} className="text-cyber-accent" />
                    </div>
                  </Tooltip>
                  <div className="text-[10px] text-gray-400 font-sans font-normal truncate max-w-[150px]">{c.desc}</div>
                </th>
              ))}
              <th className="py-3 px-4 bg-cyber-bg/90 text-right font-bold text-cyber-accent">
                <Tooltip content="Formül: ∑(Ham Skor × Kanıt Güvenilirlik Çarpanı). Manipüle edilmemiş gerçekçi çıkar büyüklüğünü yansıtır.">
                  <span className="cursor-help flex items-center justify-end gap-1">
                    Ağırlıklı Net Skor
                    <HelpCircle size={11} className="text-cyber-accent" />
                  </span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border text-sm">
            {caseData.actors.map((actor) => {
              const netScore = caseData.matrix?.calculatedNetScores?.[actor.id] ?? 0;
              return (
                <tr key={actor.id} className="hover:bg-cyber-bg/40 transition-colors">
                  <td className="py-4 px-4 font-mono">
                    <div className="font-semibold text-white">{actor.name}</div>
                    <div className="text-[11px] text-gray-400">{actor.role || 'Rol belirtilmedi'}</div>
                  </td>
                  {CATEGORIES.map((cat) => {
                    const cell = getCellData(actor.id, cat.key);
                    return (
                      <td key={cat.key} className="py-3 px-4 border-l border-cyber-border/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <Tooltip content={`Ham Puan: ${cell.rawScore} (-5: Ağır Kayıp, 0: Nötr, +5: Büyük Kazanç)`}>
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded cursor-help ${
                                cell.rawScore > 0
                                  ? 'bg-emerald-950 text-cyber-winner'
                                  : cell.rawScore < 0
                                  ? 'bg-red-950 text-cyber-loser'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {cell.rawScore > 0 ? `+${cell.rawScore}` : cell.rawScore}
                            </span>
                          </Tooltip>
                          <Tooltip content="Bu puanın istihbari ve analitik gerekçesini yazın/düzenleyin">
                            <button
                              onClick={() => setSelectedCell({ actorId: actor.id, category: cat.key })}
                              className="inline-flex items-center gap-1 text-[11px] text-cyber-accent hover:underline"
                            >
                              <Edit3 size={10} />
                              {cell.justification ? 'Gerekçe (Dolu)' : 'Gerekçe Yaz'}
                            </button>
                          </Tooltip>
                        </div>
                        <Tooltip content={`Sürgüyü ayarlayın: ${cell.rawScore}`}>
                          <input
                            type="range"
                            min={-5}
                            max={5}
                            step={1}
                            value={cell.rawScore}
                            onChange={(e) =>
                              upsertBenefitScore(
                                actor.id,
                                cat.key,
                                Number(e.target.value),
                                cell.evidenceIds,
                                cell.justification
                              )
                            }
                            className="w-full accent-cyber-accent cursor-pointer"
                          />
                        </Tooltip>
                        {cell.justification && (
                          <div className="text-[10px] text-gray-400 truncate max-w-[140px] mt-0.5 italic" title={cell.justification}>
                            "{cell.justification}"
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-4 px-4 text-right font-mono font-bold text-lg border-l border-cyber-border">
                    <Tooltip content={`Toplam ağırlıklı skor: ${netScore}`}>
                      <span
                        className={`cursor-help ${
                          netScore > 0
                            ? 'text-cyber-winner'
                            : netScore < 0
                            ? 'text-cyber-loser'
                            : 'text-gray-400'
                        }`}
                      >
                        {netScore > 0 ? `+${netScore}` : netScore}
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="bg-cyber-panel border border-cyber-accent/80 rounded-lg p-5 shadow-lg animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs font-bold text-cyber-accent uppercase flex items-center gap-2">
              <Edit3 size={14} /> Hücre Analiz Gerekçesi & Metodolojik Dayanak
            </span>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded border border-cyber-border"
            >
              Kapat ✕
            </button>
          </div>
          <p className="text-xs text-gray-300 mb-2">
            Bu puanı neden verdiniz? Dayandığınız istihbari argümanı ve gerekçeyi belirtin:
          </p>
          <textarea
            rows={3}
            value={getCellData(selectedCell.actorId, selectedCell.category).justification}
            onChange={(e) => {
              const c = getCellData(selectedCell.actorId, selectedCell.category);
              upsertBenefitScore(
                selectedCell.actorId,
                selectedCell.category,
                c.rawScore,
                c.evidenceIds,
                e.target.value
              );
            }}
            className="w-full bg-cyber-bg border border-cyber-border rounded p-2.5 text-xs text-white focus:outline-none focus:border-cyber-accent font-sans"
            placeholder="İstihbari gerekçe, kaynak bağlantıları veya çıkar varsayımlarını yazın..."
          />
        </div>
      )}

      <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 shadow-lg">
        <h3 className="text-base font-mono font-bold text-white mb-4 flex items-center gap-2">
          <Award className="text-cyber-accent" size={18} /> Sıralama: En Olası Nihai Yararlananlar
          <InfoTooltip text="En yüksek pozitif puana sahip aktör, Cui Bono prensibine göre olaydan en yüksek çıkar sağlayan baş aktördür." />
        </h3>
        <div className="space-y-3">
          {rankedActors.map(({ actor, netScore }, idx) => {
            const pct = Math.min(100, Math.max(5, (Math.abs(netScore) / (maxAbsScore || 1)) * 100));
            return (
              <div key={actor.id} className="space-y-1.5 bg-cyber-bg/50 p-2.5 rounded border border-cyber-border/40">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-gray-200">
                    <span className="text-cyber-accent mr-1.5">#{idx + 1}</span> {actor.name}
                  </span>
                  <span
                    className={
                      netScore > 0
                        ? 'text-cyber-winner font-bold'
                        : netScore < 0
                        ? 'text-cyber-loser font-bold'
                        : 'text-gray-400'
                    }
                  >
                    {netScore > 0 ? `+${netScore}` : netScore} pts
                  </span>
                </div>
                <div className="w-full bg-cyber-bg h-2.5 rounded-full overflow-hidden border border-cyber-border/30">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full transition-all duration-500 ${
                      netScore > 0 ? 'bg-cyber-winner' : netScore < 0 ? 'bg-cyber-loser' : 'bg-gray-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
