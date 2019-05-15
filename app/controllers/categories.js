var Category = require('../models/category');
const mongoose = require('mongoose');


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
exports.getSummary = function(req, res, next) {

   var pipeline= [
                           { "$match": { "_id": mongoose.Types.ObjectId(req.body.obSetID) }},
                        
                            { "$unwind": 
                              "$obs"
                               // {"path": "$obSets",
                               // "preserveNullAndEmptyArrays": true}
                                },
                            { "$lookup": {
                                "let": { "obsID": "$obs._id" },
                                "from": "categories",
                                "pipeline": [
                                { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                                ],
                                "as": "obs_doc"
                            }},
                            { "$unwind": 
                            '$obs_doc'
                          // { "path": '$obSets_doc',
                          //  "preserveNullAndEmptyArrays": true}}
                            },
            
                            {'$addFields':{'obs_doc.patientID': req.body.patientID, 'obs_doc.index':'$obs.index'}
                            },
                            
                            {"$project":{
                            
                                obs:0
                            
                            }},
            
                            { "$lookup": {
                                "let": {"obsID": "$obs_doc._id" , 
                                        "patientID":"$obs_doc.patientID"},
                                "from": "datas",
                                "pipeline":[
                                    {
                                          "$match": {
                                                  "$expr": {
                                                      
                                                        "$and": [
                                                            {
                                                                "$eq": [ {"$toString":"$obID"}, {"$toString":"$$obsID"} ]
                                                            },
                                                            {
                                                                "$eq": [ {"$toString":"$patientID"}, {"$toString":"$$patientID"} ]
                                                            }
                                                        ]    
                                                    }
                                                  }
                                              }
                                      ],
          
                                "as": "obs_doc.patientData"
                            }},
                    
                { "$unwind": {
                                "path":'$obs_doc.patientData',
                                "preserveNullAndEmptyArrays": true
                } },
    
           
   
    
    {"$addFields": {
        "obs_doc.value":{ $ifNull: [ "$obs_doc.patientData.value", ''] },
        "obs_doc.values":{ $ifNull: [ "$obs_doc.patientData.values", []] },
        "obs_doc.alertLevel":   { "$cond": {
                    if :{"$and":[{"$ne": ["$obs_doc.patientData.value", null]},
                                {"$ne": ["$obs_doc.patientData.value", '']},
                                {"$in":["$obs_doc.type",["number", "mapping ob", "mapping lab","mapping", "calculation"]]}
                                ]
                            },
                    then:{
                    "$map":
                        {
                        input: "$obs_doc.options",
                        as: "option",
                        in: { "$cond": 
                                    { if:{ "$and":
                                    [{ $gte:[{ '$toDecimal': '$obs_doc.patientData.value'}, "$$option.from" ] },
                                    { $lt: [{'$toDecimal': '$obs_doc.patientData.value'}, "$$option.to" ] }
                                    ]
                                    }, 
                                    then: { $ifNull: [ "$$option.alertLevel", 0] },
                                    else:0
                                    }
                                }
                        }
                },
                else:[0]
                    
                    }
            },
        "obs_doc.createdAt":"$obs_doc.patientData.createdAt"
                    }      
    },
    {"$addFields": {
        "obs_doc.alertLevel":
        {
            "$reduce": {
                input: "$obs_doc.alertLevel",
                initialValue: 0,
                in: { $add: [ "$$value", "$$this" ] }
            }
        }
    }      
    },
    
    {"$addFields": {
        "obs_doc.alertLevel":{ $ifNull: [ "$obs_doc.alertLevel", 0 ]},
    }
    },
                         
    {"$group": {_id:{_id: "$_id",
                            name:"$name",
                            patientID:req.body.patientID,
                            obName: "$obs_doc.name",
                            obID:"$obs_doc._id",
                            obType:"$obs_doc.type",
                            obIndex:"$obs_doc.index"

                        },
                    valueSet: {$push:"$obs_doc.value"},
                    valuesSet:{$push:"$obs_doc.values"},
                    timeSet:{$push:"$obs_doc.createdAt"},
                    alertLevelSet:{$push:"$obs_doc.alertLevel"},
                        }
            },
    
    {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    patientID:'$_id.patientID',
                    obs:{_id:"$_id.obID", 
                        name:"$_id.obName",
                        type:"$_id.obType",
                        index:'$_id.obIndex',
                        valueSet:"$valueSet", 
                        valuesSet:"$valuesSet", 
                        timeSet:"$timeSet",
                        alertLevelSet:"$alertLevelSet",
                    },
                }
            },

   
 { "$sort": { "obs.index": 1 }}, 

{"$group": {_id:{_id: "$_id",
                name:"$name",
                patientID:req.body.patientID,},
                
                obs:{$push:"$obs"}
            }
    },
    {"$project":{
        _id:'$_id._id',
        name:'$_id.name',
        patientID:'$_id.patientID',
        obs:1
    }
} 



   


        ];
             Category.aggregate(
                     pipeline,
                    function(err, result)   {
                    console.log ('_id',req.body)
                    console.log ('result',result)
                    if(err) {
                        console.log(err);
                    }
                    else{
                         res.json(result);
                    }
                })
             
    }
    
