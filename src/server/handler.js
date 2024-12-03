const predictClassification = require('../services/inferenceService');
const storeData = require('../services/storeData');
const crypto = require('crypto');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    try {
        const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            result: label,
            explanation,
            suggestion,
            confidenceScore,
            createdAt
        };

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: confidenceScore > 99 ? 'Model is predicted successfully.' : 'Model is predicted successfully but under threshold. Please use the correct picture',
            data
        });
        response.code(201);
        return response;

    } catch (error) {
        console.error('Error in postPredictHandler:', error);
        return h.response({
            status: 'fail',
            message: 'An internal server error occurred. Please try again later.'
        }).code(500);
    }
}

module.exports = postPredictHandler;
