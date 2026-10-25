import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Target,
  Users,
  ShieldCheck,
  Cpu,
  Network,
  Compass,
  MapPin,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useOsint } from '../context/OsintContext';

export const UserGuideModal = ({ isOpen, onClose }) => {
  const { caseData } = useOsint();
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const hasEvent = Boolean(caseData.event?.title);
  const actorCount = (caseData.actors || []).length;
  const evidenceCount = (caseData.evidences || []).length;
  const scoreCount = (caseData.matrix?.scores || []).filter((s) => s.rawScore !== 0).length;
  const osintCount = (caseData.osintEntities || []).length;

  const steps = [
    {
      step: 1,
      title: 'Olay ve Bağlamın Tanımlanması',
      icon: <Target className="text-cyber-accent" size={20} />,
      status: hasEvent ? 'Tamamlandı' : 'Bekleniyor',
      isCompleted: hasEvent,
      desc: 'İstihbarat analizinin temelini oluşturacak vaka veya güvenlik olayını tanımlayın.',
      actions: [
        'Modül 1 alanında vakanın adını (örn: "Kritik Enerji Boru Hattı Sabotajı") yazın.',
        'Olayın gerçekleştiği veya tespit edildiği tarihi seçin.',
        'Özet alanına olayın operasyonel bağlamını, hedeflenen varlığı ve ilk etki sahasını özetleyin.',
        '"Olayı Kaydet" butonuna tıklayarak veriyi yerel veritabanına sabitleyin.',
      ],
      tip: 'Olay bağlamı ne kadar net olursa, Modül 5\'teki Gemini AI motoru çıkar hipotezlerini o kadar isabetli türetir.',
    },
    {
      step: 2,
      title: 'Aktör Havuzunun Oluşturulması',
      icon: <Users className="text-emerald-400" size={20} />,
      status: actorCount > 0 ? `${actorCount} Aktör Eklendi` : 'Bekleniyor',
      isCompleted: actorCount > 0,
      desc: 'Olaydan doğrudan veya dolaylı fayda ya da zarar sağlayabilecek tüm şüpheli ve ilgili tarafları tanımlayın.',
      actions: [
        'Aktör Adı kutusuna devlet, grup, şirket, konsorsiyum veya tehdit aktörü adını girin (örn: "APT29", "Doğu Gaz Konsorsiyumu").',
        'Aktörün başlangıç hipotez rolünü belirleyin:',
        '• Doğrudan Çıkar Sağlayan (Direct Winner): Ana motivasyona sahip olan taraf.',
        '• Fırsatçı (Opportunist): Olayı kendisi başlatmasa da oluşan boşluktan yararlanan.',
        '• Dolaylı Kazanan (Collateral Beneficiary): Yan etkilerden kazanç sağlayan.',
        '• İsnat Edilen Fail (Accused Culprit): Olayın faili olarak gösterilen ancak asıl kazanan olmayabilecek taraf.',
        '"Aktör Ekle" butonuna basarak aktörleri listeye dahil edin.',
      ],
      tip: 'Cui Bono prensibinde şüphe duyulan ilk kişi her zaman asıl yararlanan olmayabilir. Farklı motivasyondaki en az 2-3 aktör eklemek matris karşılaştırmasını güçlendirir.',
    },
    {
      step: 3,
      title: 'Kanıt Girişi & SATs Güvenilirlik Çarpanı',
      icon: <ShieldCheck className="text-amber-400" size={20} />,
      status: evidenceCount > 0 ? `${evidenceCount} Kanıt Eklendi` : 'Bekleniyor',
      isCompleted: evidenceCount > 0,
      desc: 'Toplanan açık kaynak istihbaratını (OSINT) Yapılandırılmış Analitik Teknikler (SATs) ile tartın.',
      actions: [
        'Kanıt Başlığı ve Kaynak Tipini (URL, FININT, SIGINT veya Sızdırılan Belge) belirleyin.',
        'Aşağıdaki 4 SATs kriterine 1 ile 5 arasında puan verin:',
        '• Aidiyet (Attribution): Bilginin kaynağı net mi?',
        '• Yetkinlik (Credentials): Bilgiyi veren kaynak teknik olarak güvenilir mi?',
        '• Nesnellik (Objectivity): Kaynağın taraflı veya manipülatif olma ihtimali düşük mü?',
        '• Doğrulanabilirlik (Verifiability): Veri bağımsız kaynaklarla teyit edilebiliyor mu?',
        'Sistem otomatik olarak (Toplam / 20) formülüyle 0.10 ile 1.00 arasında bir güvenilirlik çarpanı hesaplar.',
      ],
      tip: 'Doğrulanmamış sosyal medya iddialarının çarpanı düşük kalır; böylece matriste manipülatif algı puanları aktör skorunu yapay olarak şişirmez.',
    },
    {
      step: 4,
      title: 'Cui Bono Matris Puanlaması (Kimin Çıkarına?)',
      icon: <Cpu className="text-purple-400" size={20} />,
      status: scoreCount > 0 ? `${scoreCount} Skor Girildi` : 'Bekleniyor',
      isCompleted: scoreCount > 0,
      desc: 'Her aktörün olay sonucunda elde ettiği net kazanım veya maruz kaldığı kaybı puanlayın.',
      actions: [
        'Modül 3 Matris tablosunda her aktör için 4 boyutta -5 (Ağır Kayıp) ile +5 (Büyük Kazanç) arasında kaydırma çubuğunu ayarlayın:',
        '1. Finansal (FININT): Piyasa payı, hisse değeri, ihale kazanımı, kaynak kontrolü.',
        '2. Jeopolitik: Bölgesel nüfuz, ittifak güçlenmesi, askeri konumlanma.',
        '3. Siber / Veri: Fikri mülkiyet hırsızlığı, casusluk avantajı, sistem zaafiyeti oluşturma.',
        '4. İtibar / Algı: Caydırıcılık artışı, rakibin itibar kaybı, dezenformasyon başarısı.',
        '"Gerekçe Yaz" bağlantısına tıklayarak istihbari argümanınızı kaydedin.',
        'VEYA Modül 5\'e ham haber metnini ve API anahtarınızı girerek "Gemini AI ile Analiz Et" butonuna basın; yapay zeka matrisi sizin için önerilerle dolduracaktır.',
      ],
      tip: 'Net Skor = Ham Puan × İlişkili Kanıtın Güvenilirlik Çarpanı formülüyle hesaplanır. En yüksek artı puana sahip aktör "En Olası Nihai Yararlanan" olarak sıralanır.',
    },
    {
      step: 5,
      title: 'OSINT Düğümleri ve Çıkar Ağ Analizi',
      icon: <Network className="text-sky-400" size={20} />,
      status: osintCount > 0 ? `${osintCount} Düğüm Eklendi` : 'Opsiyonel',
      isCompleted: osintCount > 0,
      desc: 'Aktörlere ait dijital ve operasyonel varlıkları ilişkilendirerek ağ görselleştirmesini inceleyin.',
      actions: [
        'İlgili aktörü seçin ve kategori belirleyin: Sosyal Medya (@kullanıcı), Kripto Cüzdan (0x...), Araç/Plaka veya Domain/IP.',
        'Etiket ve tanımlayıcı değeri girerek "Düğüm Ekle" butonuna basın.',
        'SVG Çıkar Ağ Grafiği üzerinden Olay &rarr; Aktör &rarr; Dijital Varlık ilişkilerini görsel olarak denetleyin.',
        'Tam ekran butonunu kullanarak geniş ekranda ağ analizini inceleyin.',
      ],
      tip: 'Kripto cüzdan ve domain bağlantıları, anonim aktörler arasındaki gizli fonlama ve altyapı ortaklıklarını açığa çıkarır.',
    },
    {
      step: 6,
      title: 'Alternatif Gelecekler (Futures) & Coğrafi Analiz (GEOINT)',
      icon: <Compass className="text-pink-400" size={20} />,
      status: 'Tamamlandı',
      isCompleted: true,
      desc: 'Stratejik belirsizlikleri modelleyin ve operasyon lokasyonlarını haritalandırın.',
      actions: [
        'Alternatif Gelecekler Matrisinde (Modül 6) iki kritik belirsizlik ekseni tanımlayın (örn: X: Yaptırım Şiddeti, Y: Çatışma Yayılımı).',
        'Oluşan 4 senaryo kadranındaki metinleri vakanızın olası sonuçlarına göre düzenleyin.',
        'GEOINT Haritasında (Modül 7) haritaya tıklayarak koordinat alın ve kritik tesisleri (Komuta Merkezi, Siber Hedef, Düğüm) işaretleyin.',
      ],
      tip: 'Gelecekler matrisi, analistin tek bir sonuca kilitlenmesini ("confirmation bias") engelleyen standart bir istihbarat tekniğidir (SATs).',
    },
    {
      step: 7,
      title: 'Raporlama ve Karar Desteği',
      icon: <Download className="text-emerald-400" size={20} />,
      status: 'Hazır',
      isCompleted: true,
      desc: 'Ulaşılan bulguları karar alıcılara sunmak için dışa aktarın.',
      actions: [
        'Kronoloji modülünden olay ve kanıt akışını son kez kontrol edin.',
        'Modül 9\'dan "PDF / Sayfayı Yazdır" ile resmi analitik bülten çıktısı alın.',
        '".cuibono.json İndir" butonuyla tüm vaka verilerini bilgisayarınıza yedekleyin.',
        'Daha sonra başka bir oturumda "Vaka JSON İçe Aktar" ile çalışmanıza kaldığınız yerden devam edebilirsiniz.',
      ],
      tip: 'Oluşturulan .cuibono.json dosyası IndexedDB veritabanının tam kopyasını içerir ve ekip üyeleriyle güvenle paylaşılabilir.',
    },
  ];

  const currentStep = steps[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-cyber-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyber-border bg-[#090d16]">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-cyber-accent/10 border border-cyber-accent rounded-lg text-cyber-accent">
              <BookOpen size={20} />
            </span>
            <div>
              <h3 className="font-mono font-bold text-base text-white">
                CuiBono-IntelEngine Analiz Metodolojisi & Kullanım Kılavuzu
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                Yapılandırılmış Analitik Teknikler (SATs) ile adım adım istihbarat çıkar analizi rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-cyber-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sol: Adım Listesi & İlerleme */}
          <div className="w-full md:w-72 bg-[#090d16]/70 border-r border-cyber-border p-3 overflow-y-auto space-y-1">
            <div className="text-[11px] font-mono font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">
              Analiz İş Akışı
            </div>
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                  activeTab === idx
                    ? 'bg-cyber-accent text-black font-bold shadow-md'
                    : 'text-gray-300 hover:bg-[#1f2937]/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[11px] ${activeTab === idx ? 'text-black' : 'text-gray-400'}`}>
                    0{s.step}.
                  </span>
                  <span className="truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                </div>
                {s.isCompleted ? (
                  <CheckCircle2 size={14} className={activeTab === idx ? 'text-black' : 'text-emerald-400'} />
                ) : (
                  <span className={`text-[10px] ${activeTab === idx ? 'text-black' : 'text-gray-500'}`}>
                    •
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sağ: Aktif Adım Detayları */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                {currentStep.icon}
                <div>
                  <div className="text-[11px] font-mono text-cyber-accent font-bold">
                    ADIM 0{currentStep.step} / 07
                  </div>
                  <h4 className="text-lg font-mono font-bold text-white">{currentStep.title}</h4>
                </div>
              </div>
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                  currentStep.isCompleted
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                {currentStep.status}
              </span>
            </div>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">{currentStep.desc}</p>

            <div className="bg-[#090d16] border border-cyber-border rounded-lg p-4 space-y-2.5">
              <h5 className="font-mono text-xs font-bold text-cyber-accent uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Yapılması Gereken İşlemler:
              </h5>
              <ul className="space-y-2 text-xs text-gray-300 font-sans">
                {currentStep.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyber-accent font-mono text-xs">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentStep.tip && (
              <div className="p-3 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-xs text-cyber-accent font-sans flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono">İstihbarat Metodolojisi İpucu:</strong> {currentStep.tip}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Nav */}
        <div className="flex items-center justify-between p-4 border-t border-cyber-border bg-[#090d16]">
          <button
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
            className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded border border-cyber-border text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={14} /> Önceki Adım
          </button>

          <span className="text-xs font-mono text-gray-400">
            Adım {activeTab + 1} / {steps.length}
          </span>

          {activeTab < steps.length - 1 ? (
            <button
              onClick={() => setActiveTab((prev) => Math.min(steps.length - 1, prev + 1))}
              className="inline-flex items-center gap-1 text-xs font-mono px-3.5 py-1.5 rounded bg-cyber-accent hover:bg-cyan-400 text-black font-bold transition-colors"
            >
              Sonraki Adım <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-mono px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold transition-colors"
            >
              Anlaşıldı, Analize Başla ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
