require('dotenv').config({path: '.env'})
const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const app = express()
const initDB = require("./src/init/initDB")
const initServer = require("./src/init/initServer")
const initRoute = require('../backend/src/init/initRoute')
const noMatchMiddleware = require('./src/middleware/404.middleware')
const errorMiddleware = require('./src/middleware/error.middleware')
// 跨域中间件
app.use(cors({credentials: true, origin: true}))
// 内置json中间件
app.use(express.json())
// app.use(bodyParser.json()) 
// app.use(bodyParser.urlencoded({ extended: true }))

// http请求日志中间件
app.use(morgan('tiny'))

//静态服务
app.use('/static', express.static('public'))
// app.use(express.static('public'))

// 初始化路由
initRoute(app)
// 主程序
const main = async() => {
    // 初始化数据库
    await initDB()
    // 初始化服务
    await initServer(app)
}

main()
// 404
app.use(noMatchMiddleware)
app.use(errorMiddleware)