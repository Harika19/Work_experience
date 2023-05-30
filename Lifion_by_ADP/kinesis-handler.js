const Kinesis = require('@lifion/kinesis');
const Errors = require('ohcm-errors');
const { errorCodes } = require('../constants');

const { KINESIS_ERROR } = errorCodes;

class KinesisHandler {
  constructor(config, listener, errorListener) {
    this.listener = listener;
    this.errorListener = errorListener;
    this.stream = config.stream;
    this.workstream = config.workstream;
    this.operationType = config.operationType || 'subscribe';
    this.useAutoShardAssignment = config.useAutoShardAssignment;
    this.usePausedPolling = config.usePausedPolling;
    this.useAutoCheckpoints = config.useAutoCheckpoints;
    this.client = new Kinesis({
      streamName: this.stream,
      useAutoShardAssignment: this.useAutoShardAssignment,
      workstream: this.workstream,
    });
  }

  async startConsumer() {
    if (this.operationType !== 'subscribe' && this.operationType !== 'both') {
      throw new Errors({ message: `Operation type not supported ${this.operationType}` });
    }
    if (!(this.listener instanceof Function && this.errorListener instanceof Function)) {
      throw new Errors({ message: 'No listener found' });
    }
    try {
      this.client.on('data', ({ records, setCheckpoint, shardId }) => this.listener({
        records,
        setCheckpoint,
        shardId,
      }));
      this.client.on('error', error => this.errorListener(error));
      return this.client.startConsumer();
    } catch (error) {
      throw new Errors({
        code: KINESIS_ERROR.KINESIS_CONNECTION_FAILED,
        message: 'Failed to connect sqs consumer',
        details: this.messageObject('connect', 'failed', null),
      }).append(error);
    }
  }

  async getListOfShards() {
    return this.client.listShards();
  }

  checkHealth() {
    return this.client.getHealth();
  }

  publishMessage(records) {
    if (this.operationType !== 'publish' && this.operationType !== 'both') {
      throw new Errors({ message: `Operation type not supported ${this.operationType}` });
    }
    const messages = { records };
    return this.client.putRecords(messages);
  }

  async stopConsumer() {
    return this.client.stopConsumer();
  }

  messageObject(operationType, status, additionalInfo) {
    return {
      workstream: this.workstream,
      topic: this.topic,
      operationType,
      status,
      additionalInfo,
    };
  }
}

module.exports = KinesisHandler;
