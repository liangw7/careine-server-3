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
    serviceID:{
        type:String
    },
    
    providerID:{
        type: String
    },
    status:{
        type: String
    },
    value:{
        type:Number
    },
    UOM:{
        type: String
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

module.exports = mongoose.model('order', orderSchema);