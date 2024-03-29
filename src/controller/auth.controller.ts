import {Request, Response} from "express";
import {getRepository, MoreThanOrEqual} from "typeorm";
import {User} from "../entity/user.entity";
import bcryptjs from 'bcryptjs';
import {sign, verify} from 'jsonwebtoken'
import {Token} from "../entity/token.entity";

const speakeasy = require('speakeasy');

export const Register = async (req: Request, res: Response) => {
    const body = req.body;

    if (body.password !== body.password_confirm) {
        return res.status(400).send({
            message: "Passwords do not match!"
        });
    }

    const {password, tfa_secret, ...user} = await getRepository(User).save({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: await bcryptjs.hash(body.password, 12),
    });

    res.send(user);
}

export const Login = async (req: Request, res: Response) => {
    const user = await getRepository(User).findOneBy({
        email: req.body.email,
    });

    if (!user) {
        return res.status(400).send({
            message: "Invalid credentials"
        });
    }

    if (!await bcryptjs.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: "Invalid credentials"
        });
    }

    if (user.tfa_secret) {
        return res.send({
            id: user.id
        });
    }

    const secret = speakeasy.generateSecret({
        name: 'My App'
    });

    res.send({
        id: user.id,
        secret: secret.ascii,
        otpauth_url: secret.otpauth_url
    });
}

const qrcode = require('qrcode')
export const QR = (req: Request, res: Response) => {
    qrcode.toDataURL('otpauth://totp/My%20App?secret=MVJF2WSFLNRHUVJPEFCEE5DLK4QWS22MNU6FEURWKEYCK4R2O4VA', (err: any, data: any) => {
        res.send(`<img src="${data}" />`);
    });
}

export const TwoFactor = async (req: Request, res: Response) => {
    try {
        const id = req.body.id;

        const repository = getRepository(User);

        const user = await repository.findOneBy(id);

        if (!user) {
            return res.status(400).send({
                message: "Invalid credentials"
            });
        }

        const secret = user.tfa_secret !== '' ? user.tfa_secret : req.body.secret;
        console.log(secret)
        console.log(req.body.code)

        // TODO: See how can you debug speakeasy.totp
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'ascii',
            token: req.body.code
        })

        console.log(verified)

        if (!verified) {
            return res.status(400).send({
                message: "Invalid credentials"
            });
        }

        if (user.tfa_secret === '') {
            await repository.update(id, {tfa_secret: secret});
        }

        const accessToken = sign({id}, process.env.REFRESH_SECRET || '', {expiresIn: '30s'});

        const refreshToken = sign({id}, process.env.REFRESH_SECRET || '', {expiresIn: '1w'});

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //1 day
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        res.send({
           message: 'success'
        });
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
}

export const AuthenticateUser = async (req: Request, res: Response) => {
    try {
        const accessToken = req.header('Authorization')?.split(' ')[1] || '';

        const payload: any = verify(accessToken, process.env.ACCESS_SECRET || '')

        if (!payload) {
            return res.status(401).send({
                message: 'unauthenticatedA'
            });
        }

        const user = await getRepository(User).findOneBy(payload.id);

        if (!user) {
            return res.status(401).send({
                message: 'unauthenticatedU'
            });
        }

        const {password, tfa_secret, ...data} = user

        res.send(data)
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
}

export const Refresh = async (req: Request, res: Response) => {
    try {
        const cookie = req.cookies['refresh_token']

        const payload: any = verify(cookie, process.env.REFRESH_SECRET || '')

        if (!payload) {
            return res.status(401).send({
                message: 'unauthenticatedA'
            });
        }

        const refreshToken = await getRepository(Token).findOneBy({
            user_id: payload.id,
            expired_at: MoreThanOrEqual(new Date())
        });

        if (!refreshToken) {
            return res.status(401).send({
                message: 'unauthenticatedA'
            });
        }

        const token = sign({
            id: payload.id
        }, process.env.ACCESS_SECRET || '', {expiresIn: '30s'});

        return res.send({
            token
        });
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }

}

export const Logout = async (req: Request, res: Response) => {
    await getRepository(Token).delete({
        token: req.cookies['refresh_token']
    })

    res.cookie('refresh_token', '', {maxAge: 0});

    return res.send({
        message: 'success'
    });
}
