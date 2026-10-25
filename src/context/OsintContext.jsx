import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_EMPTY_CASE_FILE,
  loadActiveCaseFromIndexedDB,
  saveActiveCaseToIndexedDB,
  clearActiveCaseInIndexedDB,
} from '../services/db';

const OsintContext = createContext(undefined);

export function calculateReliabilityFromSATs(metrics) {
  if (!metrics) return 0.5;
  const { attribution = 3, credentials = 3, objectivity = 3, verifiability = 3 } = metrics;
  const total = attribution + credentials + objectivity + verifiability;
  return Math.min(1.0, Math.max(0.1, Number((total / 20).toFixed(2))));
}

export function computeAllNetScores(scores, evidences, actors) {
  const result = {};
  (actors || []).forEach((a) => {
    result[a.id] = 0;
  });
  (scores || []).forEach((scoreItem) => {
    if (scoreItem.rawScore === 0) return;
    const linkedEvs = (evidences || []).filter((ev) =>
      (scoreItem.evidenceIds || []).includes(ev.id)
    );
    let multiplier = 0.25;
    if (linkedEvs.length > 0) {
      multiplier =
        linkedEvs.reduce((acc, ev) => acc + (ev.reliabilityMultiplier || 0.5), 0) /
        linkedEvs.length;
    }
    const weighted = scoreItem.rawScore * multiplier;
    result[scoreItem.actorId] = Number(
      ((result[scoreItem.actorId] || 0) + weighted).toFixed(2)
    );
  });
  return result;
}

