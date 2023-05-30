const { Kafka } = require('kafkajs');
const Errors = require('ohcm-errors');

class KafkaAdmin {
    constructor(config = {}) {
        this.kafkaConfig = config.kafka;
        this.topic = config.topic;
        this.consumerGroupId = config.groupId;
        this.client = new Kafka(this.kafkaConfig);
        this.adminClient = this.client.admin();
        this.isConnected = false;
    }

    async connect() {
      try {
          const { CONNECT, DISCONNECT } = this.adminClient.events;
          this.adminClient.on(CONNECT, (e) => { console.log('Connected to kafka admin sucessfully!!!',e); this.isConnected = true; });
          this.adminClient.on(DISCONNECT, (e) => { console.log('Disconnected to kafka admin',e); this.isConnected = false; });
          if (!this.isConnected)  await this.adminClient.connect();
          
      } catch (error) {
          const ohcmError = new Errors({
              code: KAFKA_ERROR.KAFKA_CONNECTION_FAILED,
              message: 'Failed to connect to kafka admin',
          }).append(error);
          throw ohcmError;
      }
  }

    async topicList() {
        const existingTopics = await this.adminClient.listTopics();
        return existingTopics;
    }

    async createTopic(topicName) {
        const result = await this.adminClient.createTopics({ 
            topics: [
              {topic: topicName}
            ]
           /* topics: [
                { topic: 'business-events-test-demo1' },
                //{ topic: 'business-events-testb13' },
                //{ topic: 'business-event-topic-manager' },
                //{ topic: 'business-events-test4' },
            ]*/
        });
        console.log('ccccc',result);
    }

    async createTopic1(topicName) {
      for(let i =0; i <topicName.length; i++){
        await this.adminClient.createTopics({ 
          topics: [
            {topic: topicName[i]}
          ]
        });
      }
      //console.log('ccccc',result);
  }
 // add logs if already exists , failed ...
      // add try , catch-return obj-topic, status, message/err of each topic
  async createTopic2(topicName = []) {
    try{
      let topics = [];
   
    topics = topicName.map(element => ({topic : element}));
     const result = await this.adminClient.createTopics({ 
        topics,
    });
    return result;
    }catch(err){
      console.log('checkkkkkk', err);
      const ohcmError = new Errors({
        message: 'Failed to detele topics',
      }).append(error);
      
      throw ohcmError;
    }
    
}

    async deleteTopic(topics) {
      try{
        await this.adminClient.deleteTopics({
          topics
      });
      

      }catch(error){
        console.log('rrrrr', error)
        if(error.originalError && error.originalError.type === 'UNKNOWN_TOPIC_OR_PARTITION') return;
          const ohcmError = new Errors({
            message: 'Failed to detele topics',
          }).append(error);
          throw ohcmError;
      
      }
        
    }
    
   
    async deleteTopic1(topics) {
      let listOfTopics = await this.topicList();
      console.log(listOfTopics);
      listOfTopics= listOfTopics.filter(topic => topics.includes(topic));
      console.log('oooooo', listOfTopics);
       await this.adminClient.deleteTopics({
         topics: listOfTopics
      });
  }
  async deleteTopicO(topics) {

    // use fetchTopicMetadata not  getTopicList
    let listOfTopics = await this.getTopicList();
   
    listOfTopics = listOfTopics.filter(topic => topics.includes(topic));
    await this.adminClient.deleteTopics({
      topics: listOfTopics,
    });
  }

    async groupList() {
        const existingGroups = await this.adminClient.listGroups();
        return existingGroups;  
    }
//try-catch needed
    async fetchTopicOffset(topic) {
        const fetchTopicOffsettt = await this.adminClient.fetchTopicOffsets(topic);
        
        return fetchTopicOffsettt;
    }
//no need
    async getConsumerGroup(grp) {
        const result = await this.adminClient.describeGroups(grp);
        return result;
    }
//needed
    async fetchTopicMetadataa(ar){
      const res = await this.adminClient.fetchTopicMetadata({topics: ar});
      return res;
  }

    async disconnect() {
      await this.adminClient.disconnect();
  }

}
async function testAdmin() {
    const config = {
        topic: 'business-events-test-111',
        groupId: 'business-events-fanout',
        kafka: {
            clientId: "lifion--business-events-admin",
            ssl: true,
            brokers: [
                'b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094',
                'b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9094'
            ]
        }
    }
 
    const kafkaAdmin = new KafkaAdmin(config);
   await kafkaAdmin.connect();
   /*const topicName = ['topic-demo-1', 'topic-demo-2','topic-demo-3', 'topic-demo-4'];
   const res = await kafkaAdmin.createTopic2(topicName);
    console.log('createTopic2', res);
    const topicn = ['business-events-test','business-events-test4'];
    const r = await kafkaAdmin.fetchTopicMetadataa(topicn);
    console.log('fetchTopicMetadataa', JSON.stringify(r, null,2));*/

  /*const topics = ['topic-demo-2','topic-demo-3'];
   await kafkaAdmin.deleteTopic(topics);*/
   const list = await kafkaAdmin.topicList();
    console.log('list of topics',list)
   /*const grp = ['business-events-testGroup', 'business-events-fanout'];
   const a = await kafkaAdmin.getConsumerGroup(grp);
    console.log('getConsumerGroup', a);
    const a1 = await kafkaAdmin.groupList();
    console.log('groupList', a1);
    const a2 = await kafkaAdmin.fetchTopicOffset('business-events-test4');
    console.log('fetchTopicOffset', a2);*/
   
   //await new Promise(resolve => setTimeout(resolve, 5000));
   // await kafkaAdmin.disconnect();
   return null;
}

testAdmin().then(result => console.log(result)).catch(error => console.log(error));


