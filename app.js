import express from "express"
import movieRouter from "./routes/movie.js"
import imagePath from "./middleware/imagePath.js"
import errorHandler from "./middleware/errorHandler.js"
import notFound from "./middleware/notFound.js"


const app = express()
const port = process.env.SERVER_PORT

app.get("/", (req, res) => {
    console.log("Welcome to books API")
})

app.use(express.json())
app.use(express.static("public"))


app.use("/movies", imagePath, movieRouter)

app.use(notFound)
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server in ascolto nella porta ${port}`)
})



