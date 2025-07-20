import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        
        if (storedUser) {
          // Stored user'ı kullan ama background'da güncel bilgileri de al
          dispatch({ type: actionTypes.SET_USER, payload: storedUser });
          
          // Background'da güncel bilgileri al
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              dispatch({ type: actionTypes.SET_USER, payload: response.user });
            }
          } catch (error) {
            // Hata varsa stored user'ı kullanmaya devam et
            console.warn('Failed to refresh user data:', error);
          }
        } else {
          // Stored user yoksa logout et
          logout();
        }
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.user });
        toast.success(`Hoş geldin ${response.user.name}!`);
        return response;
      } else {
        throw new Error(response.message || 'Giriş başarısız');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Giriş işlemi başarısız';
      dispatch({ type: actionTypes.SET_ERROR, payload: message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.user });
        toast.success(`Hoş geldin ${response.user.name}! Hesabın başarıyla oluşturuldu.`);
        return response;
      } else {
        throw new Error(response.message || 'Kayıt başarısız');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Kayıt işlemi başarısız';
      dispatch({ type: actionTypes.SET_ERROR, payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: actionTypes.LOGOUT });
      toast.success('Başarıyla çıkış yaptınız');
    } catch (error) {
      // Logout'ta hata olsa bile local state'i temizle
      dispatch({ type: actionTypes.LOGOUT });
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData) => {
    try {
      dispatch({ type: actionTypes.CLEAR_ERROR });

      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        dispatch({ type: actionTypes.SET_USER, payload: response.user });
        toast.success('Profil başarıyla güncellendi');
        return response;
      } else {
        throw new Error(response.message || 'Profil güncellenemedi');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profil güncellenirken hata oluştu';
      dispatch({ type: actionTypes.SET_ERROR, payload: message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};