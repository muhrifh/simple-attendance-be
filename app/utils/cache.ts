import { LRUCache } from 'lru-cache'

const options = {
    max: 500,
  
    // for use with tracking overall storage size
    maxSize: 5000,
    sizeCalculation: (value :any, key : any) => {
      return 1
    },
  
    // for use when you need to clean up something when objects
    // are evicted from the cache
    dispose: (value :any, key:any) => {
      // freeFromMemoryOrWhatever(value)
    },
  
    // how long to live in ms
    ttl: 1000 * 60 * 2,
  
    // return stale items before removing from cache?
    allowStale: false,
  
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  
    // async method to use for cache.fetch(), for
    // stale-while-revalidate type of behavior
    fetchMethod: async (
      key:any,
      staleValue:any,
      { options, signal, context }
    ) => {},
  }
  
  export const cache = new LRUCache(options)