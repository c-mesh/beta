var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var path = require('path');
var mongoose = require('mongoose');
var logger = require("morgan");
var favicon = require('serve-favicon');
var https = require('https');
var cors = require('cors');
var fs = require('fs');
require('dotenv').config();
mongoose.Promise = Promise;

var router = express.Router();

// Express server
var app = express();
var port = process.env.PORT || 3000;
//var connectionString = "mongodb://localhost:27017/test"

//--Chaitanya Edits-- from: https://www.tonyerwin.com/2014/09/redirecting-http-to-https-with-nodejs.html
//Routing HTTP to HTTPS

app.enable('trust proxy');
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});

app.use(express.static(__dirname + '/public'));

var server = app.listen(port, function() {
        console.log('Listening on port %d', server.address().port);
});

//--Chaitanya Edits-- end

// Server middle-wares
app.use(express.static("public"));

// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'favicon.png')));
app.use(logger('dev'));

app.use(cookieParser('S3CR37C00K13'));
app.use(cookieSession({
    secret: 'S3CR37C00K13',
    maxAge: 365 * 24 * 60 * 60 * 1000 // 24 hours
}));

// Passport logic
require('./config/passport.js')(passport);
app.use(passport.initialize());
app.use(passport.session());


// Database configuration with mongoose and model requires
var User = require('./models/User.js');
var Mesh = require('./models/Mesh.js');
var EventLog = require('./models/EventLog.js');
var LocationErrorLogs = require('./models/locationErrorLog');
var LocationUserLogs = require('./models/LocationUserLog');

// Database logic
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

var db = mongoose.connection;
console.log('Mongoose Version:' + mongoose.version);

db.on('error', function(error) {
    console.log('Mongoose Error: ', error);
});

db.once('open', function() {
    console.log('Mongoose connection successful.');
});

