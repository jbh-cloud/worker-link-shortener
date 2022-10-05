import router from './router'
import { Env } from './interfaces'

export default {
	async fetch(request: Request, env: Env) {
		return await router.handle(request, env)
	}
}