//use aggregation to set a form
exports.getForm = function(req, res, next) {

var patientType='patient';
var visitType='visit';
var profileIDs=[];
//console.log (' profileID', req.body.profileID)
//console.log (' formTypes', req.body.formTypes)
for (profileID of req.body.profileIDs){
    profileIDs.push(mongoose.Types.ObjectId(profileID));
}
    
   Category.find({ _id: {$in:profileIDs}}).exec(function(err, profiles) {

    if (err) throw err;
    console.log ('profiles',profiles)

    var formIDs=[];
    for (let profile of profiles){
        for (let form of profile.forms){
            if (req.body.visitType){
               if (req.body.visitType==form.visitType&&req.body.formTypes.indexOf (form.formType)>-1&&formIDs.indexOf(mongoose.Types.ObjectId(form._id))==-1)
                {
                    formIDs.push(mongoose.Types.ObjectId(form._id) )
                }
            }
            else{
                if (req.body.formTypes.indexOf (form.formType)>-1&&formIDs.indexOf(mongoose.Types.ObjectId(form._id))==-1)
                {
                    formIDs.push(mongoose.Types.ObjectId(form._id) )
                }

            }
    }
    }
console.log (' formIDs', formIDs)

    if (!req.body.patientID){
        var pipeline= [
            
               { "$match": { "_id": {$in: formIDs } }},
            
                {"$unwind": '$obSets'},
                {"$project":{obs:0 }},

                { "$lookup": {
                    "let": { "obSetsID": "$obSets._id" },
                    "from": "categories",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                    ],
                    "as": "obSets_doc"
                }},
                {"$unwind": '$obSets_doc'},
                {"$unwind": '$obSets_doc.obs'},

                { "$lookup": {
                    "let": { "obsID": "$obSets_doc.obs._id" },
                    "from": "categories",
                    "pipeline": [
                    { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                    ],
                    "as": "obSets_doc.obs_doc"
                }},

                {"$project":{
                
                    obSets:0
                
                }},

                {"$unwind": '$obSets_doc.obs_doc'},

                {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                            '_id':'$obSets_doc._id', 
                                            'addsIn':'$obSets.addsIn', 
                                            'obs_doc':{'name':'$obSets_doc.obs.name',
                                                        '_id':'$obSets_doc.obs._id',
                                                        'addsIn':'$obSets_doc.obs.addsIn', 
                                                        'options':'$obSets_doc.obs_doc.options'}}}},

                    
                {"$group": {_id:{_id: "$_id",name:"$name",formType:"$formType", addsIn:'$obSets_doc.addsIn',obSetName:'$obSets_doc.name',obSetID:'$obSets_doc._id'},
                        
                            obs: {$push: '$obSets_doc.obs_doc'}}},

                {"$project":{
                                _id:'$_id._id',
                                name:'$_id.name',
                                formType:'$_id.formType',
                                obSetName:'$_id.obSetName',
                                addsIn:'$_id.addsIn',
                                obSetID: '$_id.obSetID',
                                obs:1
                                    
                        }},
                            

                {'$addFields':{'obSets':{'name':'$obSetName', '_id':'$obSetID', 'addsIn':'$addsIn', 'obs':'$obs'}}},

                {"$group": {_id:{_id: "$_id",name:"$name",formType:"$formType"},
                        
                            obSets: {$push: '$obSets'}}},

                {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    formType:'$_id.formType',
                    obSets:1
                        
                }},

                { $sort : { formType: 1 } }
            ];
        
        }
    else {
        pipeline= [
                       { "$match": { "_id": {$in:formIDs } }},
                    
                        
                        { "$unwind": 
                          "$obSets"
                           // {"path": "$obSets",
                           // "preserveNullAndEmptyArrays": true}
                            },
                       
        
                        { "$lookup": {
                            "let": { "obSetsID": "$obSets._id" },
                            "from": "categories",
                            "pipeline": [
                            { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obSetsID"} ] } } }
                            ],
                            "as": "obSets_doc"
                        }},
                    
                        { "$unwind": 
                            '$obSets_doc'
                          // { "path": '$obSets_doc',
                          //  "preserveNullAndEmptyArrays": true}}
                     },
                    
                        { "$unwind": 
                       // '$obSets_doc.obs'
                        {
                            "path": '$obSets_doc.obs',
                            "preserveNullAndEmptyArrays": true}
                     },
        
                        { "$lookup": {
                            "let": { "obsID": "$obSets_doc.obs._id" },
                            "from": "categories",
                            "pipeline": [
                            { "$match": { "$expr": { "$eq": [ {"$toString":"$_id"}, {"$toString":"$$obsID"} ] } } }
                            ],
                            "as": "obSets_doc.obs_doc"
                        }},
        
        
                        {"$project":{
                        
                            obSets:0
                        
                        }},
        
                      
                        { "$unwind": {
                            "path":'$obSets_doc.obs_doc',
                            "preserveNullAndEmptyArrays": true
                    } },
                        {'$addFields':{'obSets_doc':{'name':'$obSets_doc.name', 
                                                    '_id':'$obSets_doc._id', 
                                                    'addsIn':'$obSets.addsIn', 
                                                    'obs_doc':{'name':'$obSets_doc.obs.name',
                                                                '_id':'$obSets_doc.obs._id',
                                                                'patientID': req.body.patientID,
                                                                'visitID': req.body.visitID,
                                                                'addsIn':'$obSets_doc.obs.addsIn',
                                                                'index':'$obSets_doc.obs.index',
                                                                'options':'$obSets_doc.obs_doc.options'}}}},
                     
        
                        { "$lookup": {
                            "let": { "obsID": "$obSets_doc.obs_doc._id" , 
                                    "patientID":"$obSets_doc.obs_doc.patientID",
                                    "visitID":"$obSets_doc.obs_doc.visitID",
                                    "context": "$obSets_doc.obs_doc.context",
                                    "mappingOb":"$obSets_doc.obs_doc.mappingOb"},
                            "from": "datas",
                            "pipeline":[
                                {
                                      "$match": {
                                              "$expr": {
                                                  "$or":[
                                                      {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                          "$eq": [ "$$context", patientType ]
                                                      },
                                                        
                                                    ]
                                                  },
                                                {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$obsID"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                            "$eq": [ "$visitID", "$$visitID" ]
                                                        },
                                                        {
                                                          "$eq": [ "$$context", visitType ]
                                                      },
                                                        
                                                    ]
                                                },
                                                {
                                                    "$and": [
                                                        {
                                                            "$eq": [ "$obID", {"$toString":"$$mappingOb._id"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        }
                                                      
                                                        
                                                    ]
                                                  },
                                            ]
                                                  
                                              }
                                              }
                                          }
                                  ],
      
                            "as": "obSets_doc.obs_doc.patientData"
                        }},
                        
        {"$addFields": {
            "obSets_doc.obs_doc.patientData":
                { "$arrayElemAt": [ "$obSets_doc.obs_doc.patientData", -1 ] }
         }
       },
                     
                        { "$lookup": {
                            "let": { "mappingLab":"$obSets_doc.obs_doc.mappingLab", 
                                      "patientID":"$obSets_doc.obs_doc.patientID" },
                            "from": "labs",
                            "pipeline":[
                                {
                                      "$match": {
                                              "$expr": {
                                                   "$and": [
                                                        {
                                                            "$eq": [ "$labItemID", {"$toString":"$$mappingLab._id"} ]
                                                        },
                                                        {
                                                            "$eq": [ "$patientID", "$$patientID" ]
                                                        },
                                                        {
                                                          "$gte": [ "$$mappingLab.searchDays",{"$subtract": [req.body.visitDate, "$createdAt"  ] } ]
                                                      },
                                                        
                                                    ]
                                              }
                                              }
                                          }
                                  ],
      
                            "as": "obSets_doc.obs_doc.LabData"
                        }},  

                        //lookup lab collection
        {"$addFields": {
                            "obSets_doc.obs_doc.labData":
                                { "$arrayElemAt": [ "$obSets_doc.obs_doc.labData", -1 ] }
                         }
        },
                        
        /*    { "$unwind": {
                            "path":'$obSets_doc.obs_doc.LabData',
                            "preserveNullAndEmptyArrays": true
            } },*/
                  
//asign lab data to ob value
            {"$addFields": {
                 "obSets_doc.obs_doc.value":
                                { "$cond": {
                                    if :{$ne: ["obSets_doc.obs_doc.patientData.value", null]},
                                    then:"$obSets_doc.obs_doc.patientData.value",
                                    else:"$obSets_doc.obs_doc.labData.value"
                                    
                                    }
                            }
                        }
                    },
            {"$addFields": {
                        "obSets_doc.obs_doc.values":{ $ifNull: [ "$obSets_doc.obs_doc.values", []] }
                    }
            },
         
            {"$addFields": {
                "obSets_doc.obs_doc.values":
                { "$cond": {
                    if :{"$and":[{"$ne": ["$obSets_doc.obs_doc.value", null]},
                                 {"$in":["$obSets_doc.obs_doc.type",["number", "mapping ob","mapping", "mapping lab"]]}
                                ]
                            },
                    then:{
                     "$map":
                        {
                          input: "$obSets_doc.obs_doc.options",
                          as: "option",
                          in: { "$cond": 
                                    { if:{ "$and":
                                    [{ $gte:[{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.from" ] },
                                    { $lt: [{"$toDecimal":"$obSets_doc.obs_doc.value"}, "$$option.to" ] }
                                    ]
                                    }, 
                                    then: "$$option",
                                    else:null
                                    }
                                }
                        }
                   },
                   else:  { "$cond": {
                                if :{"$and":[
                                            {"$in":["$obSets_doc.obs_doc.type",["list"]]}
                                            ]
                                        },
                                then:{
                                "$map":
                                    {
                                    input: "$obSets_doc.obs_doc.options",
                                    as: "option",
                                    in: { "$cond": 
                                        { if:{ "$and":
                                                [{ "$in":["$$option.text", "$obSets_doc.obs_doc.values" ] }
                                                
                                                ]
                                                }, 
                                                then: "$$option",
                                                else:null
                                                }
                                            }
                                    }
                            },
                            else:[]
                    
                        }
            }
                    
                    }
            }
        }
    },

    {"$addFields": {
        "obSets_doc.obs_doc.values":
        {$filter: {
        input: "$obSets_doc.obs_doc.values",
        as: "item",
        cond: { $ne: [ "$$item", null ] }
     }
        }
    }
},
   
    { "$unwind": {
        "path":'$obSets_doc.obs_doc.values',
        "preserveNullAndEmptyArrays": true
} },

 
        {"$group": {_id:{_id: "$_id",
                            name:"$name",
                            formType:"$formType", 
                            obSetAddsIn:'$obSets_doc.addsIn',
                            obSetName:'$obSets_doc.name',
                            obSetID:'$obSets_doc._id',
                            obID:'$obSets_doc.obs_doc._id',
                            obName:'$obSets_doc.obs_doc.name',
                            obOptions:'$obSets_doc.obs_doc.options',
                            obAddsIn:'$obSets_doc.obs_doc.addsIn',
                            obType:'$obSets_doc.obs_doc.type',
                            obValue:'$obSets_doc.obs_doc.value',
                            obIndex: '$obSets_doc.obs_doc.index',
                            obCalculationItems:'$obSets_doc.obs_doc.calculationItems',
                            obSingleSelection:'$obSets_doc.obs_doc.singleSelection'
                            
                        },
                    obValues: {$push: '$obSets_doc.obs_doc.values'},
                    obNumber: {$sum: {'$toDecimal':'$obSets_doc.obs_doc.values.number'}},
                        
                        }
        },

        { "$sort": { "_id.obIndex": 1 }}, 

        {"$project":{
            _id:'$_id._id',
            name:'$_id.name',
            formType:'$_id.formType',
            obSetName:'$_id.obSetName',
            obSetAddsIn:'$_id.obSetAddsIn',
            obSetID: '$_id.obSetID',
            obs:{ _id:'$_id.obID',
                 name: '$_id.obName',
                 options:'$_id.obOptions',
                 addsIn:'$_id.obAddsIn',
                 type:'$_id.obType', 
                 value:'$_id.obValue',
                 index:'$_id.obIndex',
                 calculationItems:'$_id.obCalculationItems',
                 singleSelection:'$_id.obSingleSelection',
                 values:'$obValues',
                 number:'$obNumber'
        }
        }
    },
       
                
        {"$group": {_id:{_id: "$_id",
                        name:"$name",
                        formType:"$formType", 
                        obSetAddsIn:'$obSetAddsIn',
                        obSetName:'$obSetName',
                        obSetID:'$obSetID'},
                obs: {$push: '$obs'},
                obsSum: {$sum: '$obs.number'},
                      
                    }
            },

          

            {"$project":{
                _id:'$_id._id',
                name:'$_id.name',
                formType:'$_id.formType',
                obSetName:'$_id.obSetName',
                obSetAddsIn:'$_id.obSetAddsIn',
                obSetID: '$_id.obSetID',
                obs:{
                    $map:
                        {
                          input: "$obs",
                           as: "ob",
                           in: 
                            { "$cond": {
                                if:{ "$eq": ["$$ob.type", 'calculation']},
                                then: {"value":"$obsSum", 
                                        "_id":"$$ob._id",
                                        "name":"$$ob.name",
                                        "type":"$$ob.type",
                                        "addsIn": "$$ob.addIn",
                                        "options": "$$ob.options",
                                        "index":"$$ob.index",
                                        "calculationItems":'$$ob.calculationItems',
                                        "singleSelection":'$$ob.singleSelection',
                                        "values":{
                                            "$map":
                                                    {
                                                    input: "$$ob.options",
                                                    as: "option",
                                                    in: { "$cond": 
                                                                { if:{ "$and":
                                                                [{ $gte:[{"$toDecimal":"$obsSum"}, "$$option.from" ] },
                                                                { $lt: [{"$toDecimal":"$obsSum"}, "$$option.to" ] }
                                                                ]
                                                                }, 
                                                                then: "$$option",
                                                                else:null
                                                                }
                                                            }
                                                    }
                                            }
                                        },
                                else: "$$ob"
                                        }
                                    }
                                }
                            }
        }},




          
            {'$addFields':{'obSets':{'name':'$obSetName', '_id':'$obSetID', 'addsIn':'$obSetAddsIn', 'obs':'$obs'}}},

                {"$group": {_id:{_id: "$_id",name:"$name",formType:"$formType"},
                        
                            obSets: {$push: '$obSets'}}},

                {"$project":{
                    _id:'$_id._id',
                    name:'$_id.name',
                    formType:'$_id.formType',
                    obSets:1
                        
                }},

                     
                    ];
                
            }
        Category.aggregate(
                 pipeline,
                function(err, result)   {
                console.log ('_id',req.body.formIDs)
                console.log ('result',result)
                if(err) {
                    console.log(err);
                }
                else{
                     res.json(result);
                }
            })
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
exports.getByFilter = function(req, res, next) {

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

