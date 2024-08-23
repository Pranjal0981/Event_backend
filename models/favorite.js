const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: true,  // Assuming that adding a document here means it's favorited
  },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
