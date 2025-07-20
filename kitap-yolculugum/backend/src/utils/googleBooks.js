const axios = require('axios');

class GoogleBooksAPI {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/books/v1/volumes';
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  }

  async searchBooks(query, maxResults = 10) {
    try {
      const params = {
        q: query,
        maxResults,
        printType: 'books',
        langRestrict: 'tr', // Öncelikle Türkçe kitaplar
      };

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.baseURL, { params });

      return this.formatSearchResults(response.data.items || []);
    } catch (error) {
      console.error('Google Books API error:', error.message);
      throw new Error('Kitap arama servisi geçici olarak kullanılamıyor');
    }
  }

  async searchByISBN(isbn) {
    try {
      const query = `isbn:${isbn}`;
      const response = await this.searchBooks(query, 1);
      return response[0] || null;
    } catch (error) {
      console.error('ISBN search error:', error.message);
      return null;
    }
  }

  async getBookDetails(googleBooksId) {
    try {
      const url = `${this.baseURL}/${googleBooksId}`;
      const params = {};

      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(url, { params });
      return this.formatBookDetails(response.data);
    } catch (error) {
      console.error('Book details error:', error.message);
      throw new Error('Kitap detayları alınamıyor');
    }
  }

  formatSearchResults(items) {
    return items.map(item => this.formatBookDetails(item));
  }

  formatBookDetails(item) {
    const volumeInfo = item.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    return {
      googleBooksId: item.id,
      title: volumeInfo.title || '',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
      publisher: volumeInfo.publisher || '',
      publishedDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : null,
      description: volumeInfo.description || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || 'tr',
      isbn: this.extractISBN(volumeInfo.industryIdentifiers || []),
      coverImage: imageLinks.large || imageLinks.medium || imageLinks.small || imageLinks.thumbnail || '',
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || ''
    };
  }

  extractISBN(identifiers) {
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    return isbn13?.identifier || isbn10?.identifier || '';
  }

  // Alternatif arama metotları
  async searchByAuthor(author, maxResults = 10) {
    return this.searchBooks(`inauthor:${author}`, maxResults);
  }

  async searchByTitle(title, maxResults = 10) {
    return this.searchBooks(`intitle:${title}`, maxResults);
  }

  async searchByCategory(category, maxResults = 10) {
    return this.searchBooks(`subject:${category}`, maxResults);
  }
}

module.exports = new GoogleBooksAPI();