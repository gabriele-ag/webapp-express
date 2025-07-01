import slugify from "slugify"
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

const show = (req, res, next) => {
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

const storeReviews = (req, res, next) => {

    // dalla request prendiamo l'id
    const { id } = req.params;
    console.log(id);

    // verifichiamo che il libro con questo id esiste

    const movieSql = `
    SELECT *
    FROM movies
    WHERE id = ? `;

    // se il libro esiste, preleviamo dal body della richiesta i dati
    // salviamo la nuova review nel database
    // inviamo la risposta con il codice 201
    connection.query(movieSql, [id], (err, movieResult) => {
        if(movieResult.length === 0) {
            return res.status(404).json({
                error: "Film non trovato"
            })
        }

        const {name, vote, text} = req.body
        const newReviewSql = `
        INSERT INTO reviews (movie_id, name, vote, text)
        VALUES (?, ?, ?, ?)
        `

        connection.query(newReviewSql, [id, name, vote, text], (err, results) => {
            if(err) {
                return next(new Error(err))
            };

            return res.status(201).json({
                    message: "Reviews created",
                    id: results.insertId,
            });
        });
    });


    console.log("Salva una reviews")
}

const store = (req, res, next) => {
    const { title, director, genre, abstract, release_year} = req.body;

    // prendiamo i dati del film dalla richiesta
    const slug = slugify(title, {
        lower: true,
        strinct: true,
    });

    const sql = `
    INSERT INTO movies (slug, title, director, genre, abstract, release_year)
    VALUES (?, ?, ?, ?, ?)
    `;

    // scriviamo la prepared statement query
    connection.query(sql, [slug, title, director, genre, abstract, release_year], (err, results) => {
        if (err) {
            return next(new Error(err))
        };

        return res.status(201).json({
            id: results.insertId,
            slug,
        });
    });

    // eseguiamo la query
    // se c'è errore lo gestiamo
    // Invio la risposta con il codice 201 e id e slug



}

const controller = {
    index,
    show,
    store,
    storeReviews,
};

export default controller;