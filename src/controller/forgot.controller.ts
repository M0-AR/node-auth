import {Request, Response} from "express";
import {Reset} from "../entity/reset.entity";
import {getRepository} from "typeorm";
import {createTransport} from "nodemailer";


export const Forgot = async (req: Request, res: Response) => {
    const {email} = req.body;
    const token = Math.random().toString(20).substring(2, 12);

    await getRepository(Reset).save({
        email,
        token
    })

    const transporter = createTransport({
        host: '0.0.0.0',
        port: 1025
    })

    const url = `http://localhost:3000/reset/${token}`;

    await transporter.sendMail({
        from: 'from@examlpe.com',
        to: email,
        subject: 'Reset your password!',
        html: `Click <a href="${url}">here</a> to reset your password!`
    })

    res.send({
        message: 'Please check your email!'
    });
}