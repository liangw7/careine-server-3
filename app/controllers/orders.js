var Order = require('../models/order');

exports.get = function(req, res, next) {

    Order.find(function(err, Orders) {

        if (err) {
            res.send(err);
        }

        res.json(Orders);

    });

}


exports.getById = function(req, res, next) {

    Order.findById({ _id: req.params.orderId }, function(err, Order) {

        if (err) {
            res.send(err);
        }

        res.json(Order);

    });

}

exports.getByPatient = function(req, res, next) {

    Order.find(req.body, function(err, data) {
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
exports.getByVisit = function(req, res, next) {

    Order.find(req.body, function(err, data) {
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

exports.getByType = function(req, res, next) {

    Order.find(req.body, function(err, data) {
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


exports.Update = function(req, res, next) {


    Order.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function(req, res, next) {

    Order.create((req.body),
        function(err, Order) {

            if (err) {
                res.send(err);
            }

            res.json(Order);



        });

}

exports.delete = function(req, res, next) {

    Order.remove({
        _id: req.params.OrderId
    }, function(err, Order) {
        res.json(Order);
    });

}