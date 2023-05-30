/* eslint-disable no-underscore-dangle */
const { Kafka } = require('kafkajs');
const Logger = require('@lifion/logger');
const { name, version } = require('../../package.json');
const Errors = require('ohcm-errors');
const { errorCodes } = require('../constants');

const { KAFKA_ERROR } = errorCodes;

const logger = new Logger({
  filename: __filename,
  name,
  version,
});
const dependency = { logger };

class KafkaAdmin {
  constructor(config = {}) {
    this.kafkaConfig = config.kafka;
    this.validate();
    this.client = new Kafka(this.kafkaConfig);
    this.adminClient = this.client.admin();
    this.isConnected = false;
    this.defaultPartition = 2;
    this.defaultReplicationFactor = this.kafkaConfig.brokers.length || 2;
  }

  validate() {
    if (!this.kafkaConfig || !this.kafkaConfig.brokers || !this.kafkaConfig.brokers.length) {
      throw new Error('Missing broker configuration');
    }
  }

  async connect() {
    try {
      const { CONNECT, DISCONNECT } = this.adminClient.events;
      this.adminClient.on(CONNECT, (e) => { logger.info('Admin connected to kafka successfully', e); this.isConnected = true; });
      this.adminClient.on(DISCONNECT, (e) => { logger.info('Admin disconnected to kafka', e); this.isConnected = false; });
      if (!this.isConnected) await this.adminClient.connect();
    } catch (error) {
      const ohcmError = new Errors({
        code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
        message: 'Admin failed to connect kafka',
      }).append(error);
      throw ohcmError;
    }
  }

  async getTopicList() {
    const existingTopics = await this.adminClient.listTopics();
    return existingTopics;
  }

  async createTopic(topicParams = []) {
    try {
      const topics = topicParams.map(param => ({
        topic: param.topic,
        numPartitions: param.numPartitions || this.defaultPartition,
        replicationFactor: param.replicationFactor || this.defaultReplicationFactor,
      }));
      const result = await this.adminClient.createTopics({
        topics,
      });
      return result;
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Failed to create topics',
      }).append(error);
      throw ohcmError;
    }
  }

  async deleteTopic(topics) {
    try {
      await this.adminClient.deleteTopics({
        topics,
      });
    } catch (error) {
      if (error.originalError && error.originalError.type === 'UNKNOWN_TOPIC_OR_PARTITION') return;
      const ohcmError = new Errors({
        message: 'Failed to detele topics',
      }).append(error);
      throw ohcmError;
    }
  }

  async groupList() {
    const existingGroups = await this.adminClient.listGroups();
    return existingGroups;
  }

  async fetchTopicOffset(topic) {
    try {
      const recentOffset = await this.adminClient.fetchTopicOffsets(topic);
      return recentOffset;
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Error fetchig offset for the given topic',
      }).append(error);
      throw ohcmError;
    }
  }

  async getConsumerGroup(groupIds) {
    const consumerGroupDetails = await this.adminClient.describeGroups(groupIds);
    return consumerGroupDetails;
  }

  async fetchTopicsMetadata(topics) {
    try {
      const topicMetadata = await this.adminClient.fetchTopicMetadata({ topics });
      return topicMetadata;
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Error fetchig metadata for the given topic',
      }).append(error);
      throw ohcmError;
    }
  }

  async disconnect() {
    await this.adminClient.disconnect();
  }
}

module.exports = { dependency, KafkaAdmin };
