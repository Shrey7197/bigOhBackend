const mongoose = require('mongoose');

// Defining user schema
// User schema attributes: (_id, aadhaar, password, name, gender, age, phoneNumber, address, pin, bloodGroup, insuranceId)
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    aadhaar: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String },
    gender: { type: String },
    age: { type: Number },
    phoneNumber: {type: String },
    address: { type: String },
    pin: { type: Number },
    bloodGroup: { type: String },
    insuranceId: { type: String }
});

module.exports = mongoose.model('User', userSchema);