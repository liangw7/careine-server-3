var mongoose = require('mongoose');

var problemSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
   
    patientEmail:{
        type: String
    },
    problemID: {
        type: String
    },
    role:{
        type:String  //medical , surgical or familyor, social etc.
    },
    name: {
        type: String
    },
    status:{
        type: String //active or resolved
    },
    familyMember:{
        type: String 
    },
    description:{
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('problem', problemSchema);