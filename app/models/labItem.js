var mongoose = require('mongoose');

var labItemSchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
   from:{
       type: Number
   },
   to:{
       type: Number
   },
    uom: {
        type: String
    },
    labType:{
        type: String
    },
    synonyms:{
        type: []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('labItem', labItemSchema);