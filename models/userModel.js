const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  avatar: {
    url: String,
    fieldId: String,
},
lastLogin: {
    type: Date,
    default: null
},
blocked: {
    type: Boolean,
    default: false
},
otp: {
    type: Number,
    default: -1
},
});

userSchema.pre("save", function () {
    if (!this.isModified("password")) {
        return;
    }
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt)
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

userSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


const User = mongoose.model('User', userSchema);

module.exports = User;
