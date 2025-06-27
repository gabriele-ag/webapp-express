const imagePath = (req, res, next) => {
    req.imagePath = `${req.protocol}://${req.get("host")}/images/covers`
    next()
}

export default imagePath