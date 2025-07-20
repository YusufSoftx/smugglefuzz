# 🚀 Kitap Yolculuğum - Kurulum Rehberi

Bu rehber, İremsu'nun kişisel kitap asistanı uygulamasını yerel geliştirme ortamında çalıştırmak için gerekli adımları içerir.

## 📋 Gereksinimler

- **Node.js** v16 veya üzeri
- **MongoDB** (yerel kurulum veya MongoDB Atlas)
- **Git**
- **Modern web tarayıcısı**

## 🎯 Hızlı Başlangıç

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd kitap-yolculugum
```

### 2. Tüm bağımlılıkları yükleyin
```bash
npm run install:all
```

### 3. MongoDB kurulumu
MongoDB'yi yerel olarak kurun veya MongoDB Atlas ücretsiz hesabı oluşturun.

**MongoDB Atlas (Önerilen)**:
1. [MongoDB Atlas](https://www.mongodb.com/atlas/database) hesabı oluşturun
2. Yeni bir cluster oluşturun (ücretsiz M0 seviyesi yeterli)
3. Database user oluşturun
4. IP adresini whitelist'e ekleyin (0.0.0.0/0 tüm IP'ler için)
5. Connection string'i kopyalayın

### 4. Environment değişkenlerini ayarlayın

**Backend (.env)** - `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kitap-yolculugum?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=iremsu_kitap_yolculugu_super_secret_key_2024
JWT_EXPIRE=30d

# Google Books API (opsiyonel)
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
```

**Frontend (.env)** - `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=Kitap Yolculuğum
REACT_APP_VERSION=1.0.0
```

### 5. Uygulamayı çalıştırın

**Her iki uygulamayı birlikte çalıştırmak için**:
```bash
npm run dev
```

**Ayrı ayrı çalıştırmak için**:

Backend:
```bash
npm run dev:backend
```

Frontend (yeni terminal):
```bash
npm run dev:frontend
```

## 🌐 Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Dokümantasyonu**: http://localhost:5000 (Ana endpoint listesi)

## 🔑 Google Books API Kurulumu (Opsiyonel)

Kitap arama özelliği için Google Books API kullanılır:

1. [Google Cloud Console](https://console.cloud.google.com/) gidin
2. Yeni proje oluşturun veya mevcut birini seçin
3. "APIs & Services" > "Library" bölümüne gidin
4. "Books API" arayın ve etkinleştirin
5. "Credentials" bölümünden API key oluşturun
6. API key'i backend `.env` dosyasına ekleyin

## 📊 Test Verileri

Uygulama ilk çalıştırıldığında boş bir veritabanı ile başlar. Test için:

1. Kayıt olun (herhangi bir email ve şifre)
2. Dashboard'a erişin
3. "Yeni Kitap Ekle" ile kitap eklemeye başlayın

## 🛠 Geliştirme Komutları

```bash
# Tüm bağımlılıkları yükle
npm run install:all

# Geliştirme modunda çalıştır (her iki uygulama)
npm run dev

# Sadece backend
npm run dev:backend

# Sadece frontend
npm run dev:frontend

# Production build (frontend)
npm run build

# Production start (backend)
npm start
```

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
- MongoDB URI'nin doğru olduğundan emin olun
- MongoDB Atlas kullanıyorsanız IP whitelist kontrolü yapın
- Network bağlantınızı kontrol edin

### Port Çakışması
- 5000 portu kullanılıyorsa backend `.env` dosyasında PORT değişkenini değiştirin
- 3000 portu kullanılıyorsa React otomatik olarak farklı port önerecektir

### CORS Hatası
- Backend'de CORS ayarları frontend URL'ini içerdiğinden emin olun
- Environment değişkenlerinin doğru olduğunu kontrol edin

### Tailwind CSS Çalışmıyor
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
```

## 📱 Mobil Test

Responsive tasarım için farklı cihazlarda test edin:
- Chrome DevTools > Device Simulation
- Gerçek mobil cihazlarda `http://[bilgisayar-ip]:3000`

## 🔄 Hot Reload

- Frontend: Kod değişiklikleri otomatik olarak yenilenir
- Backend: nodemon ile otomatik restart (kod değişikliklerinde)

## 📚 Useful Links

- [React Dokümantasyonu](https://react.dev/)
- [Tailwind CSS Dokümantasyonu](https://tailwindcss.com/docs)
- [MongoDB Dokümantasyonu](https://docs.mongodb.com/)
- [Express.js Dokümantasyonu](https://expressjs.com/)

## 💡 Geliştirme İpuçları

1. **Component Structure**: React bileşenlerini `src/components` klasöründe organize edin
2. **API Testing**: Postman veya Insomnia kullanarak API endpoint'lerini test edin
3. **Database**: MongoDB Compass ile veritabanını görsel olarak inceleyin
4. **Debugging**: Browser DevTools Console ve React DevTools kullanın

## 🎨 Tasarım Sistemi

- **Renkler**: Tailwind custom color palette (primary, secondary, accent)
- **Tipografi**: Inter (sans), Playfair Display (serif), JetBrains Mono (mono)
- **Komponentler**: `src/index.css` dosyasında tanımlı custom CSS classları

---

Herhangi bir sorun yaşarsanız, bu dokümantasyonu kontrol edin veya geliştirici ile iletişime geçin. 🚀