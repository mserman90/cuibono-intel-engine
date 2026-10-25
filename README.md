# CuiBono-IntelEngine (Web Tabanlı OSINT & Çıkar Analiz Platformu)

İstemci tarafında çalışan (Client-side), modern Yapılandırılmış İstihbarat Analiz Teknikleri (SATs), Açık Kaynak İstihbaratı (OSINT) ve Cui Bono (Kimin Çıkarına?) mantığıyla çalışan analitik platform.

---

## 🚀 Hızlı Başlangıç (Geliştirme Ortamı)

```bash
# Bağımlılıkları yükleyin
npm install

# Yerel geliştirme sunucusunu başlatın (http://localhost:3000)
npm run dev

# Üretim (Production) derlemesi alın
npm run build
```

Derleme çıktısı `./dist` dizinine oluşturulur. Bu dizin herhangi bir statik sunucuya (Nginx, Apache, S3, Cloudflare Pages, GitHub Pages, Vercel, Netlify) doğrudan dağıtılabilir.

---

## 🌐 Deploy Seçenekleri (Dağıtım Rehberi)

### 1. Vercel (1-Click Deployment)
Proje kökünde `vercel.json` mevcuttur:
```bash
npx vercel
# veya Vercel Dashboard'dan GitHub reponuzu bağlayıp Build Command: `npm run build`, Output Directory: `dist` seçin.
```

### 2. Netlify
Proje kökünde `netlify.toml` mevcuttur:
```bash
npx netlify deploy --prod
# veya Netlify panosundan reponuzu seçtiğinizde build ayarları otomatik algılanır.
```

### 3. Docker ile Dağıtım
Proje içerisinde multi-stage ve Nginx tabanlı optimize edilmiş bir `Dockerfile` ve `nginx.conf` mevcuttur:

```bash
# İmajı oluşturun
docker build -t cuibono-intel-engine .

# Konteyneri 80 portunda çalıştırın
docker run -d -p 8080:80 --name cuibono cuibono-intel-engine
```
Artık tarayıcınızdan `http://localhost:8080` adresine gidebilirsiniz.

### 4. GitHub Pages
1. `vite.config.js` dosyasında `base: './'` ayarı zaten yapılmıştır.
2. `npm run build` çalıştırıp `dist` klasörünü `gh-pages` dalına gönderebilirsiniz:
```bash
npx gh-pages -d dist
```

---

## 🛠️ Temel Modüller ve Özellikler

1. **Modül 1 (Olay Tanımlama):** Olay başlığı, tarihi ve bağlam özeti.
2. **Modül 2 (Aktör Yönetimi):** Olayla bağlantılı aktörlerin hipotez rolleriyle eklenmesi ve yönetimi.
3. **Modül 3 (Cui Bono Matris Motoru):** Aktörlerin Finansal, Jeopolitik, Siber ve İtibar kategorilerindeki çıkar skorları (-5 ile +5 arası) ve gerekçelendirmeleri.
4. **Modül 4 (Ağ Grafiği & OSINT Düğümleri):** Aktörlere bağlı sosyal medya, kripto cüzdan, araç/plaka ve domain/IP varlıkları.
5. **Modül 5 (Gemini AI Hipotez Asistanı):** Ham istihbarat ve haber metinlerini Google Gemini 2.5 Flash ile otomatik analiz edip matris ve düğüm önerileri çıkarma.
6. **Modül 6 (Futures Matrix):** İki eksenli alternatif gelecekler ve senaryo kadranları.
7. **Modül 7 (GEOINT Coğrafi İstihbarat Haritası):** Leaflet tabanlı lokasyon, hedef ve koordinat işaretleme.
8. **Modül 8 (Zaman Çizelgesi / Kronoloji):** Olay ve kanıtların kronolojik akışı.
9. **Modül 9 (Raporlama & Dışa/İçe Aktarım):** Yazdırma/PDF, Markdown özeti, `.cuibono.json` içe ve dışa aktarımı.
10. **Kalıcılık:** Tüm veriler kullanıcının tarayıcısındaki yerel IndexedDB veritabanında saklanır.
