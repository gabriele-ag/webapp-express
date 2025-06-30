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
        WHERE movies.title LIKE ?`;
        params.push(`%${search}%`);
    };

    sql += ` 
        GROUP BY movies.id
    `;

    console.log(params)

    connection.query(sql, params, (err, result) => {
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
    const slug = req.params.slug;

    const movieSql = ` 
    SELECT movies.*, ROUND(AVG(reviews.vote), 2) AS vote_avg 
    FROM movies 
    LEFT JOIN reviews 
    ON movies.id = reviews.movie_id
    WHERE movies.slug = ?
    GROUP BY movies.id 
    `;

    const reviewSql = ` 
    SELECT *
    FROM reviews
    WHERE reviews.movie_id = ? `

    connection.query(movieSql, [slug], (err, movieResult) => {
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
            const movieData = movieResult[0]
            connection.query(reviewSql, [movieData.id], (err, reviewResult) => {
                if(err) {
                    return new Error(err)
                }
                res.status(200).json({
                    data: {
                        ...movieData,
                        reviews: reviewResult,
                        image: `${req.imagePath}/${movieData.image}`
                        
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