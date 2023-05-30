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
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class KafkaConsumer {
    constructor(config = {}) {
        this.kafkaConfig = config.kafka;
        this.topic = config.topic;
        this.consumerGroupId = config.groupId;
        this.client = new Kafka(this.kafkaConfig);
        this.consumer = this.client.consumer({
            groupId: this.consumerGroupId,
            maxInFlightRequests: 50,
        });
       // this.adminClient = this.client.admin();
        this.messageHandler = config.messageHandler;
        this.validate();
        this.waitToAddTopic = false;
        this.isStoped = true;
        this.isConnected = false;
        this.processMethod = 'batch';
    }

    validate() {
        if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
            throw new Error('Missing broker configuration');
        }
        if (!this.topic) {
            throw new Error('Missing topic');
        }
        if (!this.consumerGroupId) {
            throw new Error('Missing consumer group id');
        }
    }

    async connect() {
        try {
            const { STOP, CONNECT, DISCONNECT } = this.consumer.events;
            this.consumer.on(STOP, (e) => { console.log(e); this.isStoped = true; });
            this.consumer.on(CONNECT, (e) => { console.log('Connected to kafka consumer sucessfully!!!',e); this.isConnected = true; });
            this.consumer.on(DISCONNECT, (e) => { console.log('Disconnected to kafka consumer',e); this.isConnected = false; });
            if (!this.isConnected)  await this.consumer.connect();
            
        } catch (error) {
            const ohcmError = new Errors({
                code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
                message: 'Failed to connect to kafka consumer',
            }).append(error);
            throw ohcmError;
        }
    }

    async _addTopics({ pattern, topic }) {
        if (pattern) {
            await this.consumer.subscribe({ topic: "/" + pattern + ".*/i" });
        } else {
            await this.consumer.subscribe({ topic });
        }
        await this.consume(this.processMethod);
    }

    async subscribeTopic({ pattern, topic }, status = 'notStopped') {
        if (status === 'notStopped') await this.consumer.stop();
        if (this.isStoped === true) {
            await this._addTopics({ pattern, topic });
            this.isStoped === false
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
        await this.consumer.subscribe({ topic });
        console.log(`Subscribed to ${topic} sucessfully ..`);
    }

    async topicList() {
        await this.adminClient.connect();
        const existingTopics = await this.adminClient.listTopics();
        return existingTopics;
    }

    checkMessageFormat(message) {
        const { key, value: bufferData} = message;
        if(!key){
            throw new Errors("key is missing");
        }else if(!bufferData.toString()){
            throw new Errors("value is missing");
        }
    }

     async _batchListener() {
        try {
            await this.consumer.run({
                eachBatchAutoResolve: true,
                eachBatch: async ({
                    batch,
                    resolveOffset,
                    heartbeat,
                    isRunning,
                    isStale
                }) => {
                    const { topic, partition } = batch;
                    console.log('batch size:', batch.messages.length);
                    for (let message of batch.messages) {
                        if (!isRunning() || isStale()) break
                        this.checkMessageFormat(message);
                        await this.messageHandler(topic, partition, message);
                        resolveOffset(message.offset);
                        await heartbeat();
                    }
                },
            });
        } catch (error) {
            const ohcmError = new Errors({
                message: 'Error while listening to batch of messsages',
            }).append(error);
            throw ohcmError;
        }
    }
    //if already _batchListener then dont allow _listener;
     async _listener() {
        try {
            if(this.processMethod === 'batch') return;
            await this.consumer.run({
                eachMessage: async ({ topic, message, partition }) => {
                    this.checkMessageFormat(message);
                    const { key, offset, value: bufferData } = message
                    const size = bufferData && bufferData.length;
                    console.log(`Message received from topic ${topic} with key: ${key},
                    offset:${offset}, partition:${partition}, size:${size}`);
                    await this.messageHandler(topic, partition, message);
                }
            });
        } catch (error) {
            const ohcmError = new Errors({
                message: 'Error while listening to messsage',
            }).append(error);
            throw ohcmError;
        }
    }

    async readFromOffset(topic, offset) {
        return this.consumer.seek({ topic, partition: 0, offset });
        // return u;
    }

    async fetchOffset(groupId, topic) {
         await this.adminClient.fetchOffsets({groupId, topic}); 
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

//module.exports = { dependency, KafkaConsumer };


function messageProcesser(topic, partition, message) {
    console.log('messageProcesser', {
        topic: topic,
        partition: partition,
        message: {
            offset: message.offset,
            key: message.key.toString(),
            value: message.value.toString(),
            headers: message.headers,
        }
    });
}

let consumer;

async function topicmessagehandler(topic, partition, message) {
    console.log('topicmessagehandler', {
        topic: topic,
        partition: partition,
        message: {
            offset: message.offset,
            key: message.key.toString(),
            value: message.value.toString(),
            headers: message.headers,
        }
    });
    try {
        const newTopic = JSON.parse(message.value).topic;
        await consumer.subscribeTopic({ topic: newTopic });
        console.log('topic added:  ', newTopic);
    } catch (error) {
        console.log('subscribe error', error);
    }

}

async function TestConsumer() {
    const config = {
        topic: 'business-events-testa',
        groupId: 'business-events-testGroup',
        kafka: {
            clientId: "lifion--business-events-consumer",
            ssl: true,
            brokers: [
                'b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094',
                'b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094'
            ]
        },
        messageHandler: messageProcesser
    }
    const config1 = {
        topic: 'business-event-topic-manager',
        groupId: 'business-events',
        kafka: {
            clientId: "lifion--business-events-consumer",
            ssl: true,
            brokers: [
                'b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094',
                'b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094'
            ]
        },
        messageHandler: topicmessagehandler
    }
    consumer = new KafkaConsumer(config);
    await consumer.connect();
    await consumer.topicsubscription('business-events-testa');
    await consumer.topicsubscription('business-events-testb');
    await consumer.topicsubscription('business-events-test4');
    await consumer.topicsubscription('business-events-test3');
    
    await consumer.consume();
    const consumer1 = new KafkaConsumer(config1);
    await consumer1.connect();
    await consumer1.topicsubscription('business-event-topic-manager');
    await consumer1.consume();
    
    // console.log('consumer going to disconnect --- consumer');
     //await consumer.disconnect();
    // console.log('consumer going to disconnect --- consumer1');
     //await consumer1.disconnect();
    console.log('done');
    return 'done';
}


TestConsumer().then(result => console.log(result)).catch(error => console.log(error));
