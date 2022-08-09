const { decode } = require("jsonwebtoken");
const HttpException = require("../../exception/http.exception");

module.exports.authMiddleware = async (req,res,next)=>{
    // console.log('authMiddleware');

    // console.log(req.headers.authorization);
    // console.log(req.header('authorization'));

    //01 authorization header
    const authHeader = req.headers.authorization
    if(!authHeader){
        return next(new HttpException(401,'authorization 必须提供','authorization missing'))
    }
    //02 验证token 类型
    const authHeaderArr = authHeader.split(' ')
    console.log(authHeaderArr);
    if(authHeaderArr[0]!=='Token'){
        return next(new HttpException(401,'authorization 格式错误,格式 Token content','Token missing'))
    }

    //03 验证token内容
    if(!authHeaderArr[1]){
        return next(new HttpException(401,'authorization 格式错误,格式 Token content','Token content missing'))
    }

    //03 解签验证
    try {
        const user = await decode(authHeaderArr[1]) 
        if(!user){
            return next(new HttpException(401,"token 内容不存在 ",'token decode error'))
        }
        req.user = user // req 追加解签后的user信息
        req.token = authHeaderArr[1] // req 追加token
        return next()
    } catch (error) {
        // jwt 验证失败 ： token 失效 过期等
        return next(new HttpException(401,"Authorization token验证失败",e.message))
    }

}