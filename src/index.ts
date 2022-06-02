require('dotenv').config()

import express, {Request, Response} from 'express';
import {createConnection} from "typeorm";
import {routes} from "./routes";
import cors from 'cors';

createConnection().then(() => {
    const app = express();

    app.use(express.json());
    app.use(cors({
        origin: ['http://localhost:3000', 'http//localhost:8080', 'http//localhost:4200'],
        credentials: true
    }));

   routes(app);

    app.listen(8001, () => {
        console.log('listening to port 8001')
    });
})