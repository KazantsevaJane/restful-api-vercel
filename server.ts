import * as bodyParser from 'body-parser';
import { create, defaults, router as jsonRouter, rewriter } from 'json-server';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import * as path from "path";

const PORT = 3000;
const JWT_SECRET_KEY = 'MySecretKey';
const JWT_EXPIRES_IN = '1h';

const server = create();

const router = jsonRouter("db/db.json");
const middlewares = defaults();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(middlewares);

server.post('/login', (req, res) => {
    const payload: { email: string; password: string } = { email: req.body.email, password: req.body.password };
    const user: { id: number; email: string; password: string } | null =
        (router.db.get('users') as any).find({ email: payload.email, password: payload.password }).value() ?? null;
    if (user) {
        const accessToken = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({ accessToken, user: {id: user.id, email: user.email} });
    } else {
        const status = 401;
        const message = 'Incorrect username or password';
        res.status(status).json({ status, message });
    }
});

server.get('/user/:id', function (req, res) {
    console.log(req.params.id)
    res.send('user' + req.params.id)
})

server.get('/users', function (req, res) {
    res.send(router.db.get('users'))
})

server.put('/users/:id', function (req, res) {
    const user = (router.db.get('users') as any).find({id: req.params.id})
    res.send(router.db.updateWith(user, req.body))
})

server.use(router);

server.listen(PORT, () => {
    console.log(`JSON Server is running on port: ${PORT}`);
});
