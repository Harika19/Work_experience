/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable  object-curly-newline */
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
/* Default kafka consumer values */
const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 Minutes
const HEARTBEAT_INTERVAL = 15 * 1000; // 15 Seconds
const MAX_BYTES_PER_PARTITION = 500000; // 0.5 MB

class KafkaConsumer {
  constructor(config = {}) {
    this.kafkaConfig = config.kafka;
    this.topic = config.topic;
    this.consumerGroupId = config.groupId;
    this.sessionTimeout = config.sessionTimeout;
    this.heartbeatInterval = config.heartbeatInterval;
    this.maxBytesPerPartition = config.maxBytesPerPartition;
    this.validate();
    this.client = new Kafka(this.kafkaConfig);
    this.consumer = this.client.consumer({
      groupId: this.consumerGroupId,
      sessionTimeout: this.sessionTimeout || SESSION_TIMEOUT,
      heartbeatInterval: this.heartbeatInterval || HEARTBEAT_INTERVAL,
      maxBytesPerPartition: this.maxBytesPerPartition || MAX_BYTES_PER_PARTITION,
      maxInFlightRequests: 50,
    });
    this.messageHandler = config.messageHandler;
    this.waitToAddTopic = false;
    this.isStopped = true;
    this.isConnected = false;
    this.processMethod = 'batch';
    this.fromBeginning = config.fromBeginning !== false;
  }

  validate() {
    if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
      throw new Error('Missing broker configuration');
    }
    if (!this.consumerGroupId) {
      throw new Error('Missing consumer group id');
    }
  }

  async connect() {
    try {
      const {
        STOP, CONNECT, DISCONNECT,
      } = this.consumer.events;
      this.consumer.on(STOP, (e) => { logger.info(e); this.isStopped = true; });
      this.consumer.on(CONNECT, (e) => { logger.info('Consumer connected to kafka sucessfully', e); this.isConnected = true; });
      this.consumer.on(DISCONNECT, (e) => { logger.info('Consumer disconnected to kafka', e); this.isConnected = false; });
      // this.consumer.on(HEARTBEAT, (e) => { logger.info('HEARTBEAT for kafka consumer', e); });
      if (!this.isConnected) await this.consumer.connect();
      if (this.topic) await this.consumer.subscribe({ topic: this.topic, fromBeginning: this.fromBeginning });
    } catch (error) {
      const ohcmError = new Errors({
        code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
        message: 'Consumer failed to connect kafka',
      }).append(error);
      throw ohcmError;
    }
  }

  async _addTopics({ pattern, topic }) {
    if (pattern) {
      await this.consumer.subscribe({ topic: `/${pattern}.*/i`, fromBeginning: this.fromBeginning });
    } else {
      await this.consumer.subscribe({ topic, fromBeginning: this.fromBeginning });
    }
    await this.consume(this.processMethod);
  }

  async subscribeTopic({ pattern, topic }, status = 'notStopped') {
    if (status === 'notStopped') await this.consumer.stop();
    if (this.isStopped === true) {
      await this._addTopics({ pattern, topic });
      this.isStopped = false;
    } else {
      this.subscribeTopic({ pattern, topic }, 'pending');
    }
  }

  async consume(type = 'batch', force = false) {
    if (force === true) await this.consumer.stop();
    if (type === 'batch') {
      await this._batchListener();
    } else {
      await this._listener();
    }
    this.processMethod = type;
  }

  async topicsubscription(topic) {
    await this.consumer.subscribe({ topic, fromBeginning: this.fromBeginning });
    logger.info(`Consumer subscribed to ${topic} sucessfully ..`);
  }

  checkMessageFormat(message) {
    const { key, value: bufferData } = message;
    if (!key.toString()) {
      throw new Errors('key is missing');
    } else if (!bufferData.toString()) {
      throw new Errors('value is missing');
    }
  }

  async _batchListener() {
    try {
      await this.consumer.run({
        eachBatchAutoResolve: true,
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) =>
          this.messageHandler({ batch, resolveOffset, heartbeat, isRunning, isStale }) });
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Error while listening to batch of messsages',
      }).append(error);
      throw ohcmError;
    }
  }

  async _listener() {
    try {
      await this.consumer.run({ eachMessage: async ({ topic, message, partition }) => this.messageHandler({ topic, partition, message }) });
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Error while listening to messsage',
      }).append(error);
      throw ohcmError;
    }
  }

  async readFromOffset(topic, offset) {
    await this.consumer.seek({ topic, partition: 0, offset });
  }

  async fetchOffset(groupId, topic) {
    await this.adminClient.fetchOffsets({ groupId, topic });
  }

  async getConsumerGroupDetail() {
    return this.consumer.describeGroup();
  }

  async getConsumer() {
    return this.consumer;
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}

module.exports = { dependency, KafkaConsumer };
