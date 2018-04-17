var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var User = require('../models/User.js');

var passport = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(null, user);
        });
    });

    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
            scope: ['r_emailaddress', 'r_basicprofile'],
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                console.log('passport linkedin Strategy: ', profile);
                User.findOne({
                    'fullName': profile.displayName
                }, function(err, user) {
                    if (user) {
                        console.log('User already in database!');
                        return done(null, user);
                    } else {
                        console.log('Creating a new user in database!');

                        var avatarURL = "/assets/images/default_avatar.png";
                        if (profile.photos[0]) avatarURL = profile.photos[0].value;

                        User.create({
                            'fullName': profile.displayName,
                            'firstName': profile._json.firstName,
                            'lastName': profile._json.lastName,
                            'photo': avatarURL,
                            'job': profile._json.headline,
                            'linkedinURL': profile._json.siteStandardProfileRequest.url,
                            'acceptedTermsAndConditions': 1,
                            'acceptedTermsAndConditionsOn': Date.now()
                        }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Done creating a new user');
                                return done(null, data);
                            }
                        });
                    }
                });
            });
        }
    ));

};

module.exports = passport;
