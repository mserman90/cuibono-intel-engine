import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export const FullscreenToggle = ({ targetId }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = () => {
    const elem = document.getElementById(targetId);
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded text-xs font-mono text-gray-300 hover:text-white transition-colors"
      title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
    >
      {isFullscreen ? (
        <>
          <Minimize2 size={12} />
          <span>Küçült</span>
        </>
      ) : (
        <>
          <Maximize2 size={12} />
          <span>Tam Ekran</span>
        </>
      )}
    </button>
  );
};
