const slug = require('unique-slug')

module.exports.getSlug = () => {
    let randomSlug = slug()
    return randomSlug
}

