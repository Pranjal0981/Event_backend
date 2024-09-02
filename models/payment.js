const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    payment_id:{
        type:String,
        required:true,
    },
    signature:{
        type:String,
        required:true,
    },
    orderId:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    numberOfPeople:{
        type:Number,
        required:true
    },
    qrCode:{
        type:String,
        // required:true
    },
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event',
        required:true
    }
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment