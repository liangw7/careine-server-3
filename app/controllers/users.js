var User = require('../models/user');
const mongoose = require('mongoose');
const https = require("https");
const fs = require('fs')
const path = require('path');
const { Wechat } = require('wechat-jssdk');
// const { WechatClient } = require('messaging-api-wechat');
const wechatConfig = {
    //set your oauth redirect url, defaults to localhost
    "wechatRedirectUrl": "https://www.digitalbaseas.com/wechat/oauth-callback",
    //"wechatToken": "wechat_token", //not necessary required
    "appId": 'wx1456c566ec3e6686',
    "appSecret": '8ada6bb8a95c8d79abf7a374688aa9cd',
    "card": true, //enable cards
    "payment": true, //enable payment support
    "merchantId": '1601139967', //
    "paymentSandBox": false, //dev env
    "paymentKey": 'GNHsDl0y4Y4RNlUAWGXOKcjzc1SraA9X', //API key to gen payment sign
    "paymentCertificatePfx": fs.readFileSync(path.join(process.cwd(), 'apiclient_cert.p12')),
    //default payment notify url
    "paymentNotifyUrl": `http://www.digitalbaseas.com/api/wx/notify`,
    //mini program config
    // "miniPro32oj888qq8117`gram": {
    //   "appId": "mp_appid",
    //  "appSecret": "mp_app_secret",
    // }
}
const wx = new Wechat(wechatConfig);

//var ObjectId = mongoose.Types.ObjectId;

