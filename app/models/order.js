var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    infor: {
        type: Object

    },
    visitID: {
        type: String
    },
    
    orderItemID:{
        type: String
    },
    
    providerID:{
        type: String
    },
    status:{
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('order', orderSchema);