import express from "express";
import homeController, { getHomepage } from "../controllers/homeController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomepage);
    router.get("/bro", (req, res) => {
        return res.send('Hello world, my bro')
    });
    router.get("/about",homeController.getAboutpage);
    //rest api

    return app.use("/", router);
}

module.exports = initWebRoutes;