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
    ReportController = require('./controllers/report'),
    MailController = require('./controllers/mail'),
    OrderItemController = require('./controllers/orderItem'),
    LabItemController = require('./controllers/labItem'),
    ImageItemController = require('./controllers/imageItem'),
    UploadDataController = require('./controllers/upload'),
    ProblemController = require('./controllers/problem'),
    //    Image = require('./models/image');
    LabController = require('./controllers/labs'),
    OrderController = require('./controllers/orders'),
    DiagnosisController = require('./controllers/diagnosis'),
    express = require('express'),
    passportService = require('../config/passport'),
    passport = require('passport');
    var path = require('path');
    const fs = require('fs')
    const { promisify } = require('util')
    const https = require("https");
    const request = require("request");
    const unlinkAsync = promisify(fs.unlink)
    var multer = require('multer');
    const {Wechat} = require('wechat-jssdk');
    const { WechatClient } = require('messaging-api-wechat');
    const wechatConfig={
        //set your oauth redirect url, defaults to localhost
        "wechatRedirectUrl": "https://www.digitalbaseas.com/wechat/oauth-callback",
        //"wechatToken": "wechat_token", //not necessary required
        "appId":  'wx1456c566ec3e6686',
        "appSecret": '8ada6bb8a95c8d79abf7a374688aa9cd',
        card: true, //enable cards
     //   payment: true, //enable payment support
     //   merchantId: '', //
      //  paymentSandBox: true, //dev env
      //  paymentKey: '', //API key to gen payment sign
      //  paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
        //default payment notify url
      //  paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
        //mini program config
       // "miniProgram": {
       //   "appId": "mp_appid",
        //  "appSecret": "mp_app_secret",
       // }
      }
      const wx = new Wechat(wechatConfig);

var roleList=['admin', 'provider', 'market'];

var requireAuth = passportService.authenticateJWT,
   requireLogin = passportService.authenticateCredentials;
   // var requireAuth = passportService.authenticate('jwt', { session: false }),
   //     requireLogin = passportService.authenticate('local', { session: false });
//console.log ('requireAuth',requireAuth)
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
        reportRoutes = express.Router();
        diagnosisRoutes = express.Router();
        mailRoutes = express.Router();
        orderItemRoutes = express.Router();
        labItemRoutes = express.Router();
        imageItemRoutes = express.Router();
        problemRoutes = express.Router();
        uploadDataRoutes = express.Router();
        uploadRoutes=express.Router();
        tttRoutes=express.Router();


        // Auth Routes
    apiRoutes.use('/auth', authRoutes);
    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin , AuthenticationController.login);
    authRoutes.get('/protected', requireAuth, function(req, res) {
     // console.log ('requireAuth',requireAuth)
        res.send({ content: 'Success' });
        });
   //upload routes
       
 

   apiRoutes.use('/ttt', tttRoutes);
  // console.log ('here api test')
   tttRoutes.get('/', function (req, res) {
  

    res.send('Hello World\n');
   
});

