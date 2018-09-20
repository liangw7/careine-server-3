var mongoose = require('mongoose');

var visitSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);