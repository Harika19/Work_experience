/* eslint-disable class-methods-use-this */
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

class KafkaProducer {
  constructor(config = {}) {
    this.kafkaConfig = config.kafka;
    this.topic = config.topic;
    this.validate();
    this.client = new Kafka(this.kafkaConfig);
    this.producer = this.client.producer();
    this.isConnected = false;
  }

  validate() {
    if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
      throw new Errors('Missing broker configuration');
    }
  }

  async connect() {
    try {
      const { CONNECT, DISCONNECT } = this.producer.events;
      this.producer.on(CONNECT, (e) => { logger.info('Producer connected to kafka sucessfully', e); this.isConnected = true; });
      this.producer.on(DISCONNECT, (e) => { logger.info('Producer disconnected to kafka', e); this.isConnected = false; });
      if (!this.isConnected) await this.producer.connect();
    } catch (error) {
      const ohcmError = new Errors({
        code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
        message: 'Producer failed to connect kafka',
      }).append(error);
      throw ohcmError;
    }
  }

  checkMessageFormat(topicMessages) {
    topicMessages.forEach((topicMessage) => {
      if (!topicMessage.topic) throw new Errors('topic is missing ..');
      topicMessage.messages.forEach((message) => {
        if (!(message.key || message.value)) {
          throw new Errors('invalid message format..');
        }
      });
    });
  }

  async sendMessage(topic, messages, isMessageKeyRequired = true, acks = 1) {
    if (!topic) {
      throw new Errors({ message: 'No topic found' });
    }
    messages.forEach((message) => {
      const { key, value: bufferData } = message;
      const condition = isMessageKeyRequired ? !(key && bufferData) : !bufferData;
      if (condition) {
        throw new Errors('invalid message format..');
      }
      if (key) logger.info(`key of produced message: ${key.toString()}`);
    });
    const data = await this.producer.send({
      topic,
      messages,
      acks,
    });
    const [{ baseOffset, partition }] = data;
    logger.info(`${topic} is produced with offset ${baseOffset} and partition ${partition}`);
  }

  async sendToMultipleTopics(topicMessages) {
    try {
      this.checkMessageFormat(topicMessages);
      await this.producer.sendBatch({ topicMessages });
      logger.info('sucessfully sent messages to multiple topics');
    } catch (error) {
      const ohcmError = new Errors({
        code: KAFKA_ERROR.KAFKA_CANNOT_SEND_MESSAGE,
        message: 'Failed to send messages to multiple topics',
      }).append(error);
      throw ohcmError;
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

module.exports = { dependency, KafkaProducer };
