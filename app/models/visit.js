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
    orderID: {
        type: String
    },
    type: {
        type: String
    },
    profile: {
        type: Object
    },
    status: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);