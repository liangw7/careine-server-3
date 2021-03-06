module.exports = {
  mongo_url: "mongodb://liangw7:alex2005@127.0.0.1:27017/careline?maxPoolSize=2&socketTimeoutMS=600000",
  /*axiconn: {
    host: 'bj-cdb-qcpjo1zh.sql.tencentcdb.com',
    user: 'AIoT2',
    port: '63182',
    password: 'aiot7534',
    database: 'AxiDB_v2'
  },*/
  axiconn : {
    host: 'db.axilink.pro',
    user: 'AIoT2',
    port: '10109',
    password: 'aiot7534',
    database: 'AxiDB_v2'
},
  wechat:{
    wechatRedirectUrl: 'https://www.digitalbaseas.com/wechat/oauth-callback',    //set your oauth redirect url, defaults to localhost
    appId: 'wx1456c566ec3e6686',
    appSecret: '8ada6bb8a95c8d79abf7a374688aa9cd',
    card: true, //enable cards
  //  "wechatToken": "wechat_token", //not necessary required
  //  payment: true, //enable payment support
  //  merchantId: '', //
  //  paymentSandBox: true, //dev env
  //  paymentKey: '', //API key to gen payment sign
  //  paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
  //  default payment notify url
  //  paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
  },
  wxpay: {
    appid: 'wx1456c566ec3e6686',
    mchid: '1601139967',
    partnerKey: 'GNHsDl0y4Y4RNlUAWGXOKcjzc1SraA9X',
   // pfx: require('fs').readFileSync('/home/careline-server/1601139967_20200801_cert/apiclient_cert.p12'), // 证书文件路径
    pfx: require('fs').readFileSync('/home/careline-server/apiclient_cert.p12'), // 证书文件路径
    notify_url: encodeURI('https://www.digitalbaseas.com/api/wx/notify'), // 支付回调网址
    refund_url: encodeURI('https://www.digitalbaseas.com/api/wx/notifyRefund'),  // 退款结果通知回调地址(选填)  
    spbill_create_ip: '127.0.0.1' //  IP地址
  },
  
  wxapi: {
   // sns: 'https://api.weixin.qq.com/sns',
   // cgi: 'https://api.weixin.qq.com/cgi-bin',
    token: 'https://api.weixin.qq.com/cgi-bin/token',
    send: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
    access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    userinfo: 'https://api.weixin.qq.com/sns/userinfo',
    getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
  },
  peer: {
    debug: false,
    path: '/ws/'
  },
  s3: {
    AWS_ACCESS_KEY: 'AKIAISS7W65ZH3BWLPBA', 
    AWS_SECRET_ACCESS_KEY: 'SHwMrJumjZS7Hd4pcH6sPKtQgMudBqXC1fXV0NVq', 
    REGION : 'us-east-2', // change to yours
    Bucket: 'careline-prod' // change to yours
  },
  upload_path: '../uploads',
  homepage: 'https://www.digitalbaseas.com/homepage/login-poster/',
  api_port: 8080,
  debug: false
}