const initServer = async(app) => {
    return new Promise(async(resolve, reject) => {
        const PORT = process.env.PORT || 8080
        const HOST = process.env.HOST || '127.0.0.1'
        app.listen(PORT, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`)
            resolve()
        }).on('error', (error) => {
            console.log(error)
            reject()
        })
    })
}

module.exports = initServer