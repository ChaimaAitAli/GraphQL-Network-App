import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { connectDB } from './db.js';
import jwt from 'jsonwebtoken';
import i18next from './i18n.js';
import 'dotenv/config';

// Create Express app
const app = express();

// Connect to the database
await connectDB();

// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
        {
            async serverWillStart() {
                console.log('Server setting up GraphQL query caching...');
            },
            async requestDidStart(requestContext) {
                let operationType = null;
                return {
                    async didResolveOperation(context) {
                        operationType = context.operation?.operation;
                    },
                    async willSendResponse({ response }) {
                        if (operationType === 'query') {
                            if (!response.http) response.http = { headers: new Map() };
                            if (!response.errors || response.errors.length === 0) {
                                response.http.headers.set('Cache-Control', 'public, max-age=300');
                                response.http.headers.set('Vary', 'Accept, Origin, Accept-Encoding, Accept-Language');
                                response.http.headers.set('ETag', generateETag(response.body));
                            } else {
                                response.http.headers.set('Cache-Control', 'no-store');
                            }
                        } else if (operationType === 'mutation') {
                            if (!response.http) response.http = { headers: new Map() };
                            response.http.headers.set('Cache-Control', 'no-store');
                        }
                    }
                };
            }
        }
    ]
});

function generateETag(body) {
    if (!body) return '';
    const str = JSON.stringify(body);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `"${hash.toString(16)}"`;
}

function parseAcceptEncoding(acceptEncoding) {
    if (!acceptEncoding) return [];
    return acceptEncoding.split(',')
        .map(item => {
            const [encoding, qValue] = item.trim().split(';').map(s => s.trim());
            let quality = 1.0;
            if (qValue && qValue.startsWith('q=')) {
                quality = parseFloat(qValue.substring(2));
                if (isNaN(quality)) quality = 1.0;
            }
            return { encoding, quality };
        })
        .sort((a, b) => b.quality - a.quality);
}

await server.start();

// IMPORTANT: Parse JSON before applying compression
app.use(express.json());
app.use(cors());

// Apply compression with enhanced settings
app.use(compression({
    threshold: 0,
    level: 6,
    filter: (req, res) => {
        if (req.method === 'OPTIONS') {
            return false;
        }
        if (req.body) {
            const query = req.body.query || '';
            const operationName = req.body.operationName || '';
            const isQuery = query.trim().startsWith('query') ||
                (!query.trim().startsWith('mutation') &&
                    !operationName.toLowerCase().includes('mutation'));
            const acceptEncoding = req.headers['accept-encoding'] || '';
            const encodings = parseAcceptEncoding(acceptEncoding);
            console.log(`Request type: ${isQuery ? 'QUERY' : 'MUTATION'}`);
            console.log(`Client preferences: ${JSON.stringify(encodings)}`);
            console.log(`Applying compression: ${isQuery}`);
            return isQuery;
        }
        return compression.filter(req, res);
    }
}));

// Move language middleware before Apollo middleware
app.use((req, res, next) => {
    // Default version
    req.apiVersion = '1.0';

    // Default language
    req.language = 'en';

    // Check for version in headers
    const versionHeader = req.headers['x-api-version'];
    if (versionHeader) {
        req.apiVersion = versionHeader;
    }

    // Check for language in headers (both Accept-Language and custom header)
    const languageHeader = req.headers['accept-language'] || req.headers['x-language'];
    if (languageHeader) {
        const lang = languageHeader.split(',')[0].trim().substring(0, 2).toLowerCase();
        if (['en', 'fr'].includes(lang)) {
            req.language = lang;
        }
    }

    next();
});

// Apply Apollo middleware
app.use('/', expressMiddleware(server, {
    context: async ({ req }) => {
        // Set the language for this request
        const language = req.language;

        // Get the token from the request headers
        const token = req.headers.authorization?.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET;

        // Create the context object
        const context = {
            apiVersion: req.apiVersion,
            language: req.language,
            t: (key, options) => i18next.t(key, { lng: language, ...options }),
            formatDate: (date) => {
                const moment = require('moment');
                moment.locale(language);
                const format = language === 'fr' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
                return moment(date).format(format);
            }
        };

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                context.userId = decoded.userId;
            } catch (error) {
                console.error('Invalid token:', error.message);
            }
        }

        return context;
    }
}));


// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
});


// For content-negotiation and cors
/*
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { connectDB } from './db.js';
import { Builder } from 'xml2js';
import {
    ParamsNotValidError,
    BodyNotValidError,
    ResourceNotFoundError,
    PathNotFoundError,
    ServerError
} from "./errors.js";
// Connect to database
await connectDB();
// Define allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://your-production-app.com',
    // Add more allowed origins as needed
];
// Create Express app
const app = express();
// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        const { code, statusCode, message } = error.originalError || {};
        return {
            message: message || error.message,
            extensions: {
                code: code || "INTERNAL_SERVER_ERROR",
                statusCode: statusCode || 500,
            },
        };
    }
});
// Start Apollo Server
await server.start();
// Apply CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
// Parse JSON requests
app.use(express.json());
// Handle GraphQL requests
app.post('/', async (req, res) => {
    try {
        // Process with Apollo Server
        const result = await server.executeOperation({
            query: req.body.query,
            variables: req.body.variables,
            operationName: req.body.operationName
        });
        // Check if client wants XML
        const acceptHeader = req.headers.accept;
        if (acceptHeader && acceptHeader.includes('application/xml')) {
            try {
                // Convert to XML
                const builder = new Builder({
                    rootName: 'graphql',
                    renderOpts: { pretty: true }
                });
                const xmlBody = builder.buildObject(result);
                // Send XML response
                res.setHeader('Content-Type', 'application/xml');
                return res.send(xmlBody);
            } catch (error) {
                console.error("XML conversion error:", error);
                // Fall back to JSON if XML conversion fails
            }
        }
        // Default to JSON response
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    } catch (error) {
        console.error("GraphQL execution error:", error);
        res.status(500).send({
            errors: [{
                message: "Internal server error",
                extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    statusCode: 500
                }
            }]
        });
    }
});
// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is Ready listening on port ${PORT}`);
});
*/