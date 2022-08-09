const userRoute = require('../routes/users')
const followRoute = require('../routes/follow')
const tagRoute = require('../routes/tag')
const articleRoute = require('../routes/article')
const favorRoute = require('../routes/favorite')
const commentRoute = require('../routes/comment')

const initRoute = (app) => {
    app.use('/api/v1/users', userRoute)
    app.use('/api/v1/follow', followRoute)
    app.use('/api/v1/tag', tagRoute)
    app.use('/api/v1/articles', articleRoute)
    app.use('/api/v1/favorite', favorRoute)
    app.use('/api/v1/comment', commentRoute)
}

module.exports = initRoute