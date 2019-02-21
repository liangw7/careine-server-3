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
    userID: {
        type: String
    },
    content:{
        type: Object
    },
    service:{
        type: Object
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('order', medSchema);