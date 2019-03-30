var mongoose = require('mongoose');

var LabSchema = new mongoose.Schema({

    desc: {
        type: String
    },
    name: {
        type: String
    },
    displayName: {
        type: String
    },
    about: {
        type: String
    },
    patientID: {
        type: String
    },
    visitId: {
        type: String
    },
    orderId: {
        type: String
    },
    providerId: {
        type: String
    },
    obID:{
        type: String
    },
    displayName: {
        type: String
    },
    uploaded:{
        type: String
    },
    status: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', LabSchema);

//https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d