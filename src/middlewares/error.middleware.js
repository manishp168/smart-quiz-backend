const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something going wrong";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        data: null
    });
}

export { errorHandler }