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
    }, 
    availableAtYear: {
        type: Number
    },
    availableAtMonth: {
        type: Number
    },
    availableAtDate: {
        type: Number
    },
    availableAtHours: {
        type: Number
    },
    availableAtMinutes: {
        type: Number
    },
    reservedAt: {
        type: Date
    }
  
}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);