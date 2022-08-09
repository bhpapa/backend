const validator = require('validator')

//验证：创建文章
module.exports.validateCreateUser = ( title, description, body)=>{
    let error = {}
    
    if(validator.isEmpty(title)){
        error.username = '文章标题不能为空'
    }
    if(validator.isEmpty(description)){
        error.password = '文章描述不能为空'
    }
    if(validator.isEmpty(body)){
        error.email = '文章内容不能为空'
    }

    let validate = Object.keys(error).length <1  // true 验证通过，false : 验证失败

    return {error,validate}

}