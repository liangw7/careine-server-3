var Data = require('../models/data');

exports.getDatas = function(req, res, next) {

    Data.find(function(err, Datas) {

        if (err) {
            res.send(err);
        }

        res.json(Datas);

    });

}
exports.getDatasByPatient = function(req, res, next) {

    Data.find(req.body, function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByFollowup = function(req, res, next) {

    Data.find(req.body, function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByVisit = function(req, res, next) {

    Data.find(req.body,function(err, data) {
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

    }).sort({"createdAt": 'desc'});

}

exports.getDatasByFilter = function(req, res, next) {
 
    Data.find( {$and:req.body.filter}, function(err, data) {
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

exports.getById = function(req, res, next) {

  

    Data.findById({ _id: req.params.dataId }, function(err, Category) {

        if (err) {
            res.send(err);
        }

        res.json(Category);

    });

}

exports.Create = function(req, res, next) {
    console.log('request', req.body)
    Data.create(req.body, function(err, Data) {

        if (err) {
            res.send(err);
        }
        res.json(Data);


    });

}

exports.Delete = function(req, res, next) {

    Data.remove({
        _id: req.params.dataID
    }, function(err, data) {
        res.json(data);
    });
}


exports.Update = function(req, res, next) {


    Data.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}