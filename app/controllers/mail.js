var Mail = require('../models/mail');

exports.getAllMail = function(req, res, next) {

    Mail.find(function(err, Mail) {

        if (err) {
            res.send(err);
        }

        res.json(Mail);

    });

}


exports.getById = function(req, res, next) {

    console.log('mailId', req.params.mailId)

    Mail.findById({ _id: req.params.mailId }, function(err, Mail) {

        if (err) {
            res.send(err);
        }

        res.json(Mail);

    });

}


exports.getByFilter = function(req, res, next) {

    console.log ('filter',req.body.filter)
 
    Mail.find( req.body.filter, function(err, data) {
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


exports.Update = function(req, res, next) {


    Mail.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function(req, res, next) {

    Mail.create((req.body),
        function(err, Mail) {

            if (err) {
                res.send(err);
            }

            res.json(Mail);



        });

}

exports.Delete = function(req, res, next) {

    Mail.remove({
        _id: req.params.mailId
    }, function(err, Mail) {
        res.json(Mail);
    });

}