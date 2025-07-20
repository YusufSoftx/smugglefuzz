# 📚 Kitap Yolculuğum - İremsu için Kişisel Kitap Asistanı

Modern, estetik ve sezgisel bir dijital kitap takip uygulaması. Sadece bir takip aracı değil, aynı zamanda kişisel bir kitap günlüğü ve ilham kaynağı.

## 🎯 Proje Vizyonu

İremsu'nun okuma serüvenini zenginleştiren, okuma eylemini daha keyifli, düzenli ve motive edici hale getiren kişisel bir dijital asistan oluşturmak.

## ✨ Temel Özellikler

### 📖 Kişisel Kütüphane ve Kitap Yönetimi
- **Akıllı Kitap Rafları**: Dinamik raf sistemi (Şu An Okuduklarım, Okuduklarım, Okuyacaklarım)
- **Google Books API Entegrasyonu**: ISBN, kitap adı veya yazar ile otomatik arama
- **Zengin Kitap Detayları**: Kapak fotoğrafı, başlık, yazar, yayınevi, sayfa sayısı otomatik çekimi
- **Manuel Ekleme**: API'de bulunamayan kitaplar için tam kontrol

### 📊 İlerleme Takibi
- **Akıllı İlerleme Takibi**: Sayfa numarası veya yüzde (%) olarak
- **Otomatik Tarih Yönetimi**: Başlangıç ve bitiş tarihleri
- **Okuma Serisi**: Art arda okuma günlerini takip eden streak sistemi
- **Görsel İstatistikler**: İlerleme çubukları ve grafikler

### 📝 Kişisel Notlar ve Alıntılar
- **Markdown Destekli Notlar**: Zengin metin formatlama (kalın, italik, liste, başlık)
- **Alıntı Koleksiyonu**: Metin ve fotoğraf alıntıları
- **Akıllı Etiketleme**: İlham, felsefe, unutma, komik gibi etiketler
- **Sayfa Referansları**: Hangi sayfadan alındığını belirtme

### 🎯 Hedefler ve Motivasyon
- **Aylık/Yıllık Hedefler**: Kitap sayısı ve sayfa hedefleri
- **Başarı Rozetleri**: "İlk 10 kitabını bitirdin", "Bir ayda 5 kitap okudun" gibi
- **İstatistik Paneli**: Aylara göre okuma grafikleri, en çok okunan yazarlar
- **Rastgele Alıntılar**: Günlük ilham için eski alıntılardan rastgele seçim

### 🎨 Modern Kullanıcı Deneyimi
- **Karanlık/Açık Mod**: Tek tuşla geçiş
- **Akıcı Animasyonlar**: Göze hoş gelen, abartısız geçişler
- **Sezgisel Navigasyon**: Kolay erişilebilir menü yapısı
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

## 🛠 Teknoloji Stack

### Backend
- **Node.js & Express.js**: Modern JavaScript backend
- **MongoDB & Mongoose**: NoSQL veritabanı ve ODM
- **JWT Authentication**: Güvenli kullanıcı doğrulama
- **Google Books API**: Kitap veri entegrasyonu
- **Express Validator**: Veri doğrulama
- **Helmet & Rate Limiting**: Güvenlik önlemleri

### Frontend
- **React 18**: Modern kullanıcı arayüzü
- **React Router**: Sayfa yönlendirme
- **Tailwind CSS**: Modern, responsive styling
- **Heroicons**: Güzel ikon seti
- **React Hot Toast**: Bildirim sistemi
- **Axios**: HTTP istekleri

### Tasarım ve UX
- **Custom Color Palette**: Özel renk sistemi
- **Google Fonts**: Inter, Playfair Display, JetBrains Mono
- **CSS Grid & Flexbox**: Modern layout sistemi
- **Micro-interactions**: Kullanıcı deneyimi detayları

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v16+)
- MongoDB
- NPM veya Yarn

