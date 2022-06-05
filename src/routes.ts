import {Router} from 'express'
import {AuthenticateUser, Login, Logout, Refresh, Register} from "./controller/auth.controller";

export const routes = (router: Router) => {
    router.post('/api/register', Register);
    router.post('/api/login', Login);
    router.get('/api/user', AuthenticateUser);
    router.post('/api/refresh', Refresh);
    router.post('/api/logout', Logout);
}