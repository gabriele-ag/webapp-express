import connection from "../db.js"

const index = (req, res, next) => {

    const search = req.query.search

    let sql = ` 
    SELECT movies.*, ROUND(AVG(reviews.vote), 2) AS vote_avg 
    FROM movies 
    LEFT JOIN reviews 
    ON movies.id = reviews.movie_id `
    const params =[]


    if (search !== undefined) {
        sql += `
        WHERE movies.title LIKE ?`
        params.push(`%${search}%`);
    };

    sql += ` 
        GROUP BY movies.id
    `;

    connection.query(sql, (err, result) => {
        if(err) {
            return next(new Error(err))
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

    const movieSql = ` 
    SELECT * 
    FROM movies 
    WHERE id = ? `

    const reviewSql = " SELECT `reviews`.`name`, `reviews`.`text`, `reviews`.`vote` FROM `movies`INNER JOIN `reviews` ON `movies`.`id` = `reviews`.`movie_id` WHERE `id` = ? "

    connection.query(movieSql, [id], (err, movieResult) => {
        if(err) {
            return res.status(500).json({
            status: "fail",
            message: "Errore lato server"
            });
        };
            
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