var passport = require('passport');
var User = require('../app/models/user');
var config = require('./auth');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;

var localOptions = {
    usernameField: 'email'
};
var adminCredential ={
    email:'liangw0730@gmail.com',
    password:'Outlook!2018',
    role:'admin'
}


var localLogin = new LocalStrategy(localOptions, function(email, password, done) {

console.log ('email', email)
//console.log ('adminCredential',adminCredential )
if (adminCredential.email!=email||adminCredential.password!=password){
    
    User.findOne({
        email: email
    }, function(err, user) {

        if (err) {
            console.log ('ligin error', err)
            return done(err);
        }

        if (!user) {
            return done(null, false, { error: 'Login failed. Please try again.' });
        }

        user.comparePassword(password, function(err, isMatch) {

            if (err) {
                return done(err);
            }

            if (!isMatch) {
                return done(null, false, { error: 'Login failed. Please try again.' });
            }

            return done(null, user);

        });

    });
}
else if (adminCredential.email==email||adminCredential.password==password)
   
        return done(null, adminCredential);
});

var jwtOptions = {
    jwtFromRequest:ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
};

var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    console.log ('jwtOptions',jwtOptions)
    User.findById(payload._id, function(err, user) {
        console.log ('payload',payload)
        console.log ('user',user)
        if (err) {
            return done(err, false);
        }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }

    });

});

passport.use(jwtLogin);
passport.use(localLogin);

module.exports = {
    initialize: () => passport.initialize(),
    authenticateJWT: passport.authenticate('jwt', { session: false }),
    authenticateCredentials: passport.authenticate('local', { session: false }),
};