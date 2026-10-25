import React, { useEffect, useRef, useState } from 'react';
import { FullscreenToggle } from './FullscreenToggle';
import { MapPin, Plus, Navigation } from 'lucide-react';
import L from 'leaflet';

export const GeointMap = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [markers, setMarkers] = useState([
    { id: 1, lat: 41.0082, lng: 28.9784, title: 'İstanbul (Operasyon Merkezi)', type: 'HQ' },
    { id: 2, lat: 39.9334, lng: 32.8597, title: 'Ankara (Bürokratik Düğüm)', type: 'NODE' },
    { id: 3, lat: 50.4501, lng: 30.5234, title: 'Kiev (Siber Hedef)', type: 'TARGET' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
    }).setView([41.0082, 28.9784], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // Harita tıklama ile koordinat alma
    map.on('click', (e) => {
      setNewLat(e.latlng.lat.toFixed(5));
      setNewLng(e.latlng.lng.toFixed(5));
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Marker'ları haritaya yansıtma
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Önceki markerları temizle
    const layerGroup = L.layerGroup().addTo(map);

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng]).addTo(layerGroup);
      marker.bindPopup(`<b>${m.title}</b><br/><span style="font-size:10px; color:#666;">Tip: ${m.type}</span>`);
    });

    return () => {
      map.removeLayer(layerGroup);
    };
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
      type: 'MANUAL',
    };
    setMarkers((prev) => [...prev, newM]);
    setNewTitle('');
    setNewLat('');
    setNewLng('');

    if (mapRef.current) {
      mapRef.current.setView([latNum, lngNum], 7);
    }
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
            Olay mahalleri, sunucu lokasyonları ve aktör üslerini koordinatlandırın. (Haritaya tıklayarak koordinat seçebilirsiniz)
          </p>
        </div>
        <FullscreenToggle targetId="geoint-map-wrapper" />
      </div>

      <form onSubmit={handleAddMarker} className="bg-cyber-bg p-3 rounded border border-cyber-border grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Lokasyon / Hedef Adı"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-cyber-panel border border-cyber-border rounded px-3 py-1.5 text-xs text-white focus:border-cyber-accent focus:outline-none"
        />
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
    </div>
  );
};
