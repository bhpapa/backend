const {validateCreateUser, validateUserLogin} = require('../utils/validate/user.validate')
const HttpException = require('../exception/http.exception')
const User = require('../models/user')
const {md5Password, matchPassword} = require('../utils/md5')
const {sign} = require('../utils/jwt')

// 用户注册
module.exports.createUser = async (req, res, next)=>{
    try {
        //获取提交内容
        console.log('req.body:', req.body)
        let { username,password,email } =  req.body.user
    
        //数据验证
        let { error,validate } = validateCreateUser(username,password,email)
        if (!validate) {
            throw new HttpException(422,'用户提交数据验证失败',error)
        }
    
        //业务验证
        // 1）验证email是否存在
        const existUser = await User.findByPk(email)
        if (existUser) {
            throw new HttpException(422,'用户注册邮箱已存在','email is exist')
        }
    
        // 创建用户
        // 1）密码加密
        const md5PWD = await md5Password(password)
        // 2）User model 存储数据库
        const user = await User.create({
            username,
            password:md5PWD,
            email
        })
        // 3）创建成功 ： 返回
        if (user) {
            console.log(user);
            // 3.1） 创建token
            let data ={}
            data.username = username
            data.email = email
            data.token = await sign(username,email)
            data.bio = null
            data.avatar = null
        
            // 3.2)  返回数据
        
            res.status(201) // Created 创建资源成功
                .json({
                    status:1,
                    data,
                    message:'创建用户成功'
                })
        }
    } catch (error) {
      //整体异常捕获
       next(error)
    }    
}

//用户登录
module.exports.login = async (req, res, next) => {
    try {
        // ● 获取请求数据  email password
        console.log('req.body:', req.body)
        let { email, password } = req.body.user;
        // ● 验证请求数据  ： email password 字段是否正确
        let { error, validate } = validateUserLogin(email, password);
        // ● 验证业务逻辑  :
        //   ○ 用户是否存在
        const user = await User.findByPk(email);
    
        if (!user) {
            throw new HttpException(401, "用户不存在", "user not found");
        }
        //   ○ 密码是否匹配
        const oldMd5Pwd = user.dataValues.password;
        const match = matchPassword(oldMd5Pwd, password);
        if (!match) {
            throw new HttpException(401, "用户输入密码错误", "password not match");
        }
        // ● 返回数据
        //   ○ 生成token
        delete user.dataValues.password;
        user.dataValues.token = await sign(
            user.dataValues.username,
            user.dataValues.email
        );
    
        //   ○ 返回数据
        return res.status(200).json({
            status: 1,
            data: user.dataValues,
            message: "用户登录成功",
        });
    } catch (e) {
      next(e);
    }
}

//获取用户信息
module.exports.getUser = async (req, res, next) => {
    try {
        // ● 获取请求数据   :req.user 
        const {email} = req.user
    
        // ● 验证请求数据  ： 
        // ○ 接口数据验证  不需要
        // ○ email 验证用户是否存在
        const user = await User.findByPk(email)
        console.log('user:', user)
        if (!user) {
            throw new HttpException(401, "用户不存在", "user not found");
        }
    
        // ● 返回数据
        //   ○ 去除password字段
        delete user.dataValues.password
        //   ○ 添加token
        user.dataValues.token = await sign(user.dataValues.username,user.dataValues.email)
        //   ○ 返回用户数据
        return res.status(200)
            .json({
                status:1,
                message:'请求用户信息成功',
                data:user.dataValues
            })
    } catch (error) {
      next(error)
    }    
}

//用户信息更新
module.exports.updateUserInfo = async (req, res, next) => {
    try { 
        // ● 验证接口权限  
        // ● 获取请求数据   : req.email  
        // console.log('req.user', req.user)
        // console.log('req.body.user', req.body.user)
        const {email} = req.user
        // console.log('email:', email)
        // ● 验证请求数据  ： email 验证用户是否存在   
        const user = await User.findByPk(email)
        // console.log('user:', user)
        if (!user) {
            throw new HttpException(401, "用户不存在", "user not found");
        }
        // ● 修改用户数据   
        // ○ 获取请求数据:   body 数据 =>更新的信息   
        const bodyUser = req.body.user
        if (bodyUser) {
            // ○ 数据字段判断：字段不确定
            const username = bodyUser.username ? bodyUser.username : user.username
            const bio = bodyUser.bio ? bodyUser.bio : user.bio 
            const avatar = bodyUser.avatar ? bodyUser.avatar : user.avatar 
            const brief = bodyUser.brief ? bodyUser.brief : user.brief 
            // ○ password更新 ： 加密  
            let password = user.password
            if (bodyUser.password) {
                password = await md5Password(bodyUser.password)
            } 
            const values = {username: username, bio: bio, avatar: avatar, brief: brief, password: password}
            const condition = { where :{email: email} }
            // console.log('values:', values)
            // ○ 更新操作   
            await User.update(values, condition)
            // const updateUser = await User.update(values, condition)
            let updateUser = await User.findByPk(email)
            console.log('updateUser', updateUser)
            // ● 返回数据   
            // ○ 去除password 
            delete updateUser.dataValues.password  
            // console.log('updateUser.dataValues', updateUser.dataValues)
            // ○ 添加token 
            updateUser.dataValues.token = await sign(username, email)  
            // ○ 返回用户数据
            return res.status(200).json({
                status: 1,
                message: '请求用户信息成功',
                data: updateUser.dataValues
            }) 
        } else {
            throw new HttpException(401, "更新数据不能为空", "update body is null");
        }  
    } catch (e) {
        next(e);
    }
}