
const User = require('../models/user')
const HttpException = require('../exception/http.exception')

// 添加关注
module.exports.follow = async (req, res,next) => {
    try {
        // ● 获取参数 ： 被关注的用户名
        console.log('req.params:', req.params)
        const username = req.params.username
        // ● 校验 ： 提供被关注用户
        //     ○ 参数校验
        //     ○ 业务验证：被关注用户是否存在
        const userA = await User.findOne({
            where:{
                username
            }
        })
        // console.log('userA:', userA)
        if(!userA){
            throw new HttpException(404, '被关注的用户名称不存在', 'user with this username not found')
        }
        // ● 关注者信息（粉丝）
        //     ○ 获取email : 通过token
        const {email} = req.user
        //     ○ 获取用户信息
        const userB = await User.findByPk(email)
        // console.log('userB:', userB)
        // ● 添加关注
        //     ○ 建立关系：被关注者主键和关注者主键存储到数据库中表followers
        await userA.addFollower(userB)
        // await userA.removeFollowers(userB)
        // ● 返回被关注者信息
        //     ○ 基本信息和被关注状态
        const profile = {
            username:userA.username,
            bio:userA.bio,
            avatar:userA.avatar,
            following:true
        }
        res.status(200)
           .json({
               status:1,
               message:'关注成功',
               data:profile
           })
    } catch (error) {
       next(error)
    }
};

// 取消关注
module.exports.cancelFollow = async (req, res,next) => {
    try {
        // ● 获取参数 ： 被关注的用户名
        const username = req.params.username
        // ● 校验 ： 提供被关注用户
        //     ○ 参数校验
        //     ○ 业务验证：被关注用户是否存在
        const userA = await User.findOne({
            where:{
                username
            }
        })
        if(!userA){
            throw new HttpException(404,'被关注的用户名称不存在','user with this username not found')
        }
        // ● 关注者信息（粉丝）
        //     ○ 获取email : 通过token
        const {email} = req.user
        //     ○ 获取用户信息
        const userB = await User.findByPk(email)
        // ● 添加关注
        //     ○ 建立关系：被关注者主键和关注者主键存储到数据库中表followers
        await userA.removeFollower(userB)
        // ● 返回被关注者信息
        //     ○ 基本信息和被关注状态
        const profile = {
            username:userA.username,
            bio:userA.bio,
            avatar:userA.avatar,
            following:false
        }
        res.status(200)
           .json({
               status:1,
               message:'取消关注成功',
               data:profile
           })
    } catch (error) {
       next(error)
    }
  };

// 获取粉丝 & 判断当前登录的用户是否关注
module.exports.getFollowers = async (req, res,next) => {
    try {
        // ● 获取参数 ： 作者用户名  userAuthor
        const username = req.params.username
        // ● 校验 ： 提供被关注用户
        //     ○ 参数校验
        //     ○ 业务验证：
        //         ■ 获取作者信息 ： 连表查询 获取所有粉丝 [emails]
        //         ■ 作者信息是否存在 
        const userAuthor = await User.findOne({
            where:{
                username
            },
            include:['Follower'] //通过Follower 中间表关联查询 [user1,user2]
        })

        console.log('userAuthor',userAuthor);

        if(!userAuthor){
            throw new HttpException(404,'被关注的用户名称不存在','user with this username not found')
        }
        // ● 验证是否关注
        //     ○ 当前登录粉丝  email : 通过token
        //     ○ 是否关注 ：判断 当前登录的用户email 是否再作者的所有粉丝的emails 里面
        const {email} = req.user
        let following = false
        let followers = []
        for (const user of userAuthor.Follower) {
            console.log(user.dataValues);
            if(email===user.dataValues.email){
                following = true    
            }

            delete user.dataValues.password
            delete user.dataValues.Follower
            followers.push(user.dataValues)
        }
        console.log(followers);
        // ● 返回被关注者信息
        //     ○ 基本信息
        //     ○ 关注状态
        //     ○ 粉丝信息

        const profile ={
            username:userAuthor.username,
            bio:userAuthor.bio,
            avatar:userAuthor.avatar,
            following,
            followers
        }

        res.status(200)
        .json({
            status:1,
            message:'获取关注信息成功',
            data:profile
        })

    } catch (error) {
      next(error)
    }
};