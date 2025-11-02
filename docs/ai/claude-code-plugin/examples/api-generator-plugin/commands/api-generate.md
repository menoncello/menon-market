---
name: api-generator
description: "Generate complete REST APIs with models, routes, controllers, and documentation"
parameters:
  - name: api-name
    type: string
    required: true
    description: "Name of the API to generate"
  - name: framework
    type: string
    required: false
    default: "express"
    description: "Backend framework to use (express, fastify, koa)"
  - name: database
    type: string
    required: false
    default: "mongodb"
    description: "Database type (mongodb, postgresql, mysql)"
  - name: authentication
    type: boolean
    required: false
    default: true
    description: "Include authentication and authorization"
  - name: testing
    type: boolean
    required: false
    default: true
    description: "Include test files and testing setup"
  - name: documentation
    type: boolean
    required: false
    default: true
    description: "Include API documentation with Swagger/OpenAPI"
examples:
  - command: "/api-generator UserAPI --framework=express --database=mongodb"
    description: "Generate a complete user management API with Express and MongoDB"
  - command: "/api-generator BlogAPI --framework=fastify --database=postgresql --authentication=false"
    description: "Generate a blog API with Fastify and PostgreSQL without authentication"
---

# API Generator

This command generates a complete REST API with all necessary components including models, routes, controllers, middleware, tests, and documentation.

## Usage

```bash
/api-generator <api-name> [options]
```

## Parameters

### Required Parameters

- **api-name** (string): Name of the API to generate. This will be used for naming files, classes, and API endpoints.

### Optional Parameters

- **framework** (string, default: "express"): Backend framework to use
  - `express`: Express.js framework
  - `fastify`: Fastify framework
  - `koa`: Koa.js framework

- **database** (string, default: "mongodb"): Database type to use
  - `mongodb`: MongoDB with Mongoose
  - `postgresql`: PostgreSQL with Sequelize
  - `mysql`: MySQL with Sequelize

- **authentication** (boolean, default: true): Include JWT-based authentication and authorization system

- **testing** (boolean, default: true): Generate comprehensive test files and testing setup

- **documentation** (boolean, default: true): Include Swagger/OpenAPI documentation

## Generated Structure

The command will create the following project structure:

```
{{pascalCase api-name}}-API/
├── src/
│   ├── controllers/
│   │   ├── {{camelCase api-name}}.controller.js
│   │   └── auth.controller.js
│   ├── models/
│   │   ├── {{camelCase api-name}}.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── {{camelCase api-name}}.routes.js
│   │   └── auth.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── services/
│   │   ├── {{camelCase api-name}}.service.js
│   │   └── auth.service.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── logger.js
│   │   └── validators.js
│   ├── config/
│   │   ├── database.config.js
│   │   ├── jwt.config.js
│   │   └── swagger.config.js
│   └── app.js
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
├── docs/
│   └── api.yaml
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── server.js
```

## Generated Components

### 1. Models

