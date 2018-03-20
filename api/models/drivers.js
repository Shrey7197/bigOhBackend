const mongoose = require('mongoose');

// Defining driver schema
// Driver schema attributes: (_id, driverId, password, name, address, phoneNumber)
const driverSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    driverId: { type: String },
    password: { type: String },
    name: { type: String },
    address: { type: String },
    phoneNumber: { type: String }
});

module.exports = mongoose.model('Driver', driverSchema);