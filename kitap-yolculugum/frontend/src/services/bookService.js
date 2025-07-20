import api from './api';

export const bookService = {
  // Google Books API ile kitap ara
  searchBooks: async (query, type = 'general', maxResults = 10) => {
    const response = await api.get('/books/search', {
      params: { q: query, type, maxResults }
    });
    return response.data;
  },

  // Kitabı kütüphaneye ekle
  addBookToLibrary: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  // Kullanıcının kitaplarını getir
  getUserBooks: async (params = {}) => {
    const response = await api.get('/books/library', { params });
    return response.data;
  },

  // Kitap detaylarını getir
  getBookDetails: async (bookId) => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  // Okuma durumunu güncelle
  updateReadingProgress: async (bookId, progressData) => {
    const response = await api.put(`/books/${bookId}/progress`, progressData);
    return response.data;
  },

  // Kitaba not ekle
  addNote: async (bookId, noteData) => {
    const response = await api.post(`/books/${bookId}/notes`, noteData);
    return response.data;
  },

  // Kitaba alıntı ekle
  addQuote: async (bookId, quoteData) => {
    const response = await api.post(`/books/${bookId}/quotes`, quoteData);
    return response.data;
  },

  // Dashboard verilerini getir
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Kitap kategorilerini getir
  getCategories: async () => {
    // Bu backend'de henüz yok, frontend'de sabit liste kullanacağız
    return {
      success: true,
      data: [
        'Roman',
        'Hikaye',
        'Şiir',
        'Deneme',
        'Biyografi',
        'Tarih',
        'Felsefe',
        'Bilim',
        'Teknoloji',
        'Sanat',
        'Müzik',
        'Spor',
        'Sağlık',
        'Kişisel Gelişim',
        'İş & Ekonomi',
        'Siyaset',
        'Din',
        'Çocuk Kitapları',
        'Gençlik',
        'Akademik',
        'Diğer'
      ]
    };
  },

  // Favori kitapları getir
  getFavoriteBooks: async () => {
    const response = await api.get('/books/library', {
      params: { isFavorite: true }
    });
    return response.data;
  },

  // Alıntıları ara
  searchQuotes: async (searchTerm) => {
    // Bu özellik henüz backend'de yok, frontend'de local arama yapacağız
    return {
      success: true,
      data: [],
      message: 'Alıntı arama özelliği geliştiriliyor'
    };
  }
};