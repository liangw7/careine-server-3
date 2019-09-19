var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({


    email: {
        type: String,
        lowercase: true,
        unique: true

    },
    password: {
        type: String

    },
    role: {
        type: String
    },
    name:{
        type: String
    },
    phone:{
        type: String
    },
    ssn:{
        type: String
    },
    gender:{
        type: String
    },
    age:{
        type: String
    },
    birthday:{
        type: String
    },
    photo:{
        type: String
    },
   specialty:{
        type: String
    },
    color:{
        type: String
    },
    desc:{
        type: String
    },
    procedureDate:{
        type:Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },

    activity: { type: Object },
    profiles:[],
    service: { type: Object },
    marketPlace: { type: Object },
    providers:[],
    labs:[],
    serviceList:[],
    marketList:[],
    allergyList:[],
    primaryProblem:{ type: Object },
    userID: {
        type: String
    },
    patientLists:[],
    screeningList:[],
    educations:[],
    carePlans:[]
}, {
    timestamps: true
});

UserSchema.pre('save', function(next) {

    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {

        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function(err, hash) {

            if (err) {
                return next(err);
            }

            user.password = hash;
            next();

        });

    });

});

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {

    bcrypt.compare(passwordAttempt, this.password, function(err, isMatch) {

        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });

}

module.exports = mongoose.model('User', UserSchema);