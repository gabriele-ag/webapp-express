import connection from "../db.js"

const index = (req, res) => {

    const sql = " SELECT * FROM `movies` "

    connection.query(sql, (err, result) => {
        if(err) {
            console.log(err)
        } else {
            const movies = result.map((curMovie) => {

                return {
                    ...curMovie,
                    image: `${req.imagePath}/${curMovie.image}`
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

    const movieSql = " SELECT * FROM `movies` WHERE `id` = ? "
    const reviewSql = " SELECT `reviews`.`name`, `reviews`.`text`, `reviews`.`vote` FROM `reviews` WHERE id = ? "

    connection.query(movieSql, [id], (err, movieResult) => {
        if(err) {
            console.log("Error")
        } 
            
        if (movieResult.length == 0) {
                res.status(404).json({
                    error: "Movie not found"
                })
        } else {
            connection.query(reviewSql, [id], (err, reviewResult) => {
                res.status(200).json({
                    data: {
                        ...movieResult[0],
                        reviews: reviewResult,
                        image: `${req.imagePath}/${movieResult[0].image}`
                        
                    } 
                })
            })
        }
        
    })
}

const controller = {
    index,
    show
}

export default controller