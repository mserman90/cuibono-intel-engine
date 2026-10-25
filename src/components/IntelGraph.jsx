import React, { useState, useEffect } from 'react';
import { useOsint } from '../context/OsintContext';
import { FullscreenToggle } from './FullscreenToggle';
import { getAllCustomIconsFromIndexedDB, saveCustomIconToIndexedDB } from '../services/db';
import { Network, Plus, Trash2, Share2, Globe, Key, Car, AtSign } from 'lucide-react';

export const IntelGraph = () => {
  const { caseData, isDataAvailable, addOsintEntity, removeOsintEntity } = useOsint();
  const [linkedActorId, setLinkedActorId] = useState('');
  const [category, setCategory] = useState('SOCIAL_MEDIA');
  const [label, setLabel] = useState('');
  const [customIcons, setCustomIcons] = useState([]);
  const [selectedIconUrl, setSelectedIconUrl] = useState('');

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
        return <AtSign size={14} className="text-sky-400" />;
      case 'CRYPTO_WALLET':
        return <Key size={14} className="text-amber-400" />;
      case 'VEHICLE':
        return <Car size={14} className="text-emerald-400" />;
      case 'DOMAIN_IP':
        return <Globe size={14} className="text-purple-400" />;
      default:
        return <Share2 size={14} className="text-gray-400" />;
    }
  };

  if (!isDataAvailable || !caseData.event || !caseData.actors || caseData.actors.length === 0) {
    return null;
  }

  return (
    <div id="intel-graph-wrapper" className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Network className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#04</span> Çıkar Ağ Grafiği & OSINT Varlıkları
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Aktörlerle ilişkili OSINT düğümlerini (sosyal medya, kripto hesapları, IP/domain) ilişkilendirin.</p>
        </div>
        <FullscreenToggle targetId="intel-graph-wrapper" />
      </div>

      <form onSubmit={handleAddEntity} className="bg-cyber-bg p-3.5 rounded border border-cyber-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        <select
          value={linkedActorId || caseData.actors[0]?.id || ''}
          onChange={(e) => setLinkedActorId(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
        >
          {caseData.actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-cyber-accent font-mono focus:border-cyber-accent focus:outline-none"
        >
          <option value="SOCIAL_MEDIA">Sosyal Medya Hesabı</option>
          <option value="CRYPTO_WALLET">Kripto Cüzdan Adresi</option>
          <option value="VEHICLE">Araç / Plaka / Varlık</option>
          <option value="DOMAIN_IP">Domain / IP / Sunucu</option>
        </select>

        <input
          type="text"
          placeholder="Tanımlayıcı Etiket / Değer"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
        />

        <button
          type="submit"
          className="bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} /> OSINT Düğüm Ekle
        </button>
      </form>

      <div className="space-y-3">
        <h4 className="text-xs font-mono text-gray-300">Aktör Bazında Bağlantılı Varlıklar:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {caseData.actors.map((actor) => {
            const entities = (caseData.osintEntities || []).filter(
              (ent) => ent.linkedActorId === actor.id
            );
            return (
              <div key={actor.id} className="bg-cyber-bg/80 border border-cyber-border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center border-b border-cyber-border pb-1.5">
                  <span className="font-mono font-bold text-xs text-white">{actor.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{entities.length} varlık</span>
                </div>
                {entities.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">Bağlantılı OSINT verisi yok.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {entities.map((ent) => (
                      <span
                        key={ent.id}
                        className="inline-flex items-center gap-1.5 bg-cyber-panel border border-cyber-border px-2 py-1 rounded text-[11px] font-mono text-gray-200"
                      >
                        {getCategoryIcon(ent.category)}
                        <span className="truncate max-w-[130px]" title={ent.label}>
                          {ent.label}
                        </span>
                        <button
                          onClick={() => removeOsintEntity(ent.id)}
                          className="text-red-400 hover:text-red-300 ml-1"
                          title="Sil"
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
    </div>
  );
};
