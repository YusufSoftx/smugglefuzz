const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const User = require('../models/User');
const googleBooksAPI = require('../utils/googleBooks');

// @desc    Google Books API ile kitap ara
// @route   GET /api/books/search
// @access  Private
const searchBooks = async (req, res) => {
  try {
    const { q, type = 'general', maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }

    let searchResults = [];

    switch (type) {
      case 'isbn':
        const bookByISBN = await googleBooksAPI.searchByISBN(q);
        searchResults = bookByISBN ? [bookByISBN] : [];
        break;
      case 'author':
        searchResults = await googleBooksAPI.searchByAuthor(q, maxResults);
        break;
      case 'title':
        searchResults = await googleBooksAPI.searchByTitle(q, maxResults);
        break;
      default:
        searchResults = await googleBooksAPI.searchBooks(q, maxResults);
    }

    res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kitap arama sırasında bir hata oluştu'
    });
  }
};

// @desc    Kitabı kütüphaneye ekle
// @route   POST /api/books
// @access  Private
const addBookToLibrary = async (req, res) => {
  try {
    const {
      googleBooksId,
      shelf = 'toRead',
      customBookData,
      rating,
      review,
      currentPage = 0
    } = req.body;

    let bookData;

    // Google Books'tan mı yoksa manuel mi ekleniyor?
    if (googleBooksId) {
      // Google Books'tan veri çek
      bookData = await googleBooksAPI.getBookDetails(googleBooksId);
    } else if (customBookData) {
      // Manuel veri kullan
      bookData = customBookData;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google Books ID veya kitap bilgileri gereklidir'
      });
    }

    // Kitap zaten veritabanında var mı kontrol et
    let book = await Book.findOne({ googleBooksId: googleBooksId || null });

    if (!book) {
      // Yeni kitap oluştur
      book = await Book.create(bookData);
    }

    // Kullanıcının bu kitabı zaten kütüphanesinde var mı kontrol et
    const existingUserBook = await UserBook.findOne({
      user: req.user._id,
      book: book._id
    });

    if (existingUserBook) {
      return res.status(400).json({
        success: false,
        message: 'Bu kitap zaten kütüphanenizde mevcut'
      });
    }

    // UserBook oluştur
    const userBookData = {
      user: req.user._id,
      book: book._id,
      shelf,
      'readingStatus.currentPage': currentPage
    };

    if (rating) userBookData.rating = rating;
    if (review) userBookData.review = review;

    // Okuma tarihleri
    if (shelf === 'reading') {
      userBookData['readingStatus.startDate'] = new Date();
    } else if (shelf === 'completed') {
      userBookData['readingStatus.startDate'] = new Date();
      userBookData['readingStatus.endDate'] = new Date();
      userBookData['readingStatus.currentPage'] = book.pageCount || 0;
    }

    const userBook = await UserBook.create(userBookData);

    // İlerleme yüzdesini hesapla
    userBook.calculateProgress();
    await userBook.save();

    // Başarı rozetleri kontrol et
    await checkAchievements(req.user._id, 'book_added');

    // Popolate edilmiş veriyi döndür
    const populatedUserBook = await UserBook.findById(userBook._id)
      .populate('book');

    res.status(201).json({
      success: true,
      message: 'Kitap başarıyla kütüphaneye eklendi',
      data: populatedUserBook
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      message: 'Kitap eklenirken bir hata oluştu'
    });
  }
};

