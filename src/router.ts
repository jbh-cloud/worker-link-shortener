import { Router } from 'itty-router';
// import Toucan from 'toucan-js';
// import { addSentry } from './sentry';
import {Env, IRequest} from "./interfaces";
import {addEnv, addLinkService, authorizeRequest} from "./utils";
import {redirectHandler} from "./handlers/redirectHandler";
import {newShortenRequestHandler} from "./handlers/newShortenRequestHandler";
import {homepageHandler} from "./handlers/homepageHandler";
import {addSentry} from "./sentry";

const router = Router()
    .get(
        '*',
        (request: IRequest, env: Env, ctx: ExecutionContext) => addSentry(request, env, ctx),
        (request: IRequest, env: Env) => addEnv(request, env),
        (request: IRequest, env: Env) => addLinkService(request, env),

    )
    .post(
        '/api/*',
        (request: IRequest, env: Env) => authorizeRequest(request, env)
    )
    .post(
        '*',
        (request: IRequest, env: Env, ctx: ExecutionContext) => addSentry(request, env, ctx),
        (request: IRequest, env: Env) => addEnv(request, env),
        (request: IRequest, env: Env) => addLinkService(request, env)
    )

    .get('/', async (request: IRequest) => homepageHandler(request))
    .get('/:id', async (request: IRequest) => redirectHandler(request))

    .post('/api/generate-link', async (request: IRequest) => newShortenRequestHandler(request))

    // catch non-matching routes
    .get('*', () => new Response('Not found', { status: 404 }))
    .post('*', () => new Response('Not found', { status: 404 }))
    .delete('*', () => new Response('Not found', { status: 404 }))

export default router






