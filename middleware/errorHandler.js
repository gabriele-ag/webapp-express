const errorHandler = (err, req, res, next) => {

    const resData = {
        status: "fail",
        message: "Qualcosa è andato storto"
    }
    if(process.env.ENVIRONMENT === "development") {
        resData.error = err.message
    }
}

export default errorHandler