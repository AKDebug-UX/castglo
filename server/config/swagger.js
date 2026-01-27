const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Castglo API',
      version: '1.0.0',
      description: 'Castglo - Investor-ready casting marketplace backend API documentation',
      contact: {
        name: 'Castglo Team',
        email: 'support@castglo.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.castglo.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            fullName: {
              type: 'string',
              example: 'John Talent',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['talent', 'casting_director', 'industry_professional', 'admin'],
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890',
            },
            profilePicture: {
              type: 'string',
              example: 'https://res.cloudinary.com/...',
            },
            emailVerified: {
              type: 'boolean',
              example: true,
            },
            isSuspended: {
              type: 'boolean',
              example: false,
            },
            subscriptionStatus: {
              type: 'string',
              enum: ['free', 'active', 'cancelled', 'expired'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CastingCall: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            title: {
              type: 'string',
              example: 'Lead Actor for Indie Film',
            },
            description: {
              type: 'string',
            },
            projectName: {
              type: 'string',
            },
            projectType: {
              type: 'string',
              enum: ['film', 'tv', 'commercial', 'web_series', 'theater', 'music_video', 'other'],
            },
            status: {
              type: 'string',
              enum: ['open', 'filled', 'closed', 'cancelled'],
            },
            deadline: {
              type: 'string',
              format: 'date-time',
            },
            createdBy: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Application: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            castingCallId: {
              type: 'string',
            },
            talentId: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['submitted', 'viewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
            },
            appliedRole: {
              type: 'string',
            },
            isShortlisted: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
