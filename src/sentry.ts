import Toucan from "toucan-js";
import { Options } from "toucan-js/dist/types";
import {Env, IRequest } from "./interfaces";

export function addSentry(request: IRequest, env: Env, ctx: ExecutionContext): void {
    const options = {
        dsn: env.SENTRY_DSN,
        ctx,
        request,
        allowedHeaders: ['user-agent'],
        allowedSearchParams: /(.*)/,
    } as Options

    request.sentry = new Toucan(options);
}