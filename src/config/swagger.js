import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "TaskFlow API",
            version: "1.0.0",
            description: "TaskFlow Project Management API",
        },

        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Local server",
            },
        ],

        components: {
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                            example: "Invalid Credentials!",
                        },
                        errors: {
                            type: "array",
                            items: {},
                            example: [],
                        },
                    },
                },
            },

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;