const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [50, 'İsim 50 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir email adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    defaultView: {
      type: String,
      enum: ['grid', 'list'],
      default: 'grid'
    },
    language: {
      type: String,
      default: 'tr'
    }
  },
  goals: {
    monthly: {
      books: {
        type: Number,
        default: 2
      },
      pages: {
        type: Number,
        default: 500
      }
    },
    yearly: {
      books: {
        type: Number,
        default: 24
      },
      pages: {
        type: Number,
        default: 6000
      }
    }
  },
  stats: {
    totalBooksRead: {
      type: Number,
      default: 0
    },
    totalPagesRead: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastReadDate: {
      type: Date
    }
  },
  achievements: [{
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Şifreyi hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Okuma serisi güncelleme metodu
userSchema.methods.updateReadingStreak = function() {
  const today = new Date();
  const lastRead = this.stats.lastReadDate;
  
  if (!lastRead) {
    this.stats.currentStreak = 1;
    this.stats.longestStreak = Math.max(this.stats.longestStreak, 1);
  } else {
    const diffDays = Math.floor((today - lastRead) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.stats.currentStreak += 1;
      this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
    } else if (diffDays > 1) {
      this.stats.currentStreak = 1;
    }
  }
  
  this.stats.lastReadDate = today;
};

module.exports = mongoose.model('User', userSchema);