exports.getUsers = function (req, res, next) {

    User.find(function (err, data) {
        if (err) {
            res.send(err);
        }

        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.getUserById = function (req, res, next) {

    User.findById({ _id: req.params.User_id },
        function (err, data) {
            if (err) {
                res.send(err);
            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();
        });
}

exports.getByFilter = function (req, res, next) {

    User.find(req.body, { _id: 1, name: 1, title: 1, photo: 1, email: 1, role: 1, weChatID: 1 }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        console.log('data', data)
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.getWithDetailByFilter = function (req, res, next) {

    User.find(req.body, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        console.log('data', data)
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.getCount = function (req, res, next) {

    User.count(req.body,
        function (err, data) {
            if (err) {
                res.send(err);
            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();
        });
}

exports.getDailyPatients = function (req, res, next) {

    User.aggregate(
        [{ $match: { role: 'patient' } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        }
            //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.days * 24 * 60 * 60 * 1000))) }
            //       } }
        ],
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getMonthlyPatients = function (req, res, next) {

    var IDList = [];
    for (let id of req.body.serviceIDs) {
        IDList.push(mongoose.Types.ObjectId(id));
    }
    var pipeline = [
        { $match: { role: 'patient', serviceList: { '$elemMatch': { '_id': { '$in': req.body.serviceIDs } } } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }

        //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
        //       } }
    ];

    User.aggregate(
        pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}

exports.getMonthlyPatientsByProvider = function (req, res, next) {
    var pipeline = [
        {
            $match: {
                role: 'patient',
                providers: { '$elemMatch': { '_id': { '$in': req.body.providerID } } },
                createdAt: { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
            }
        },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    User.aggregate(
        pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getCountByService = function (req, res, next) {

    var IDList = [];
    for (let id of req.body.serviceIDs) {
        IDList.push(mongoose.Types.ObjectId(id));
    }
    var pipeline = [
        {
            '$match': {
                'role': 'patient',
                'serviceList': { '$elemMatch': { '_id': { '$in': req.body.serviceIDs } } }
            }
        },
        { '$unwind': '$serviceList' },
        { '$match': { 'serviceList._id': { '$in': req.body.serviceIDs } } },
        {
            '$lookup': {
                "let": { "serviceListID": "$serviceList._id" },
                "from": "users",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                '$or': [
                                    {
                                        '$and': [
                                            { "$eq": [{ "$toString": "$_id" }, '$$serviceListID'] }

                                        ],
                                    }
                                ]
                            }
                        }
                    }
                ],
                "as": "serviceList.service"
            }
        },
        { '$unwind': '$serviceList.service' },
        {
            '$group': {
                _id: {
                    serviceName: '$serviceList.service.name',
                    serviceID: '$serviceList._id'
                },

                count: { $sum: 1 }
            }
        },
        {
            "$project": {
                serviceName: '$_id.serviceName',
                serviceID: '$_id.serviceID',
                count: 1,
            }
        },
    ];

    User.aggregate(
        pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}

exports.getPatientsByPlace = function (req, res, next) {
    User.aggregate(
        [{ $match: { role: 'patient' } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }

            //   "createdAt": { $gte: new Date((new Date().getTime() - (req.body.months * 24 * 60 * 60 * 1000))) }
            //       } }
        ],
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}



exports.getUsersByRole = function (req, res, next) {
    User.find({ 'role': req.params.role },
        function (err, data) {
            if (err) {
                res.send(err);

            }


            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();

        });
}

exports.getUsersByProfile = function (req, res, next) {
    // console.log('req.body', req.body)
    User.find(req.body, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.createUser = function (req, res, next) {
    // console.log ('req', req)
    User.findOne({ email: req.body.email }, function (err, existingUser) {

        if (err) {
            return next(err);
        }
        if (existingUser) {
            return res.status(422).send({ error: 'That email address is already in use' });
        }

        User.create(req.body, function (err, data) {
            if (err) {
                res.send(err);

            }
            if (req.body.profilePic != undefined) {
                var loadedfile = Buffer.from(req.body.profilePic, 'base64');
                // console.log(loadedfile)

                var path = '././profile_photos/' + data._id + '.jpg'
                // console.log(path)
                console.log('pic', req.body.profilePic)
                fs.writeFile(path, req.body.profilePic, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("File saved successfully!");
                });
            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();
        });
    });
}

exports.updateUser = function (req, res, next) {

    User.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, data) {
            console.log(' req.body', req.body)
            console.log('user updated', data)
            if (err || data == undefined) {
                res.send(err);
            }
            /*console.log('pic', req.body.profilePic)
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
            }*/
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();
        });
}

exports.getProfilePhoto = function (req, res, next) {
    console.log(req.body.userId)
    var path = '././profile_photos/' + req.body.userId + '.jpg';
    fs.readFile(path, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('data: ', data)
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data);
        res.end();
    });
}

exports.deleteUser = function (req, res, next) {
    var valid_id = mongoose.Types.ObjectId.isValid(req.params.id);
    console.log('id', valid_id)
    User.remove({
        _id: req.params.User_id
    }, function (err, data) {
        if (err) {
            res.send(err);
        }

        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.getUserProfiles = function (req, res, next) {

    var pipeline = [
        { "$match": { "_id": mongoose.Types.ObjectId(req.body.filterID) } },
        { "$unwind": "$profiles" },
        {
            "$lookup": {
                "let": { "profilesID": "$profiles._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$profilesID" }] } } }
                ],
                "as": "profiles_doc"
            }
        },
        { "$unwind": "$profiles_doc" },
        {
            "$group": {
                _id: {
                    _id: "$_id",
                    name: "$name"
                },
                profiles: { $push: "$profiles_doc" }
            }
        },
        {
            "$project": {
                name: "$_id.name",
                _id: "$_id._id",
                profiles: "$profiles"
            }
        },
    ];

    User.aggregate(
        pipeline,
        function (err, result) {

            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })
}

exports.getProviders = function (req, res, next) {

    var pipeline = [
        { "$match": { "_id": mongoose.Types.ObjectId(req.body.serviceID) } },
        { "$unwind": "$providers" },
        {
            "$lookup": {
                "let": { "providersID": "$providers._id" },
                "from": "users",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$providersID" }] } } }
                ],
                "as": "providers_doc"
            }
        },
        { "$unwind": "$providers_doc" },
        {
            "$group": {
                _id: {
                    _id: "$_id",
                    name: "$name",
                    desc: "$desc",
                    photo: "$photo"
                },
                providers: { $push: "$providers_doc" }
            }
        },
        {
            "$project": {
                name: "$_id.name",
                _id: "$_id._id",
                photo: "$_id.photo",
                desc: "$_id.desc",
                providers: "$providers"
            }
        },
    ];

    User.aggregate(
        pipeline,
        function (err, result) {
            console.log('result providers', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })

}

exports.getlabItems = function (req, res, next) {

    var pipeline = [
        { "$match": { "_id": { "$eq": mongoose.Types.ObjectId(req.body.patientID) } } },
        { "$unwind": "$profiles" },
        {
            "$lookup": {
                "let": { "profilesID": "$profiles._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$profilesID" }] } } }
                ],
                "as": "detail_profiles"
            }
        },
        // { "$replaceRoot": { newRoot: "$$obSets" } },                
        { "$unwind": "$detail_profiles" },
        { "$unwind": "$detail_profiles.forms" },
        //look for lab form
        { "$match": { "detail_profiles.forms.formType": { "$eq": "lab" } } },
        {
            "$lookup": {
                "let": { "formsID": "$detail_profiles.forms._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$formsID" }] } } }
                ],
                "as": "detail_profiles.detail_forms"
            }
        },
        { "$unwind": "$detail_profiles.detail_forms" },
        { "$unwind": "$detail_profiles.detail_forms.obSets" },
        //group labs together
        {
            "$group": {
                "_id": { "_id": "$_id" },
                "obSets": { "$push": "$detail_profiles.detail_forms.obSets" }

            }
        },
        { "$unwind": "$obSets" },
        {
            "$lookup": {
                "let": { "obSetsID": "$obSets._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$obSetsID" }] } } }
                ],
                "as": "detail_obSets"
            }
        },
        { "$unwind": "$detail_obSets" },
        { "$replaceRoot": { newRoot: "$detail_obSets" } },
        { "$unwind": "$labItems" },
        {
            "$lookup": {
                "let": { "labItemsID": "$labItems._id" },
                "from": "labitems",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$labItemsID" }] } } }
                ],
                "as": "detail_labItems"
            }
        },
        {
            "$unwind":
                "$detail_labItems"
        },
        {
            "$lookup": {
                "let": { "labItemsID": "$labItems._id" },
                "from": "labs",
                "pipeline": [
                    {
                        "$match":
                        {
                            "$expr": {
                                "$and": [
                                    {
                                        "$eq": ["$patientID", req.body.patientID]
                                    },
                                    {
                                        "$eq": ["$labItemID", { "$toString": "$$labItemsID" }]
                                    }
                                ]
                            }
                        }
                    }],

                "as": "value_labItems"
            }
        },
        {
            "$unwind":
            {
                "path": "$value_labItems",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$addFields": {
                "value_labItems.values":
                {
                    "$cond": {
                        if: { "$ne": ["$value_labItems.value", null] },
                        then: {
                            "$map":
                            {
                                input: "$value_labItems.options",
                                as: "option",
                                in: {
                                    "$cond":
                                    {
                                        if: {
                                            "$and":
                                                [{ $gte: [{ "$toDecimal": "$value_labItems.value" }, "$$option.from"] },
                                                { $lt: [{ "$toDecimal": "$value_labItems.value" }, "$$option.to"] }
                                                ]
                                        },
                                        then: "$$option",
                                        else: ''
                                    }
                                }
                            }
                        },
                        else: []
                    }
                }
            }
        },
        {
            "$group": {
                _id: {
                    _id: "$_id",
                    label: "$label",
                    labID: "$detail_labItems._id",
                    labLabel: "$detail_labItems.label",
                    labUOM: "$detail_labItems.uom",
                    labType: "$detail_labItems.labType"
                },
                labValue: { "$push": "$value_labItems.value" },
                labValueID: { "$push": "$value_labItems._id" },
                labValues: { "$push": "$value_labItems.values" },
                labTimeStamps: { "$push": "$value_labItems.resultAt" }
            }
        },
        {
            "$project": {
                _id: "$_id._id",
                label: "$_id.label",
                labs: {
                    _id: "$_id.labID",
                    label: "$_id.labLabel",
                    uom: "$_id.labUOM",
                    valueSet: "$labValue",
                    labValueID: "$labValueID",
                    valuesSet: "$labValues",
                    timeStamps: "$labTimeStamps"
                }
            }
        },
        {
            "$group": {
                _id: {
                    _id: "$_id",
                    label: "$label"
                },
                labs: { "$push": "$labs" }
            }
        },
        {
            "$project": {
                _id: "$_id._id",
                label: "$_id.label",
                labs: "$labs"
            }
        }
    ];

    User.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })
}

