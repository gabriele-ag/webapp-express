import connection from "../db.js"

const index = (req, res) => {
    console.log(req.imagePath)

    const sql = " SELECT * FROM `movies` "

    connection.query(sql, (err, result) => {
        if(err) {
            console.log(err)
        } else {
            const movies = result.map((curMovie) => {
                return {
                    ...curMovie,
                    image: `${req.imgPath}/${curMovie.image}`
                }
            })
        
            res.json({
                data: movies,
            })           
        }
    })
}

const show = (req, res) => {
    const id = req.params.id

    const sql = " SELECT * FROM `movies` WHERE `id` = ? "

    connection.query(sql, [id], (err, result) => {
        if(err) {
            console.log("Error")
        } else {
            if (result.length == 0) {
                res.status(404).json({
                    error: "Movie not found"
                })
            } else {
                res.json({
                    data: result[0]
                })
            }
        }
    })

}

const controller = {
    index,
    show
}

export default controller