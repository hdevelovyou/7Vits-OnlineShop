import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine"
import initWebRoutes from "./route/web"
import connectDB from "./config/connectDB"
require('dotenv').config();
let app = express();

//config app

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

viewEngine(app);
initWebRoutes(app);

connectDB();

let port=process.env.PORT || 9999;
//Port undefined => Port = 9999
app.listen(port, () => {
    console.log("My first server is running on port: " + port)
})