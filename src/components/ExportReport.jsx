import React, { useRef } from 'react';
import { useOsint } from '../context/OsintContext';
import { Download, Upload, Printer, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { Tooltip, InfoTooltip } from './Tooltip';

export const ExportReport = () => {
  const { caseData, exportCaseToJson, importCaseFromJson } = useOsint();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importCaseFromJson(content);
        if (result.success) {
          alert('Vaka başarıyla içe aktarıldı.');
        } else {
          alert(`Hata: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyMarkdownSummary = () => {
    const event = caseData.event || {};
    const actors = caseData.actors || [];
    const netScores = caseData.matrix?.calculatedNetScores || {};

    let md = `# Cui Bono İstihbarat Raporu: ${event.title || 'Başlıksız Vaka'}\n\n`;
    md += `**Tarih:** ${event.incidentDate || 'Belirtilmemiş'}\n`;
    md += `**Özet:** ${event.summary || 'Özet yok.'}\n\n`;
    md += `## Aktör Çıkar Sıralaması (En Olası Yararlananlar)\n\n`;
    actors.forEach((a, idx) => {
      md += `${idx + 1}. **${a.name}** (${a.role || 'Rol yok'}) - Net Skor: ${netScores[a.id] || 0}\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      alert('Markdown formatındaki özet rapor panoya kopyalandı.');
    });
  };

  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-lg p-5 space-y-4 shadow-lg print:border-none print:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <Download className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#09</span> Raporlama, Dışa & İçe Aktarım
            <InfoTooltip text="Vaka verilerini şemalı JSON olarak yedekleyin, başka bir cihazdan geri yükleyin veya PDF/Markdown rapor çıktısı alın." />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Analiz sonuçlarını JSON formatında yedekleyin, içe aktarın veya yazdırma / PDF formatına dönüştürün.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 pt-1">
        <Tooltip content="Mevcut analizi ve çıkar sıralamasını resmi yazdırma veya PDF olarak kaydeder.">
          <button
            onClick={() => window.print()}
            className="bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} /> PDF / Sayfayı Yazdır
          </button>
        </Tooltip>

        <Tooltip content="Tüm aktörleri, matrisi, kanıtları ve OSINT düğümlerini .cuibono.json dosyası olarak indirir.">
          <button
            onClick={exportCaseToJson}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> .cuibono.json İndir
          </button>
        </Tooltip>

        <Tooltip content="Önceden indirilmiş bir .cuibono.json dosyasını yükleyerek analize kaldığınız yerden devam edin.">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-cyber-bg hover:bg-cyber-border text-gray-200 border border-cyber-border font-mono font-semibold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors"
          >
            <Upload size={14} /> Vaka JSON İçe Aktar
          </button>
        </Tooltip>

        <Tooltip content="Analiz özetini ve aktör sıralamasını panoya kopyalar (Notion, Obsidian veya mesajlaşma için).">
          <button
            onClick={copyMarkdownSummary}
            className="bg-cyber-bg hover:bg-cyber-border text-gray-200 border border-cyber-border font-mono font-semibold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors"
          >
            <FileCode size={14} /> Markdown Olarak Kopyala
          </button>
        </Tooltip>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,.cuibono.json"
          className="hidden"
        />
      </div>
    </div>
  );
};
