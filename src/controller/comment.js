
const User = require('../models/user')
const Article = require('../models/article')
const Comment = require('../models/comment')
const HttpException = require('../exception/http.exception')

module.exports.createComment = async (req, res,next) => {
    try {
        const {slug} = req.params
        const {body} = req.body.comment
        const article = await Article.findByPk(slug)
        if (!article) {
            throw new HttpException(404,'文章不存在','article not found')
        }
        const user = await User.findByPk(req.user.email)
        console.log('user:', user.__proto__)
        if (!user) {
            throw new HttpException(404,'用户不存在','user not found')
        }
        let newComment = await Comment.create({body})
        await user.addComments(newComment)
        await article.addComments(newComment)
        newComment.dataValues.user = {
            username: user.dataValues.username,
            brief: user.dataValues.brief,
            avatar: user.dataValues.avatar
        }
        res.status(200).json({
            status:1,
            messagae:'创建评论成功',
            data:newComment
        })
    } catch (error) {
       next(error)
    }
}

module.exports.getComments = async (req, res,next) => {
    try {
        const {slug} = req.params
        const article = await Article.findByPk(slug)
        if (!article) {
            throw new HttpException(404, '文章不存在', 'article not found')
        }
        const comments = await Comment.findAll({
            where: {
                articleSlug: slug
            },
            include: [{
                model: User,
                attributes: ['username', 'brief', 'avatar']
            }]
        })
        res.status(200).json({
            status:1,
            messagae:'获取评论成功',
            data:comments
        })
    } catch (error) {
       next(error)
    }
}

module.exports.deleteComment = async (req, res,next) => {
    try {
        const {slug, id} = req.params
        console.log(req.params)
        const article = await Article.findByPk(slug)
        if (!article) {
            throw new HttpException(404, '文章不存在', 'article not found')
        }
        const comment = await Comment.findByPk(id)
        if (!comment) {
            throw new HttpException(404, '评论不存在', 'comment not found')
        }
        if (req.user.email !== comment.userEmail) {
            throw new HttpException(404, '非评论者本人，无删除权限', 'privilege not found')
        }
        await Comment.destroy({where:{id}})
        res.status(200).json({
            status:1,
            messagae:'删除评论成功',
        })
    } catch (error) {
       next(error)
    }
}