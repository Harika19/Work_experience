const Redis = require('ioredis');
const { redis } = require('../constants');

class RedisClient {
  constructor(config) {
    this.clusterNodes = config.clusterNodes;
    this.clusterOpts = config.clusterOpts;
    this.connectTimeout = config.connectTimeout || 3000;
    this.maxRetriesPerRequest = config.maxRetriesPerRequest || 3;
    this.client = null;
  }

  async getHealth() {
    return this.client.ping();
  }

  async getClient() {
    await this.connect();
    return this.client;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }
    this.client = new Redis.Cluster(this.clusterNodes, this.clusterOpts);
    this.health = true;
    return this.client;
  }

  async findKey(key) {
    try {
      const client = await this.getClient();
      const value = await client.keys(key);
      return value;
    } catch (err) {
      throw err;
    }
  }

  async isMigrationStarted(clientId) {
    try {
      const { clusterOpts: { keyPrefix } } = redis;
      const redisKey = `${keyPrefix}${clientId}:migration:*`;
      const findRedisKey = await this.findKey(redisKey);
      const shardName = findRedisKey[0].split(':')[3];
      if (findRedisKey.length) {
        return shardName;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async disconnect() {
    return this.client.disconnect();
  }
}

module.exports = RedisClient;