export const OsintProvider = ({ children }) => {
  const [caseData, setCaseData] = useState(INITIAL_EMPTY_CASE_FILE);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    loadActiveCaseFromIndexedDB().then((data) => {
      setCaseData(data);
      setIsDbReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isDbReady) return;
    saveActiveCaseToIndexedDB(caseData).catch((err) =>
      console.error('IndexedDB kayıt hatası:', err)
    );
  }, [caseData, isDbReady]);

  const isDataAvailable = Boolean(
    caseData.event !== null ||
      (caseData.actors && caseData.actors.length > 0) ||
      (caseData.evidences && caseData.evidences.length > 0)
  );

  const setEventDetails = useCallback((eventInput) => {
    const now = new Date().toISOString();
    setCaseData((prev) => {
      const eventId = prev.event?.id || `evt_${Date.now()}`;
      return {
        ...prev,
        event: {
          ...eventInput,
          id: eventId,
          createdAt: prev.event?.createdAt || now,
          updatedAt: now,
        },
        matrix: { ...prev.matrix, eventId },
      };
    });
  }, []);

  const addActor = useCallback((actorInput) => {
    const newActor = {
      ...actorInput,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCaseData((prev) => {
      const updatedActors = [...(prev.actors || []), newActor];
      const recalculated = computeAllNetScores(
        prev.matrix?.scores || [],
        prev.evidences || [],
        updatedActors
      );
      return {
        ...prev,
        actors: updatedActors,
        matrix: {
          ...prev.matrix,
          calculatedNetScores: recalculated,
          lastCalculatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateActor = useCallback((id, updated) => {
    setCaseData((prev) => ({
      ...prev,
      actors: (prev.actors || []).map((a) => (a.id === id ? { ...a, ...updated } : a)),
    }));
  }, []);

  const removeActor = useCallback((id) => {
    setCaseData((prev) => {
      const updatedActors = (prev.actors || []).filter((a) => a.id !== id);
      const updatedScores = (prev.matrix?.scores || []).filter((s) => s.actorId !== id);
      const recalculated = computeAllNetScores(
        updatedScores,
        prev.evidences || [],
        updatedActors
      );
      return {
        ...prev,
        actors: updatedActors,
        matrix: {
          ...prev.matrix,
          scores: updatedScores,
          calculatedNetScores: recalculated,
          lastCalculatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const addEvidence = useCallback((evidenceInput, quality) => {
    const reliabilityMultiplier = calculateReliabilityFromSATs(quality);
    const newEvidence = {
      ...evidenceInput,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reliabilityMultiplier,
      qualityMetrics: quality,
    };
    setCaseData((prev) => {
      const updatedEvidences = [...(prev.evidences || []), newEvidence];
      const recalculated = computeAllNetScores(
        prev.matrix?.scores || [],
        updatedEvidences,
        prev.actors || []
      );
      return {
        ...prev,
        evidences: updatedEvidences,
        matrix: {
          ...prev.matrix,
          calculatedNetScores: recalculated,
          lastCalculatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const removeEvidence = useCallback((id) => {
    setCaseData((prev) => {
      const updatedEvidences = (prev.evidences || []).filter((e) => e.id !== id);
      const updatedScores = (prev.matrix?.scores || []).map((s) => ({
        ...s,
        evidenceIds: (s.evidenceIds || []).filter((evId) => evId !== id),
      }));
      const recalculated = computeAllNetScores(
        updatedScores,
        updatedEvidences,
        prev.actors || []
      );
      return {
        ...prev,
        evidences: updatedEvidences,
        matrix: {
          ...prev.matrix,
          scores: updatedScores,
          calculatedNetScores: recalculated,
          lastCalculatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const upsertBenefitScore = useCallback(
    (actorId, category, rawScore, evidenceIds = [], justification = '') => {
      setCaseData((prev) => {
        const scores = prev.matrix?.scores || [];
        const existingIndex = scores.findIndex(
          (s) => s.actorId === actorId && s.category === category
        );
        let updatedScores;
        const newEntry = { actorId, category, rawScore, evidenceIds, justification };
        if (existingIndex >= 0) {
          updatedScores = [...scores];
          updatedScores[existingIndex] = {
            ...updatedScores[existingIndex],
            ...newEntry,
          };
        } else {
          updatedScores = [...scores, newEntry];
        }
        const recalculated = computeAllNetScores(
          updatedScores,
          prev.evidences || [],
          prev.actors || []
        );
        return {
          ...prev,
          matrix: {
            ...prev.matrix,
            scores: updatedScores,
            calculatedNetScores: recalculated,
            lastCalculatedAt: new Date().toISOString(),
          },
        };
      });
    },
    []
  );

  const addOsintEntity = useCallback((entityInput) => {
    const newEnt = {
      ...entityInput,
      id: `osint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setCaseData((prev) => ({
      ...prev,
      osintEntities: [...(prev.osintEntities || []), newEnt],
    }));
  }, []);

  const removeOsintEntity = useCallback((id) => {
    setCaseData((prev) => ({
      ...prev,
      osintEntities: (prev.osintEntities || []).filter((item) => item.id !== id),
    }));
  }, []);

  const getRankedActors = useCallback(() => {
    return [...(caseData.actors || [])]
      .map((actor) => ({
        actor,
        netScore: caseData.matrix?.calculatedNetScores?.[actor.id] ?? 0,
      }))
      .sort((a, b) => b.netScore - a.netScore);
  }, [caseData.actors, caseData.matrix?.calculatedNetScores]);

  const exportCaseToJson = useCallback(() => {
    if (!isDataAvailable) {
      alert('Dışa aktarılacak aktif vaka verisi bulunamadı.');
      return;
    }
    const exportPayload = { ...caseData, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${
      caseData.event?.title
        ? caseData.event.title.toLowerCase().replace(/[^a-z0-9-_]/g, '_')
        : 'vaka'
    }.cuibono.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [caseData, isDataAvailable]);

  const importCaseFromJson = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || parsed.schemaVersion !== '1.0.0') {
        return { success: false, error: 'Uyumsuz şema sürümü. v1.0.0 bekleniyor.' };
      }
      const recalculated = computeAllNetScores(
        parsed.matrix?.scores || [],
        parsed.evidences || [],
        parsed.actors || []
      );
      setCaseData({
        ...parsed,
        matrix: {
          ...parsed.matrix,
          calculatedNetScores: recalculated,
          lastCalculatedAt: new Date().toISOString(),
        },
      });
      return { success: true };
    } catch {
      return { success: false, error: 'Geçersiz JSON dosyası formatı.' };
    }
  }, []);

  const resetCase = useCallback(async () => {
    await clearActiveCaseInIndexedDB();
    setCaseData(INITIAL_EMPTY_CASE_FILE);
  }, []);

  return (
    <OsintContext.Provider
      value={{
        caseData,
        isDataAvailable,
        setEventDetails,
        addActor,
        updateActor,
        removeActor,
        addEvidence,
        removeEvidence,
        upsertBenefitScore,
        addOsintEntity,
        removeOsintEntity,
        getRankedActors,
        exportCaseToJson,
        importCaseFromJson,
        resetCase,
      }}
    >
      {children}
    </OsintContext.Provider>
  );
};

export function useOsint() {
  const context = useContext(OsintContext);
  if (!context) throw new Error('useOsint bir OsintProvider altında kullanılmalıdır.');
  return context;
}
