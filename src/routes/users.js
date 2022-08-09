const express = require('express')
const router = express.Router()
const { createUser, getUser, login, updateUserInfo } = require('../controller/users')
const { authMiddleware } = require('../middleware/admin/auth.middleware')

router.get('/', authMiddleware, getUser)

router.patch('/', authMiddleware, updateUserInfo) //局部更新

router.post('/', createUser)

router.post('/login', login)

module.exports = router
