var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
let MeetupStrategy = require('passport-meetup').Strategy;
var User = require('../models/User.js');
let Organizer = require('../models/Organizer.js');

var passport = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log('_id caleed with ' + id)
        User.findById(id, function(err, user) {
            if(!user){
            Organizer.findById(id, function(err, organizer) {
                return done(null, organizer);
            });
        }else{

        
            return done(null, user);
        }
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

    passport.use(new MeetupStrategy({        
        consumerKey: process.env.MEETUP_CLIENT,
        consumerSecret: process.env.MEETUP_CLIENT_SECRET,
        callbackURL: process.env.MEETUP_CALLBACK_URL,
        scope:['email']
      },
        function(accessToken, refreshToken, profile, done) {
            console.log('meetup startegy called')
            process.nextTick(function() {
                console.log(`passport meetup Strategy:  ${JSON.stringify(profile)}`);
                Organizer.findOne({
                    'fullName': profile.displayName
                }, function(err, user) {
                    if (user) {
                        console.log('Organizer already in database!');
                        return done(null, user);
                    } else {
                        console.log('Creating a new Organizer in database!');

                        var avatarURL = "/assets/images/default_avatar.png";
                        if (profile._json.results[0] && profile._json.results[0] && profile._json.results[0].photo) avatarURL = profile._json.results[0].photo.photo_link;

                        Organizer.create({
                            'fullName': profile.displayName,
                            'photo': avatarURL,
                            'job': profile._json.results[0].title,
                            'URL': profile._json.results[0].link,
                            'acceptedTermsAndConditions': 1,
                            'acceptedTermsAndConditionsOn': Date.now(),
                            'authenticatedWith':'meetup'
                        }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Done creating a new Organizer');
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
