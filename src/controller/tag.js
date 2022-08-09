
const Tag = require('../models/tag')
const HttpException = require('../exception/http.exception')

// 添加标签
module.exports.addTag = async (req, res,next) => {
    try {
        // 获取标签
        const tag = req.body.tag
        // console.log(tag)
        const tagResult = await Tag.create({name: tag})
        res.status(200)
            .json({
                status: 1,
                message: "添加成功",
                data: tagResult
            })
    } catch (error) {
       next(error)
    }
}

// 获取标签
module.exports.getTags = async (req, res,next) => {
    try {
        // 查询所有标签
        const allTags = await Tag.findAll()
        console.log(allTags)
        // 标签处理
        let tagArr = []
        for (const tag of allTags) {
            tagArr.push(tag.dataValues.name)
        }
        res.status(200)
            .json({
                status: 1,
                message: "查询成功",
                data: tagArr
            })
        // 相应数据
    } catch (error) {
       next(error)
    }
}