const express = require('express')
const router = express.Router()
const { getTags, addTag } = require('../controller/tag')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.get('/', getTags)
router.post('/', authMiddleware, addTag)

module.exports = router