// Authentication with Passport and Linkedin
app.get('/auth/linkedin/callback', function(req, res, next) {
    console.log('/auth/linkedin/callback')
    passport.authenticate('linkedin', {
        failureRedirect: '/'
    }, function(err, user, info) {
        if (err) {
            // return next(err);
            return res.redirect('/');
        }
        if (!user) {
            return res.redirect('/auth/linkedin');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            console.log('authenticate callback meshId: ' + req.session.meshId);
            if (req.session.page == 'mesh') {
            console.log('updating mesh: ' + req.session.meshId);
                Mesh.findByIdAndUpdate(req.session.mesh.meshId, {
                    $addToSet: {
                        users: req.user
                    },
                    $inc: {peakParticipantNumber: 1}
                }, (err, mesh) => {
                    if (err) console.log(err);
                });

            }
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/auth/linkedin/page/:page',(req, res, next) => {
    req.session.page = req.params.page;
    console.log('req.session.page: ' + req.session.page);
    next();
}, passport.authenticate('linkedin'));

app.get('/auth/linkedin/join-mesh/:meshId/:meshName/:meshEndTimeMilliSec', (req, res, next) => {
    req.session.page = 'mesh';
    req.session.mesh = {
        meshId: req.params.meshId,
        meshName: req.params.meshName,
        meshEndTimeMilliSec: req.params.meshEndTimeMilliSec
    };
    next();
}, passport.authenticate('linkedin'));


////////////////////////////////////////////////////
//                  REST API                      //
////////////////////////////////////////////////////

// GET /api/users - return all users
app.get('/api/users', isAuthenticated, (req, res, next) => {
    if (req.isAuthenticated()) {
        User.find({}, (err, users) => {
            res.json(users);
        });
    } else res.status(401).end();
});

// GET /api/user/:id - return a user
app.get('/api/user/:id', isAuthenticated, (req, res, next) => {
    var userObj = {};
    if (req.isAuthenticated()) {
        User.findById(req.params.id, (err, user) => {
            userObj.user = user;
            if (req.session.page) {
                userObj.page = req.session.page;
                if (req.session.page == 'mesh') {
                    userObj.mesh = req.session.mesh;
                    delete req.session.mesh;
                }
                delete req.session.page;
            }
            console.log('/api/user/:id page:' + userObj.page);
            res.json(userObj);
        });
    } else res.status(401).end();
});

// POST /api/user - Create a User
app.post('/api/user', (req, res, next) => {});

// PUT /api/user - Update a User
app.put('/api/user/:user_id',isAuthenticated, (req, res, next) => {
    User.findByIdAndUpdate(req.params.user_id, req.body,(err)=>{
        if(err){
            return res.status(400).send("unable to update a user")
        }
        User.findById(req.param.user_id,(err, user)=>{
            return res.json(user);
        });
    })
})

// PUT /api/user/:id/join_mesh/:mesh_id - Join to a Mesh
app.post('/api/join_mesh/:mesh_id', isAuthenticated, (req, res, next) => {

    const meshId = req.params.mesh_id;
    const userId = req.user._id;
    const today = new Date();

    if (!req.user || !req.user.acceptedTermsAndConditions) {
        return res.status(500)
            .send('Unauthorized! You need to accept terms and conditions first to join the mesh.');
    }

    User.findOne({
        _id: userId
    })
    .then( user => {
        if (!user) {
            console.log('No user found');
            return;
        }

        // @TODO: here check for Terms and Conditions flag

        // User.findByIdAndUpdate(userId, {
        //     // $addToSet: {
        //     //     meshJoined: {
        //     //         action: 'MESH_JOINED',
        //     //         meshId: meshId,
        //     //         joinedAt: Date.now(),
        //     //         joinedOn: today.toString()
        //     //     }
        //     // }
        // })
        // .catch( (err) => {
        //     console.log("failed to update meshJoined in users");
        // });

        // const joinedMesh = user.meshJoined.find((mesh) => {
        //     return mesh.meshId == meshId
        // });

        const meshUpdate = {
            $addToSet: {
                users: userId
            }
        };

        // if (!joinedMesh) {
        //     meshUpdate.$inc = {
        //         peakParticipantNumber: 1
        //     }
        // }

        Mesh.findByIdAndUpdate(meshId, meshUpdate)
        .catch( (err) => {
            res.status(500)
                .send('failed to add user to the mesh');
        });


    })
    .then( () => {
        // Find and populate again
        Mesh.findById(meshId)
            .populate("users")
            .lean()
            .exec()
            .then( (mesh) => {
                if (!mesh) {
                    return res.status(500)
                        .send('No mesh found');
                }

                return res.status(200)
                    .json(mesh);
            })
            .catch( (err) => {
                console.log(err);
                res.status(500)
                    .send('Unable to join mesh');
            });
    });



/*
    Mesh.find({_id:req.params.mesh_id, users:{"$in":[req.user]}},
        (err, meshWithCurrentUser)=>{
            if(meshWithCurrentUser.length > 0){
                res.json(meshWithCurrentUser[0]);
                return;
            }
            Mesh.findByIdAndUpdate(req.params.mesh_id, {
            $addToSet: {
                users: req.user
            },
            $inc: {peakParticipantNumber: 1}
        }, (err, mesh) => {
            if (err) {
                console.log(err);
                res.status(500).send('joining meshes broke');
                return;
            }
            // update mesh created in users
            var today = new Date();
            User.findByIdAndUpdate(req.user,{
                $addToSet:{
                    meshJoined: {
                        action: 'MESH_JOINED',
                        meshId:mesh._id,
                        joinedAt: Date.now(),
                        joinedOn: today.toString()
                    }
                }
            },(err)=>{
                if(err){
                    console.log("failed to update mesh joined in users")
                }
            })
            Mesh.findById(req.params.mesh_id).populate("users").lean().exec((err2, mesh2) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('joining mesh broke');
                }
                res.json(mesh2);
            });
        });
    });
*/


});

// PUT /api/user/:id/leave_mesh/:mesh_id - Leave a Mesh
app.post('/api/leave_mesh/:mesh_id', isAuthenticated, (req, res, next) => {

    const meshId = req.params.mesh_id;
    const userId = req.user._id;
    const today = new Date();

    User.findByIdAndUpdate(userId, {
        $addToSet: {
            meshJoined: {
                action: 'MESH_LEFT',
                meshId: meshId,
                leftAt: Date.now(),
                leftOn: today.toString()
            }
        }
    })
    .catch( (err) => {
        console.log("failed to update mesh joined in users")
    });

    Mesh.findByIdAndUpdate(meshId, {
        $pull: {
            'users': userId
        }
    })
    .then( (updatedMesh) => {
        // Find and populate again
        Mesh.findById(meshId)
            .populate("users")
            .lean()
            .exec()
            .then( (mesh) => {
                if (!mesh) {
                    return res.status(500)
                        .send('No mesh found');
                }

                return res.status(200)
                    .json(mesh);
            })
            .catch( (err) => {
                console.log(err);
                res.status(500)
                    .send('Unable to leave mesh');
            });
    })
    .catch( (err) => {
        res.status(500)
            .send('failed to remove user from the mesh.');
        console.log(err);
    });

});

// GET /api/meshes - Return all Meshes
app.get('/api/meshes', (req, res, next) => {
    var rightNow = new Date;
    var rightNowMilliSec = rightNow.getTime();

    Mesh.find({
        meshStartTimeMilliSec:{$lt: rightNowMilliSec},
        meshEndTimeMilliSec:{$gt: rightNowMilliSec}
    }).populate("users").exec((err, meshes) => {
        if(err) {
            console.log(err);
            res.status(500).send('Broked getting meshes');
        } else {
            meshes = meshes.map( (mesh) => {
                const validUsers = mesh.users.filter((usr)=>usr.acceptedTermsAndConditions);
                mesh.users = validUsers;
                return mesh;
            });
           res.json(meshes);
        }
    });
});

// GET /api/mesh/:id - Return a Mesh
app.get('/api/mesh/:id', isAuthenticated, (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log(`getting all other users in mesh ${req.params.id}`);
        Mesh.findById(req.params.id)
            .populate("users").exec((err, mesh) => {
            if (err) {
                console.log(err);
                res.status(500).send('Get other users in mesh broke');
            } else {
                if(mesh){
                    const validUsers = mesh.users.filter((usr)=>usr.acceptedTermsAndConditions);
                    mesh.users = validUsers;
                }
                res.json(mesh);
            }
        });
    } else res.status(401).end();
});

// POST /api/mesh - Create a Mesh
app.post('/api/mesh', isAuthenticated, (req, res, next) => {
    var today = new Date();
    if (req.isAuthenticated()) {
        Mesh.create({
            meshName: req.body.meshName,
            meshCreatedAtTime: today.toString(),
            meshStartTime: req.body.meshStartTime.toString(),
            meshStartTimeMilliSec: req.body.meshStartTimeMilliSec,
            meshEndTime: req.body.meshEndTime.toString(),
            meshEndTimeMilliSec: req.body.meshEndTimeMilliSec,
            meshCreatedCoordinate: req.body.meshCreatedCoordinate,
            meshCoordinate: req.body.meshCoordinate,
            meshLocationAddress: req.body.meshLocationAddress,
            meshCreatedBy: req.user
        }, (err, mesh) => {
            if (err) {
                console.log(`Mesh Creation Failed: ${err}`);
                res.status(500).json(err).end();
            } else {
                // update mesh created in users
                User.findByIdAndUpdate(req.user,{
                    $addToSet:{
                        meshCreated: mesh._id
                    }
                }, (err)=>{
                    if(err){
                        console.log("error in updating meshCreated in users")
                    }
                });
                res.json(mesh);
            }
        });
    } else res.status(401).end();
});

// GET /api/mesh/:id/users - Return all users registered to a Mesh
app.get('/api/mesh/:id/users', isAuthenticated, (req, res, next) => {
    var users = {};
    if (req.isAuthenticated()) {
        Mesh.findById(req.params.id, (err, mesh) => {
            users = mesh.users;
            res.json(users);
        });
    } else res.status(401).end();
});

//POST /api/user/:id/activity - Log user activity
app.post('/api/browserActive', isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;

    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp
    })
});

