/// <reference path="../../../typings/index.d.ts" />

import * as exp from "express";
import {HomeController} from "../../nodejs/web/home/homeController";

export const InitRouter = (app: exp.Application) => {

    new HomeController(app);

    // app.get("*", (req, res) => {

    //     //back to the default page 
    //     res.redirect("/spa");

    // });
};
