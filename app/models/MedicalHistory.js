var mongoose = require('mongoose');

var MedicalHistorySchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    content: {
        type: Object
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);