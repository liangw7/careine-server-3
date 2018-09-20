var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({

    name: {
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
    addMoreThanOnce: {
        type: String
    },
    options: [],
    obs: [],
    obSets: [],
    profile: [],
    calculationItems: [],
    userProfile: { type: Object }


}, {
    timestamps: true
});

module.exports = mongoose.model('category', categorySchema);