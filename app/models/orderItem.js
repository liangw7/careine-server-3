var mongoose = require('mongoose');

var orderItemSchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
   orderType:{
       type: String
   },
   medsClass:{
       type: String
   },
    uom: {
        type: String
    },
    labs:[],
    images:[],
    forms:[],
  
    synonyms:{
        type: []
    },
    packageVolume:{
        type: String
    },
    packageType:{
        type: String
    },
    medForm:{
        type: String
    },
    dose:{
        type: String
    },
    allergyList:{
        type:[]
    },
    items:{
        type:[]
    },
    coOrders:{
        type:[]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('orderItem', orderItemSchema);