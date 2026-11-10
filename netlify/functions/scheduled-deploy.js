// TODO REMOVE?
const fetch = require('node-fetch')

const BUILD_HOOK = 'https://api.netlify.com/build_hooks/6af3877479c099e5a75c07ef'

const handler = schedule('1 0 * * *', async () => {
    await fetch(BUILD_HOOK, {
        method: 'POST'
    }).then(response => {
        console.log('Build hook response:', response)
    })

    return {
        statusCode: 200
    }
})

export {handler}
