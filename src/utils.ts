import {Env, IRequest} from "./interfaces";
import {LinkService} from "./services/LinkService";


export function isValidHttpUrl(urlString: string): boolean {
    let url: URL | null = null
    try {
        url = new URL(urlString);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export function addLinkService(request: IRequest, env: Env): void {
    request.linkService = new LinkService(env)
}

export function addEnv(request: IRequest, env: Env): void {
    request.env = env
}

export function authorizeRequest(request: IRequest, env: Env): Response | void {
    // simple authorization, mainly for DDoS

    const origin = request.headers.get('Origin')
    console.log(`authorizeRequest() request origin -> ${origin}`)
    if (origin !== `https://${env.APP_HOSTNAME}`)
        return new Response('unauthorized', {status: 401})
}