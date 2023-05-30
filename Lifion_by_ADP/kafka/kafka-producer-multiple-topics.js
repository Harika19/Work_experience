const { Kafka } = require('kafkajs');
const Errors = require('ohcm-errors');

class KafkaProducer {
    constructor(config = {}) {
        this.kafkaConfig = config.kafka;
        this.topic = config.topic;
        this.validate();
        this.client = new Kafka(this.kafkaConfig);
        this.producer = null;
    }

    validate() {
        if (!this.kafkaConfig || !this.kafkaConfig.brokers) {
            throw new Error('Missing broker configuration');
        }
        if (!this.topic) {
            throw new Error('Missing topic');
        }
    }

    async topicList() {
        const adminClient = this.client.admin();
        await adminClient.connect();
        const existingTopics = await adminClient.listTopics();
        console.log('ttttttttt', existingTopics);
    }

    async connect() {
        this.producer = this.client.producer({ allowAutoTopicCreation: true });
        await this.producer.connect();
    }

    async sendMessage(messages) {
        await this.producer.send({ topic: this.topic, messages: JSON.Stringify(messages) });
    }

    async sendBatchhhh(topicMessages) {
        console.log('ttttttopic', topicMessages);
        const b = await this.producer.sendBatch({ topicMessages });
        console.log('bbbbbb', b);
    }

    async disconnect() {
        await this.producer.disconnect();
    }
}

async function TestProducer() {
    const config = {
        topic: 'business-events-testa',
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
        }
    };
    const topicMessages = [
        {
            topic: 'business-events-testa',
            messages: [{ key: 'key3', value: 'yayy testt 11' }],
        },
        {
            topic: 'business-events-test4',
            messages: [{ key: 'key2', value: 'yayyy testt 22' }],
        },
        {
            topic: 'business-events-testb',
            messages: [{ key: 'key4', value: 'yayyy testt 22' }],
        }
    ];
    const producer = new KafkaProducer(config);
    await producer.connect();
    //await producer.topicList();
    const startTime = Date.now();
    // multiple topics

    const result = await producer.sendBatchhhh(topicMessages);
    await producer.topicList();
    console.log('batchh msgg end time', Date.now() - startTime, result);
    //await producer.disconnect();
    console.log('yummmm');
}

TestProducer().then(result => console.log('completed', result)).catch(error => console.log(error));