import Toucan from "toucan-js";
import {LinkService} from "./services/LinkService";

export interface Env {
    LINKS: KVNamespace
    SENTRY_DSN: string
    APP_HOSTNAME: string
}

export interface IRequest extends Request {
    env: Env
    linkService: LinkService;
    isAuthenticated: boolean
    sentry: Toucan
}

export interface NewShortenRequest {
    url: string
}

export interface NewShortenResponse {
    url: string
}

export interface LinkKvMetadata {
    keys: string[]
}

export interface RedirectRule {
    id: string
    destination: string
}