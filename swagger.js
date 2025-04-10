const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NWV Company API',
      version: '1.0.0',
      description: 'NWV Company loyihasi uchun API hujjatlari',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Development server' },
    ],
    components: {
      schemas: {
        Advantage: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
          },
        },
        StudentReview: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            course: { type: 'string' },
            text: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Barcha routelarni skaner qilish
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;