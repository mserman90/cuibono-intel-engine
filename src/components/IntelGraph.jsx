import React, { useState, useEffect } from 'react';
import { useOsint } from '../context/OsintContext';
import { FullscreenToggle } from './FullscreenToggle';
import { getAllCustomIconsFromIndexedDB, saveCustomIconToIndexedDB } from '../services/db';
import { Tooltip, InfoTooltip } from './Tooltip';
import {
  Network,
  Plus,
  Share2,
  Globe,
  Key,
  Car,
  AtSign,
  Maximize2,
  Layers,
  UploadCloud,
} from 'lucide-react';

export const IntelGraph = () => {
  const { caseData, isDataAvailable, addOsintEntity, removeOsintEntity } = useOsint();
  const [linkedActorId, setLinkedActorId] = useState('');
  const [category, setCategory] = useState('SOCIAL_MEDIA');
  const [label, setLabel] = useState('');
  const [customIcons, setCustomIcons] = useState([]);
  const [selectedIconUrl, setSelectedIconUrl] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    getAllCustomIconsFromIndexedDB().then(setCustomIcons);
  }, []);

  const handleUploadIcon = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = String(ev.target?.result || '');
      if (dataUrl) {
        const id = `ico_${Date.now()}`;
        await saveCustomIconToIndexedDB(id, file.name, dataUrl);
        const updated = await getAllCustomIconsFromIndexedDB();
        setCustomIcons(updated);
        setSelectedIconUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddEntity = (e) => {
    e.preventDefault();
    const target = linkedActorId || caseData.actors?.[0]?.id;
    if (!target || !label.trim()) return;
    addOsintEntity({
      linkedActorId: target,
      category,
      label: label.trim(),
      customIconDataUrl: selectedIconUrl || undefined,
      socialData: category === 'SOCIAL_MEDIA' ? { platform: 'X/Twitter', username: label } : undefined,
    });
    setLabel('');
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'SOCIAL_MEDIA':
        return <AtSign size={13} className="text-sky-400" />;
      case 'CRYPTO_WALLET':
        return <Key size={13} className="text-amber-400" />;
      case 'VEHICLE':
        return <Car size={13} className="text-emerald-400" />;
      case 'DOMAIN_IP':
        return <Globe size={13} className="text-purple-400" />;
      default:
        return <Share2 size={13} className="text-gray-400" />;
    }
  };

  if (!isDataAvailable || !caseData.event || !caseData.actors || caseData.actors.length === 0) {
    return (
      <div className="bg-cyber-panel border border-cyber-border rounded-lg p-6 text-center my-4">
        <Network className="mx-auto text-gray-500 mb-2" size={26} />
        <h3 className="text-sm font-mono text-gray-300">Ağ Grafiği için Olay ve Aktör Ekleyiniz</h3>
      </div>
    );
  }

  const actors = caseData.actors || [];
  const entities = caseData.osintEntities || [];
  const filteredEntities =
    activeFilter === 'ALL'
      ? entities
      : entities.filter((e) => e.category === activeFilter);

  // SVG Diyagram Hesaplamaları (Görsel İlişki Ağı)
  const eventTitle = caseData.event.title || 'Vaka Olayı';
  const width = 800;
  const height = Math.max(380, actors.length * 100);
  const centerX = 160;
  const centerY = height / 2;

  return (
    <div
      id="intel-graph-wrapper"
      className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Network className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#04</span> Çıkar Ağ Grafiği & OSINT Varlık Şablonları
            <InfoTooltip text="Olay, aktörler ve bu aktörlere bağlı açık kaynak dijital varlıkları (sosyal medya, kripto cüzdan, IP, araç) arasındaki hiyerarşik bağ grafiği." />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Olay &rarr; Aktörler &rarr; OSINT Düğümleri (sosyal medya, kripto hesapları, IP/domain) hiyerarşik bağ analizi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Kategori Filtresi */}
          <div className="flex bg-cyber-bg border border-cyber-border rounded text-[11px] font-mono">
            {[
              { id: 'ALL', label: 'Tümü', tip: 'Tüm OSINT varlık kategorilerini gösterir.' },
              { id: 'SOCIAL_MEDIA', label: 'Sosyal', tip: 'X/Twitter, Telegram veya sosyal medya hesapları.' },
              { id: 'CRYPTO_WALLET', label: 'Kripto', tip: 'ETH, BTC veya fon transfer cüzdan adresleri.' },
              { id: 'VEHICLE', label: 'Varlık', tip: 'Kayıtlı araç, plaka veya lojistik varlıklar.' },
              { id: 'DOMAIN_IP', label: 'Domain', tip: 'C2 sunucuları, ASN veya IP adresleri.' },
            ].map((f) => (
              <Tooltip key={f.id} content={f.tip}>
                <button
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2 py-1 transition-colors ${
                    activeFilter === f.id
                      ? 'bg-cyber-accent text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              </Tooltip>
            ))}
          </div>
          <FullscreenToggle targetId="intel-graph-wrapper" />
        </div>
      </div>

      {/* Düğüm Ekleme Formu */}
      <form
        onSubmit={handleAddEntity}
        className="bg-cyber-bg p-3.5 rounded border border-cyber-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5"
      >
        <Tooltip content="Bu OSINT verisinin hangi aktör ile ilişkili olduğunu seçin." className="w-full">
          <select
            value={linkedActorId || actors[0]?.id || ''}
            onChange={(e) => setLinkedActorId(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none cursor-pointer"
          >
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Tooltip>

        <Tooltip content="OSINT varlığının kategorisini seçin." className="w-full">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-cyber-accent font-mono focus:border-cyber-accent focus:outline-none cursor-pointer"
          >
            <option value="SOCIAL_MEDIA">Sosyal Medya Hesabı</option>
            <option value="CRYPTO_WALLET">Kripto Cüzdan Adresi</option>
            <option value="VEHICLE">Araç / Plaka / Varlık</option>
            <option value="DOMAIN_IP">Domain / IP / Sunucu</option>
          </select>
        </Tooltip>

        <Tooltip content="Tespit edilen kullanıcı adı, cüzdan adresi, plaka veya sunucu IP adresi." className="col-span-1 md:col-span-2 w-full">
          <input
            type="text"
            placeholder="Tanımlayıcı Değer (örn: @anon, 0x4f...)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
          />
        </Tooltip>

        <Tooltip content="Yeni dijital varlığı aktörün ağ haritasına bağlar.">
          <button
            type="submit"
            className="w-full bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Düğüm Ekle
          </button>
        </Tooltip>
      </form>

      {/* Görsel İnteraktif Ağ Şeması (SVG Graph) */}
      <div className="bg-cyber-bg rounded border border-cyber-border p-3 overflow-x-auto relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[700px] h-auto select-none">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="edgeEntity" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Merkez: Olay Düğümü */}
          <g>
            <rect
              x={centerX - 90}
              y={centerY - 26}
              width={180}
              height={52}
              rx={8}
              fill="#111827"
              stroke="#06b6d4"
              strokeWidth={2}
            />
            <text
              x={centerX}
              y={centerY - 4}
              textAnchor="middle"
              fill="#06b6d4"
              fontSize={11}
              fontFamily="monospace"
              fontWeight="bold"
            >
              OLAY
            </text>
            <text
              x={centerX}
              y={centerY + 14}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={11}
              fontFamily="sans-serif"
            >
              {eventTitle.length > 20 ? eventTitle.substring(0, 18) + '...' : eventTitle}
            </text>
          </g>

          {/* Aktör Düğümleri & Bağlantıları */}
          {actors.map((actor, idx) => {
            const actorY =
              actors.length === 1
                ? centerY
                : 50 + (idx * (height - 100)) / (actors.length - 1);
            const actorX = 420;

            const actorEntities = filteredEntities.filter((e) => e.linkedActorId === actor.id);
            const netScore = caseData.matrix?.calculatedNetScores?.[actor.id] ?? 0;

            return (
              <g key={actor.id}>
                {/* Olay -> Aktör Çizgisi */}
                <path
                  d={`M ${centerX + 90} ${centerY} C ${(centerX + 90 + actorX) / 2} ${centerY}, ${
                    (centerX + 90 + actorX) / 2
                  } ${actorY}, ${actorX - 90} ${actorY}`}
                  fill="none"
                  stroke="url(#edgeGrad)"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />

                {/* Aktör Kutusu */}
                <rect
                  x={actorX - 90}
                  y={actorY - 24}
                  width={180}
                  height={48}
                  rx={6}
                  fill="#111827"
                  stroke={netScore > 0 ? '#10b981' : netScore < 0 ? '#ef4444' : '#1f2937'}
                  strokeWidth={1.5}
                />
                <text
                  x={actorX}
                  y={actorY - 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {actor.name.length > 18 ? actor.name.substring(0, 16) + '...' : actor.name}
                </text>
                <text
                  x={actorX}
                  y={actorY + 14}
                  textAnchor="middle"
                  fill={netScore > 0 ? '#10b981' : netScore < 0 ? '#ef4444' : '#9ca3af'}
                  fontSize={10}
                  fontFamily="monospace"
                >
                  Net Skor: {netScore > 0 ? `+${netScore}` : netScore} ({actorEntities.length} OSINT)
                </text>

                {/* Aktör -> OSINT Düğümleri */}
                {actorEntities.map((ent, entIdx) => {
                  const entSpacing = 36;
                  const startEntY =
                    actorY - ((actorEntities.length - 1) * entSpacing) / 2 + entIdx * entSpacing;
                  const entX = 660;

                  return (
                    <g key={ent.id}>
                      {/* Çizgi */}
                      <path
                        d={`M ${actorX + 90} ${actorY} C ${(actorX + 90 + entX) / 2} ${actorY}, ${
                          (actorX + 90 + entX) / 2
                        } ${startEntY}, ${entX - 60} ${startEntY}`}
                        fill="none"
                        stroke="url(#edgeEntity)"
                        strokeWidth={1.5}
                      />
                      {/* OSINT Düğüm Kutusu */}
                      <rect
                        x={entX - 60}
                        y={startEntY - 14}
                        width={130}
                        height={28}
                        rx={4}
                        fill="#090d16"
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      <text
                        x={entX + 5}
                        y={startEntY + 3}
                        textAnchor="middle"
                        fill="#e5e7eb"
                        fontSize={9.5}
                        fontFamily="monospace"
                      >
                        {ent.label.length > 15 ? ent.label.substring(0, 13) + '..' : ent.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Düğüm Kartları ve Detay Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actors.map((actor) => {
          const actEntities = filteredEntities.filter((ent) => ent.linkedActorId === actor.id);
          return (
            <div
              key={actor.id}
              className="bg-cyber-bg/80 border border-cyber-border rounded-lg p-3 space-y-2"
            >
              <div className="flex justify-between items-center border-b border-cyber-border pb-1.5">
                <span className="font-mono font-bold text-xs text-white">{actor.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {actEntities.length} kayıtlı varlık
                </span>
              </div>
              {actEntities.length === 0 ? (
                <p className="text-[11px] text-gray-500 italic">Bağlantılı OSINT düğümü yok.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {actEntities.map((ent) => (
                    <span
                      key={ent.id}
                      className="inline-flex items-center gap-1.5 bg-cyber-panel border border-cyber-border px-2 py-1 rounded text-[11px] font-mono text-gray-200"
                    >
                      {getCategoryIcon(ent.category)}
                      <Tooltip content={`Kategori: ${ent.category}`}>
                        <span className="truncate max-w-[130px] cursor-help" title={ent.label}>
                          {ent.label}
                        </span>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => removeOsintEntity(ent.id)}
                        className="text-red-400 hover:text-red-300 ml-1 font-bold"
                        title="Düğümü Kaldır"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