app.post('/api/browserInactive', isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;

    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp
    })
});

app.post('/api/profileViewed', isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;
    let profilesViewed = [req.body.viewedUserId];

    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp,
        profilesViewed: profilesViewed
    })
    //todo select
})

app.post('/api/feedbackClicked', isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;

    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp
    })
})

app.post('/api/meshJoined',isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;


    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp
    })
})

app.post('/api/meshLeaveOn',isAuthenticated, (req, res, next) => {
    let userId = req.user._id;
    let meshId = req.body.meshId;
    let timeStamp = req.body.timestamp;
    let type = req.body.activityType;


    EventLog.create({
        userId: userId,
        meshId: meshId,
        type: type,
        timestamp: timeStamp
    })
})

// POST LOCATION ERROR LOGS
app.post('/api/locationErrorLogs', (req, res) => {
    let ip = req.body.ip;
    let deviceName = req.body.deviceName;
    let OS = req.body.OS;
    let browser = req.body.browser;
    let timestamp = req.body.timestamp;

    LocationErrorLogs.create({
        ip: ip,
        deviceName: deviceName,
        OS: OS,
        browser: browser,
        timestamp: timestamp
    }).then(() => {
        res.send({
            "error": false,
            "statusCode": 200,
            "message": "location error logs saved successfully"
        })
    }).catch(() => {
        res.send({
            "error": true,
            "statusCode": 404,
            "message": "unable to save location error logs"
        })
    })
})

// POST LOCATION USER LOGS
app.post('/api/locationUserLogs', (req, res) => {
    let ip = req.body.ip;
    let status = req.body.status;
    let firstVisitOn = req.body.firstVisitOn;
    LocationUserLogs.create({
        ip: ip,
        status: status,
        firstVisitOn: firstVisitOn
    }).then(() => {
        res.send({
            "error": false,
            "statusCode": 200,
            "message": "location user logs saved successfully"
        })
    }).catch(() => {
        res.send({
            "error": true,
            "statusCode": 404,
            "message": "unable to save user logs"
        })
    })
})

// UPDATE LOCATION USER LOGS
app.put('/api/updateLocationUserLogs', (req, res) => {
    let data = req.body;
    let query = { ip: data.ip }
    LocationUserLogs.findOneAndUpdate(query, { $set: {
        status: data.status,
        resolvedOn: data.resolvedOn,
        ip: data.ip
    }}, { new: true })
    .then(() => {
        res.send({
            "error": false,
            "statusCode": 200,
            "message": "updated location user logs saved successfully"
        })
    }).catch(() => {
        res.send({
            "error": true,
            "statusCode": 404,
            "message": "unable to update user logs"
        })
    });
});

// GET /api/loggedin - Check if a user is authenticated
app.get('/api/loggedin', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isLogged: true,
            user: req.user
        });
    } else res.json({ isLogged: false });
});

app.get('/web', function(req, res){
    res.sendFile(path.join(__dirname+'/public/web.html'));
});

// Redirect
app.get('*', function(request, response) {
    console.log('Showing index page!');
    response.redirect('/');
});

//Chaitanya edits
// app.listen(port, function() {
//     console.log(`Server is running on port ${port}`);
// });
//Chaitanya edits end

// Helper Functions
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
}