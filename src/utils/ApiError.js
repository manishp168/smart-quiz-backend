class ApiError {
    constructor(statusCode, message = "internal server error") {
        this.success = false;
        this.statusCode = statusCode;
        this.message = message;
    }
}

export { ApiError }