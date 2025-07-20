const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  shelf: {
    type: String,
    enum: ['reading', 'completed', 'toRead', 'abandoned'],
    default: 'toRead',
    required: true
  },
  // Okuma durumu
  readingStatus: {
    currentPage: {
      type: Number,
      default: 0,
      min: 0
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startDate: Date,
    endDate: Date,
    lastReadDate: Date
  },
  // Kullanıcı değerlendirmesi
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [2000, 'İnceleme 2000 karakterden uzun olamaz']
  },
  // Kişisel notlar
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Not 5000 karakterden uzun olamaz']
    },
    pageNumber: Number,
    isPrivate: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Alıntılar
  quotes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Alıntı 1000 karakterden uzun olamaz']
    },
    pageNumber: Number,
    tags: [{
      type: String,
      trim: true
    }],
    isPhoto: {
      type: Boolean,
      default: false
    },
    photoUrl: String,
    isFavorite: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Okuma hedefleri
  personalGoals: {
    targetEndDate: Date,
    dailyPageGoal: Number
  },
  // Favori kitap işareti
  isFavorite: {
    type: Boolean,
    default: false
  },
  // Özel etiketler
  customTags: [{
    type: String,
    trim: true
  }],
  // Okuma oturumları (gelişmiş istatistikler için)
  readingSessions: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    pagesRead: {
      type: Number,
      min: 0
    },
    duration: {
      type: Number, // dakika cinsinden
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Compound index: Her kullanıcı için bir kitaptan sadece bir tane olmalı
userBookSchema.index({ user: 1, book: 1 }, { unique: true });

// Diğer indeksler
userBookSchema.index({ user: 1, shelf: 1 });
userBookSchema.index({ user: 1, isFavorite: 1 });
userBookSchema.index({ user: 1, rating: 1 });
userBookSchema.index({ 'readingStatus.lastReadDate': -1 });

// İlerleme yüzdesini hesaplama metodu
userBookSchema.methods.calculateProgress = function() {
  if (this.book && this.book.pageCount && this.readingStatus.currentPage) {
    this.readingStatus.progressPercentage = Math.round(
      (this.readingStatus.currentPage / this.book.pageCount) * 100
    );
  }
  return this.readingStatus.progressPercentage;
};

// Not güncelleme metodu
userBookSchema.methods.updateNote = function(noteId, content) {
  const note = this.notes.id(noteId);
  if (note) {
    note.content = content;
    note.updatedAt = new Date();
  }
  return note;
};

// Alıntı arama metodu
userBookSchema.methods.searchQuotes = function(searchTerm) {
  return this.quotes.filter(quote => 
    quote.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

module.exports = mongoose.model('UserBook', userBookSchema);