# worker-link-shortener

Designed to be a lightweight website and API leveraging Cloudflare's free tier of Workers. 
Shortened links consist of a random 3 character, case-sensitive alphanumeric id which is then stored with its corresponding redirect url in [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/)

Have a look for yourself: [https://69420.cc/M86](https://69420.cc/M86)

### Features

- Simple UI powered by UIKit
- Sentry integration
- Free to host (runs as a serverless website)


### Data structure

Sets of required data are stored in batches per KV entry. worker-link-shortener dynamically creates new keys if the limit of the current key is reached (125). 

A visualization of this if the limit was 3 would be:

```json
{
  "1": {
    "metadata": {
      "keys": [
        "VC4",
        "c7G",
        "9iI"
      ]
    },
    "value": [
      {"id": "VC4", "url": "https://example1.com"},
      {"id": "c7G", "url": "https://example2.com"},
      {"id": "9iI", "url": "https://example3.com"}
    ]
  },
  "2": {
    "metadata": {
      "keys": [
        "dg2",
        "o9P"
      ]
    },
    "value": [
      {"id": "dg2", "url": "https://example4.com"},
      {"id": "o9P", "url": "https://example5.com"}
    ]
  }
  
}
```

### Limitations

**~125,000 shortened links maximum**

_Currently Cloudflare KV allows up-to 1000 key/value pairs. In order to quickly determine if an id has been generated or not, ids are stored in the key metadata. The maximum size of metadata per key is 1024B. To ensure worker-link-shortener does not go over this limit, the number of ids per metadata (and thus key) is limited to 125 (3 char length) ids (~870B)_ 

**Potential link generation collision**

_Cloudflare KV currently only allows 1 write per key per second. This means that there is potental for data loss if there is a race condition whereby both keys are invoked at the same time._

**Generated links can take up-to 60 seconds to start working**

_When updating the KV, Cloudflare can take up-to 60 seconds to update all cached locations. This may manifest itself as a link not working before this cache has been broken_


### TODO

- Update UI to be mobile friendly
- Refactor data structure to be 1 id per key (Cloudflare now supports unlimited KV keys?)
- Add self-destroy functionality (destroy on expiry)