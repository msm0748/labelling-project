import * as express from "express";
import { port } from "../config.json";

const app = express();

app.listen(port, () => {
    console.log("server is running!");
});
