const imagePath = (req, res, next) => {
    req.imagePath = "http://localhost:3000/images/covers"
    next()
}

export default imagePath