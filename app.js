import express from "express"
import movieRouter from "./routes/movie.js"
import imagePath from "./middleware/imgPath.js"


const app = express()
const port = 3000

app.get("/", (req, res) => {
    console.log("Welcome to books API")
})

app.use(express.json())
app.use(express.static("public"))
app.use("/movies", imagePath, movieRouter)


app.listen(port, () => {
    console.log(`Server in ascolto nella porta ${port}`)
})