{{#if (eq database "mongodb")}}
**MongoDB Model (Mongoose)**
```javascript
// src/models/{{camelCase api-name}}.model.js
const mongoose = require('mongoose');

const {{pascalCase api-name}}Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('{{pascalCase api-name}}', {{pascalCase api-name}}Schema);
```
{{else}}
**SQL Model (Sequelize)**
```javascript
// src/models/{{camelCase api-name}}.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const {{pascalCase api-name}} = sequelize.define('{{pascalCase api-name}}', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'active'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  });

  return {{pascalCase api-name}};
};
```
{{/if}}

### 2. Controllers

```javascript
// src/controllers/{{camelCase api-name}}.controller.js
const {{camelCase api-name}}Service = require('../services/{{camelCase api-name}}.service');
const { validate{{pascalCase api-name}} } = require('../utils/validators');

class {{pascalCase api-name}}Controller {
  async create{{pascalCase api-name}}(req, res) {
    try {
      const { error } = validate{{pascalCase api-name}}(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        });
      }

      const {{camelCase apiName}} = await {{camelCase api-name}}Service.create{{pascalCase api-name}}({
        ...req.body,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '{{pascalCase api-name}} created successfully',
        data: {{camelCase apiName}}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create {{camelCase api-name}}',
        error: error.message
      });
    }
  }

  async get{{pluralize (pascalCase api-name)}}(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const {{camelCase apiName}}s = await {{camelCase api-name}}Service.get{{pluralize (pascalCase api-name)}}({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: {{camelCase apiName}}s
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch {{pluralize (camelCase api-name)}}',
        error: error.message
      });
    }
  }

  async get{{pascalCase api-name}}ById(req, res) {
    try {
      const { id } = req.params;
      const {{camelCase apiName}} = await {{camelCase api-name}}Service.get{{pascalCase api-name}}ById(id);

      if (!{{camelCase apiName}}) {
        return res.status(404).json({
          success: false,
          message: '{{pascalCase api-name}} not found'
        });
      }

      res.json({
        success: true,
        data: {{camelCase apiName}}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch {{camelCase api-name}}',
        error: error.message
      });
    }
  }

  async update{{pascalCase api-name}}(req, res) {
    try {
      const { id } = req.params;
      const { error } = validate{{pascalCase api-name}}(req.body, true);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        });
      }

      const {{camelCase apiName}} = await {{camelCase api-name}}Service.update{{pascalCase api-name}}(id, req.body);

      if (!{{camelCase apiName}}) {
        return res.status(404).json({
          success: false,
          message: '{{pascalCase api-name}} not found'
        });
      }

      res.json({
        success: true,
        message: '{{pascalCase api-name}} updated successfully',
        data: {{camelCase apiName}}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update {{camelCase api-name}}',
        error: error.message
      });
    }
  }

  async delete{{pascalCase api-name}}(req, res) {
    try {
      const { id } = req.params;
      const success = await {{camelCase api-name}}Service.delete{{pascalCase api-name}}(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: '{{pascalCase api-name}} not found'
        });
      }

      res.json({
        success: true,
        message: '{{pascalCase api-name}} deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete {{camelCase api-name}}',
        error: error.message
      });
    }
  }
}

module.exports = new {{pascalCase api-name}}Controller();
```

### 3. Routes

{{#if (eq framework "express")}}
```javascript
// src/routes/{{camelCase api-name}}.routes.js
const express = require('express');
const router = express.Router();
const {{camelCase api-name}}Controller = require('../controllers/{{camelCase api-name}}.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate{{pascalCase api-name}} = require('../utils/validators');

{{#if authentication}}
// Apply authentication middleware to all routes
router.use(authMiddleware);
{{/if}}

// POST /api/{{kebabCase api-name}} - Create new {{camelCase api-name}}
router.post('/', {{camelCase api-name}}Controller.create{{pascalCase api-name}});

// GET /api/{{kebabCase api-name}} - Get all {{pluralize (camelCase api-name)}} with pagination
router.get('/', {{camelCase api-name}}Controller.get{{pluralize (pascalCase api-name)}});

// GET /api/{{kebabCase api-name}}/:id - Get {{camelCase api-name}} by ID
router.get('/:id', {{camelCase api-name}}Controller.get{{pascalCase api-name}}ById);

// PUT /api/{{kebabCase api-name}}/:id - Update {{camelCase api-name}}
router.put('/:id', {{camelCase api-name}}Controller.update{{pascalCase api-name}});

// DELETE /api/{{kebabCase api-name}}/:id - Delete {{camelCase api-name}}
router.delete('/:id', {{camelCase api-name}}Controller.delete{{pascalCase api-name}});

module.exports = router;
```
{{/if}}

### 4. Services

```javascript
// src/services/{{camelCase api-name}}.service.js
const {{camelCase api-name}}Model = require('../models/{{camelCase api-name}}.model');

class {{pascalCase api-name}}Service {
  async create{{pascalCase api-name}}({{camelCase api-name}}Data) {
    try {
      const {{camelCase apiName}} = new {{camelCase api-name}}Model({{camelCase api-name}}Data);
      return await {{camelCase apiName}}.save();
    } catch (error) {
      throw new Error(`Failed to create {{camelCase api-name}}: ${error.message}`);
    }
  }

  async get{{pluralize (pascalCase api-name)}}({ page, limit, status, userId }) {
    try {
      const query = {};

      if (status) {
        query.status = status;
      }

      if (userId) {
        query.createdBy = userId;
      }

      const {{camelCase apiName}}s = await {{camelCase api-name}}Model.find(query)
        .populate('createdBy', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await {{camelCase api-name}}Model.countDocuments(query);

      return {
        {{pluralize (camelCase api-name)}}: {{camelCase apiName}}s,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch {{pluralize (camelCase api-name)}}: ${error.message}`);
    }
  }

  async get{{pascalCase api-name}}ById(id) {
    try {
      return await {{camelCase api-name}}Model.findById(id)
        .populate('createdBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to fetch {{camelCase api-name}}: ${error.message}`);
    }
  }

  async update{{pascalCase api-name}}(id, updateData) {
    try {
      return await {{camelCase api-name}}Model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update {{camelCase api-name}}: ${error.message}`);
    }
  }

  async delete{{pascalCase api-name}}(id) {
    try {
      const result = await {{camelCase api-name}}Model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete {{camelCase api-name}}: ${error.message}`);
    }
  }
}

