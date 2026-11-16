# 🎓 TYT Akıllı Koç ve Takip Asistanı

YKS / TYT adayları için geliştirilmiş modern, hızlı, mobil öncelikli ve akıllı bir sınav hazırlık ve koçluk web uygulaması.

Öğrencilerin konu eksiklerini kapatmalarını, deneme netlerini düzenli takip etmelerini ve yanlış yaptıkları soruları arşivleyip tekrar etmelerini sağlar.

---

## 🌟 Öne Çıkan Özellikler

- ⏳ **Canlı YKS Geri Sayımı**:
  - Sınav gününe kalan gün, saat, dakika ve saniyeyi gerçek zamanlı gösteren motivasyon paneli.
- 📋 **Kapsamlı TYT Konu Takip Matrisi**:
  - Türkçe, Matematik, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe ve Din Kültürü müfredatı.
  - Her konu için *"Çalışılmadı"*, *"Çalışılıyor"*, *"Tamamlandı"* durumları ve tekrar sayıları.
  - Ders bazlı dinamik ilerleme çubukları ve tamamlama yüzdeleri.
- 📓 **Yanlış Soru Defteri**:
  - Denemelerde ve testlerde yanlış yapılan soruları fotoğrafı (kamera veya galeriden) veya metniyle kaydetme.
  - Ders ve konu etiketi ekleme, çözüm notları tutma, gözden geçirme durumu takibi.
- 📊 **Deneme Net Takibi & Grafik**:
  - Yapılan tüm denemelerin Türkçe, Sosyal, Matematik, Fen ve Toplam netlerini kaydetme.
  - Net artış/azalış trendleri.
- 🤖 **Akıllı AI Koç Analiz Motoru**:
  - Konu matrisinizi, yanlış soru defterinizi ve son deneme netlerinizi çapraz analiz eder.
  - Size özel güçlü yönler, dikkat edilmesi gereken zayıf alanlar ve net artırıcı stratejik çalışma tavsiyeleri üretir.
- 🌓 **Karanlık ve Aydınlık Mod (Dark/Light Mode)**:
  - Gözü yormayan modern arayüz tasarımı.
- 🔒 **%100 Güvenli ve Sıfır Konfigürasyon (LocalStorage)**:
  - Veritabanı veya sunucu kurulumu gerektirmez. Tüm veriler öğrencinin kendi tarayıcısında/cihazında saklanır. İnternet bağlantısı olmasa bile çalışır!

---

## 📱 Telefonda Uygulama Olarak Nasıl Kullanılır? (PWA)

Bu uygulama modern bir **Progressive Web App (PWA)** olarak yapılandırılmıştır.

1. **Vercel Üzerinde Yayına Alın:**
   - Projeyi GitHub'a yükledikten sonra [vercel.com](https://vercel.com) üzerinden tek tıkla deploy edin.
   - Veritabanı gerekmediği için hiçbir ortam değişkeni (Environment Variable) ayarlamanıza gerek yoktur! Doğrudan çalışır.
2. **Telefona Yükleyin:**
   - **Android (Chrome veya Samsung Browser):** Sitenize girin ➔ Menüden **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** seçeneğini seçin.
   - **iPhone (Safari):** Safari'den siteyi açın ➔ Alttaki **Paylaş** simgesine dokunun ➔ **"Ana Ekrana Ekle"** deyin.

Uygulama telefonunuzun ana ekranında tıpkı Google Play / App Store uygulaması gibi tam ekran çalışır.

---

## 🛠️ Yerel Geliştirme (Localhost)

Projeyi kendi bilgisayarınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı (Production) derlemesi oluşturun
npm run build
```

---

## 📂 Proje Yapısı

```text
├── public/                 # PWA manifest ve uygulama ikonları
│   ├── icon.svg
│   └── manifest.json
├── src/
│   ├── components/         # Arayüz bileşenleri
│   │   ├── ExamAnalysis.tsx    # Deneme sınavı & AI koç analizi
│   │   ├── ProgressBar.tsx     # İlerleme çubukları
│   │   ├── StatCard.tsx        # İstatistik kartları
│   │   ├── SubjectMatrix.tsx   # Konu takip matrisi
│   │   ├── WrongNotebook.tsx   # Yanlış soru defteri
│   │   └── YKSCountdown.tsx    # Geri sayım sayacı
│   ├── data/
│   │   └── curriculum.ts       # TYT ders ve konu müfredatı
│   ├── hooks/
│   │   ├── useDarkMode.ts      # Tema yönetimi
│   │   └── useLocalStorage.ts  # Cihaz içi veri saklama
│   ├── types/                  # TypeScript tip tanımları
│   ├── utils/
│   │   ├── analysis.ts         # AI koç analiz algoritmaları
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html              # Mobil uyumlu HTML & meta etiketleri
├── package.json
└── vite.config.ts
```

---

## 📄 Lisans

MIT
