const express = require('express')
const router = express.Router()
const { createArticle, getArticle, getFollowArticle, getArticles, updateArticle, deleteArticle } = require('../controller/article')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.post('/',authMiddleware,createArticle)
router.get('/follow',authMiddleware, getFollowArticle)
router.get('/:slug',authMiddleware, getArticle)
router.get('/',authMiddleware, getArticles)
router.put('/:slug',authMiddleware, updateArticle)
router.delete('/:slug',authMiddleware, deleteArticle)

module.exports = router
