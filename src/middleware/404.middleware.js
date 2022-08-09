const HttpException  = require('../exception/http.exception')

const noMatchMiddleware = (req,res,next)=>{ 
  const noMatchError = new HttpException(404,'访问路径不匹配','router url not found') 
  next(noMatchError) 
}

module.exports = noMatchMiddleware