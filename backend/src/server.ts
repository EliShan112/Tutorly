import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

app.get('/', (req, res)=>{
    res.send("hellooooo")
})


app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${process.env.PORT}`)
})