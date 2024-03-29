import {Router} from 'express'
import {AuthenticateUser, Login, Logout, Refresh, Register, TwoFactor, QR} from "./controller/auth.controller";
import {ForgotPassword, ResetPassword} from "./controller/forgot.controller";

export const routes = (router: Router) => {
    router.post('/api/register', Register);
    router.post('/api/login', Login);
    router.post('/api/two-factor', TwoFactor);// TODO: a problem with this
    router.get('/api/user', AuthenticateUser);
    router.post('/api/refresh', Refresh);
    router.post('/api/logout', Logout);
    router.post('/api/forgot', ForgotPassword);
    router.post('/api/reset', ResetPassword);
    router.get('/test', QR);
}