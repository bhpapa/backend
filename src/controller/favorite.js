
const Article = require('../models/article')
const Tag = require('../models/tag')
const HttpException = require('../exception/http.exception')

function handleArticle(article,author,count){
    const newTags = []
    for (const t of article.dataValues.tags) {
        newTags.push(t.name)
    }
    article.dataValues.tags = newTags
    delete author.dataValues.password
    delete author.dataValues.email
    article.dataValues.author = author
    article.dataValues.favoriteCount = count
    article.dataValues.favorited  = true
    return article.dataValues
}

// 添加喜欢
module.exports.addFavorite = async (req, res,next) => {
    try {
        // ● 获取参数（文章）
        const {slug} = req.params
        // ● 获取文章 ： 包含tag
        let article = await Article.findByPk(slug,{include:Tag})
        if(!article){
            throw new HttpException(404,'喜欢文章不存在','article not found')
        }
        // ● 添加喜欢 ： 文章 添加被喜欢的用户  
        console.log(article.__proto__); //addUsers
 
        await article.addUsers(req.user.email) // 文章添加喜欢用户 ： 文章可以被多个人喜欢 
        // ● 获取文章作者
        const author = await article.getUser() 
        // ● 获取喜欢个数
        const count = await article.countUsers()
        // ● 数据处理：标签 / 作者 / 喜欢个数
        article = handleArticle(article,author,count)
        // ● 响应数据
        res.status(200).json({
            status:1,
            messagae:'喜欢文章成功',
            data:article
        })
    } catch (error) {
       next(error)
    }
}

module.exports.removeFavorite = async (req, res,next) => {
    try {
        // ● 获取参数（文章）
        const {slug} = req.params
        // ● 获取文章 ： 包含tag
        let article = await Article.findByPk(slug,{include:Tag})
        if(!article){
            throw new HttpException(404,'喜欢文章不存在','article not found')
        }
        // ● 取消喜欢
        // console.log(article.__proto__); //addUsers
 
        await article.removeUsers(req.user.email) 

        // ● 获取文章作者
        const author = await article.getUser() 
        // ● 获取喜欢个数
        const count = await article.countUsers()
        // ● 数据处理：标签 / 作者 / 喜欢个数
        article = handleArticle(article,author,count)
        // ● 响应数据
        res.status(200).json({
            status:1,
            messagae:'取消喜欢文章成功',
            data:article
        })
    } catch (error) {
       next(error)
    }
  }