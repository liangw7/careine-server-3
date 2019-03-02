var mongoose = require('mongoose');

var diagnosisSchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
    level: {
        type: Number
    },
    subDiagnosisList: []
    
}, {
    timestamps: true
});

module.exports = mongoose.model('diagnosis', diagnosisSchema);