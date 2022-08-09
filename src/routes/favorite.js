const express = require('express')
const router = express.Router()
const { addFavorite, removeFavorite } = require('../controller/favorite')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.post('/:slug',authMiddleware, addFavorite)
router.delete('/:slug',authMiddleware, removeFavorite)

module.exports = router
