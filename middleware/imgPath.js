const imagePath = (req, res, next) => {
    const path = "http://localhost:3000/img/cover"
    req.imagePath = path
    next()
}

export default imagePath