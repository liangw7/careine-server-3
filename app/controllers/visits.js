var Visit = require('../models/visit');

exports.getVisits = function(req, res, next) {

    Visit.find(function(err, Visits) {

        if (err) {
            res.send(err);
        }

        res.json(Visits);

    });

}
exports.getVisitsByPatient = function(req, res, next) {

    console.log('req.body', req.body)

    Visit.find(req.body, function(err, data) {
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
exports.getVisitsByProvider = function(req, res, next) {

    Visit.find({ providerID: req.params.providerID }, function(err, data) {
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

exports.getVisitsByRequester = function(req, res, next) {

    Visit.find({ requesterID: req.params.requesterID }, function(err, data) {
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
exports.UpdateVisit = function(req, res, next) {

    console.log('request', req.body)
    Visit.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createVisit = function(req, res, next) {
    console.log('request', req.body)
    Visit.create(req.body, function(err, Visit) {

        if (err) {
            res.send(err);
        }
        res.json(Visit);


    });

}

exports.deleteVisit = function(req, res, next) {

    Visit.remove({
        _id: req.params.visitID
    }, function(err, visit) {
        res.json(visit);
    });

}