module.exports = new {{pascalCase api-name}}Service();
```

{{#if authentication}}
### 5. Authentication System

```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;
```
{{/if}}

### 6. Testing Setup

{{#if testing}}
```javascript
// tests/integration/api/{{camelCase api-name}}.test.js
const request = require('supertest');
const app = require('../../../src/app');
const { generateTestToken } = require('../../helpers/auth');

describe('{{pascalCase api-name}} API', () => {
  let authToken;
  let {{camelCase apiName}}Id;

  beforeAll(async () => {
    authToken = await generateTestToken();
  });

  describe('POST /api/{{kebabCase api-name}}', () => {
    it('should create a new {{camelCase api-name}}', async () => {
      const {{camelCase apiName}}Data = {
        name: 'Test {{pascalCase api-name}}',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/{{kebabCase api-name}}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({{camelCase api-name}}Data)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe({{camelCase api-name}}Data.name);
      {{camelCase api-name}}Id = response.body.data._id;
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        description: 'Missing required name field'
      };

      const response = await request(app)
        .post('/api/{{kebabCase api-name}}')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('GET /api/{{kebabCase api-name}}', () => {
    it('should get all {{pluralize (camelCase api-name)}}', async () => {
      const response = await request(app)
        .get('/api/{{kebabCase api-name}}')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.{{pluralize (camelCase api-name)}})).toBe(true);
    });
  });

  describe('GET /api/{{kebabCase api-name}}/:id', () => {
    it('should get {{camelCase api-name}} by ID', async () => {
      const response = await request(app)
        .get(`/api/{{kebabCase api-name}}/${{camelCase api-name}}Id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe({{camelCase api-name}}Id);
    });

    it('should return 404 for non-existent {{camelCase api-name}}', async () => {
      const response = await request(app)
        .get('/api/{{kebabCase api-name}}/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});
```
{{/if}}

### 7. API Documentation

{{#if documentation}}
```yaml
# docs/api.yaml
openapi: 3.0.0
info:
  title: {{pascalCase api-name}} API
  description: A RESTful API for managing {{pluralize (camelCase api-name)}}
  version: 1.0.0

paths:
  /api/{{kebabCase api-name}}:
    get:
      summary: Get all {{pluralize (camelCase api-name)}}
      tags:
        - {{pascalCase api-name}}
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: List of {{pluralize (camelCase api-name)}}
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      {{pluralize (camelCase api-name)}}:
                        type: array
                        items:
                          $ref: '#/components/schemas/{{pascalCase api-name}}'
                      pagination:
                        $ref: '#/components/schemas/Pagination'

    post:
      summary: Create a new {{camelCase api-name}}
      tags:
        - {{pascalCase api-name}}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Create{{pascalCase api-name}}'
      responses:
        '201':
          description: {{pascalCase api-name}} created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/{{pascalCase api-name}}'
        '400':
          description: Validation error

  /api/{{kebabCase api-name}}/{id}:
    get:
      summary: Get {{camelCase api-name}} by ID
      tags:
        - {{pascalCase api-name}}
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: {{pascalCase api-name}} details
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/{{pascalCase api-name}}'
        '404':
          description: {{pascalCase api-name}} not found

components:
  schemas:
    {{pascalCase api-name}}:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [active, inactive, pending]
        createdBy:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Create{{pascalCase api-name}}:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
        status:
          type: string
          enum: [active, inactive, pending]
          default: active

    Pagination:
      type: object
      properties:
        currentPage:
          type: integer
        totalPages:
          type: integer
        totalItems:
          type: integer
        itemsPerPage:
          type: integer
```
{{/if}}

## Configuration Files

### Package.json
```json
{
  "name": "{{kebabCase api-name}}-api",
  "version": "1.0.0",
  "description": "{{title-case api-name}} REST API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "{{#if (eq framework "express")}}express{{/if}}{{#if (eq framework "fastify")}}fastify{{/if}}{{#if (eq framework "koa")}}koa{{/if}}": "^4.18.0",
    "{{#if (eq database "mongodb")}}mongoose{{/if}}{{#if (or (eq database "postgresql") (eq database "mysql"))}}sequelize{{/if}}": "^7.0.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    {{#if authentication}}"jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",{{/if}}
    "joi": "^17.9.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

### Environment Configuration
```bash
# .env.example
PORT=3000
NODE_ENV=development

{{#if (eq database "mongodb")}}
MONGODB_URI=mongodb://localhost:27017/{{kebabCase api-name}}-api
{{/if}}
{{#if (eq database "postgresql")}}
DB_HOST=localhost
DB_PORT=5432
DB_NAME={{kebabCase api-name}}_api
DB_USER=your_username
DB_PASSWORD=your_password
{{/if}}
{{#if (eq database "mysql")}}
DB_HOST=localhost
DB_PORT=3306
DB_NAME={{kebabCase api-name}}_api
DB_USER=your_username
DB_PASSWORD=your_password
{{/if}}

{{#if authentication}}
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
{{/if}}
```

## Installation and Setup

After generating the API:

1. **Install dependencies**:
   ```bash
   cd {{pascalCase api-name}}-API
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   {{#if (eq database "mongodb")}}
   ```bash
   # Start MongoDB
   mongod
   ```
   {{/if}}
   {{#if (eq database "postgresql")}}
   ```bash
   # Create PostgreSQL database
   createdb {{kebabCase api-name}}_api
   ```
   {{/if}}
   {{#if (eq database "mysql")}}
   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE {{kebabCase api-name}}_api;"
   ```
   {{/if}}

4. **Run the API**:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

6. **Access API documentation**:
   {{#if documentation}}
   Open `http://localhost:3000/api-docs` in your browser
   {{/if}}

## API Endpoints

The generated API includes the following endpoints:

### {{pascalCase api-name}} Management
- `GET /api/{{kebabCase api-name}}` - Get all {{pluralize (camelCase api-name)}} (with pagination)
- `POST /api/{{kebabCase api-name}}` - Create new {{camelCase api-name}}
- `GET /api/{{kebabCase api-name}}/:id` - Get {{camelCase api-name}} by ID
- `PUT /api/{{kebabCase api-name}}/:id` - Update {{camelCase api-name}}
- `DELETE /api/{{kebabCase api-name}}/:id` - Delete {{camelCase api-name}}

{{#if authentication}}
### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
{{/if}}

{{#if documentation}}
### Documentation
- `GET /api-docs` - Swagger API documentation
{{/if}}

## Features Included

- ✅ **CRUD Operations**: Complete create, read, update, delete functionality
- ✅ **Input Validation**: Comprehensive validation using Joi
- ✅ **Error Handling**: Centralized error handling middleware
- ✅ **Authentication**: JWT-based authentication (if enabled)
- ✅ **Pagination**: Built-in pagination for list endpoints
- ✅ **Testing**: Unit and integration tests
- ✅ **Documentation**: OpenAPI/Swagger documentation
- ✅ **Logging**: Request/response logging
- ✅ **Security**: CORS, Helmet security headers
- ✅ **Environment Config**: Environment-based configuration

## Customization Tips

1. **Add custom fields**: Update the model schema and validation rules
2. **Custom middleware**: Add middleware in the `src/middleware/` directory
3. **Additional services**: Create new services in `src/services/`
4. **Custom validators**: Add validation schemas in `src/utils/validators.js`
5. **Database relationships**: Define relationships in model files
6. **Rate limiting**: Add rate limiting middleware for API protection

---

*This API generator creates a production-ready foundation for your REST API development. Customize and extend it according to your specific requirements.*