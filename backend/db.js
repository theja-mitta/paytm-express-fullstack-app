const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb+srv://taskapp:Taskapp%4012345@cluster0.kenmuzt.mongodb.net/paytm_app');

// User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password_hash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

userSchema.methods.createHash = async function(plainTextPassword) {
 const saltRounds = 10;
 const salt =  await bcrypt.genSalt(saltRounds);
 return await bcrypt.hash(plainTextPassword, salt);
}

userSchema.methods.validatePassword = async function(hashedPassword) {
    return await bcrypt.compare(hashedPassword, this.password_hash);
}

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});


// Create a model from the schema
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    Account
};