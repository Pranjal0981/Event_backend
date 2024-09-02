const QRCode = require('qrcode');
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  numberOfPeople: Number,
  qrCode: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.pre('save', async function (next) {
  if (!this.qrCode) {
    const qrCodeData = `Booking ID: ${this._id}, User ID: ${this.userId}, Event ID: ${this.eventId}`;
    this.qrCode = await QRCode.toDataURL(qrCodeData); // Generate QR code as a base64 string
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
