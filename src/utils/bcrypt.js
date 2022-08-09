const bcrypt = require('bcrypt')

const SALT = 10

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, SALT, (err, encrypted) => {
            if(err) {
                reject(err)
            }
            resolve(encrypted)
        })
    })
}

const matchPassword = (oldHashPwd, password) => {
    return new Promise( async (resolve, reject) => {
        const match = await bcrypt.compare(password, oldHashPwd)
        console.log(match)
    })
}

module.exports = {hashPassword, matchPassword}

// async function test() {
//     const password = 'abc'
//     const hashPwd = await hashPassword(password)
//     console.log(hashPwd)
//     const match = await matchPassword(hashPwd, 'abc')
//     console.log(match)
// }

// test()