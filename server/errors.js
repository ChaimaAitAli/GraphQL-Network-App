// errors.js
export class GraphQLError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
    }

    toGraphQLError() {
        return {
            message: this.message,
            extensions: {
                code: this.code,
                ...this.details,
            },
        };
    }
}

export class ParamsNotValidError extends GraphQLError {
    constructor(message = "Invalid parameters", details = {}) {
        super(message, "PARAMS_NOT_VALID", details);
    }
}

export class BodyNotValidError extends GraphQLError {
    constructor(message = "Invalid input data", details = {}) {
        super(message, "BODY_NOT_VALID", details);
    }
}

export class ResourceNotFoundError extends GraphQLError {
    constructor(message = "Resource not found", details = {}) {
        super(message, "RESOURCE_NOT_FOUND", details);
    }
}

export class PathNotFoundError extends GraphQLError {
    constructor(message = "Invalid operation or path", details = {}) {
        super(message, "PATH_NOT_FOUND", details);
    }
}

export class ServerError extends GraphQLError {
    constructor(message = "Internal server error", details = {}) {
        super(message, "SERVER_ERROR", details);
    }
}