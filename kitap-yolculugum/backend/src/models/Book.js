const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Kitap başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  author: {
    type: String,
    required: [true, 'Yazar adı gereklidir'],
    trim: true,
    maxlength: [100, 'Yazar adı 100 karakterden uzun olamaz']
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Yayınevi adı 100 karakterden uzun olamaz']
  },
  publishedDate: {
    type: Date
  },
  pageCount: {
    type: Number,
    min: [1, 'Sayfa sayısı en az 1 olmalıdır']
  },
  language: {
    type: String,
    default: 'tr'
  },
  categories: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [2000, 'Açıklama 2000 karakterden uzun olamaz']
  },
  coverImage: {
    type: String,
    default: ''
  },
  googleBooksId: {
    type: String,
    trim: true
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  // Kullanıcı tarafından eklenen ek bilgiler
  customFields: {
    series: String,
    seriesNumber: Number,
    translator: String,
    edition: String,
    acquisitionDate: Date,
    acquisitionPrice: Number,
    bookFormat: {
      type: String,
      enum: ['paperback', 'hardcover', 'ebook', 'audiobook'],
      default: 'paperback'
    }
  }
}, {
  timestamps: true
});

// İndeksler
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ author: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ publishedDate: -1 });

module.exports = mongoose.model('Book', bookSchema);