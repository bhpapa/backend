const {validateCreateUser} = require('../utils/validate/article.validate')
const HttpException = require('../exception/http.exception')
const Article = require('../models/article')
const User = require('../models/user')
const Tag = require('../models/tag')
const { getSlug } = require('../utils/slug')
const sequelize = require('../db/sequelize')

function handleArticle(article, author) {
    //     ○ 标签返回优化
    const newTags = []
    for (const t of article.dataValues.tags) {
        newTags.push(t.name)
    }
    // console.log(newTags);
    article.dataValues.tags = newTags
    //     ○ 作者信息优化
    // console.log(author);
    delete author.dataValues.password
    delete author.dataValues.email
    article.dataValues.author = author
    return article.dataValues
}

const handleArticles = async (currentEmail, article) => {
    //     ○ 标签返回优化
    const newTags = []
    for (const t of article.dataValues.tags) {
        newTags.push(t.name)
    }
    // console.log(article.dataValues.user);
    article.dataValues.tags = newTags
    //     ○ 作者信息优化
    // console.log(author);
    let {username, email, brief, avatar} = article.dataValues.user
    let author = {
        username, email, brief, avatar
    }
    delete article.dataValues.user
    article.dataValues.author = author
    // console.log("article.dataValues:", article.dataValues)
    const count = await article.countUsers()
    // console.log("count:", count)
    if (count == 0) {
        article.dataValues.isFavorite = false
        article.dataValues.favoriteCount = 0
        return article.dataValues
    }
    const allFavoriteUsers = await article.getUsers()
    // console.log("allFavoriteUsers:", allFavoriteUsers)
    let allFavoriteUserEmails = []
    allFavoriteUsers.forEach(user => {
        allFavoriteUserEmails.push(user.email)
    })
    // console.log("allFavoriteUserEmails:", allFavoriteUserEmails)
    let isFavorite = allFavoriteUserEmails.includes(currentEmail)
    article.dataValues.isFavorite = isFavorite
    article.dataValues.favoriteCount = count
    // console.log("article.dataValues:", article.dataValues)
    return article.dataValues
}
//创建文章
module.exports.createArticle = async (req,res,next)=>{
    console.log('createArticle');
    try {
        // ● 获取请求内容： title description body  tags
        const { title, description, body, tags } = req.body.article
       
        console.log(title,description,body);
        // ● 请求内容验证： 字段验证
        let { error, validate } = validateCreateUser(title, description, body)
        if(!validate){
           throw new HttpException(401,'文章创建参数验证失败',error) 
        }
        // ● 获取作者信息：token 解签=>email=>author 信息 （只有登录用户的作者才能创建自己的文章）
        const { email } = req.user
        const author = await User.findByPk(email)
        console.log('email:', email)
        console.log("author:", author)
        if(!author){
            throw new HttpException(401,'作者账号不存在','author user not found') 
        }
        // ● 创建文章
        //     ○ 生成别名
        let slug = getSlug()
        console.log('slug:', slug)
        //     ○ 存储数据：文章和作者email
        let article = await Article.create({ // 注意 ： 创建返回值 是 不包含标签关系
            slug,
            title,
            description,
            body,
            userEmail: author.email
        })
        // ● 存储文章和标签的关系
        //     ○ 自定义标签 ： 当前作者自己添加的标签=>文章和标签关系存储
        //     ○ 系统自带标签 ： 数据库已经存在的标签 =>文章和标签关系存储
        if(tags){
            for (const t of tags) {
                let existTag= await Tag.findByPk(t) // 已存在的标签

                let newTag // 新标签
                if(!existTag){
                    //创建标签
                    newTag = await Tag.create({name:t})
                    //文章和标签关系 ：taglist 
                    // console.log(article.__propo__); addTag(tag)
                    await article.addTag(newTag)
                }else{
                    //文章和标签关系 ：taglist
                    await article.addTag(existTag)
                }

            }
        }
        // ● 返回文章数据： （文章 / 标签 / 作者） 
        //     ○ 根据slug获取数据（包含文章对应的标签）
        article = await Article.findByPk(slug,{include:Tag})
        console.log(article.dataValues)
        article = handleArticle(article, author)
        //     ○ 文章数据优化返回
        res.status(200)
            .json({
                status:1,
                message:'文章创建成功',
                data:article
            })
    } catch (e) {
        next(e)
    }
}

