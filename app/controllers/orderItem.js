var OrderItem = require('../models/orderItem');

exports.getAll = function(req, res, next) {

    OrderItem.find(function(err, OrderItem) {

        if (err) {
            res.send(err);
        }

        res.json(OrderItem);

    });

}


exports.getById = function(req, res, next) {

    console.log('OrderItemId', req.params.OrderItemId)

    OrderItem.findById({ _id: req.params.id }, function(err, OrderItem) {

        if (err) {
            res.send(err);
        }

        res.json(OrderItem);

    });

}


exports.getByFilter = function(req, res, next) {

    
 
    OrderItem.find( req.body, function(err, data) {
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


    OrderItem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function(req, res, next) {

    OrderItem.create((req.body),
        function(err, OrderItem) {

            if (err) {
                res.send(err);
            }

            res.json(OrderItem);



        });

}

exports.Delete = function(req, res, next) {

    OrderItem.remove({
        _id: req.params.OrderItemId
    }, function(err, OrderItem) {
        res.json(OrderItem);
    });

}