import {IRequest} from "../interfaces";

export async function redirectHandler(request: IRequest) : Promise<Response> {
    try {
        const url = new URL(request.url)
        const id = url.pathname.substring(1)
        const link = await request.linkService.getLinkForId(id)

        if (link === null)
            return new Response('Not found', {status: 404})

        return Response.redirect(link, 301)
    } catch (e) {
        request.sentry.captureException(e)
        return new Response('error', {status: 500})
    }
}