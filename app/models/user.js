var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({


    email: {
        type: String,
        //  lowercase: true,
        //   unique: true

    },
    weChatID: {
        type: String
    },
    openID: {
        type: String
    },
    weChatNickname: {
        type: String
    },
    deviceUserID: {
        type: String
    },
    userName: {
        type: String
    },
    password: {
        type: String

    },
    sortNumber: {
        type: Number
    },
    role: {
        type: String
    },
    name: {
        type: String
    },
    enName: {
        type: String
    },
    phone: {
        type: String
    },
    ssn: {
        type: String
    },
    city: {
        type: String
    },
    gender: {
        type: String
    },
    age: {
        type: Number
    },
    ageObj: {
        type: Object
    },
    birthday: {
        type: String
    },
    photo: {
        type: String
    },
    specialty: {
        type: String
    },
    color: {
        type: String
    },
    desc: {
        type: String
    },
    procedureDate: {
        type: Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },

    activity: { type: Object },
    profiles: [],
    service: { type: Object },
    marketPlace: { type: Object },
    providers: [],
    introForms: [],
    labs: [],
    followups: [],
    serviceList: [],
    marketList: [],
    allergyList: [],
    primaryProblem: { type: Object },
    userID: {
        type: String
    },
    status: {
        type: String
    },
    title: {
        type: String
    },
    enTitle: {
        type: String
    },
    desc: {
        type: String
    },
    enDesc: {
        type: String
    },
    follow: {
        type: String
    },
    patientLists: [],
    screeningList: [],
    educations: [],
    carePlans: []
}, {
    timestamps: true
});

UserSchema.pre('save', function (next) {

    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {

        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function (err, hash) {

            if (err) {
                return next(err);
            }

            user.password = hash;
            next();

        });

    });

});

UserSchema.methods.comparePassword = function (passwordAttempt, cb) {

    bcrypt.compare(passwordAttempt, this.password, function (err, isMatch) {

        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });

}

module.exports = mongoose.model('User', UserSchema);