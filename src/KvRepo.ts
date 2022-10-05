import {RedirectRule, LinkKvMetadata} from "./interfaces";

// 125 (3 char length) ids in metadata should be about 870B (KV Metadata limit is 1024B)
// With 1000 KV keys (free), this allows for 125,000 shortened urls
const SUB_KEYS_PER_KEY = 125

export class KvRepo {
    private kv: KVNamespace | null = null
    public idToKvKey: {[key: string]: string} | null = null

    constructor(kv: KVNamespace) {
        this.kv = kv
    }

    public async setup(): Promise<void> {
        await this.getAllIdToKvKey()
    }

    private async getAllIdToKvKey(): Promise<void> {
        if (this.idToKvKey === null){
            this.idToKvKey = {}
            let listPage = {list_complete: false, cursor:undefined, keys: [] as any[]} as KVNamespaceListResult<any>
            while(!listPage.list_complete){
                listPage = await this.kv!.list({cursor: listPage.cursor})
                for (const key of listPage.keys){
                    if (key.metadata != null){
                        const metadata = JSON.parse(key.metadata) as LinkKvMetadata
                        metadata.keys.map(i => this.idToKvKey![i] = key.name)
                    }
                    else{
                        console.log(`[[${key.name}] - WARNING - No metadata`)
                    }
                }
            }
        }
        else {
            console.log(`getAllIdToKvKey() called but this.idToKvKey already set`)
        }
    }

    public async get(key: string): Promise<string | null>{
        const backendKey = this.idToKvKey![key]
        if (backendKey === undefined)
            return null

        let value = await this.kv!.get(backendKey);
        if (value === null)
            throw new Error('This should never happen') //TODO: handle

        const redirectRules = JSON.parse(value) as RedirectRule[]
        const rule = redirectRules.filter(i => i.id === key)

        if (rule.length !== 1){
            return null // TODO: this should never happen, decide how to handle
        }

        return rule[0].destination
    }

    public async put(id: string, link: string): Promise<void> {
        const backendKey = await this.getAvailableKvKey()
        let { value, metadata } = await this.kv!.getWithMetadata<string>(backendKey);

        console.log(`put(${id}, ${link}) kv key -> ${backendKey}`)
        if (value === null){
            // seed new key with default values
            value = '[]'
            metadata = '{"keys": []}'
        }

        let rules = JSON.parse(value!) as RedirectRule[]
        let newMeta = JSON.parse(metadata!) as LinkKvMetadata

        rules.push({
            id: id,
            destination: link
        } as RedirectRule)

        newMeta.keys.push(id)

        console.log(`rules -> ${JSON.stringify(rules)}`)
        console.log(`newMeta -> ${JSON.stringify(newMeta)}`)

        await this.kv!.put(backendKey, JSON.stringify(rules), {metadata: JSON.stringify(newMeta)})
    }

    private async getAvailableKvKey(): Promise<string> {
        // perform list operation on all keys in namespace, and gather number of subkeys in use per key
        let keyToSubKeyCount : {[key:string]: any} = {}
        let listPage = {list_complete: false, cursor:undefined, keys: [] as any[]} as KVNamespaceListResult<any>
        while(!listPage.list_complete){
            listPage = await this.kv!.list({cursor: listPage.cursor})
            for (const key of listPage.keys){
                if (key.metadata != null){
                    const metadata = JSON.parse(key.metadata) as LinkKvMetadata
                    keyToSubKeyCount[key.name] = metadata.keys.length
                }
                else{
                    console.log(`[[${key.name}] - WARNING - No metadata`)
                }
            }
        }

        if (Object.keys(keyToSubKeyCount).length === 0)
            return "1"

        const lastKey = Math.max(...Object.keys(keyToSubKeyCount).map(i => parseInt(i))).toString()
        console.log(`getAvailableKvKey() lastKey -> ${lastKey}`)

        console.log(`getAvailableKvKey() ${keyToSubKeyCount[lastKey]} < ${SUB_KEYS_PER_KEY} -> ${keyToSubKeyCount[lastKey] < SUB_KEYS_PER_KEY}`)
        if (keyToSubKeyCount[lastKey] < SUB_KEYS_PER_KEY)
            return lastKey

        // increment new key
        let n = (parseInt(lastKey) +1).toString()
        console.log(`getAvailableKvKey() new key -> ${n}`)
        return n
    }
}