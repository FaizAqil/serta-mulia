require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    // Error handling using onPreResponse
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            // Validate statusCode for InputError
            const statusCode = Number.isInteger(response.statusCode) ? response.statusCode : 400; // Default to 400
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message} Silakan gunakan foto lain.`,
            });
            newResponse.code(statusCode);
            return newResponse;
        }

        if (response.isBoom) {
            // Validate statusCode for Boom errors
            const statusCode = Number.isInteger(response.output.statusCode)
                ? response.output.statusCode
                : 500; // Default to 500
            const newResponse = h.response({
                status: 'fail',
                message: response.output.payload.message, // Use Boom's payload message
            });
            newResponse.code(statusCode);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server started at: ${server.info.uri}`);
})();
