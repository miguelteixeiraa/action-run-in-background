'use strict'

const fastify = require('fastify')({
    logger: true,
})

fastify.get('/hello', () => {
    return 'UP'
})

fastify.listen({
    host: '0.0.0.0',
    port: 8000,
})
