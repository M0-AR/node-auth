import {Request, Response} from "express";
import {Reset} from "../entity/reset.entity";
import {getRepository} from "typeorm";


export const Forgot = async (req: Request, res: Response) => {
    const {email} = req.body;
    const token = Math.random().toString(20).substring(2, 12);

    const reset = await getRepository(Reset).save({
        email,
        token
    })

    res.send(reset);
}