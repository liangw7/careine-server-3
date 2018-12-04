var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({

    name: {
        type: String
    },
    displayName: {
        type: String
    },
    type: {
        type: String
    },
    field: {
        type: String
    },
    formType: {
        type: String
    },
    activityForm: {
        type: Object
    },
    singleSelection: {
        type: String
    },
    min: {
        type: Number
    },
    max: {
        type: Number
    },
    imageType: {
        type: String
    },
    activityType: {
        type: String
    },
    profileType: {
        type: String
    },
    orderType: {
        type: String
    },
    context: {
        type: String
    },
    uom: {
        type: String
    },
    orderMaster:{
        type: Object
    },
    isOrderMaster:{
        type: String
    },
    addMoreThanOnce: {
        type: String
    },
    allowDuplicate: {
        type: String
    },
    options: [],
    obs: [],
    obSets: [],
    activities: [],
    profiles: [],
    calculationItems: [],
    userProfile: { type: Object },
    labs:[],
    images:[],
    forms:[],
    synonyms:{
        type: String
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
    resource:{
        type: String
    },
    route:{
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('category', categorySchema);