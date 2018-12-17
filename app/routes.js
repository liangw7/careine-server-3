var AuthenticationController = require('./controllers/authentication'),
    TodoController = require('./controllers/todos'),
    VisitController = require('./controllers/visits'),
    PathwayController = require('./controllers/pathway'),
    FollowupController = require('./controllers/followup'),
    UserController = require('./controllers/users'),
    MedicalHistoryController = require('./controllers/MedicalHistory'),
    NoteController = require('./controllers/note'),
    MedController = require('./controllers/meds'),
    RequestController = require('./controllers/Request'),
    ImageController = require('./controllers/images'),
    ScreeningController = require('./controllers/screening'),
    CategoryController = require('./controllers/categories'),
    DataController = require('./controllers/data'),
    //    Image = require('./models/image');
    LabController = require('./controllers/labs'),
    OrderController = require('./controllers/orders'),

    express = require('express'),
    passportService = require('../config/passport'),
    passport = require('passport');
fs = require('fs');
var requireAuth = passport.authenticate('jwt', { session: false }),
    requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {


    var apiRoutes = express.Router(),
        authRoutes = express.Router(),
        todoRoutes = express.Router();
    visitRoutes = express.Router();
    pathwayRoutes = express.Router();
    followupRoutes = express.Router();
    MedicalHistoryRoutes = express.Router();
    noteRoutes = express.Router();
    MedRoutes = express.Router();
    RequestRoutes = express.Router();
    userRoutes = express.Router();
    imageRoutes = express.Router();
    labRoutes = express.Router();
    orderRoutes = express.Router();
    screeningRoutes = express.Router();
    CategoryRoutes = express.Router();
    dataRoutes = express.Router();
    // Auth Routes
    apiRoutes.use('/auth', authRoutes);

    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);

    authRoutes.get('/protected', requireAuth, function(req, res) {
        res.send({ content: 'Success' });
    });

    // Todo Routes
    apiRoutes.use('/todos', todoRoutes);
    todoRoutes.get('/', requireAuth, TodoController.getTodos);
    todoRoutes.post('/', requireAuth, TodoController.createTodo);
    todoRoutes.delete('/:todoID', requireAuth, TodoController.deleteTodo);
    todoRoutes.get('/patient/:patientID', requireAuth, TodoController.getTodosByPatient);
    todoRoutes.get('/provider/:providerID', requireAuth, TodoController.getTodosByProvider);
    todoRoutes.get('/requester/:requesterID', requireAuth, TodoController.getTodosByRequester);
    todoRoutes.post('/update', requireAuth, TodoController.UpdateTodo);

    // Visit Routes
    apiRoutes.use('/visits', visitRoutes);
    visitRoutes.get('/', requireAuth, VisitController.getVisits);
    visitRoutes.post('/', requireAuth, VisitController.createVisit);
    visitRoutes.delete('/:visitID', requireAuth, VisitController.deleteVisit);
    visitRoutes.post('/patient', requireAuth, VisitController.getVisitsByPatient);
    visitRoutes.get('/provider/:providerID', requireAuth, VisitController.getVisitsByProvider);
    visitRoutes.get('/requester/:requesterID', requireAuth, VisitController.getVisitsByRequester);
    visitRoutes.post('/update', requireAuth, VisitController.UpdateVisit);

    // Data Routes
    apiRoutes.use('/datas', dataRoutes);
    dataRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), DataController.getDatas);
    dataRoutes.post('/', requireAuth, DataController.Create);
    dataRoutes.delete('/:dataID', requireAuth, DataController.Delete);
    dataRoutes.post('/patient', requireAuth, DataController.getDatasByPatient);
    dataRoutes.post('/ob', requireAuth, DataController.getDatasByOb);
    dataRoutes.post('/visit', requireAuth, DataController.getDatasByVisit);
    dataRoutes.post('/followup', requireAuth, DataController.getDatasByFollowup);
    dataRoutes.post('/filter', requireAuth, DataController.getDatasByFilter);
    dataRoutes.get('/dataId', requireAuth, DataController.getById);
    dataRoutes.post('/update', requireAuth, DataController.Update);

    // followup Routes
    apiRoutes.use('/followups', followupRoutes);
    followupRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), FollowupController.getFollowups);
    followupRoutes.post('/', requireAuth, FollowupController.createFollowup);
    followupRoutes.delete('/:visitID', requireAuth, FollowupController.deleteFollowup);
    followupRoutes.get('/patient/:patientID', requireAuth, FollowupController.getFollowupsByPatient);
    followupRoutes.get('/provider/:providerID', requireAuth, FollowupController.getFollowupsByProvider);
    followupRoutes.post('/date', requireAuth, FollowupController.getFollowupsByDate);

    followupRoutes.get('/requester/:requesterID', requireAuth, FollowupController.getFollowupsByRequester);
    followupRoutes.post('/update', requireAuth, FollowupController.UpdateFollowup);


    // pathway Routes
    apiRoutes.use('/pathway', pathwayRoutes);
    pathwayRoutes.get('/', PathwayController.getPathway);
    pathwayRoutes.post('/', requireAuth, PathwayController.createPathway);
    pathwayRoutes.delete('/:pathwayID', requireAuth, PathwayController.deletePathway);
    pathwayRoutes.get('/patient/:patientID', requireAuth, PathwayController.getPathwayByPatient);
    pathwayRoutes.get('/provider/:providerID', requireAuth, PathwayController.getPathwayByProvider);
    pathwayRoutes.post('/visit', requireAuth, PathwayController.getPathwayByVisit);

    pathwayRoutes.get('/requester/:requesterID', requireAuth, PathwayController.getPathwayByRequester);
    pathwayRoutes.post('/update', requireAuth, PathwayController.UpdatePathway);

    // User Routes
    apiRoutes.use('/users', userRoutes);
    userRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), UserController.getUsers);
    userRoutes.get('/:User_id', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'market']), UserController.getUserById);
    userRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'market']), UserController.createUser);
    // userRoutes.get('/role/:role', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'market']), UserController.getUsersByRole);
    userRoutes.get('/role/:role', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), UserController.getUsersByRole);
    userRoutes.get('/email/:email', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), UserController.getUserByEmail);

    userRoutes.post('/getProfilePhoto', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), UserController.getProfilePhoto);
    userRoutes.post('/update', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), AuthenticationController.roleAuthorization(['admin', 'provider', 'market']), UserController.updateUser);

    userRoutes.delete('/:User_id', requireAuth, AuthenticationController.roleAuthorization(['admin', 'provider', 'patient']), AuthenticationController.roleAuthorization(['admin', 'provider', 'market']), UserController.deleteUser);

    // MedicalHistory Routes
    apiRoutes.use('/MedicalHistory', MedicalHistoryRoutes);
    MedicalHistoryRoutes.get('/:_id', requireAuth, MedicalHistoryController.getById);
    MedicalHistoryRoutes.post('/patient', requireAuth, MedicalHistoryController.getByPatient);
    MedicalHistoryRoutes.post('/Update', requireAuth, MedicalHistoryController.Update);
    MedicalHistoryRoutes.get('/', requireAuth, MedicalHistoryController.get);
    MedicalHistoryRoutes.post('/', requireAuth, MedicalHistoryController.create);
    MedicalHistoryRoutes.delete('/:ID', requireAuth, MedicalHistoryController.delete);
    MedicalHistoryRoutes.post('/photo', requireAuth, MedicalHistoryController.upload);
    MedicalHistoryRoutes.delete('/photo/:ID', requireAuth, MedicalHistoryController.deletePhoto);


    // note Routes
    apiRoutes.use('/note', noteRoutes);
    noteRoutes.get('/:noteId', requireAuth, NoteController.getById);
    noteRoutes.post('/patient', requireAuth, NoteController.getByPatient);
    noteRoutes.post('/visit', requireAuth, NoteController.getByVisit);
    noteRoutes.post('/Update', requireAuth, NoteController.Update);
    noteRoutes.get('/', requireAuth, NoteController.get);
    noteRoutes.post('/', requireAuth, NoteController.create);
    noteRoutes.delete('/:noteId', requireAuth, NoteController.delete);
    noteRoutes.post('/photo', requireAuth, NoteController.upload);
    noteRoutes.delete('/photo/:noteId', requireAuth, NoteController.deletePhoto);

    // note Routes
    apiRoutes.use('/screening', screeningRoutes);
    screeningRoutes.get('/:screeningId', requireAuth, ScreeningController.getById);
    screeningRoutes.post('/patient', requireAuth, ScreeningController.getByPatient);
    screeningRoutes.post('/visit', requireAuth, ScreeningController.getByVisit);
    screeningRoutes.post('/Update', requireAuth, ScreeningController.Update);
    screeningRoutes.get('/', requireAuth, ScreeningController.get);
    screeningRoutes.post('/', requireAuth, ScreeningController.create);
    screeningRoutes.delete('/:screeningId', requireAuth, ScreeningController.delete);
    screeningRoutes.post('/photo', requireAuth, ScreeningController.upload);
    screeningRoutes.delete('/photo/:screeningId', requireAuth, ScreeningController.deletePhoto);

    // Med Routes
    apiRoutes.use('/meds', MedRoutes);
    MedRoutes.get('/:medId', requireAuth, MedController.getById);
    MedRoutes.post('/patient', requireAuth, MedController.getByPatient);
    MedRoutes.post('/Update', requireAuth, MedController.Update);
    MedRoutes.get('/', requireAuth, MedController.get);
    MedRoutes.post('/', requireAuth, MedController.create);
    MedRoutes.delete('/:medId', requireAuth, MedController.delete);
       // order Routes
       apiRoutes.use('/orders', orderRoutes);
       orderRoutes.get('/:orderId', requireAuth, OrderController.getById);
       orderRoutes.post('/patient', requireAuth, OrderController.getByPatient);
       orderRoutes.post('/visit', requireAuth, OrderController.getByVisit);
       orderRoutes.post('/Update', requireAuth, OrderController.Update);
       orderRoutes.get('/', requireAuth, OrderController.get);
       orderRoutes.post('/', requireAuth, OrderController.create);
       orderRoutes.delete('/:orderId', requireAuth, OrderController.delete);

    // Category Routes
    apiRoutes.use('/categories', CategoryRoutes);
    CategoryRoutes.get('/:categoryId', CategoryController.getById);
    CategoryRoutes.post('/patient', CategoryController.getByPatient);
    CategoryRoutes.post('/Update', CategoryController.Update);
    CategoryRoutes.get('/', CategoryController.get);
    CategoryRoutes.post('/', CategoryController.create);
    CategoryRoutes.get('/field/:field', CategoryController.getByField);
    CategoryRoutes.get('/profileType/:profileType', CategoryController.getByProfileType);
    CategoryRoutes.get('/activityType/:activityType', CategoryController.getByActivityType);
    CategoryRoutes.get('/formType/:formType', CategoryController.getByFormType);
    CategoryRoutes.post('/fields', CategoryController.getByFields);
    CategoryRoutes.post('/orderMaster', CategoryController.getOrderMasters);
    CategoryRoutes.delete('/:categoryId', requireAuth, CategoryController.delete);

    // Request Routes
    apiRoutes.use('/Requests', RequestRoutes);
    RequestRoutes.post('/', requireAuth, RequestController.getRequestById);
    RequestRoutes.get('/', RequestController.getRequests);
    RequestRoutes.get('/:title', RequestController.getRequestsByPatient);

    RequestRoutes.post('/', requireAuth, RequestController.createRequest);
    RequestRoutes.delete('/:requestID', requireAuth, RequestController.deleteRequest);

    //images Routes
    apiRoutes.use('/images', imageRoutes);
    imageRoutes.post('/', requireAuth, ImageController.uploadImage);
    imageRoutes.post('/patient', requireAuth, ImageController.getByPatient);
    imageRoutes.post('/getImage', requireAuth, ImageController.getImage);
    imageRoutes.delete('/:ID', requireAuth, ImageController.delete);

    //labs Routes
    apiRoutes.use('/labs', labRoutes);
    labRoutes.post('/upload', requireAuth, LabController.uploadLab);
    labRoutes.post('/patient', requireAuth, LabController.getByPatient);
    labRoutes.post('/getLab', requireAuth, LabController.getLab);
    labRoutes.delete('/:ID', requireAuth, LabController.delete);
    labRoutes.post('/Update', requireAuth, LabController.Update);
    labRoutes.post('/', requireAuth, LabController.create);
    labRoutes.post('/visit', requireAuth, LabController.getByVisit);
    // Set up routes

    app.use('/api', apiRoutes);
    /* var multer = require('multer');
     var storage = multer.diskStorage({
         destination: function(req, file, cb) {
             cb(null, 'uploads')
         },
         filename: function(req, file, cb) {
             cb(null, req.body.name + '-' + Date.now())
         }
     })

     var upload = multer({ storage: storage });*/
    /*
    app.post('/uploads', (req, res, next) => {


        var newImage = {
            filename: req.body.image.name,
            originalName: req.body.image.about,
            desc: req.body.image.about,
            patientID: req.body.patientID,
        };

        Image.create(newImage, function(err, data) {

            if (err) {
                res.send(err);

            }
            console.log(data)
            var loadedfile = Buffer.from(req.body.image.profilePic, 'base64');
            // console.log(loadedfile)

            var path = '././uploads/' + data._id + '.jpg'
                // console.log(path)
            fs.writeFile(path, req.body.profilePic, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log("File saved successfully!");
            });
            res.json(data);
        });


    });

    app.get('/uploads', (req, res, next) => {
        // use lean() to get a plain JS object
        // remove the version key from the response
        Image.find({}, '-__v').lean().exec((err, images) => {
            if (err) {
                res.sendStatus(400);
            }

            // Manually set the correct URL to each image
            for (let i = 0; i < images.length; i++) {
                var img = images[i];
                img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
            }
            res.json(images);
        })
    });*/


}