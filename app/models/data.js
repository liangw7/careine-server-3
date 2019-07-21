var mongoose = require('mongoose');

var dataSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
    userID: {
        type: String
    },
    userEmail:{
        type: String
    },
    patientEmail:{
        type: String
    },
    visitID:{
        type: String
    },
    orderID:{
        type: String
    },
    followupID:{
        type: String
    },
    problemItemID:{
        type: String
    },
    familyMember: {
        type: String
    },
    medicationItemID:{
        type: String
    },
    scheduleID:{
        type: String
    },
    registryUserID: {
        type: String
    },
    registryUserEmail:{
        type:String
    },
    
    obID: {
        type: String
    },
    obType:{
        type:String
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