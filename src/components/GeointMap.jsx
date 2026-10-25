import React, { useEffect, useRef, useState } from 'react';
import { FullscreenToggle } from './FullscreenToggle';
import { MapPin, Plus, Navigation, Crosshair } from 'lucide-react';
import L from 'leaflet';

export const GeointMap = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [markers, setMarkers] = useState([
    { id: 1, lat: 41.0082, lng: 28.9784, title: 'İstanbul (Operasyon Merkezi)', type: 'HQ' },
    { id: 2, lat: 39.9334, lng: 32.8597, title: 'Ankara (Bürokratik Düğüm)', type: 'NODE' },
    { id: 3, lat: 50.4501, lng: 30.5234, title: 'Kiev (Siber Hedef)', type: 'TARGET' },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newType, setNewType] = useState('NODE');

  // SVG tabanlı güvenilir DivIcon (Vite asset 404 sorunlarını önler)
  const createCyberIcon = (type) => {
    let color = '#06b6d4'; // default cyber-accent
    if (type === 'HQ') color = '#10b981'; // winner/green
    if (type === 'TARGET') color = '#ef4444'; // loser/red
    if (type === 'MANUAL') color = '#f59e0b'; // warning/amber

    return L.divIcon({
      className: 'cyber-map-pin',
      html: `
        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}; opacity:0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:24px; height:24px; background:#111827; border:2px solid ${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px ${color};">
            <div style="width:8px; height:8px; background:${color}; border-radius:50%;"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
    }).setView([41.0082, 28.9784], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    // Harita tıklamasıyla koordinat alma
    map.on('click', (e) => {
      setNewLat(e.latlng.lat.toFixed(5));
      setNewLng(e.latlng.lng.toFixed(5));
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Marker listesi değiştikçe haritada güncelleme
  useEffect(() => {
    if (!layerGroupRef.current || !mapRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    markers.forEach((m) => {
      const icon = createCyberIcon(m.type);
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #111;">
          <strong style="color: #06b6d4;">${m.title}</strong><br/>
          <span style="font-size: 10px; color: #666;">Tip: ${m.type}</span><br/>
          <span style="font-size: 10px; color: #888;">[${m.lat}, ${m.lng}]</span>
        </div>
      `);
    });
  }, [markers]);

  const handleAddMarker = (e) => {
    e.preventDefault();
    const latNum = parseFloat(newLat);
    const lngNum = parseFloat(newLng);
    if (!newTitle.trim() || isNaN(latNum) || isNaN(lngNum)) return;

    const newM = {
      id: Date.now(),
      lat: latNum,
      lng: lngNum,
      title: newTitle.trim(),
      type: newType,
    };
    setMarkers((prev) => [...prev, newM]);
    setNewTitle('');
    setNewLat('');
    setNewLng('');

    if (mapRef.current) {
      mapRef.current.setView([latNum, lngNum], 7);
    }
  };

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div id="geoint-map-wrapper" className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <MapPin className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#07</span> Coğrafi İstihbarat (GEOINT) Haritası
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Olay mahalleri, veri merkezleri ve operasyon üslerini haritada konumlandırın. (Haritaya tıklayarak koordinat seçebilirsiniz).
          </p>
        </div>
        <FullscreenToggle targetId="geoint-map-wrapper" />
      </div>

      <form onSubmit={handleAddMarker} className="bg-cyber-bg p-3.5 rounded border border-cyber-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        <input
          type="text"
          placeholder="Lokasyon / Hedef Adı"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-cyber-accent font-mono focus:border-cyber-accent focus:outline-none"
        >
          <option value="NODE">Düğüm / Tesis (NODE)</option>
          <option value="HQ">Komuta Merkezi (HQ)</option>
          <option value="TARGET">Siber / Fiziksel Hedef (TARGET)</option>
          <option value="MANUAL">Özel Nokta (MANUAL)</option>
        </select>
        <input
          type="text"
          placeholder="Enlem (Lat)"
          value={newLat}
          onChange={(e) => setNewLat(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white font-mono focus:border-cyber-accent focus:outline-none"
        />
        <input
          type="text"
          placeholder="Boylam (Lng)"
          value={newLng}
          onChange={(e) => setNewLng(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white font-mono focus:border-cyber-accent focus:outline-none"
        />
        <button
          type="submit"
          className="bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} /> Nokta Ekle
        </button>
      </form>

      <div
        className="h-[420px] w-full rounded border border-cyber-border relative z-0 overflow-hidden"
        ref={containerRef}
      />

      {/* Marker list pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {markers.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 bg-cyber-bg border border-cyber-border px-2.5 py-1 rounded text-xs font-mono text-gray-300"
          >
            <Crosshair size={12} className="text-cyber-accent" />
            <span>{m.title}</span>
            <span className="text-[10px] text-gray-500">[{m.type}]</span>
            <button
              type="button"
              onClick={() => removeMarker(m.id)}
              className="text-red-400 hover:text-red-300 ml-1 text-xs"
              title="Sil"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