//获取文章 : 单个文章
module.exports.getArticle = async (req,res,next)=>{
    try {
        const {slug} = req.params
        let article = await Article.findByPk(slug,{include:Tag})
        // console.log('article:', article.__proto__)
        const author = await article.getUser()
        console.log('article:', author)
        article = handleArticle(article, author)
        //     ○ 文章数据优化返回
        res.status(200)
            .json({
                status:1,
                message:'文章查询成功',
                data:article
            })
    } catch (e) {
        next(e)
    }
}

//获取文章：条件（tag,author,limit,offset）获取全局文章
module.exports.getArticles = async (req,res,next)=>{
    try {
        const {email} = req.user
        const {tag, author, limit=20, offset=0} = req.query
        let result
        if (tag && !author) {
            result = await Article.findAndCountAll({
                distinct:true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                    where: {name:tag}
                }, {
                    model: User,
                    attributes: ['email', 'username', 'brief', 'avatar']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else if (!tag && author) {
            result = await Article.findAndCountAll({
                distinct:true,
                include: [{
                    model: Tag,
                    attributes: ['name']
                }, {
                    model: User,
                    attributes: ['email', 'username', 'brief', 'avatar'],
                    where:{username: author}
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else if (tag && author) {
            result = await Article.findAndCountAll({
                distinct:true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                    where: {name:tag}
                }, {
                    model: User,
                    attributes: ['email', 'username', 'brief', 'avatar'],
                    where:{username: author}
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else {
            result = await Article.findAndCountAll({
                distinct:true,
                include: [{
                    model: Tag,
                    attributes: ['name']
                }, {
                    model: User,
                    attributes: ['email', 'username', 'brief', 'avatar']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        }
        let articles = []
        for (const article of result.rows) {
            let articleValue = await handleArticles(email, article)
            articles.push(articleValue)
        }
        //     ○ 文章数据优化返回
        res.status(200)
            .json({
                status:1,
                message:'文章查询成功',
                data:{articles, articlesCount:result.count}
            })
    } catch (e) {
        next(e)
    }
}

//获取文章：关注作者的文章
module.exports.getFollowArticle = async (req,res,next)=>{
    try {
        const {email} = req.user
        const sql = `select userEmail from Followers where FollowerEmail='${email}'`
        const authorEmails = await sequelize.query(sql)
        // console.log("authorEmails:", authorEmails)
        if (authorEmails[0].length==0) {
            return res.status(200)
                    .json({
                        status:1,
                        message:'未关注任何文章',
                        data:[]
                    })
        }
        let followEmails = []
        for (const item of authorEmails[0]) {
            followEmails.push(item.userEmail)
        }
        let {count, rows} = await Article.findAndCountAll({
            distinct:true,
            where: {
                userEmail: followEmails
            },
            include: [Tag, User]
        })
        // console.log("count:", count)
        // console.log("rows:", rows)
        let articles = []
        for (const article of rows) {
            // console.log("article:", article)
            let articleValue = await handleArticles(email, article)
            console.log('articleValue:', articleValue)
            articles.push(articleValue)
        }
        res.status(200)
            .json({
                status:1,
                message:'关注的文章查询成功',
                data:{articles, articlesCount:count}
            })
    } catch (e) {
        next(e)
    }
}

//更新文章
module.exports.updateArticle = async (req,res,next)=>{
    try {
        const {slug} = req.params
        const data = req.body.article 
        let article = await Article.findByPk(slug,{include:Tag})
        const loginUser = await User.findByPk(req.user.email)
        if(!loginUser){
            throw new HttpException(401,'登录账号不存在','user not found') 
        } 
        const authorEmail = article.userEmail
        if(loginUser.email != authorEmail){
            throw new HttpException(403,'无修改权限','author not patched') 
        }
        const title = data.title ? data.title : article.title
        const description = data.description ? data.description : article.description
        const body = data.body ? data.body : article.body

        const updateResult = await article.update({title, description, body})
        res.status(200)
            .json({
                status:1,
                message:'文章更新成功',
                data:updateResult
            })
    } catch (e) {
        next(e)
    }
}

//删除文章
module.exports.deleteArticle = async (req,res,next)=>{
    try {
        const {slug} = req.params
        let article = await Article.findByPk(slug,{include:Tag})
        if(!article){
            throw new HttpException(401,'删除文章不存在','article not found') 
        } 
        const {email} = req.user
        const authorEmail = article.userEmail
        if(email != authorEmail){
            throw new HttpException(403,'无删除权限','author not patched') 
        }
        await Article.destroy({where:{slug}})
        res.status(200)
            .json({
                status:1,
                message:'文章删除成功',
            })
    } catch (e) {
        next(e)
    }
}