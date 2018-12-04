var mongoose = require('mongoose');

var medSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: String

    },
    visitId: {
        type: String
    },
    providerId: {
        type: String
    },
    content:{
        type: Object
    },
    displayName: {
        type: String
    },
    status: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('med', medSchema);