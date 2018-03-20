const mongoose = require('mongoose');

// Defining hospital schema
// Hospital schema attributes: (_id, hospitalId, password, name, phoneNumber, address, pin)
const hospitalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    hospitalId: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String },
    phoneNumber: {type: String },
    address: { type: String },
    pin: { type: Number },
    h_latitude: { type: Number },
    h_longitude: {type: Number }
});

module.exports = mongoose.model('Hospital', hospitalSchema);