// @desc    Kullanıcının kitaplarını getir (rafına göre)
// @route   GET /api/books/library
// @access  Private
const getUserBooks = async (req, res) => {
  try {
    const {
      shelf,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Query oluştur
    const query = { user: req.user._id };
    
    if (shelf) {
      query.shelf = shelf;
    }

    // Arama filtresi
    let aggregatePipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' }
    ];

    // Metin araması
    if (search) {
      aggregatePipeline.push({
        $match: {
          $or: [
            { 'book.title': { $regex: search, $options: 'i' } },
            { 'book.author': { $regex: search, $options: 'i' } },
            { 'customTags': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Sıralama
    const sortStage = {};
    if (sortBy === 'title') {
      sortStage['book.title'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'author') {
      sortStage['book.author'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortStage['rating'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    aggregatePipeline.push({ $sort: sortStage });

    // Sayfalama
    const skip = (page - 1) * limit;
    aggregatePipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const userBooks = await UserBook.aggregate(aggregatePipeline);

    // Toplam sayı
    const totalCount = await UserBook.countDocuments(query);

    res.status(200).json({
      success: true,
      count: userBooks.length,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      data: userBooks
    });
  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({
      success: false,
      message: 'Kitaplar getirilirken bir hata oluştu'
    });
  }
};

// @desc    Kitap detaylarını getir
// @route   GET /api/books/:id
// @access  Private
const getBookDetails = async (req, res) => {
  try {
    const userBook = await UserBook.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('book');

    if (!userBook) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: userBook
    });
  } catch (error) {
    console.error('Get book details error:', error);
    res.status(500).json({
      success: false,
      message: 'Kitap detayları getirilirken bir hata oluştu'
    });
  }
};

// @desc    Kitap okuma durumunu güncelle
// @route   PUT /api/books/:id/progress
// @access  Private
const updateReadingProgress = async (req, res) => {
  try {
    const { currentPage, shelf } = req.body;

    const userBook = await UserBook.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('book');

    if (!userBook) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    // Okuma durumunu güncelle
    if (currentPage !== undefined) {
      userBook.readingStatus.currentPage = currentPage;
      userBook.readingStatus.lastReadDate = new Date();
      
      // İlerleme yüzdesini hesapla
      userBook.calculateProgress();

      // Kullanıcının okuma serisini güncelle
      const user = await User.findById(req.user._id);
      user.updateReadingStreak();
      await user.save();
    }

    // Raf değişikliği
    if (shelf && shelf !== userBook.shelf) {
      userBook.shelf = shelf;

      if (shelf === 'reading' && !userBook.readingStatus.startDate) {
        userBook.readingStatus.startDate = new Date();
      } else if (shelf === 'completed') {
        userBook.readingStatus.endDate = new Date();
        userBook.readingStatus.currentPage = userBook.book.pageCount || 0;
        userBook.calculateProgress();

        // İstatistikleri güncelle
        const user = await User.findById(req.user._id);
        user.stats.totalBooksRead += 1;
        user.stats.totalPagesRead += userBook.book.pageCount || 0;
        await user.save();

        // Başarı rozetleri kontrol et
        await checkAchievements(req.user._id, 'book_completed');
      }
    }

    await userBook.save();

    res.status(200).json({
      success: true,
      message: 'Okuma durumu güncellendi',
      data: userBook
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Okuma durumu güncellenirken bir hata oluştu'
    });
  }
};

// @desc    Kitaba not ekle
// @route   POST /api/books/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { content, pageNumber } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Not içeriği gereklidir'
      });
    }

    const userBook = await UserBook.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!userBook) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    userBook.notes.push({
      content,
      pageNumber
    });

    await userBook.save();

    res.status(201).json({
      success: true,
      message: 'Not başarıyla eklendi',
      note: userBook.notes[userBook.notes.length - 1]
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Not eklenirken bir hata oluştu'
    });
  }
};

// @desc    Kitaba alıntı ekle
// @route   POST /api/books/:id/quotes
// @access  Private
const addQuote = async (req, res) => {
  try {
    const { content, pageNumber, tags, isPhoto, photoUrl } = req.body;

    if (!content && !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Alıntı içeriği veya fotoğraf gereklidir'
      });
    }

    const userBook = await UserBook.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!userBook) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    userBook.quotes.push({
      content,
      pageNumber,
      tags: tags || [],
      isPhoto: isPhoto || false,
      photoUrl
    });

    await userBook.save();

    res.status(201).json({
      success: true,
      message: 'Alıntı başarıyla eklendi',
      quote: userBook.quotes[userBook.quotes.length - 1]
    });
  } catch (error) {
    console.error('Add quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Alıntı eklenirken bir hata oluştu'
    });
  }
};

// Başarı rozetleri kontrol fonksiyonu
const checkAchievements = async (userId, achievementType) => {
  try {
    const user = await User.findById(userId);
    const userBooksCount = await UserBook.countDocuments({ 
      user: userId, 
      shelf: 'completed' 
    });

    const newAchievements = [];

    switch (achievementType) {
      case 'book_added':
        const totalBooks = await UserBook.countDocuments({ user: userId });
        if (totalBooks === 1) {
          newAchievements.push({
            type: 'first_book',
            title: 'İlk Kitabın!',
            description: 'Kütüphanene ilk kitabını ekledin',
            icon: '📚'
          });
        }
        break;
        
      case 'book_completed':
        if (userBooksCount === 1) {
          newAchievements.push({
            type: 'first_completion',
            title: 'İlk Bitiş!',
            description: 'İlk kitabını bitirdin',
            icon: '🎉'
          });
        } else if (userBooksCount === 10) {
          newAchievements.push({
            type: 'ten_books',
            title: 'Kitap Kurdu',
            description: '10 kitap okudun',
            icon: '🐛'
          });
        } else if (userBooksCount === 50) {
          newAchievements.push({
            type: 'fifty_books',
            title: 'Usta Okuyucu',
            description: '50 kitap okudun',
            icon: '👑'
          });
        }
        break;
    }

    // Yeni rozetleri ekle
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
      await user.save();
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
};

module.exports = {
  searchBooks,
  addBookToLibrary,
  getUserBooks,
  getBookDetails,
  updateReadingProgress,
  addNote,
  addQuote
};