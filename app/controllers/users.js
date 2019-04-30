var User = require('../models/user');
var mongoose = require('mongoose');
var fs = require('fs');
//var ObjectId = mongoose.Types.ObjectId;

exports.getUsers = function(req, res, next) {

    User.find(function(err, data) {

        if (err) {
            res.send(err);

        }

        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });

}


exports.getUserById = function(req, res, next) {
  
  User.findById({ _id: req.params.User_id },
        function(err, data) {

            if (err) {
                res.send(err);

            }


            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function(data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });

}

exports.getByFilter = function(req, res, next) {

    
 
    User.find( req.body, function(err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        console.log ('data', data)
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });

}
exports.getCount= function(req, res, next) {

    User.count(req.body,
        function(err, data) {
            if (err) {
                res.send(err);

            }


            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function(data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });



}

exports.getUsersByRole = function(req, res, next) {

    User.find({ 'role': req.params.role },
        function(err, data) {
            if (err) {
                res.send(err);

            }


            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function(data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });

}

exports.getUsersByProfile = function(req, res, next) {

   // console.log('req.body', req.body)

    User.find(req.body, function(err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });


}

exports.getUserByEmail = function(req, res, next) {

    User.findOne({ 'email': req.params.email },
        function(err, data) {
            if (err) {
                res.send(err);

            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function(data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });

}


exports.createUser = function(req, res, next) {
    //console.log(req.body);
    // var user = JSON.parse(req.body);
    User.create(req.body, function(err, data) {

        if (err) {
            res.send(err);

        }
        if (req.body.profilePic != undefined) {
            var loadedfile = Buffer.from(req.body.profilePic, 'base64');
            // console.log(loadedfile)

            var path = '././profile_photos/' + data._id + '.jpg'
                // console.log(path)
            console.log('pic', req.body.profilePic)
            fs.writeFile(path, req.body.profilePic, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log("File saved successfully!");
            });
        }
        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();


    });

}
exports.updateUser = function(req, res, next) {

    User.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, data) {
            if (err) {
                res.send(err);
            }
            console.log('pic', req.body.profilePic)
            if (req.body.profilePic != undefined) {
                var loadedfile = Buffer.from(req.body.profilePic, 'base64');
                // console.log(loadedfile)

                var path = '././profile_photos/' + req.body._id + '.jpg'
                    // console.log(path)
                fs.writeFile(path, req.body.profilePic, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("File saved successfully!");
                });
            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function(data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });
}
exports.getProfilePhoto = function(req, res, next) {
    console.log(req.body.userId)
    var path = '././profile_photos/' + req.body.userId + '.jpg';
    fs.readFile(path, function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('data: ', data)
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data);
        res.end();
    });

}

exports.deleteUser = function(req, res, next) {
    var valid_id = mongoose.Types.ObjectId.isValid(req.params.id);
    console.log('id', valid_id)
    User.remove({
        _id: req.params.User_id
    }, function(err, data) {
        if (err) {
            res.send(err);

        }

        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function(data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();

    });

}