const dbConnection = require("../db/connection")
const Sequelize = require('../db/sequelize')
const User = require('../models/user')
const Article = require('../models/article')
const Comment = require('../models/comment')
const Tag = require('../models/tag')

// 模型关系
// A.hasOne(B); A 有一个 B
// A.belongsTo(B); A 属于 B
// A.hasMany(B); A 有多个 B
// A.belongsToMany(B, { through: 'C' }); A 属于多个 B , 通过联结表 C
const initRelation = () => {
    // 用户-文章 1:n
    User.hasMany(Article, {
        onDelete: 'CASCADE'
    }) 
    Article.belongsTo(User)

    // 用户-评论 1:n
    User.hasMany(Comment, {
        onDelete: 'CASCADE'
    }) 
    Comment.belongsTo(User)

    // 文章-评论 1:n
    Article.hasMany(Comment, {
        onDelete: 'CASCADE'
    }) 
    Comment.belongsTo(Article)

    // 用户-文章（喜欢） n:m
    User.belongsToMany(Article, {
        through: 'Favorites',
        timestamps: false
    })
    Article.belongsToMany(User, {
        through: 'Favorites',
        timestamps: false
    })

    // 用户-用户（喜欢） n:m
    User.belongsToMany(User, {
        through: 'Followers',
        as: 'Follower',
        timestamps: false
    })

    // 文章-标签 n:m
    Article.belongsToMany(Tag, {
        through: 'TagList',
        uniqueKey: false,
        timestamps: false
    })
    Tag.belongsToMany(Article, {
        through: 'TagList',
        uniqueKey: false,
        timestamps: false
    })
}

const initDB = () => {
    return new Promise(async(resolve, reject) => {
        try {
            // 建立连接
            await dbConnection()
            // 初始化模型
            initRelation()
            // 同步模型到数据库
            await Sequelize.sync({
                alter: true // 自动更新参数
            }) 
            resolve()
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

module.exports = initDB