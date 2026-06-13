require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const phoneRoutes = require('./routes/phones');
const shortlistRoutes = require('./routes/shortlist');
const wishlistRoutes = require('./routes/wishlist');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const compareRoutes = require('./routes/compare');
const preferenceRoutes = require('./routes/preferences');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/wishlist', wishlistRoutes); // backward compat
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/preferences', preferenceRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
