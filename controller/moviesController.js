import connection from "../db.js"

const index = () => {
    const sql = "SELECT * FROM `movies`"

    connection.query(sql, (err, results) => {
        if(err) {
            console.log("Error");
        } else {
            res.json({
                data: results,
            })
        }
    })
};

const controller = {
    index,
}

export default controller