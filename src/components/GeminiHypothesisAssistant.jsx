import React, { useState, useEffect } from 'react';
import { useOsint } from '../context/OsintContext';
import { analyzeOsintWithGemini } from '../services/gemini';
import { Sparkles, Key, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const GeminiHypothesisAssistant = () => {
  const { caseData, upsertBenefitScore, addOsintEntity } = useOsint();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('CUIBONO_KEY') || '');
  const [osintText, setOsintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [appliedIndices, setAppliedIndices] = useState([]);

  useEffect(() => {
    if (apiKey) localStorage.setItem('CUIBONO_KEY', apiKey);
  }, [apiKey]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    setSynthesis(null);
    setSuggestions([]);
    setAppliedIndices([]);

    try {
      const res = await analyzeOsintWithGemini(
        apiKey,
        osintText,
        caseData.event?.title || '',
        caseData.actors || []
      );
      setSynthesis(res.executiveSynthesis);
      setSuggestions(res.suggestions || []);
      if (res.extractedEntities && Array.isArray(res.extractedEntities)) {
        res.extractedEntities.forEach((ent) => addOsintEntity(ent));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Analiz sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (sug, index) => {
    upsertBenefitScore(
      sug.actorId,
      sug.category,
      sug.suggestedScore,
      [],
      sug.justification
    );
    setAppliedIndices((prev) => [...prev, index]);
  };

  const applyAllSuggestions = () => {
    suggestions.forEach((sug, i) => {
      upsertBenefitScore(
        sug.actorId,
        sug.category,
        sug.suggestedScore,
        [],
        sug.justification
      );
    });
    setAppliedIndices(suggestions.map((_, i) => i));
  };

  return (
    <div className="bg-cyber-panel border border-cyber-accent/50 rounded-lg p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <Sparkles className="text-cyber-accent" size={20} />
            <span className="text-cyber-accent">#05</span> Gemini AI Otomatik Matris & Hipotez Motoru
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ham haber, istihbarat bülteni veya sızıntı metnini yapıştırın; yapay zeka aktör çıkarlarını ve hipotezleri çıkarsın.
          </p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Google Gemini API Anahtarınız (AI Studio / Vertex AI)"
              className="w-full bg-cyber-bg border border-cyber-border rounded pl-9 pr-3 py-2 text-xs text-white font-mono focus:border-cyber-accent focus:outline-none"
            />
          </div>
        </div>

        <textarea
          rows={3}
          value={osintText}
          onChange={(e) => setOsintText(e.target.value)}
          placeholder="Ham OSINT verisini, haber metnini veya istihbarat raporunu buraya yapıştırın..."
          className="w-full bg-cyber-bg border border-cyber-border rounded p-3 text-xs text-white focus:border-cyber-accent focus:outline-none"
        />

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500 font-mono">
            Model: Gemini 2.5 Flash | Yanıtlar istemci tarafında yerel işlenir.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyber-accent hover:bg-cyan-400 text-black font-mono font-bold text-xs px-4 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                İstihbarat Analiz Ediliyor...
              </>
            ) : (
              <>
                <Send size={14} /> AI ile Analiz Et & Matrise Öner
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="p-3 bg-red-950/50 border border-red-800 rounded text-xs text-red-300 font-mono flex items-center gap-2">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {synthesis && (
        <div className="bg-cyber-bg p-4 rounded border border-cyber-border space-y-3">
          <div className="space-y-1">
            <div className="font-mono font-bold text-xs text-cyber-accent uppercase tracking-wider">
              Yönetici Analiz Sentezi:
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-sans">{synthesis}</p>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-cyber-border">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-gray-300">
                  Önerilen Çıkar Skorlamaları ({suggestions.length}):
                </span>
                <button
                  type="button"
                  onClick={applyAllSuggestions}
                  className="text-xs text-cyber-accent hover:underline font-mono"
                >
                  Tümünü Matrise Uygula
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {suggestions.map((sug, i) => {
                  const isApplied = appliedIndices.includes(i);
                  return (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row justify-between sm:items-center bg-cyber-panel p-2.5 rounded border border-cyber-border text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-semibold text-white">
                          {sug.actorName} &bull;{' '}
                          <span className="text-cyber-accent">[{sug.category}]</span> &bull;{' '}
                          <span
                            className={
                              sug.suggestedScore > 0 ? 'text-cyber-winner' : 'text-cyber-loser'
                            }
                          >
                            Skor: {sug.suggestedScore > 0 ? `+${sug.suggestedScore}` : sug.suggestedScore}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-sans">{sug.justification}</p>
                        {sug.counterHypothesis && (
                          <p className="text-[10px] text-amber-400/90 font-mono">
                            Antitez: {sug.counterHypothesis}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => applySuggestion(sug, i)}
                        disabled={isApplied}
                        className={`self-end sm:self-center px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                          isApplied
                            ? 'bg-emerald-950 text-cyber-winner border border-emerald-800'
                            : 'bg-cyber-accent hover:bg-cyan-400 text-black'
                        }`}
                      >
                        {isApplied ? 'Uygulandı ✓' : 'Uygula'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
