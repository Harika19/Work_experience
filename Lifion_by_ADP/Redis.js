redis = require('ioredis');
clusterNodes = [{ host: 'redis-bus', port: 6379 }]
clusterOpts = { scaleReads: 'all', keyPrefix: 'fde:' }
client = new redis.Cluster(clusterNodes, clusterOpts);

subscriptionFormat = `bus:businessEventId:clientId:*`;

client.keys('fde*', function (err, keys) { if (err) return console.log(err); if (keys) { console.log(keys); } });

client.keys('bus*', function (err, keys) { if (err) return console.log(err); if (keys) { console.log(keys); } });

client.del('002:migration:bus_lifion_ops_002').then((result) => { console.log(result); }).catch((err) => { console.log(err); })


client.smembers(key).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.get(key).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.hmget(key, 'filter').then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.del(key).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.flushdb().then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.srem(key, value).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.sadd(key, value).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.set(key, value).then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.keys('fde:I:b0267351ed8a48ec8090e0a5a2f77483:39d95091-2205-4f09-9f93-c653418_TEST:ENTITY_e912e3a8-1934-4363-835d-09226aa37aec').then((result) => { console.log(result.length); }).catch((err) => { console.log(err); })

client.keys('bus:b76532e178d540a3ae8a2d7f6e8ff861:10857fb9-3671-4d3f-8c50-d506e5fa59e8*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })


client.del('b76532e178d540a3ae8a2d7f6e8ff861:10857fb9-3671-4d3f-8c50-d506e5fa59e8*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.keys('bus:8c6fd6cddcbe4db8b689922d58766837:002:*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

key = '1111CLCIDM': 'entityId': 'insert': '2bc3e8e59fe340698ce760c3b8522bf8'
client.hset('1111CLCIDM:entityId:insert:2bc3e8e59fe340698ce760c3b8522bf8', { abc: 1 }).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.hgetall('1111CLCIDM:entityId:insert:2bc3e8e59fe340698ce760c3b8522bf8').then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.del('1111CLCIDM:entityId:insert:businessEventId').then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.set(key, value).then((result) => { console.log(result); }).catch((err) => { console.log(err); })


client.hgetall('bus:8c6fd6cddcbe4db8b689922d58766837:002*').then((result) => { console.log(result); }).catch((err) => { console.log(err); });
client.hgetall('bus:bc471f0921fb4be087b76360db4a3955:002*').then((result) => { console.log(result); }).catch((err) => { console.log(err); });

client.hgetall('d2b49831-47d2-44d3-96a9-fa3fa8f0795f:*:insert:*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })





async function deleteKeys() {
  const keys = await client.keys('fde:f0f7a9f0a9a64b30a082db6b8fa9f92f:002*');
  console.log('before:', keys);
  const res = keys.map(key => client.del(key.replace('fde:', '')));
  await Promise.all(res);
  // const afterKey = await client.keys('bus:bc471f0921fb4be087b76360db4a3955:002*')
  // console.log('after:', afterKey);
  return 'completed';
}

deleteKeys().then(res => console.log(res)).catch(err => console.log(err));




// trails 


client.keys('bus:bc471f0921fb4be087b76360db4a3955:002*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.set('bus:002:migration', true).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.set('bus:002:test', true).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
// test:canary-fanout-test-clients:clientPurpose
client.get('bus:002').then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.hgetall('*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.get('bus:*').then((result) => { console.log('jjjjj', result); }).catch((err) => { console.log(err); })

client.set('bus:1:002', 'eee').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.keys('f0f7a9f0a9a64b30a082db6b8fa9f92f:002:65d14cd0-8cad-4843-be92-b27e4764f0bd-integration-test:mask11:dev').then((result) => { console.log(result); }).catch((err) => { console.log(err); })


client.keys('fde*').then((result) => { console.log(result, result.length); }).catch((err) => { console.log(err); })

client.hset('1111CLCIDM:entityId:insert:2bc3e8e59fe340698ce760c3b8522bf8', { abc: 1 }).then((result) => { console.log(result); }).catch((err) => { console.log(err); })



client.keys('bus:002:migration:*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.hset('fde:test1-1', { abc: 1 }).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
client.hset('fde:test1-2', { abc: 1 }).then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.keys('fde:*002:integration-test*').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.del('002:migration:bus_lifion_ops_002').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

client.scan(0, 'MATCH', 'fde:*002:integration-test:*', 'COUNT', 1000).then((result) => { console.log(result); }).catch((err) => { console.log(err); })
const result = await client.scan(0, 'MATCH', 'fde:*002:integration-test:*', 'COUNT', 1000);

client.scan()
//
await client.get('bus:bus:002:migration', (err, result) => {
  if (err) {
    console.log('tttt', err);
  } else {
    console.log('yyy', JSON.parse(result));
  }
})

async function getCache(key = 'bus:002:migration') {
  const y = await this.client.get(key);
  console.log('nnn', (y));
}

getCache()



  .then((result) => { console.log('jjjjj', result); }).catch((err) => { console.log(err); })


  async function setKeyss(value) {
    const keys = ['e66b974b7d834d70be6d8e35d681b0d5:002:entity_1d284fe7e4f44ab6b0848fce2ba55:a33a11aa5b391a9d44583cd57c841a11c68273ea:dev']
    console.log('before:', keys);
    const res = keys.map(key => client.hset(key, value));
    console.log('gggg', res)
    const y = await Promise.all(res);
    console.log('yyyy', y)
    return y;
  }

  setKeyss( {aaa: 'test'}).then(res => console.log(res)).catch(err => console.log(err));

  client.get('f0f7a9f0a9a64b30a082db6b8fa9f92f:002:9df5edc7-67ce-4cdc-b19b-8a1bf06ed295-integration-test').then((result) => { console.log(result); }).catch((err) => { console.log(err); })



  client.hgetall('bcca9c8ed1804ff5a1db232968bb80ac:002:8a8ba921-6a67-4b0f-b0e9-d5a2dfd86aa7-integration-test').then((result) => { console.log(result); }).catch((err) => { console.log(err); })


  client.hgetall('k3').then((result) => { console.log(result); }).catch((err) => { console.log(err); })

  client.keys('002*').then((result) => { console.log(result, result.length); }).catch((err) => { console.log(err); })