//app.use('/ttt',tttRoutes)
        apiRoutes.use('/upload', uploadRoutes);

       


        uploadRoutes.get('/', function (req, res) {
            res.end('file catcher example');
        });


        uploadRoutes.get('/:filename', function( req, res, next){

            var filename = req.params.filename,
               
                root = DIR+'/';
             //   console.log ('dir', DIR)
        
            var options = {
                root: root,
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
        
            res.sendFile(filename, options, (err) => {
                if (err) {
                    next(err);
                } else {
            //        console.log('Sent:', filename);
                }
            });
        })

        const DIR = '././uploads';
 
        let storage = multer.diskStorage({
            destination: (req, file, cb) => {
              cb(null, DIR);
            },
            filename: (req, file, cb) => {
             //  console.log ('file', file.fieldname);
              cb(null, file.fieldname + '-' + file.originalname);
            }
        });
        let upload = multer({storage: storage});

        uploadRoutes.post('/',upload.single('photo'), function (req, res) {
            if (!req.file) {
              //  console.log("No file received");
                return res.send({
                    success: false
                });
            
                } else {
                console.log('file received');
                return res.send({
                    success: true
                })
                }
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
    visitRoutes.get('/', VisitController.getVisits);
    visitRoutes.post('/',  VisitController.createVisit);
    visitRoutes.delete('/:visitID',  VisitController.deleteVisit);
    visitRoutes.post('/patient', VisitController.getVisitsByPatient);
    visitRoutes.post('/filter',  VisitController.getVisitsByFilter);
    visitRoutes.post('/provider', VisitController.getVisitsByProvider);
    visitRoutes.get('/requester/:requesterID',  VisitController.getVisitsByRequester);
    visitRoutes.post('/update', VisitController.UpdateVisit);
    visitRoutes.post('/monthlyVisits', VisitController.getMonthlyVisits);
    visitRoutes.post('/getFollowupsByDate', VisitController.getFollowupsByDate);
    
    visitRoutes.post('/getMonthlyVisitsByProvider', VisitController.getMonthlyVisitsByProvider);
  // Diagnosis Routes
    apiRoutes.use('/diagnosis', diagnosisRoutes);    
    diagnosisRoutes.get('/', DiagnosisController.getAllDiagnosis);
    diagnosisRoutes.post('/', DiagnosisController.Create);
    diagnosisRoutes.post('/bulk', DiagnosisController.CreateMany);
    diagnosisRoutes.delete('/:diagnosisId',  DiagnosisController.Delete);
    diagnosisRoutes.post('/filter', DiagnosisController.getByFilter);
    diagnosisRoutes.post('/search', DiagnosisController.getBySearch);
    diagnosisRoutes.get('/diagnosisId',  DiagnosisController.getById);
    diagnosisRoutes.post('/update',  DiagnosisController.Update);
    // Mail Routes
    apiRoutes.use('/mail', mailRoutes);    
    mailRoutes.get('/',  MailController.getAllMail);
    mailRoutes.post('/',  MailController.Create);
    mailRoutes.delete('/:mailId',  MailController.Delete);
    mailRoutes.post('/filter',  MailController.getByFilter);
    mailRoutes.get('/mailId',  MailController.getById);
    mailRoutes.post('/update',  MailController.Update);
    mailRoutes.post('/getPatientMails',  MailController.getPatientMails);

  /* mailRoutes.post('/message', function(req,resp){
     //   console.log ('req.body.wechatID',req.body.wechatID)
        var filter={wechatID:"liangw7",
        appID:req.body.appID,//"wx1456c566ec3e6686",
        appSecret:req.body.appSecret//"8ada6bb8a95c8d79abf7a374688aa9cd"
       };
        const wclient = WechatClient.connect({
            appId: filter.appID,
            appSecret: filter.appSecret,
          });
          
          wclient.sendText(filter.wechatID, 'this is a test').catch(error => {
            console.log(error); // formatted error message
            //console.log(error.stack); // error stack trace
            //console.log(error.config); // axios request config
            //console.log(error.request); // HTTP request
            console.log(error.response); // HTTP response;
        });
    })*/
    
    mailRoutes.post('/message', function(req,resp){

        var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
             +req.body.appID+'&secret='+req.body.appSecret;
        https.get(tokenUrl, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                  body += data;
                });
                res.on("end", () => {
                  body = JSON.parse(body);
                  console.log('wechat access',body);
                  var weCharUrl='https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='
                  +body.access_token;
                  console.log ('weCharUrl============================================', weCharUrl)
                  var postData={touser:req.body.openID,
                                  msgtype:"text",
                                  text:{content:req.body.message}
                              };
          
                  var options = {
                      method: 'post',
                      body: postData, // Javascript object
                      json: true, // Use,If you are sending JSON data
                      url: weCharUrl,
                      headers: {
                        // Specify headers, If any
                      }
                    }
                    
                    request(options, function (err, res, body) {
                        console.log ('message option', options)
                      if (err) {
                        console.log('Error :', err)
                        return
                      }
                      console.log(' Body :', body)
                       
                    });
                  
                });
            })     
        
         });
  
    mailRoutes.post('/messageLink', function(req,resp){

    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
          +req.body.appID+'&secret='+req.body.appSecret;
    https.get(tokenUrl, res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
              body += data;
            });
            res.on("end", () => {
              body = JSON.parse(body);
              console.log('wechat access',body);
              var weCharUrl='https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='
              +body.access_token;
              console.log ('weCharUrl============================================', weCharUrl)
              var postData={touser:req.body.openID,
                              msgtype:"news",
                              news:{
                                articles: [
                                 {
                                     title:req.body.title,
                                     description:req.body.message,
                                     url:req.body.url,
                                     picurl:req.body.picUrl,
                                 }
                                 ]
                            }
                          };
                        
      
              var options = {
                  method: 'post',
                  body: postData, // Javascript object
                  json: true, // Use,If you are sending JSON data
                  url: weCharUrl,
                  headers: {
                    // Specify headers, If any
                  }
                }
                
                request(options, function (err, res, body) {
                    console.log ('message option', options)
                  if (err) {
                    console.log('Error :', err)
                    return
                  }
                  console.log(' Body :', body)
                    
                });
              
            });
        })     
    
      });
      //   POST "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=30_fCvQpHlNUuuW4XFluNRGIxHkV_QsAy3LviPfrh-_ZFoCzTT2q8t72aklw7PCT9mOnzIBhffh99vqc6B1RezrKGq2Vft09x8ewWuEwslOnE24L52cqH9ReZNYjf3zzdmRF97PhSkMISq_LgXOXMObAFASHJ" -d '{"touser":"oN_YY01eqorRQ5_TFbUDEcM6yYx8","msgtype":"text","text":{"content":"Hello World"}}'
     // Problem Routes
     apiRoutes.use('/problem', problemRoutes);    
     problemRoutes.get('/',  ProblemController.getAllProblem);
     problemRoutes.post('/',  ProblemController.Create);
     problemRoutes.delete('/:id',  ProblemController.Delete);
     problemRoutes.post('/filter',  ProblemController.getByFilter);
     problemRoutes.get('/id',  ProblemController.getById);
     problemRoutes.post('/update',   ProblemController.Update);
     problemRoutes.post('/getPatientProblems',   ProblemController.getPatientProblems);
  

          //OrderItem Routes
          apiRoutes.use('/orderItem', orderItemRoutes);    
          orderItemRoutes.get('/',  OrderItemController.getAll);
          orderItemRoutes.post('/',  OrderItemController.Create);
          orderItemRoutes.delete('/:id',  OrderItemController.Delete);
          orderItemRoutes.post('/filter',  OrderItemController.getByFilter);
          orderItemRoutes.get('/:orderItemId',  OrderItemController.getById);
          orderItemRoutes.post('/update',   OrderItemController.Update);
          orderItemRoutes.post('/getMedicationForm',   OrderItemController.getMedicationForm);
          orderItemRoutes.post('/getItems',   OrderItemController.getItems);
          orderItemRoutes.post('/getMedications',   OrderItemController.getMedications);
          orderItemRoutes.post('/checkDuplication',   OrderItemController.checkDuplication);
      
          
            //LabItem Routes
            apiRoutes.use('/labItem', labItemRoutes);    
            labItemRoutes.get('/',  LabItemController.getAll);
            labItemRoutes.post('/',  LabItemController.Create);
            labItemRoutes.delete('/:id',  LabItemController.Delete);
            labItemRoutes.post('/filter',  LabItemController.getByFilter);
            labItemRoutes.get('/:labItemId',  LabItemController.getById);
            labItemRoutes.post('/update',   LabItemController.Update);
              //ImageItem Routes
          apiRoutes.use('/imageItem', imageItemRoutes);    
          imageItemRoutes.get('/',  ImageItemController.getAll);
          imageItemRoutes.post('/',  ImageItemController.Create);
          imageItemRoutes.delete('/:id',  ImageItemController.Delete);
          imageItemRoutes.post('/filter',  ImageItemController.getByFilter);
          imageItemRoutes.get('/id:imageItemId',  ImageItemController.getById);
          imageItemRoutes.post('/update',   ImageItemController.Update);

    // uploadDataRoutes
    apiRoutes.use('/uploadData', uploadDataRoutes);    
    uploadDataRoutes.get('/', UploadDataController.getAll);
    uploadDataRoutes.post('/',   UploadDataController.Create);
    uploadDataRoutes.delete('/:id',  UploadDataController.Delete);
    uploadDataRoutes.post('/filter',  UploadDataController.getByFilter);
    uploadDataRoutes.get('/id', UploadDataController.getById);
    uploadDataRoutes.post('/update', UploadDataController.Update);

  
    // Data Routes
    apiRoutes.use('/datas', dataRoutes);
    dataRoutes.get('/',   DataController.getDatas);
    dataRoutes.post('/',  DataController.Create);
    dataRoutes.delete('/:dataID',  DataController.Delete);
    dataRoutes.post('/patient',  DataController.getDatasByPatient);
    dataRoutes.post('/ob',  DataController.getDatasByOb);
    dataRoutes.post('/visit',  DataController.getDatasByVisit);
    dataRoutes.post('/order',  DataController.getDatasByOrder);
    dataRoutes.post('/followup',  DataController.getDatasByFollowup);
    dataRoutes.post('/filter',  DataController.getDatasByFilter);
    dataRoutes.get('/dataId',  DataController.getById);
    dataRoutes.post('/update',  DataController.Update);
    dataRoutes.post('/getPatientsByFilter',  DataController.getPatientsByFilter);
    dataRoutes.post('/getReport',  DataController.getReport);
    dataRoutes.post('/getMultiReport',  DataController.getMultiReport);
     //Report Routes
     apiRoutes.use('/reports', reportRoutes);
     reportRoutes.post('/',  ReportController.Create);
     reportRoutes.delete('/:reportId',  ReportController.Delete);
     reportRoutes.post('/filter',  ReportController.getReportsByFilter);
     reportRoutes.get('/reportId',  ReportController.getById);
     reportRoutes.post('/update',  ReportController.Update);

    // followup Routes
    apiRoutes.use('/followups', followupRoutes);
    followupRoutes.get('/',   FollowupController.getFollowups);
    followupRoutes.post('/',  FollowupController.createFollowup);
    followupRoutes.delete('/:visitID',  FollowupController.deleteFollowup);
    followupRoutes.get('/patient/:patientID',  FollowupController.getFollowupsByPatient);
    followupRoutes.get('/provider/:providerID',  FollowupController.getFollowupsByProvider);
    followupRoutes.post('/date',  FollowupController.getFollowupsByDate);

    followupRoutes.get('/requester/:requesterID',  FollowupController.getFollowupsByRequester);
    followupRoutes.post('/update',  FollowupController.UpdateFollowup);


    // pathway Routes
    apiRoutes.use('/pathway', pathwayRoutes);
    pathwayRoutes.get('/', PathwayController.getPathway);
    pathwayRoutes.post('/',  PathwayController.createPathway);
    pathwayRoutes.delete('/:pathwayID',  PathwayController.deletePathway);
    pathwayRoutes.get('/patient/:patientID',  PathwayController.getPathwayByPatient);
    pathwayRoutes.get('/provider/:providerID',  PathwayController.getPathwayByProvider);
    pathwayRoutes.post('/visit',  PathwayController.getPathwayByVisit);

    pathwayRoutes.get('/requester/:requesterID',  PathwayController.getPathwayByRequester);
    pathwayRoutes.post('/update',  PathwayController.UpdatePathway);
  
    // User Routes
   // requireAuth,AuthenticationController.roleAuthorization(roleList),
    apiRoutes.use('/users', userRoutes);
    userRoutes.get('/', requireAuth, UserController.getUsers);
    userRoutes.get('/:User_id',  UserController.getUserById);
    userRoutes.post('/',UserController.createUser);
    userRoutes.get('/role/:role', UserController.getUsersByRole);
    userRoutes.post('/profile', UserController.getUsersByProfile);
    userRoutes.post('/filter', UserController.getByFilter);
    userRoutes.post('/count', UserController.getCount);
    userRoutes.get('/email/:email', UserController.getUserByEmail);
    userRoutes.post('/dailyPatients', UserController.getDailyPatients);
    userRoutes.post('/monthlyPatients', UserController.getMonthlyPatients);
    userRoutes.post('/getProfilePhoto',  UserController.getProfilePhoto);
    userRoutes.post('/getUserProfiles',  UserController.getUserProfiles);
    userRoutes.post('/getProviders',  UserController.getProviders);
    userRoutes.post('/getlabItems',  UserController.getlabItems);
    userRoutes.post('/update',  UserController.updateUser);
    userRoutes.post('/getCountByService',  UserController.getCountByService);
    userRoutes.post('/getMonthlyPatientsByProvider',  UserController.getMonthlyPatientsByProvider);
    userRoutes.delete('/:User_id', UserController.deleteUser);
    userRoutes.post('/getProviderMails',  UserController. getProviderMails);
    userRoutes.post('/getPatientMails',  UserController. getPatientMails);
    userRoutes.post('/getVisitsByProvider',  UserController.getVisitsByProvider);
    
    userRoutes.post('/getPatientMailsFromProviders',  UserController. getPatientMailsFromProviders);
    
    

    userRoutes.post('/wechat', function(req,resp){
        console.log ('wechat access================================================')
       var weCharUrl='https://api.weixin.qq.com/sns/oauth2/access_token?appid='
        +req.body.appID+'&secret='+req.body.appSecret+'&code='+req.body.code+'&grant_type=authorization_code';
        
        https.get(weCharUrl, res => {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", data => {
            body += data;
          });
          res.on("end", () => {
            body = JSON.parse(body);
            console.log('wechat access',body);
            resp.json(body);
            
          });
      })
    });
  
    userRoutes.post('/signature', (req, res) => {
//console.log ('wx',wx)
        wx.jssdk.getSignature(req.body.url).then(signatureData => {
           // console.log('req.query.url',req.body.url) 
           // console.log('signatureData',signatureData) 
          res.json(signatureData);
        });
      });
    userRoutes.post('/wechatUserInfor', function(req,resp){
       var weCharUrl='https://api.weixin.qq.com/sns/userinfo?access_token='
       +req.body.accessToken+'&openid='+req.body.openID
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
        });
       
    userRoutes.post('/wechatLink', function(req,resp){
        var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
             +req.body.appID+'&secret='+req.body.appSecret;
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
        });
    userRoutes.post('/wechatTicket', function(req,resp){
        var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' 
        + req.body.accessToken + '&type=jsapi';

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
        });             
 // MedicalHistory Routes
    apiRoutes.use('/MedicalHistory', MedicalHistoryRoutes);
    MedicalHistoryRoutes.get('/:_id',  MedicalHistoryController.getById);
    MedicalHistoryRoutes.post('/patient',  MedicalHistoryController.getByPatient);
    MedicalHistoryRoutes.post('/Update',  MedicalHistoryController.Update);
    MedicalHistoryRoutes.get('/',  MedicalHistoryController.get);
    MedicalHistoryRoutes.post('/',  MedicalHistoryController.create);
    MedicalHistoryRoutes.delete('/:ID',  MedicalHistoryController.delete);
    MedicalHistoryRoutes.post('/photo',  MedicalHistoryController.upload);
    MedicalHistoryRoutes.delete('/photo/:ID',  MedicalHistoryController.deletePhoto);


    // note Routes
    apiRoutes.use('/note', noteRoutes);
    noteRoutes.get('/:noteId',  NoteController.getById);
    noteRoutes.post('/patient',  NoteController.getByPatient);
    noteRoutes.post('/visit',  NoteController.getByVisit);
    noteRoutes.post('/Update',  NoteController.Update);
    noteRoutes.get('/',  NoteController.get);
    noteRoutes.post('/',  NoteController.create);
    noteRoutes.delete('/:noteId',  NoteController.delete);
    noteRoutes.post('/photo',  NoteController.upload);
    noteRoutes.delete('/photo/:noteId',  NoteController.deletePhoto);

    // note Routes
    apiRoutes.use('/screening', screeningRoutes);
    screeningRoutes.get('/:screeningId',  ScreeningController.getById);
    screeningRoutes.post('/patient',  ScreeningController.getByPatient);
    screeningRoutes.post('/visit',  ScreeningController.getByVisit);
    screeningRoutes.post('/Update',  ScreeningController.Update);
    screeningRoutes.get('/',  ScreeningController.get);
    screeningRoutes.post('/',  ScreeningController.create);
    screeningRoutes.delete('/:screeningId',  ScreeningController.delete);
    screeningRoutes.post('/photo',  ScreeningController.upload);
    screeningRoutes.delete('/photo/:screeningId', ScreeningController.deletePhoto);

    // Med Routes
    apiRoutes.use('/meds', MedRoutes);
    MedRoutes.get('/:medId',  MedController.getById);
    MedRoutes.post('/patient',  MedController.getByPatient);
    MedRoutes.post('/Update',  MedController.Update);
    MedRoutes.get('/',  MedController.get);
    MedRoutes.post('/filter',  MedController.getByFilter);
    MedRoutes.post('/',  MedController.create);
    MedRoutes.delete('/:medId',  MedController.delete);
    MedRoutes.post('/getPatientmedications',  MedController.getPatientmedications);
    
       // order Routes
       apiRoutes.use('/orders', orderRoutes);
       orderRoutes.get('/:orderId',  OrderController.getById);
       orderRoutes.post('/patient',  OrderController.getByPatient);
       orderRoutes.post('/visit',  OrderController.getByVisit);
       orderRoutes.post('/type',  OrderController.getByType);
       orderRoutes.post('/Update',  OrderController.Update);
       orderRoutes.get('/',  OrderController.get);
       orderRoutes.post('/',  OrderController.create);
       orderRoutes.delete('/:orderId',  OrderController.delete);
       orderRoutes.post('/filter',  OrderController.getByFilter);
       orderRoutes.post('/getconsultsByService',  OrderController.getconsultsByService);

    // Category Routes
    apiRoutes.use('/categories', CategoryRoutes);
    CategoryRoutes.get('/:categoryId', CategoryController.getById);
    CategoryRoutes.post('/patient', CategoryController.getByPatient);
    CategoryRoutes.post('/Update', CategoryController.Update);
    CategoryRoutes.get('/', CategoryController.get);
    CategoryRoutes.post('/', CategoryController.create);
    CategoryRoutes.get('/field/:field', CategoryController.getByField);
    CategoryRoutes.post('/filter', CategoryController.getByFilter);
    CategoryRoutes.get('/profileType/:profileType', CategoryController.getByProfileType);
    CategoryRoutes.get('/activityType/:activityType', CategoryController.getByActivityType);
    CategoryRoutes.get('/formType/:formType', CategoryController.getByFormType);
    CategoryRoutes.post('/fields', CategoryController.getByFields);
    CategoryRoutes.post('/orderMaster', CategoryController.getOrderMasters);
    CategoryRoutes.post('/getForm', CategoryController.getForm);
    CategoryRoutes.post('/getProblemForm', CategoryController.getProblemForm);
    CategoryRoutes.post('/getSummary', CategoryController.getSummary);
    CategoryRoutes.post('/getReport', CategoryController.getReport);
    CategoryRoutes.delete('/:categoryId',  CategoryController.delete);
    CategoryRoutes.post('/getlabItems', CategoryController.getlabItems);
    CategoryRoutes.post('/getUserForm', CategoryController.getUserForm);
    CategoryRoutes.post('/getFormById', CategoryController.getFormById);
    CategoryRoutes.post('/bulk', CategoryController.CreateMany);
  
    // Request Routes
    apiRoutes.use('/Requests', RequestRoutes);
    RequestRoutes.post('/',  RequestController.getRequestById);
    RequestRoutes.get('/', RequestController.getRequests);
    RequestRoutes.get('/:title', RequestController.getRequestsByPatient);

    RequestRoutes.post('/',  RequestController.createRequest);
    RequestRoutes.delete('/:requestID',  RequestController.deleteRequest);

    //images Routes
    apiRoutes.use('/images', imageRoutes);
   // imageRoutes.post('/',  ImageController.uploadImage);
    imageRoutes.post('/patient',  ImageController.getByPatient);
    imageRoutes.post('/getImage',  ImageController.getImage);
    imageRoutes.delete('/:imageId',  ImageController.delete);
    imageRoutes.post('/filter', ImageController.getByFilter);
    imageRoutes.post('/',   ImageController.create);
    imageRoutes.post('/update',   ImageController.update);
    //labs Routes
    apiRoutes.use('/labs', labRoutes);
   // labRoutes.post('/upload',  LabController.uploadLab);
    labRoutes.post('/patient',  LabController.getByPatient);
    labRoutes.post('/getLab',  LabController.getLab);
    labRoutes.delete('/:labId',  LabController.delete);
    labRoutes.post('/Update',  LabController.Update);
    labRoutes.post('/',  LabController.create);
    labRoutes.post('/visit',  LabController.getByVisit);
    labRoutes.post('/filter',  LabController.getByFilter);
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