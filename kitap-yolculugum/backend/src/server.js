const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Environment variables yükle
dotenv.config();

// Database bağlantısı
connectDB();

const app = express();

// Güvenlik middleware'leri
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek sayısı
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin'
  }
});

app.use('/api/', limiter);

// CORS ayarları
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kitap-yolculugum.vercel.app'] // Production domain'i
    : ['http://localhost:3000', 'http://localhost:3001'], // Development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kitap Yolculuğum API\'sine hoş geldiniz! 📚',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books'
    }
  });
});

// Dashboard controller'ı ayrı olarak ekleyelim
app.get('/api/dashboard', require('./middleware/auth').protect, async (req, res) => {
  try {
    const User = require('./models/User');
    const UserBook = require('./models/UserBook');
    
    const userId = req.user._id;
    
    // Dashboard verileri
    const [
      currentlyReading,
      recentlyCompleted,
      totalStats,
      randomQuote,
      monthlyProgress
    ] = await Promise.all([
      // Şu an okuduğu kitaplar
      UserBook.find({ user: userId, shelf: 'reading' })
        .populate('book')
        .sort({ 'readingStatus.lastReadDate': -1 })
        .limit(3),
      
      // Son bitirilen kitaplar
      UserBook.find({ user: userId, shelf: 'completed' })
        .populate('book')
        .sort({ 'readingStatus.endDate': -1 })
        .limit(5),
      
      // Genel istatistikler
      UserBook.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            completedBooks: {
              $sum: { $cond: [{ $eq: ['$shelf', 'completed'] }, 1, 0] }
            },
            currentlyReading: {
              $sum: { $cond: [{ $eq: ['$shelf', 'reading'] }, 1, 0] }
            },
            toRead: {
              $sum: { $cond: [{ $eq: ['$shelf', 'toRead'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Rastgele alıntı
      UserBook.aggregate([
        { $match: { user: userId } },
        { $unwind: '$quotes' },
        { $sample: { size: 1 } },
        {
          $lookup: {
            from: 'books',
            localField: 'book',
            foreignField: '_id',
            as: 'book'
          }
        },
        { $unwind: '$book' }
      ]),
      
      // Bu ayki ilerleme
      UserBook.find({
        user: userId,
        shelf: 'completed',
        'readingStatus.endDate': {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }).countDocuments()
    ]);

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);

    res.json({
      success: true,
      data: {
        currentlyReading,
        recentlyCompleted,
        stats: totalStats[0] || {
          totalBooks: 0,
          completedBooks: 0,
          currentlyReading: 0,
          toRead: 0
        },
        randomQuote: randomQuote[0] || null,
        monthlyProgress: {
          completed: monthlyProgress,
          goal: user.goals.monthly.books
        },
        user: {
          name: user.name,
          goals: user.goals,
          stats: user.stats,
          achievements: user.achievements.slice(-5) // Son 5 başarı
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard verileri alınamadı'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Kitap Yolculuğum API çalışıyor!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📚 MongoDB: Bağlı
  `);
});

module.exports = app;