import {Request, Response} from "express";
import {Reset} from "../entity/reset.entity";
import {getRepository} from "typeorm";
import {createTransport} from "nodemailer";
import {User} from "../entity/user.entity";
import bcryptjs from "bcryptjs";


export const ForgotPassword = async (req: Request, res: Response) => {
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

    const url = `http://localhost:8080/#/reset/${token}`;

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

export const ResetPassword = async (req: Request, res: Response) => {
    const {token, password, password_confirm} = req.body;

    if (password !== password_confirm) {
        return res.status(400).send({
            message: "Passwords do not match!"
        });
    }

    const resetPassword = await getRepository(Reset).findOneBy({token});

    if (!resetPassword) {
        return res.status(400).send({
            message: "Invalid url!"
        });
    }

    const user = await getRepository(User).findOneBy({email: resetPassword.email})

    if (!user) {
        return res.status(404).send({
            message: "User not found!"
        });
    }

    await getRepository(User).update(user.id, {
        password: await bcryptjs.hash(password, 12)
    });

    res.send({
        message: 'success'
    })
}
