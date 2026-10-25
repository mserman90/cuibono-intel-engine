import React, { useState, useEffect } from 'react';
import { useOsint } from './context/OsintContext';
import { IncentiveMatrix } from './components/IncentiveMatrix';
import { IntelGraph } from './components/IntelGraph';
import { GeminiHypothesisAssistant } from './components/GeminiHypothesisAssistant';
import { FuturesMatrix } from './components/FuturesMatrix';
import { GeointMap } from './components/GeointMap';
import { TimelineAnalysis } from './components/TimelineAnalysis';
import { ExportReport } from './components/ExportReport';
import { Tooltip, InfoTooltip } from './components/Tooltip';
import { UserGuideModal } from './components/UserGuideModal';
import {
  ShieldAlert,
  UserPlus,
  FileCheck2,
  Trash2,
  RotateCcw,
  Plus,
  Tag,
  Calendar,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const {
    caseData,
    setEventDetails,
    addActor,
    removeActor,
    addEvidence,
    removeEvidence,
    resetCase,
  } = useOsint();

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [actorName, setActorName] = useState('');
  const [actorRole, setActorRole] = useState('DIRECT_WINNER');

  // Evidence state
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evSourceType, setEvSourceType] = useState('URL');
  const [evRef, setEvRef] = useState('');
  const [evAttribution, setEvAttribution] = useState(4);
  const [evCredentials, setEvCredentials] = useState(4);
  const [evObjectivity, setEvObjectivity] = useState(4);
  const [evVerifiability, setEvVerifiability] = useState(4);

  // Sync state if caseData already has event info
  useEffect(() => {
    if (caseData.event) {
      if (caseData.event.title) setTitle(caseData.event.title);
      if (caseData.event.summary) setSummary(caseData.event.summary);
      if (caseData.event.incidentDate) setIncidentDate(caseData.event.incidentDate);
    }
  }, [caseData.event]);

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setEventDetails({
      title: title.trim(),
      summary: summary.trim(),
      incidentDate,
      categoryTags: ['OSINT', 'CuiBono'],
    });
  };

  const handleAddActor = (e) => {
    e.preventDefault();
    if (!actorName.trim()) return;
    addActor({
      name: actorName.trim(),
      role: actorRole,
      resourceCapacity: 8,
      devilsAdvocacyNotes: [],
    });
    setActorName('');
  };

  const handleAddEvidence = (e) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    addEvidence(
      {
        title: evTitle.trim(),
        description: evDesc.trim(),
        sourceType: evSourceType,
        referenceUrlOrHash: evRef.trim() || 'N/A',
        timestamp: new Date().toISOString(),
      },
      {
        attribution: Number(evAttribution),
        credentials: Number(evCredentials),
        objectivity: Number(evObjectivity),
        verifiability: Number(evVerifiability),
      }
    );
    setEvTitle('');
    setEvDesc('');
    setEvRef('');
  };

  const handleConfirmReset = () => {
    if (window.confirm('Mevcut vaka verileri silinecek ve sıfırlanacaktır. Emin misiniz?')) {
      resetCase();
      setTitle('');
      setSummary('');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* User Guide Modal */}
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Top Navigation / Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyber-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-cyber-accent/10 border border-cyber-accent rounded text-cyber-accent">
              <ShieldAlert size={22} />
            </span>
            <Tooltip content="'Cui bono?' (Kimin Çıkarına?): Bir kriz veya saldırıdan kimin kazanç sağladığını matematiksel ve yapılandırılmış yöntemlerle (SATs) tespit eden analitik karar destek platformu.">
              <h1 className="text-2xl font-mono font-bold tracking-tight text-white cursor-help flex items-center gap-1.5">
                CuiBono-IntelEngine <span className="text-xs text-cyber-accent font-normal border border-cyber-accent/40 px-1.5 py-0.5 rounded">v1.0-PRO</span>
              </h1>
            </Tooltip>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            İstemci Tarafı OSINT, Çıkar Analizi (Cui Bono) & SATs Hipotez Matris Platformu
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Tooltip content="Adım adım analiz metodolojisi, SATs formülleri ve kullanım kılavuzunu açar.">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 bg-cyber-accent hover:bg-cyan-400 text-black text-xs px-3.5 py-1.5 rounded font-mono font-bold transition-all shadow-md hover:shadow-cyan-500/20"
            >
              <BookOpen size={14} /> Analiz Kılavuzu & Rehber
            </button>
          </Tooltip>

          <Tooltip content="Tarayıcının yerel IndexedDB veritabanındaki vaka verilerini sıfırlar ve yeni temiz vaka açar.">
            <button
              onClick={handleConfirmReset}
              className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs px-3 py-1.5 rounded font-mono transition-colors"
            >
              <RotateCcw size={13} /> Sıfırla
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top 3 Input Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Olay Tanımlama */}
          <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-sm text-cyber-accent flex items-center gap-1.5">
                <Tag size={16} /> Modül 1: Olay Tanımlama
                <InfoTooltip text="İncelenen vakanın adı, tarihi ve genel etki alanını tanımlayarak analizin kapsamını belirleyin." />
              </h3>
              {caseData.event && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                  Kaydedildi ✓
                </span>
              )}
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Olay Başlığı
                  <InfoTooltip text="Örn: 'Kritik Boru Hattı Sabotajı' veya 'Bankacılık Sektörü Fidye Saldırısı'." />
                </label>
                <input
                  type="text"
                  placeholder="örn: Kritik Altyapı Siber Sabotajı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Olay Tarihi
                  <InfoTooltip text="Olayın başladığı veya saptandığı tarih. Zaman çizelgesinde referans alınır." />
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Olay Özeti
                  <InfoTooltip text="Olayın operasyonel bağlamı, hedef varlık ve ilk tespit edilen etkiler." />
                </label>
                <textarea
                  rows={2}
                  placeholder="Olayın kapsamı, gerçekleştiği bağlam ve etkileri..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <Tooltip content="Olay detaylarını IndexedDB yerel veritabanına kaydeder veya günceller." className="w-full">
                <button
                  type="submit"
                  className="w-full bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs py-2 rounded transition-colors"
                >
                  Olayı Kaydet / Güncelle
                </button>
              </Tooltip>
            </form>
          </div>

          {/* Module 2: Aktör Tanımlama */}
          <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-3.5 shadow-lg">
            <h3 className="font-mono font-bold text-sm text-cyber-accent flex items-center gap-1.5">
              <UserPlus size={16} /> Modül 2: Aktör Yönetimi
              <InfoTooltip text="Olaydan fayda veya zarar görebilecek tüm devlet, tehdit grubu, şirket veya konsorsiyumları ekleyin." />
            </h3>

            <form onSubmit={handleAddActor} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Aktör / Organizasyon Adı
                  <InfoTooltip text="Örn: 'APT28', 'Global Enerji Şirketi X', 'Devlet Y İstihbaratı'." />
                </label>
                <input
                  type="text"
                  placeholder="örn: APT29, Enerji Konsorsiyumu X"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Başlangıç Hipotez Rolü
                  <InfoTooltip text="Aktörün olaydaki varsayılan stratejik pozisyonu. Çıkar analiziyle bu rol test edilir." />
                </label>
                <select
                  value={actorRole}
                  onChange={(e) => setActorRole(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
                >
                  <option value="DIRECT_WINNER">Doğrudan Çıkar Sağlayan (Direct Winner)</option>
                  <option value="OPPORTUNIST">Fırsatçı / İkincil Yararlanan (Opportunist)</option>
                  <option value="COLLATERAL_BENEFICIARY">Dolaylı Kazanan (Collateral Beneficiary)</option>
                  <option value="ACCUSED_CULPRIT">İsnat Edilen Fail (Accused Culprit)</option>
                </select>
              </div>

              <Tooltip content="Yeni aktörü çıkar matrisine ve ağ grafiğine dahil eder." className="w-full">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs py-2 rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Aktör Ekle
                </button>
              </Tooltip>
            </form>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
              {caseData.actors.length === 0 ? (
                <p className="text-[11px] text-gray-500 italic">Henüz aktör eklenmedi.</p>
              ) : (
                caseData.actors.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center text-xs bg-cyber-bg px-2.5 py-1.5 rounded border border-cyber-border/60"
                  >
                    <div>
                      <span className="font-mono font-semibold text-white">{a.name}</span>
                      <span className="text-[10px] text-gray-400 block">{a.role}</span>
                    </div>
                    <Tooltip content="Aktörü ve bağlı matris skorlarını kaldır">
                      <button
                        onClick={() => removeActor(a.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </Tooltip>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Module: Kanıt Ekle (SATs Çarpanlı) */}
          <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-3.5 shadow-lg">
            <h3 className="font-mono font-bold text-sm text-cyber-accent flex items-center gap-1.5">
              <FileCheck2 size={16} /> İstihbarat Kanıtı & SATs Değerlendirmesi
              <InfoTooltip text="Açık kaynak istihbaratını (OSINT) 4 SATs kriterine göre tartarak 0.10 - 1.00 arası güvenilirlik çarpanı üretin." />
            </h3>

            <form onSubmit={handleAddEvidence} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-mono text-gray-400 flex items-center gap-1 mb-1">
                  Kanıt Başlığı
                  <InfoTooltip text="Belirlenen bulgunun adı (Örn: 'Borsa Açığa Satış Kayıtları', 'C2 Sunucu Trafiği')." />
                </label>
                <input
                  type="text"
                  placeholder="örn: Borsa Açığa Satış Raporu"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 block mb-0.5">Kaynak Tipi</label>
                  <select
                    value={evSourceType}
                    onChange={(e) => setEvSourceType(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded px-2 py-1 text-xs text-white focus:border-cyber-accent focus:outline-none font-mono"
                  >
                    <option value="URL">Açık Web / URL</option>
                    <option value="FININT">Finansal Rapor (FININT)</option>
                    <option value="SIGINT">Sinyal / Ağ İzi (SIGINT)</option>
                    <option value="DOCUMENT">Sızdırılan Belge</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-400 block mb-0.5">Referans / Hash</label>
                  <input
                    type="text"
                    placeholder="URL veya SHA256"
                    value={evRef}
                    onChange={(e) => setEvRef(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded px-2 py-1 text-xs text-white font-mono focus:border-cyber-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* SATs Metrics */}
              <div className="bg-cyber-bg p-2 rounded border border-cyber-border/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyber-accent font-semibold flex items-center gap-1">
                    SATs Güvenilirlik Puanlaması (1-5)
                    <InfoTooltip text="Formül: (Aidiyet + Yetkinlik + Nesnellik + Doğruluk) / 20. Matris puanları bu çarpanla tartılarak dezenformasyon engellenir." />
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                  <div>
                    <Tooltip content="Aidiyet (Attribution): Bilginin kaynağı ve aktörle bağlantısı ne kadar net?">
                      <label className="text-gray-400 block cursor-help">Aidiyet</label>
                    </Tooltip>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evAttribution}
                      onChange={(e) => setEvAttribution(e.target.value)}
                      className="w-full bg-cyber-panel border border-cyber-border rounded text-center text-white"
                    />
                  </div>
                  <div>
                    <Tooltip content="Yetkinlik (Credentials): Bilgiyi sunan analist veya kaynağın teknik uzmanlığı?">
                      <label className="text-gray-400 block cursor-help">Yetkinlik</label>
                    </Tooltip>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evCredentials}
                      onChange={(e) => setEvCredentials(e.target.value)}
                      className="w-full bg-cyber-panel border border-cyber-border rounded text-center text-white"
                    />
                  </div>
                  <div>
                    <Tooltip content="Nesnellik (Objectivity): Kaynağın tarafsızlığı; manipülasyon veya algı operasyonu riski?">
                      <label className="text-gray-400 block cursor-help">Nesnellik</label>
                    </Tooltip>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evObjectivity}
                      onChange={(e) => setEvObjectivity(e.target.value)}
                      className="w-full bg-cyber-panel border border-cyber-border rounded text-center text-white"
                    />
                  </div>
                  <div>
                    <Tooltip content="Doğrulanabilirlik (Verifiability): Bilgi harici bağımsız kaynaklarla teyit edildi mi?">
                      <label className="text-gray-400 block cursor-help">Doğruluk</label>
                    </Tooltip>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evVerifiability}
                      onChange={(e) => setEvVerifiability(e.target.value)}
                      className="w-full bg-cyber-panel border border-cyber-border rounded text-center text-white"
                    />
                  </div>
                </div>
              </div>

              <Tooltip content="Kanıtı ağırlıklı katsayısıyla sisteme kaydeder." className="w-full">
                <button
                  type="submit"
                  className="w-full bg-cyber-accent/90 hover:bg-cyber-accent text-black font-mono font-bold text-xs py-2 rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Kanıt Ekle
                </button>
              </Tooltip>
            </form>

            <div className="space-y-1 max-h-24 overflow-y-auto">
              {(caseData.evidences || []).map((ev) => (
                <div
                  key={ev.id}
                  className="flex justify-between items-center text-[11px] bg-cyber-bg px-2 py-1 rounded border border-cyber-border/40 font-mono"
                >
                  <Tooltip content={`Kaynak: ${ev.sourceType} | Güvenilirlik Katsayısı: ${ev.reliabilityMultiplier}`}>
                    <span className="truncate max-w-[170px] cursor-help" title={ev.title}>
                      {ev.title} (x{ev.reliabilityMultiplier})
                    </span>
                  </Tooltip>
                  <button
                    onClick={() => removeEvidence(ev.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Kanıtı Sil"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modules 5 to 9 */}
        <GeminiHypothesisAssistant />
        <IncentiveMatrix />
        <IntelGraph />
        <FuturesMatrix />
        <GeointMap />
        <TimelineAnalysis />
        <ExportReport />
      </main>

      <footer className="max-w-7xl mx-auto border-t border-cyber-border pt-4 text-center text-xs font-mono text-gray-500">
        CuiBono-IntelEngine &bull; Tüm analizler istemci tarafında yerel IndexedDB ile saklanır &bull; Yapılandırılmış İstihbarat Analiz Platformu
      </footer>
    </div>
  );
}
