var mongoose = require('mongoose');

var dataSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
    obID: {
        type: String
    },

    obName: {
        type: String
    },

    value: {
        type: String
    },
    values: {
        type: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('data', dataSchema);