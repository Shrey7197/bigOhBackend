const mongoose = require('mongoose');

// Defining updatedUsers schema
// User schema attributes: (_id, aadhaar, name, gender, age, phoneNumber, address, pin, bloodGroup, insuranceId)
const updatedUserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    aadhaar: { type: String, required: true },
    name: { type: String },
    gender: { type: String },
    age: { type: Number },
    phoneNumber: {type: String },
    address: { type: String },
    pin: { type: Number },
    bloodGroup: { type: String },
    insuranceId: { type: String }
});

module.exports = mongoose.model('UpdatedUser', updatedUserSchema);