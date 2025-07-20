const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');

// @desc    Kullanıcı kayıt
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veriler',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password
    });

    // İlk başarı rozetini ver
    user.achievements.push({
      type: 'first_registration',
      title: 'Hoş Geldin!',
      description: 'Kitap Yolculuğuna başladın',
      icon: '🎉'
    });

    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Kullanıcı giriş
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veriler',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Şifreyi kontrol et
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktive edilmiş'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
};

// @desc    Mevcut kullanıcı bilgilerini getir
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        goals: user.goals,
        stats: user.stats,
        achievements: user.achievements,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı'
    });
  }
};

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, preferences, goals } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    if (goals) {
      user.goals = { ...user.goals, ...goals };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        goals: user.goals,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken bir hata oluştu'
    });
  }
};

// @desc    Çıkış yap
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Başarıyla çıkış yapıldı'
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout
};