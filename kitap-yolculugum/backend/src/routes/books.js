const express = require('express');
const {
  searchBooks,
  addBookToLibrary,
  getUserBooks,
  getBookDetails,
  updateReadingProgress,
  addNote,
  addQuote
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar korunmalı
router.use(protect);

// Kitap arama ve kütüphane yönetimi
router.get('/search', searchBooks);
router.post('/', addBookToLibrary);
router.get('/library', getUserBooks);
router.get('/:id', getBookDetails);

// Okuma durumu güncelleme
router.put('/:id/progress', updateReadingProgress);

// Notlar ve alıntılar
router.post('/:id/notes', addNote);
router.post('/:id/quotes', addQuote);

module.exports = router;