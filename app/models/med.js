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

    }

}, {
    timestamps: true
});

module.exports = mongoose.model('med', medSchema);