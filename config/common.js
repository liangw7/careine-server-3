
// NODE_ENV=prod node server.js
// NODE_ENV=prod forever start server.js
let env = process.env.NODE_ENV || "dev"

exports.config  =  require(`./${env}.env.js`)
