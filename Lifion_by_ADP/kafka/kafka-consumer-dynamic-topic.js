const { Kafka } = require('kafkajs');
const bluebird = require("bluebird");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// batch counnt = 100 , ??
class KafkaProducer {
    constructor(config = {}) {
        this.kafkaConfig = config.kafka;
        this.validate();
        this.client = new Kafka(this.kafkaConfig);
        this.producer = null;

    }

    validate() {
        if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
            throw new Errors('Missing broker configuration');
        }
    }

    async connect() {
        try {
            this.producer = this.client.producer();//{ allowAutoTopicCreation: true }
            await this.producer.connect();
            console.log('Connected to kafka sucessfully..');
        } catch (error) {
            throw new Errors('Failed to connect to kafka producer', error);
        }
    }

    async sendMessage(topic, messages) {
        try {
            if (!topic && !this.topic) {
                throw new Errors({ message: 'No topic found' });
            }
            const data = await this.producer.send({ topic, messages });
            return data;
        } catch (error) {
            throw new Errors('Failed to send message', error);
        }
    }

    async sendBatchOfMessages(topicMessages) {
        try {
            if (!topicMessages) {
                throw new Errors({ message: 'No topic found' });
            }
            await this.producer.sendBatch({ topicMessages });
        } catch (error) {
            throw new Errors('Failed to send messages in bulk', error);
        }
    }

    async disconnect() {
        await this.producer.disconnect();
    }
}

class KafkaConsumer {
    constructor(config = {}) {
        this.kafkaConfig = config.kafka;
        this.topic = config.topic;
        this.consumerGroupId = config.groupId;
        this.client = new Kafka(this.kafkaConfig);
        this.consumer = null;
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
        this.consumer = this.client.consumer({
            groupId: this.consumerGroupId,
            maxInFlightRequests: 50,
        });
        console.log('eeeeee', this.consumer.events);
        const { STOP, HEARTBEAT, RECEIVED_UNSUBSCRIBED_TOPICS, CONNECT, DISCONNECT } = this.consumer.events;
        this.consumer.on(STOP, (e) => { console.log(e); this.isStoped = true; });
        this.consumer.on(CONNECT, (e) => { console.log(e); this.isConnected = true; });
        this.consumer.on(DISCONNECT, (e) => { console.log(e); this.isConnected = false; });
       // this.consumer.on(HEARTBEAT, (e) => { console.log(e); });
       // this.consumer.on(RECEIVED_UNSUBSCRIBED_TOPICS, (e) => { console.log(e); });
       if(this.isConnected) await this.consumer.connect();
        //await this.consumer.subscribe({ topic: this.topic });
    }

    async addTopics({ pattern, topic }) {
        console.log('111111')
        if (pattern) {
            await this.consumer.subscribe({ topic: "/" + pattern + ".*/i" });
        } else {
            await this.consumer.subscribe({ topic });
        }
        await this.consume(this.processMethod);
    }

    async subscribeTopic({ pattern, topic }, status = 'notStopped') {
        console.log('22222')
        if (status === 'notStopped') await this.consumer.stop();
        if (this.isStoped === true) {
            await this.addTopics({ pattern, topic });
            this.isStoped === false
        } else {
            this.subscribeTopic({ pattern, topic }, 'pending');
        }
    }

    async consume( type = 'batch', force = false) {
        console.log('333333')
        if (force === true) await this.consumer.stop();
        if (type === 'batch') {
            await this._batchListener();
        } else {
            await this._listener();
        }
        this.processMethod = type;
    }

    async _batchListener() {
        await this.consumer.run({
            eachBatchAutoResolve: false,
            eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
                const { topic, partition } = batch;
                console.log('batch size :', batch.messages.length);
                for (let message of batch.messages) {
                    if (!isRunning() || isStale()) break
                    await this.messageHandler(topic, partition, message);
                    resolveOffset(message.offset);
                    await heartbeat();
                }
            },
        });
        this.isStoped = false;
    }
    async _listener() {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, message, partition }) => {
                    const { key, offset, value: bufferData } = message
                    const size = bufferData && bufferData.length;
                    logger.info(`Message received from topic ${topic} with key: ${key},
                    offset:${offset}, partition:${partition}, size:${size}`);
                }
            });
        } catch (error) {
            const ohcmError = new Errors({
                message: 'Error while listening to messsage',
            }).append(error);
            throw ohcmError;
        }
    }

    async getConsumerGroupDetail() {
        return this.consumer.describeGroup();
    }

    async disconnect() {
        await this.consumer.disconnect();
    }

    async getConsumer() {
        return this.consumer;
    }
}

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
        topic: 'business-events-test3',
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
    await consumer.startConsume();
    const consumer1 = new KafkaConsumer(config1);
    await consumer1.connect();
    await consumer1.startConsume();
    const producer = new KafkaProducer(config);
    await producer.connect();
    const promistArray = [];
    const otherArray = [];
    for (let i = 1; i <= 10; i++) {
        const mymessages = [{ key: `message_id=${i + 1}`, value: JSON.stringify({ name: 'producer testt', id: i + 1 }) }];
        promistArray.push(producer.sendMessage('business-events-test3', mymessages));

        if (i === 5) {
            await producer.sendMessage('business-event-topic-manager', [{ key: 'new_topic1', value: JSON.stringify({ topic: 'business-events-test5' }) }]);
        }
        if (i === 7) {
            await producer.sendMessage('business-event-topic-manager', [{ key: 'new_topic2', value: JSON.stringify({ topic: 'business-events-test4' }) }]);
        }

        if (i >= 5) {
            const mymessages1 = [{ key: `message_id=${i + 1}`, value: JSON.stringify({ name: 'new topic test', id: i + 1 }) }];
            otherArray.push(producer.sendMessage('business-events-test5', mymessages1));
        }
        if (i >= 7) {
            const mymessages2 = [{ key: `message_id=${i + 1}`, value: JSON.stringify({ name: 'additional topic test', id: i + 1 }) }];
            otherArray.push(producer.sendMessage('business-events-test4', mymessages2));
        }
    }
    await Promise.all(promistArray);
    await Promise.all(otherArray);
    // console.log('waiting period')
    // await timeout(50000);
    // console.log('consumer going to disconnect --- consumer');
    // await consumer.disconnect();
    // console.log('consumer going to disconnect --- consumer1');
    // await consumer1.disconnect();
    console.log('done');
    return 'done';
}


TestConsumer().then(result => console.log(result)).catch(error => console.log(error));
