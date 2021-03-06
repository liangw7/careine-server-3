var mongoose = require('mongoose');

var visitSchema = new mongoose.Schema({
    desc: {
        type: Object
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    provider: {
        type: Object
    },
    patient: {
        type: Object
    },
    patientName:{
        type: String
    },
    providerName:{
        type: String
    },
    patientEmail:{
        type: String
    },

    providerEmail:{
        type: String
    },
   
    patientGender:{
        type: String
    }, 
    patientBirthday:{
        type: Date
    },

    providerGender:{
        type: String
    },

    providerSpecialty: {
        type: String
    },

    orderID: {
        type: String
    },
    type: {
        type: String
    },
    followupType:{
        type:String
    },
    profile: {
        type: Object
    },
    profiles: [],
    forms:[],
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
    },
    visitDate:{
        type:Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    }
  
}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);