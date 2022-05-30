import express, {Request, Response} from 'express';
import {createConnection} from "typeorm";

createConnection().then(() => {
    const app = express();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello');
    });

    app.listen(8001, () => {
        console.log('listening to port 8001')
    });
})