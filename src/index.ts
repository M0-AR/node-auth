import express, {Request, Response} from 'express';
import {createConnection} from "typeorm";
import {routes} from "./routes";

createConnection().then(() => {
    const app = express();

    app.use(express.json());

   routes(app);

    app.listen(8001, () => {
        console.log('listening to port 8001')
    });
})