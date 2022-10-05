import {IRequest, NewShortenRequest} from "../interfaces";
import {isValidHttpUrl} from "../utils";

export async function newShortenRequestHandler(request: IRequest): Promise<Response> {
    try {
        let payload: NewShortenRequest | null = null
        try {
            payload = await request.json<NewShortenRequest>()
            payload.url.toString() // throw if url is undefined
        } catch (e) {
            return new Response('Post data must have a url', {status: 400})
        }

        if (!isValidHttpUrl)
            return new Response('Url is not valid', {status: 400})

        console.log(`newShortenedLinkHandler() payload -> ${payload.url}`)
        const id = await request.linkService.getIdForLink(payload.url)

        const data = {url: `https://${request.env.APP_HOSTNAME}/${id}`}

        return new Response(JSON.stringify(data), {headers: {'content-type': 'application/json;charset=UTF-8'}})
    } catch (e) {
        request.sentry.captureException(e)
        return new Response('error', {status: 500})
    }

}