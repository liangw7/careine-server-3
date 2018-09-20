var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({

    desc: {
        type: String
    },
    name: {
        type: String
    },
    about: {
        type: String
    },
    patientID: {
        type: String
    },
    requestID: {
        type: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', ImageSchema);

//https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d