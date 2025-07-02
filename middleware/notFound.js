const notFound = (err, req, res, next) => {
    console.log("NT", err)
     res.status(404).json({
         status: "fail",
         message: "Route not found"
     });
};


export default notFound