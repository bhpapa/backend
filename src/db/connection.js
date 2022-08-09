const sequelize = require('./sequelize')

const dbConnection = async() => {
    return new Promise(async(resolve, reject) => {
        try {
            await sequelize.authenticate()
            console.log('Connection has been established successfully.')
            console.log(process.env.DB_NAME)
            resolve()
        } catch (error) {
            console.error('Unable to connect to the database:', error)
            reject()
        }
    })
}

module.exports = dbConnection