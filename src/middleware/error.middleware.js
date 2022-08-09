const errorMiddleware = (error,req,res,next)=>{
  console.log(error);
  const status = error.status || 500;
  const message = error.message || '服务器端错误'
  const errors= error.errors || '服务器端错误'

  res.status(status).json({ code: 0, message: message, errors: errors})
}

module.exports = errorMiddleware