### Backend Kurulumu
```bash
cd backend
npm install
npm run dev
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=Kitap Yolculuğum
REACT_APP_VERSION=1.0.0
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri
- `PUT /api/auth/profile` - Profil güncelleme
- `POST /api/auth/logout` - Çıkış

### Books
- `GET /api/books/search` - Google Books API ile arama
- `POST /api/books` - Kütüphaneye kitap ekleme
- `GET /api/books/library` - Kullanıcının kitapları
- `GET /api/books/:id` - Kitap detayları
- `PUT /api/books/:id/progress` - Okuma durumu güncelleme
- `POST /api/books/:id/notes` - Not ekleme
- `POST /api/books/:id/quotes` - Alıntı ekleme

### Dashboard
- `GET /api/dashboard` - Ana sayfa verileri

## 🎨 Tasarım Felsefesi

### Kullanıcı Odaklılık
Her özellik, İremsu'nun ihtiyaçları ve kullanım alışkanlıkları düşünülerek tasarlanmıştır.

### Minimalist Güç
Arayüz sade, temiz ve dikkat dağıtıcı unsurlardan arındırılmış, ancak arka planda güçlü özellikler sunar.

### Motivasyon ve Keşif
Uygulama, kullanıcıyı okumaya teşvik eder, okuma hedefleriyle motive eder ve kendi kütüphanesi içinde yeni keşifler yapmasını sağlar.

### Güvenlik ve Mahremiyet
Tüm veriler (notlar, alıntılar, okuma listeleri) kişiye özeldir ve güvenli bir şekilde saklanır.

## 🔮 Gelecek Özellikler (Aşama 2)

- **Bulut Senkronizasyonu**: Farklı cihazlardan erişim
- **Veri Dışa Aktarma**: PDF, CSV, JSON formatlarında
- **Goodreads Entegrasyonu**: Mevcut kütüphane aktarımı
- **Akıllı Bildirimler**: Kişiselleştirilmiş hatırlatmalar
- **Sosyal Özellikler**: Kitap önerileri ve paylaşım
- **Gelişmiş Analitik**: Detaylı okuma istatistikleri

## 📊 Veritabanı Şeması

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  preferences: {
    theme: 'light' | 'dark',
    defaultView: 'grid' | 'list',
    language: String
  },
  goals: {
    monthly: { books: Number, pages: Number },
    yearly: { books: Number, pages: Number }
  },
  stats: {
    totalBooksRead: Number,
    totalPagesRead: Number,
    currentStreak: Number,
    longestStreak: Number,
    lastReadDate: Date
  },
  achievements: [Achievement]
}
```

### Books Collection
```javascript
{
  title: String,
  author: String,
  isbn: String,
  publisher: String,
  publishedDate: Date,
  pageCount: Number,
  categories: [String],
  description: String,
  coverImage: String,
  googleBooksId: String
}
```

### UserBooks Collection
```javascript
{
  user: ObjectId,
  book: ObjectId,
  shelf: 'reading' | 'completed' | 'toRead' | 'abandoned',
  readingStatus: {
    currentPage: Number,
    progressPercentage: Number,
    startDate: Date,
    endDate: Date,
    lastReadDate: Date
  },
  rating: Number,
  review: String,
  notes: [Note],
  quotes: [Quote],
  isFavorite: Boolean
}
```

## 🤝 Katkıda Bulunma

Bu proje İremsu'nun kişisel kitap yolculuğu için özel olarak tasarlanmıştır, ancak kod yapısı ve tasarım prensipleri başka projeler için de ilham kaynağı olabilir.

## 📄 Lisans

MIT License - Detaylar için LICENSE dosyasına bakınız.

## 👩‍💻 Geliştirici

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş olup, özellikle kitap severler için optimize edilmiştir.

---

*"Bir kitap bin arkadaşa bedeldir." - İremsu'nun kitap yolculuğuna hoş geldin! 📚✨*