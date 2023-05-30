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
        this.adminClient = this.client.admin();
        this.isConnected = false;
    }

    validate() {
        if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
            throw new Errors('Missing broker configuration');
        }
        if (!this.topic) {
            throw new Errors('Missing topic');
        }
    }

    async topicList() {
        await this.adminClient.connect();
        const existingTopics = await this.adminClient.listTopics();
        return existingTopics;
    }

    async connect() {
        try {
            const { CONNECT, DISCONNECT } = this.producer.events;
            this.producer.on(CONNECT, (e) => { console.log('Connected to kafka producer sucessfully', e); this.isConnected = true; });
            this.producer.on(DISCONNECT, (e) => { console.log('Disconnected to kafka producer', e); this.isConnected = false; });
            if (!this.isConnected) await this.producer.connect();


            console.log('Connected to kafka producer sucessfully..');
        } catch (error) {
            // const ohcmError = new Errors({
            //     code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
            //     message: 'Failed to connect to kafka producer',
            // }).append(error);
            throw error;
        }
    }

    checkMessageFormat(topicMessages) {
        topicMessages.forEach((topicMessage) => {
            if (!topicMessage.topic) throw new Errors("topic is missing ..");
            topicMessage.messages.forEach(message => {
                if (!(message.key || message.value)) {
                    throw new Errors(" invalid message format..");
                }
            })
        })
    }

    async sendMessage(topic, messages) {
        try {
            if (!topic && !this.topic) {
                throw new Errors({ message: 'No topic found' });
            }
            messages.forEach(message => {
                const { key, value: bufferData } = message;
                if (!(key && bufferData)) {
                    throw new Errors(" invalid message format..");
                }
                console.log(`key of produced message: ${key.toString()}`);
            });
            const data = await this.producer.send({
                topic: (topic ? topic : this.topic),
                messages
            });
            const [{ baseOffset, partition }] = data;
            console.log(`${topic} is produced with offset ${baseOffset} and partition ${partition}`);
        } catch (error) {
            // const ohcmError = new Errors({
            //     code: KAFKA_ERROR.KAFKA_CANNOT_SEND_MESSAGE,
            //     message: 'Failed to send message',
            // }).append(error);
            throw error;
        }
    }

    async sendToMultipleTopics(topicMessages) {
        try {
            this.checkMessageFormat(topicMessages);
            await this.producer.sendBatch({ topicMessages });
            console.log('sucessfully sent messages to multiple topics');
        } catch (error) {
            console.log('errrrr', error);
            // const ohcmError = new Errors({
            //     code: KAFKA_ERROR.KAFKA_CANNOT_SEND_MESSAGE,
            //     message: 'Failed to send messages to multiple topics',
            // }).append(error);
            throw error;
        }
    }

    async disconnect() {
        await this.producer.disconnect();
    }
}

//module.exports = { dependency, KafkaProducer };


async function TestProducer() {
    const config = {
        topic: 'business-events-test',
        kafka: {
            clientId: "lifion--business-events-producer",
            ssl: true,
            brokers: [
                'b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094',
                'b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094'
            ],
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        },
    }
    const producer = new KafkaProducer(config);
    await producer.connect();
    await producer.topicList();
    //const startTime = Date.now();
    // multiple topics
     /*const topicMessages = [
         {
           topic: 'business-events-testa',
           messages: [{ key: 'key3', value: 'yayy testt 1' }],
         },
         {
           topic: 'business-events-testb',
           messages: [{ key: 'key2', value: 'yayyy testt 2' }],
         },
         {
           topic: 'business-events-test4',
           messages: [
             {
               key: 'key1',
               value: 'hello yayy testt 3',
             }
           ],
         }
       ];
       const result = await producer.sendToMultipleTopics(topicMessages);*/

  //* const mymessages = [{ key: `message_id=${1 + 1}`, value: 'single messageee one' }, { key: `message_id=${1 + 1}`, value: 'single messageee twooo' }];
    //  console.log('typeeeee', typeof(mymessages));
  // *const result = await producer.sendMessage('business-events-test4', (mymessages));
   // const result = await producer.sendMessage('business-event-topic-manager', [{ key: 'new_topic4', value: JSON.stringify({ topic: 'business-events-test-test7' }) }]);
    //*console.log('message end time', Date.now() - startTime, result);
   // const r = await producer.topicList();
   // console.log('topicsss', r)

    // console.log('batchh msgg end time', Date.now()-startTime, result);
    //await producer.disconnect();
}

TestProducer().then(result => console.log('completed', result)).catch(error => console.log(error));
