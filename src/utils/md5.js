const md5 = require('md5')
const SALT = 'salt'

const md5Password = (password) => {
    return new Promise((resolve, reject) => {
        const md5PWD = md5(password+SALT)
        resolve(md5PWD)
    })
}

const matchPassword = (oldMd5Pwd, password) => {
    return new Promise((reslove, reject) => {
        const newMd5Pwd = md5(password+SALT)
        oldMd5Pwd === newMd5Pwd ? reslove(true) : reject(false)
    })
}

module.exports = { md5Password, matchPassword }