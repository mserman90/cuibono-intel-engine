export const quotaStore = {
  GEMINI_AI: {
    provider: 'GEMINI_AI',
    maxLimit: 60,
    usedCount: 0,
    remainingHeaderValue: null,
    isWarningThresholdReached: false,
    lastHttpStatus: null,
  },
  RSS2JSON: {
    provider: 'RSS2JSON',
    maxLimit: 100,
    usedCount: 0,
    remainingHeaderValue: null,
    isWarningThresholdReached: false,
    lastHttpStatus: null,
  },
};

function updateQuotaAndInspectHeaders(provider, headers, status) {
  const tracker = quotaStore[provider];
  if (!tracker) return {};
  tracker.usedCount += 1;
  tracker.lastHttpStatus = status;
  const rateLimitRemaining =
    headers.get('X-RateLimit-Remaining') || headers.get('x-ratelimit-remaining');
  if (rateLimitRemaining !== null && !isNaN(Number(rateLimitRemaining))) {
    tracker.remainingHeaderValue = Number(rateLimitRemaining);
  } else {
    tracker.remainingHeaderValue = null;
  }
  if (tracker.usedCount / tracker.maxLimit >= 0.8) {
    tracker.isWarningThresholdReached = true;
  }
  return { ...tracker };
}

export async function fetchWithBackoff(
  url,
  options = {},
  provider = 'GEMINI_AI',
  maxRetries = 3,
  baseDelayMs = 1000
) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);
      const quotaSnapshot = updateQuotaAndInspectHeaders(
        provider,
        response.headers,
        response.status
      );
      if (response.ok) {
        const data = await response.json();
        return { data, quota: quotaSnapshot };
      }
      if (
        response.status === 429 ||
        (response.status >= 500 && response.status < 600)
      ) {
        if (attempt === maxRetries) {
          throw new Error(`HTTP ${response.status}: Maksimum yeniden deneme aşımı.`);
        }
        const waitTimeMs =
          baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
        await new Promise((r) => setTimeout(r, waitTimeMs));
        attempt++;
        continue;
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errText || 'İstek başarısız oldu.'}`);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
      attempt++;
    }
  }
  throw new Error('İstek gerçekleştirilemedi.');
}

export async function analyzeOsintWithGemini(
  apiKey,
  rawOsintText,
  eventTitle,
  actors,
  model = 'gemini-2.5-flash'
) {
  if (!apiKey || !apiKey.trim()) throw new Error('API anahtarı girilmedi.');
  if (!rawOsintText || !rawOsintText.trim()) throw new Error('OSINT metni girilmedi.');
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const actorContext = (actors || [])
    .map((a) => `- ID: "${a.id}", İsim: "${a.name}", Rol: "${a.role}"`)
    .join('\n');

  const systemInstruction = `Sen kıdemli bir OSINT (Açık Kaynak İstihbaratı) ve SATs (Yapılandırılmış Analitik Teknikler) uzmanısın. Yalnızca sağlanan otantik metne dayanarak analiz yap.
Yanıtını YALNIZCA şu geçerli JSON şemasında döndür:
{
  "executiveSynthesis": "Kısa analitik sentez",
  "suggestions": [
    {
      "actorId": "eşleşen aktörün ID'si",
      "actorName": "aktör adı",
      "category": "FINANCIAL | GEOPOLITICAL | CYBER_DATA | REPUTATION",
      "suggestedScore": 4,
      "justification": "Skorlama gerekçesi",
      "counterHypothesis": "Şeytanın avukatı antitezi / karşı hipotez",
      "qualityMetrics": { "attribution": 4, "credentials": 4, "objectivity": 3, "verifiability": 4 }
    }
  ],
  "extractedEntities": [
    {
      "linkedActorId": "ilgili aktörün ID'si",
      "category": "SOCIAL_MEDIA | CRYPTO_WALLET | VEHICLE | DOMAIN_IP",
      "label": "Tanımlayıcı etiket",
      "socialData": { "platform": "X/Twitter", "username": "", "followersCount": "", "postsCount": "", "bio": "", "profileUrl": "" },
      "cryptoData": { "network": "ETH", "address": "", "txHashSample": "", "estimatedFlowUsd": "" },
      "vehicleData": { "plateNumber": "", "make": "", "model": "", "year": "", "color": "", "registeredOwner": "" },
      "domainData": { "domainName": "", "ipAddress": "", "asnOrIsp": "", "archiveWaybackUrl": "" }
    }
  ]
}`;

  const { data, quota } = await fetchWithBackoff(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `VAKA BAŞLIĞI: ${eventTitle || 'Belirtilmemiş'}\nAKTÖRLER:\n${actorContext || 'Henüz aktör tanımlanmadı.'}\nANALİZ EDİLECEK HAM METİN:\n${rawOsintText}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
    'GEMINI_AI'
  );

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('AI motorundan yanıt metni alınamadı.');
  const parsed = JSON.parse(rawText);
  return { ...parsed, quota };
}
