import Redis from "ioredis";

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: "cache:"
    });
  }

  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), "EX", 60 * 60 * 24);
  }
  async get(key) {
    const cashed = await this.redis.get(key);

    return cashed ? JSON.parse(cashed) : null;
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    const keys = await this.redis.keys(`cache:${prefix}:*`);

    const keyWithoutPrefix = keys.map(key => key.replace("cache:", ""));

    return this.redis.del(keyWithoutPrefix);
  }
}

export default new Cache();
