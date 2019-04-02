var mongoose = require('mongoose');

var problemSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
   
    patientEmail:{
        type: String
    },
    problemItemID: {
        type: String
    },
    familyMember:{
        type: String 
    },
    role:{
        type: String
    },
    infor:{
        type:Object 
    },
    name: {
        type:String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('problem', problemSchema);