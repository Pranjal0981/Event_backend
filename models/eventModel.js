// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User',},
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  eventType:{type:String,required:true},
  price: { type: Number, required: true },
  image: {
    url: String,
    fieldId: String,
},
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
