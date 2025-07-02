import slugify from "slugify"
import connection from "../db.js"
import fs from "fs";

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

 const validateRequest = (req) => {
     const {title, director, abstract, genre} = req.body
     console.log(req.body)

     if (!title || !director) {
         return false; // validazione che dipende dalla semantica della tua applicazione --> voglio che title e director siano obbligatori
     };

     //genere --> voglio che il genere abbia almeno di 3 caratteri (??)

     if(genre && genre.length <= 3){
        return false;
     }

    //  if (title.length <= 4 || director.length < 4 || abstract.length < 20 || genre.length < 4) {
    //      return false;
    //  }
     return true;
 };

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
                error: "Film non trovato",
            });
        };

        const {name, vote, text} = req.body
        const newReviewSql = `
        INSERT INTO reviews (movie_id, name, vote, text)
        VALUES (?, ?, ?, ?)
        `;

        connection.query(newReviewSql, [id, name, vote, text], (err, results) => {
            if(err) {
                return next(new Error(err));
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

     if (!validateRequest(req)) {
         return res.status(400).json({
             message: "Dati errati",
         });
     };

    // Prendo i dati del film dalla richiesta
    const { title, director, genre, abstract, release_year} = req.body;
    const image = req.file.filename
    console.log(image)


    // Creo lo slug del titolo
    const slug = slugify(title, {
        lower: true,
        strict: true,
    });


    // Scriviamo la prepared statement query
    const sql = `
    INSERT INTO movies (slug, title, director, genre, abstract, release_year, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Eseguiamo la query
    // Se c'è errore lo gestiamo
    // Invio la risposta con il codice 201 e id e slug

    connection.query(sql, [slug, title, director, genre, abstract, release_year, image], (err, results) => {
        if (err) {
            return next(new Error(err))
        };

        return res.status(201).json({
            id: results.insertId,
            slug,
        });
    });



}

const destroy = (req, res, next) => {
    const slug = req.params.slug

    const movieSql = `
    SELECT *
    FROM movies
    WHERE slug = ?
    `;

    connection.query(movieSql, [slug], (err, result) => {
        if(result.length === 0) {
            return res.status(404).json({
                error: "Film non trovato",
            });
        };

        const filePath = `public/images/covers/${result[0].image}`;
        fs.unlinkSync(filePath);
    
        const movieId = result[0].id
        const deleteSql = `
        DELETE
        FROM movies
        WHERE id = ?`

        connection.query(deleteSql, [movieId], (err, result) => {
            if (err) {
                return next(new Error(err))
            }

            res.sendStatus(204);
        })

    });

};

const controller = {
    index,
    show,
    store,
    storeReviews,
    destroy,
};

export default controller;