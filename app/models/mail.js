var mongoose = require('mongoose');

var mailSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    providerEmail: {
        type: String
    },
    userID:{
        type: String
    },
    userEmail:{
        type: String
    },
    patientEmail:{
        type: String
    },
    topic:{
        type: String
    },
   pToP: {
       type: String
   },
    status: {
        type: String
    },
    contentList:{
        type: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('mail', mailSchema);