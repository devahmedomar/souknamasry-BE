import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Souknamasry E-commerce API',
    version: '1.0.0',
    description: 'Complete REST API documentation for Souknamasry e-commerce backend. This API provides endpoints for user authentication, product management, and category navigation.',
    contact: {
      name: 'API Support',
      email: 'support@souknamasry.com'
    },
    license: {
      name: 'Private',
    }
  },
  servers: [
    {
      url: 'https://souknamasry-be.vercel.app',
      description: 'Production server'
    },
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management endpoints'
    },
    {
      name: 'Products - Public',
      description: 'Public product browsing, search, and filtering'
    },
    {
      name: 'Categories - Public',
      description: 'Public category navigation and hierarchy browsing'
    },
    {
      name: 'Categories - Admin',
      description: 'Admin-only category management (requires admin role)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from the login endpoint. Format: Bearer {token}'
      }
    },
    schemas: {
      JSendSuccess: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success'
          },
          data: {
            type: 'object',
            description: 'Response data'
          }
        }
      },
      JSendFail: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'fail'
          },
          data: {
            type: 'object',
            description: 'Validation errors by field',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      },
      JSendError: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string',
            example: 'An error occurred'
          },
          code: {
            type: 'string',
            example: 'ERROR_CODE'
          },
          data: {
            type: 'object',
            nullable: true
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'fail'
          },
          data: {
            type: 'object',
            example: {
              email: ['Email is required', 'Email must be valid'],
              password: ['Password must be at least 8 characters']
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          firstName: {
            type: 'string',
            example: 'Ahmed'
          },
          lastName: {
            type: 'string',
            example: 'Mohamed'
          },
          phone: {
            type: 'string',
            nullable: true,
            example: '+201234567890'
          },
          role: {
            type: 'string',
            enum: ['customer', 'admin'],
            example: 'customer'
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Product: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            example: 'Wireless Mouse'
          },
          description: {
            type: 'string',
            example: 'High-quality wireless mouse with ergonomic design'
          },
          slug: {
            type: 'string',
            example: 'wireless-mouse'
          },
          price: {
            type: 'number',
            example: 299.99
          },
          compareAtPrice: {
            type: 'number',
            nullable: true,
            example: 399.99
          },
          category: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
          },
          inStock: {
            type: 'boolean',
            example: true
          },
          stockQuantity: {
            type: 'number',
            example: 50
          },
          sku: {
            type: 'string',
            nullable: true,
            example: 'MOUSE-001'
          },
          supplierInfo: {
            type: 'object',
            nullable: true,
            properties: {
              name: {
                type: 'string'
              },
              contact: {
                type: 'string'
              },
              notes: {
                type: 'string'
              }
            }
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          isFeatured: {
            type: 'boolean',
            example: false
          },
          views: {
            type: 'number',
            example: 0
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            example: 'Electronics'
          },
          slug: {
            type: 'string',
            example: 'electronics'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Electronic devices and accessories'
          },
          image: {
            type: 'string',
            nullable: true,
            example: 'https://example.com/category.jpg'
          },
          parent: {
            type: 'string',
            nullable: true,
            example: null
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 100
          },
          page: {
            type: 'integer',
            example: 1
          },
          pages: {
            type: 'integer',
            example: 5
          },
          limit: {
            type: 'integer',
            example: 20
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/JSendError'
            },
            example: {
              status: 'error',
              message: 'Authentication required',
              code: 'UNAUTHORIZED'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/JSendError'
            },
            example: {
              status: 'error',
              message: 'Admin access required',
              code: 'FORBIDDEN'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/JSendError'
            },
            example: {
              status: 'error',
              message: 'Resource not found',
              code: 'NOT_FOUND'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError'
            }
          }
        }
      }
    }
  }
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    // In development: use TypeScript files from src/
    ...(process.env.NODE_ENV === 'development'
      ? [path.resolve(__dirname, '../routes/*.ts')]
      : []),
    // In production/Vercel: use compiled JavaScript files from dist/
    path.resolve(__dirname, '../routes/*.js'),
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
