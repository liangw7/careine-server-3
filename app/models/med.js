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
    visitID: {
        type: String
    },
    providerID: {
        type: String
    },
    content:{
        type: Object
    },
    displayName: {
        type: String
    },
    name:{
        type: String
    },
    status: {
        type: String
    },
    medicationID:{
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('med', medSchema);