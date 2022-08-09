const express = require('express')
const router = express.Router()
const { follow, cancelFollow, getFollowers } = require('../controller/follow')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.post('/:username', authMiddleware, follow)
router.delete('/:username', authMiddleware, cancelFollow)
router.get('/:username', authMiddleware, getFollowers)

module.exports = router
