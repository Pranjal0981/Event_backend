const mongoose = require('mongoose'); // Mongoose is used for designing the MongoDB (NoSQL) database schema.
const bcrypt = require('bcryptjs');  // Bcryptjs is used for hashing passwords to securely store them.
const jwt = require('jsonwebtoken'); // JWT is used for creating JSON Web Tokens for authentication.

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: [4, "Firstname should be at least 4 characters long"], // Validation for minimum length of the first name.
    },
    lastName: {
        type: String,
        minlength: [4, "Lastname should be at least 4 characters long"], // Validation for minimum length of the last name.
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'], // Regular expression to validate email format.
        unique: true, // Ensures that each email is unique in the database.
        required: [true, 'Email is required'], // Ensures that email is a required field.
    },
    password: {
        type: String,
        minlength: [4, "Password should be at least 4 characters long"], // Validation for minimum length of the password.
        required: [true, 'Password is required'], // Ensures that password is a required field.
    },
    otp:{
        type: String,
        default:-1
    },
    phoneNumber:{
        type:String,
    }
}, { timestamps: true }); // `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.

// Pre-save middleware to hash the password before saving the user document.
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next(); // If the password hasn't been modified, proceed without re-hashing.
    }
    const salt = bcrypt.genSaltSync(10); // Generate a salt with a cost factor of 10.
    this.password = bcrypt.hashSync(this.password, salt); // Hash the password using the generated salt.
    next(); // Proceed to the next middleware or save operation.
});

// Instance method to compare a given password with the hashed password stored in the database.
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password); // Returns `true` if passwords match, `false` otherwise.
};

// Instance method to generate a JWT token for the user.
userSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE // Token expiration time is set from the environment variables.
    });
};

// Creating a model from the schema and exporting it for use in other parts of the application.
const User = mongoose.model("User", userSchema);

module.exports = User;
