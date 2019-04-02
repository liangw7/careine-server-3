var mongoose = require('mongoose');

var medSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    displayName: {
        type: String
    },
    name:{
        type: String
    },
  
    medicationItemID:{
        type: String
    },
    infor: {
        type: Object
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('med', medSchema);