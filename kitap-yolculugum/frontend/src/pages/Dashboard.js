import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { 
  BookOpenIcon, 
  ChartBarIcon, 
  FireIcon, 
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { 
  BookOpenIcon as BookOpenSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await bookService.getDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Dashboard data load error:', error);
      toast.error('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueReading = async (book) => {
    // Bu fonksiyon kitap detay sayfasına yönlendirecek
    console.log('Continue reading:', book);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalBooks: 0,
    completedBooks: 0,
    currentlyReading: 0,
    toRead: 0
  };

  const currentlyReading = dashboardData?.currentlyReading || [];
  const recentlyCompleted = dashboardData?.recentlyCompleted || [];
  const randomQuote = dashboardData?.randomQuote;
  const monthlyProgress = dashboardData?.monthlyProgress || { completed: 0, goal: 2 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hoş geldin mesajı */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Merhaba {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kitap yolculuğunun özetine hoş geldin.
        </p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
              <BookOpenSolid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Toplam Kitap</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-20">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completedBooks}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-500 bg-opacity-20">
              <BookOpenIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Şu An Okuyor</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.currentlyReading}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-20">
              <FireIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Okuma Serisi</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{user?.stats?.currentStreak || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol sütun */}
        <div className="lg:col-span-2 space-y-8">
          {/* Okumaya devam et */}
          {currentlyReading.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Okumaya Devam Et
                </h2>
                <Link to="/library?shelf=reading" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Tümünü gör
                </Link>
              </div>
              
              <div className="space-y-4">
                {currentlyReading.slice(0, 2).map((userBook) => (
                  <div key={userBook._id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      {userBook.book.coverImage ? (
                        <img 
                          src={userBook.book.coverImage} 
                          alt={userBook.book.title}
                          className="h-16 w-12 object-cover rounded book-cover"
                        />
                      ) : (
                        <div className="h-16 w-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded book-cover flex items-center justify-center">
                          <BookOpenSolid className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{userBook.book.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{userBook.book.author}</p>
                      
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>İlerleme</span>
                          <span>{userBook.readingStatus.progressPercentage || 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${userBook.readingStatus.progressPercentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Son bitirilen kitaplar */}
          {recentlyCompleted.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Son Bitirilen Kitaplar
                </h2>
                <Link to="/library?shelf=completed" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Tümünü gör
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentlyCompleted.slice(0, 4).map((userBook) => (
                  <div key={userBook._id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {userBook.book.coverImage ? (
                        <img 
                          src={userBook.book.coverImage} 
                          alt={userBook.book.title}
                          className="h-12 w-9 object-cover rounded book-cover"
                        />
                      ) : (
                        <div className="h-12 w-9 bg-gradient-to-br from-green-400 to-green-600 rounded book-cover flex items-center justify-center">
                          <BookOpenSolid className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{userBook.book.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{userBook.book.author}</p>
                      {userBook.rating && (
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <HeartSolid 
                              key={i} 
                              className={`h-3 w-3 ${i < userBook.rating ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ sütun */}
        <div className="space-y-8">
          {/* Aylık hedef */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
              Bu Ay Hedefin
            </h2>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - (monthlyProgress.completed / monthlyProgress.goal))}
                    className="text-primary-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {monthlyProgress.completed}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {monthlyProgress.goal} kitaptan {monthlyProgress.completed} tanesi tamamlandı
              </p>
              
              {monthlyProgress.completed >= monthlyProgress.goal && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                  🎉 Tebrikler! Bu ayın hedefini tamamladın!
                </p>
              )}
            </div>
          </div>

          {/* Rastgele alıntı */}
          {randomQuote && (
            <div className="card p-6 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 border-accent-200 dark:border-accent-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-accent-600" />
                Bugünün Alıntısı
              </h2>
              
              <blockquote className="text-gray-700 dark:text-gray-300 italic mb-3">
                "{randomQuote.quotes.content}"
              </blockquote>
              
              <cite className="text-sm text-gray-600 dark:text-gray-400">
                — {randomQuote.book.title}, {randomQuote.book.author}
              </cite>
            </div>
          )}

          {/* Hızlı eylemler */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hızlı Eylemler
            </h2>
            
            <div className="space-y-3">
              <Link 
                to="/add-book" 
                className="flex items-center p-3 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-3" />
                Yeni Kitap Ekle
              </Link>
              
              <Link 
                to="/library" 
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <BookOpenIcon className="h-5 w-5 mr-3" />
                Kütüphanemi Görüntüle
              </Link>
              
              <Link 
                to="/stats" 
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-3" />
                İstatistikleri Gör
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;