exports.getVisitsByProvider = function (req, res, next) {

    var pipeline = [
        //find provider
        { '$match': { 'profiles': { '$elemMatch': { '_id': { '$in': req.body.profileIDs } } }, 'role': 'provider' } },
        {
            "$lookup": {
                "let": { "providerID": "$_id" },
                "from": "visits",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                '$and': [
                                    {
                                        "$eq": [{ "$toString": "$providerID" }, { "$toString": "$$providerID" }]
                                    },
                                    { "$eq": ['$availableAtYear', req.body.availableAtYear] },
                                    { "$eq": ['$availableAtMonth', req.body.availableAtMonth] },
                                    { "$eq": ['$availableAtDate', req.body.availableAtDate] },
                                    {
                                        '$or': [{ "$eq": ['$status', 'avail'] },
                                        {
                                            "$and": [{ "$eq": ['$status', 'reserved'] },
                                            { "$eq": ['$patientID', req.body.patientID] }
                                            ]
                                        }

                                        ]
                                    }
                                ]
                            }

                        }
                    }
                ],
                "as": "providerVisits"
            }
        },
    ];

    User.aggregate(
        pipeline,

        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}

exports.getVisitsBySelectedProvider = function (req, res, next) {

    var pipeline = [
        //find provider
        { '$match': { '_id': mongoose.Types.ObjectId(req.body.providerID) } },
        {
            "$lookup": {
                "let": { "providerID": "$_id" },
                "from": "visits",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                '$and': [
                                    {
                                        "$eq": [{ "$toString": "$providerID" }, { "$toString": "$$providerID" }]
                                    },
                                    { "$eq": ['$availableAtYear', req.body.availableAtYear] },
                                    { "$eq": ['$availableAtMonth', req.body.availableAtMonth] },
                                    { "$eq": ['$availableAtDate', req.body.availableAtDate] },
                                    {
                                        '$or': [{ "$eq": ['$status', 'avail'] },
                                        { "$eq": ['$status', 'reserved'] },
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                "as": "providerVisits"
            }
        },
    ];

    User.aggregate(
        pipeline,

        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

//in provider mail box                      
exports.getProviderMails = function (req, res, next) {

    var pipeline = [
        //look up mail collection
        { "$match": { 'role': { '$eq': 'patient' } } },
        {
            "$lookup": {
                "let": { "patientID": "$_id" },
                "from": "mails",
                "pipeline": [
                    {
                        "$match": {
                            "$expr":
                            {
                                "$and": [

                                    {
                                        '$or': [
                                            //mail sent from provider
                                            {
                                                '$and': [{ "$eq": [{ "$toString": "$userID" }, req.body.providerID] },
                                                { "$eq": [{ "$toString": "$patientID" }, { "$toString": "$$patientID" }] },

                                                ]
                                            },
                                            //mail sent to provider from patient or other provider
                                            {
                                                '$and': [{ "$eq": [{ "$toString": "$userID" }, { "$toString": "$$patientID" }] },
                                                { "$eq": [{ "$toString": "$providerID" }, req.body.providerID] }
                                                ]
                                            },

                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { '$limit': req.body.limit }
                ],
                "as": "mails"
            }
        },
        { "$unwind": "$mails" },
        {
            "$group":
            {
                _id: {
                    _id: "$_id",
                    name: "$name",
                    profiles: "$profiles",
                    serviceList: "$serviceList",
                    photo: "$photo",
                    age: "$age",
                    openID: "$openID",
                    gender: "$gender",
                    educations: "$educations",
                    providers: "$providers"
                },
                mails: { $push: "$mails" },
            }
        },
        {
            "$project": {
                _id: '$_id._id',
                name: '$_id.name',
                profiles: '$_id.profiles',
                age: '$_id.age',
                gender: "$_id.gender",
                openID: "$_id.openID",
                educations: "$_id.educations",
                providers: "$_id.providers",
                photo: "$_id.photo",
                mails: "$mails",
            }
        },
        {
            "$addFields":
            {
                "newMails":
                {
                    $filter: {
                        input: "$mails",
                        as: "item",
                        cond: { $eq: ["$$item.status", 'active'] }
                    }
                }
            }

        },
        {
            "$addFields":
            {
                "newMailsCount":
                    { "$size": "$newMails" }
            }
        },
    ]

    User.aggregate(
        pipeline,
        function (err, result) {
            console.log('_ids', req.body.providerID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}

//in mail box from other provider about the patient 
exports.getPatientMails = function (req, res, next) {
    var providerIDs = [];
    console.log('req.body.providerIDs', req.body.providerIDs)
    console.log('req.body.patientID', req.body.patientID)

    for (let providerID of req.body.providerIDs) {
        providerIDs.push(mongoose.Types.ObjectId(providerID))
    }
    //find all patients of a provider
    var pipeline = [
        //get patient
        { "$match": { '_id': { '$in': providerIDs } } },
        {
            "$lookup": {
                "let": { "providerID": "$_id" },
                "from": "mails",
                "pipeline": [
                    {
                        "$match": {
                            "$expr":
                            {
                                '$or': [
                                    //mail sent from patient
                                    {
                                        '$and': [
                                            { "$eq": [{ "$toString": "$userID" }, { "$toString": req.body.patientID }] },
                                            { "$eq": [{ "$toString": "$providerID" }, { "$toString": "$$providerID" },] }
                                        ]
                                    },
                                    //mail sent from provider
                                    {
                                        '$and': [
                                            { "$eq": [{ "$toString": "$userID" }, { "$toString": "$$providerID" },] },
                                            { "$eq": [{ "$toString": "$patientID" }, { "$toString": req.body.patientID }] },
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { '$limit': req.body.limit }
                ],
                "as": "mails"
            }
        },
        /*  {"$addFields": {
              "newMails":{"$map":
                              {
                              input: "$mails",
                              as: "mail",
                              //if ther is new mail for current provider
                              in: { "$cond":{if: { '$and':[{ "$eq": [ {"$toString":"$providerID"}, req.body.providerID ]},
                                                           { '$eq':["$status", "active" ] }
                                                  ]},
                                              }, 
                                              then: "$$mail"
                                          }
                                  }
                      
                          }
                          }
          },
          {"$addFields": {
              "newMailsCount":{"$size":"$newMails"}
                     
              }
          },
 
          { '$sort' : { "newMailsCount" : -1 } }*/
    ]

    User.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body.patientListID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getPatientMailsFromProviders = function (req, res, next) {

    //find all patients of a provider
    var pipeline = [
        //get patient
        { "$match": { "_id": mongoose.Types.ObjectId(req.body.patientID) } },
        { "$unwind": "$providers" },
        //look up mail collection
        {
            "$lookup": {
                "let": { "providerID": "$poviders._id" },
                "from": "mails",
                "pipeline": [
                    {
                        "$match": {
                            "$expr":
                            {
                                '$or': [
                                    //mail sent from patient
                                    {
                                        '$and': [{ "$eq": [{ "$toString": "$userID" }, req.body.providerID] },
                                        { "$eq": [{ "$toString": "$providerID" }, "$$providerID"] },
                                        { "$toString": "$patientID" }, req.body.patientID]
                                    },

                                    //mail sent from provider
                                    {
                                        '$and': [{ "$eq": [{ "$toString": "$patientID" }, req.body.patientID] },
                                        { "$eq": [{ "$toString": "$userID" }, "$$providerID"] },
                                        { "$eq": [{ "$toString": "$providerID" }, req.body.providerID] },
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { '$limit': req.body.limit }
                ],
                "as": "mails"
            }
        },
        {
            "$addFields": {
                "newMails": {
                    "$map":
                    {
                        input: "$mails",
                        as: "mail",
                        //if ther is new mail for current provider
                        in: {
                            "$cond": {
                                if: {
                                    '$and': [{ "$eq": [{ "$toString": "$providerID" }, req.body.providerID] },
                                    { '$eq': ["$status", "active"] }
                                    ]
                                },
                            },
                            then: "$$mail"
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
                "newMailsCount": { "$size": "$newMails" }

            }
        },
        { '$sort': { "newMailsCount": 1 } }
    ]

    Data.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body.patientListID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });

}

exports.getPatientsByProfile = function (req, res, next) {

    var pipeline = [
        {
            "$match": {
                "profiles": { "$elemMatch": { _id: req.body.profileID } },
                "role": "patient"
            },
        },
        {
            "$project": {
                name: 1,
                _id: 1,
                photo: 1,
                role: 1,
                birthday: 1,
                gender: 1,
            }
        }
    ];

    User.aggregate(
        pipeline,
        function (err, result) {
            console.log('result providers', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })
}

exports.getWechatAccess = function (req, resp) {
    console.log('wechat access================================================')
    var weCharUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
        req.body.appID + '&secret=' + req.body.appSecret + '&code=' + req.body.code + '&grant_type=authorization_code';

    https.get(weCharUrl, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            console.log('wechat access', body);
            resp.json(body);

        });
    })
}

exports.getSignature = function (req, res) {
    // console.log ('wx',wx)
    wx.jssdk.getSignature(req.body.url).then(signatureData => {
        // console.log('req.query.url',req.body.url) 
        console.log('signatureData', signatureData)
        res.json(signatureData);
    });
}

exports.wechatUserInfor = function (req, resp) {
    var weCharUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token=' +
        req.body.accessToken + '&openid=' + req.body.openID
    https.get(weCharUrl, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            //  console.log(body);
            resp.json(body);

        });
    })
}

exports.wechatLink = function (req, resp) {
    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
        req.body.appID + '&secret=' + req.body.appSecret;
    https.get(tokenUrl, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            //  console.log(body);
            resp.json(body);

        });
    })
}

exports.wechatTicket = function (req, resp) {
    var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' +
        req.body.accessToken + '&type=jsapi';

    https.get(ticketUrl, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            // console.log(body);
            resp.json(body);

        });
    })
}

/**
 * 根据手机号查询对应用户信息
 * @param {请求} req 
 * @param {响应} res 
 * @param {*} next 
 */
exports.getUserByPhone = function (req, res, next) {
    console.log ('user phone number', req.body.phone )
    User.findOne({ 'phone': req.body.phone }, function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
        var _send = res.send;
        var sent = false;
        if(!data){// 如果没有查询到数据,则说明没有用户跟该手机号关联,返回如下即可
            res.send = function () {
                if (sent) return;
                _send.bind(res)({ code: -1, msg: '没有用户与该手机号关联' });
                sent = true;
            };
        }
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)({ code: 1, msg: '有用户与该手机号关联' });
            sent = true;
        };
        next();
    });
}
exports.getUserByEmail = function (req, res, next) {

    User.findOne(
        { 'email': req.params.email },
        function (err, data) {
            if (err) {
                res.send(err);

            }
            res.json(data);
            var _send = res.send;
            var sent = false;
            res.send = function (data) {
                if (sent) return;
                _send.bind(res)(data);
                sent = true;
            };
            next();
        });
}