import { LRUCache } from 'lru-cache';

export const recordCache = new LRUCache<string, Buffer>({
  max: 500, // max 500 records
  ttl: 1000 * 60 * 60 * 24, // 24 hours ttl
});
