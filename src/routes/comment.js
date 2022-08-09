const express = require('express')
const router = express.Router()
const { createComment, getComments, deleteComment } = require('../controller/comment')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.post('/:slug/comment',authMiddleware, createComment)
router.get('/:slug/comment',authMiddleware, getComments)
router.delete('/:slug/comment/:id',authMiddleware, deleteComment)

module.exports = router
