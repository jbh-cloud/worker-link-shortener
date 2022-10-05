import {Env} from "../interfaces";
import { KvRepo} from "../KvRepo";

export class LinkService {
    private repo: KvRepo | null = null
    constructor(env: Env) {
        this.repo = new KvRepo(env.LINKS)
    }

    private random = new RandomIdGenerator()

    public async getIdForLink(link: string): Promise<string>{
        await this.repo!.setup()


        let id = this.random.getId();
        console.log(`getIdForLink() id -> ${id}`)
        
        while (id in this.repo!.idToKvKey!){ // check id collision in KV
            console.log(`getIdForLink() Generated id ${id} already in KV, generating another one..`)
            id = this.random.getId();
        }

        await this.repo!.put(id, link);
        return id;
    }

    public async getLinkForId(id: string): Promise<string | null> {
        await this.repo!.setup()
        return await this.repo!.get(id);
    }
}


class RandomIdGenerator
{
    // https://stackoverflow.com/questions/9543715/generating-human-readable-usable-short-but-unique-ids
    // 5 chars in base 62 will give you 62^5 unique IDs = 916,132,832 (~1 billion)
    // 4 chars in base 62 will give you 62^5 unique IDs = 916,132,832 (~14.7 million)
    // 3 chars in base 62 will give you 62^3 unique IDs = 916,132,832 (~238 thousand)
    // 2 chars in base 62 will give you 62^2 unique IDs = 916,132,832 (3844)

    private _base62chars: string[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split('');

    private getRandomNumber(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    private getBase62(length: number): string
    {
        let ret = ""

        for (let i=0; i<length; i++)
            ret += this._base62chars[this.getRandomNumber(0, 62)]

        return ret;
    }

    private getBase36(length: number): string
    {
        let ret = ""

        for (let i=0; i<length; i++)
            ret += this._base62chars[this.getRandomNumber(0, 36)]

        return ret;
    }

    public getId(): string {
        return this.getBase62(3)
    }
}
