const mongoose = require('mongoose');

const hospital_reachedSchema = mongoose.Schema({
    hospitalId: { type: String, required: true },
    pin: { type: Number },
    driverId: { type: String },
    aadhaar: { type: String, required: true },
    caseId: {type: String, required: true},
    type: {type:String, required: true}
});

module.exports = mongoose.model('Hospital_Reached', hospital_reachedSchema);
