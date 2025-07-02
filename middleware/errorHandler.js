const errorHandler = (err, req, res, next) => {
    console.log("EH", err)
    const resData = {
        status: "fail",
        message: "Qualcosa è andato storto"
    }
    if(process.env.ENVIRONMENT === "development") {
        resData.error = err.message
    }


}

export default errorHandler