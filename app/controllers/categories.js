var Category = require('../models/category');

exports.get = function(req, res, next) {

    Category.find(function(err, Categories) {

        if (err) {
            res.send(err);
        }

        res.json(Categories);

    });

}


exports.getById = function(req, res, next) {

    console.log('categoryId', req.params.categoryId)

    Category.findById({ _id: req.params.categoryId }, function(err, Category) {

        if (err) {
            res.send(err);
        }

        res.json(Category);

    });

}

exports.getByPatient = function(req, res, next) {

    Category.find(req.body, function(err, data) {
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


exports.getByField = function(req, res, next) {

    Category.find({ 'field': req.params.field }, function(err, data) {
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

exports.getOrderMasters = function(req, res, next) {

    Category.find(req.body, function(err, data) {
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

exports.getByFields = function(req, res, next) {
    console.log('fileds', req.body)

    Category.find({ 'field': { $in: req.body } }, function(err, data) {
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

exports.getByActivityType = function(req, res, next) {

    console.log('activityType', req.params)

    Category.find({ 'activityType': req.params.activityType }, function(err, data) {
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

exports.getByFormType = function(req, res, next) {

    console.log('formType', req.params)

    Category.find({ 'formType': req.params.formType }, function(err, data) {
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
exports.getByProfileType = function(req, res, next) {

    console.log('profileType', req.params)

    Category.find({ 'profileType': req.params.profileType }, function(err, data) {
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


    Category.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function(err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function(req, res, next) {

    Category.create((req.body),
        function(err, Category) {

            if (err) {
                res.send(err);
            }

            res.json(Category);



        });

}

exports.delete = function(req, res, next) {

    Category.remove({
        _id: req.params.categoryId
    }, function(err, Category) {
        res.json(Category);
    });

}