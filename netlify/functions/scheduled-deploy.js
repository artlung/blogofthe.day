// TODO REMOVE?
const fetch = require('node-fetch')

const BUILD_HOOK = 'https://api.netlify.com/build_hooks/664ae8fa0d17a85f6f5c2e18'

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
