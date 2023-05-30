const autocannon = require('autocannon');
const HTTPClient = require('ohcm-http-client');
//const Mask = require('ohcm-mask');
const httpClient = new HTTPClient();
const bluebird = require('bluebird');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const baseUrl = 'https://perflab-green.lifion.oneadp.com';
const BUSINESS_EVENT_MINIAPP_ID = 'b63c290b762b4debbe7088cd2c76b198';
const GLOBAL_CONTEXT = 'global';

//const baseUrl = 'http://harika-sai-rama-lakshmi-puppala.ditc.us-east-1.lifion-nonprod.aws.adp';
const associateId = 'ea64cf42-bda2-4a35-a721-d68815e47f74';

const clientId = ['002', '06eaf591-ea43-48d6-abb0-755af9f_TEST', 'f4a3777c-88de-46a6-958a-9e4f1bb_TEST'];
async function generateMask() {
    const mas = {
        action: 'editing',
        editing: BUSINESS_EVENT_MINIAPP_ID,
        viewing: [BUSINESS_EVENT_MINIAPP_ID],
        editContext: GLOBAL_CONTEXT,
        branchId: '8AlALyREb',

    };
    const url = `${baseUrl}/api/mask-generation-service/v0/selection`;
    const { data: mask } = await httpClient.post(url, { mas });
    return mask;
}

async function getToken(clientId) {
    const mask = await generateMask();
    //  const url = `${baseUrl}/api/identity-token-service/v0/associates/${associateId}/tokens`;
    const url = `${baseUrl}/api/identity-token-service/v1/clients/${clientId}/associates/${associateId}/tokens?mask=${mask}`;
    const res = await httpClient.post(url);
    const { data: { token } } = res;
    return token;
}
let token;
async function tokennn(clientId) {

    token = await getToken(clientId);
    //await new Promise(resolve => setTimeout(resolve, 3000));
    await bluebird.delay(3000);
    await tokennn(clientId);

}
function finishedTest(err, res) {
    console.log('finished bench', err, res)
}
async function test() {
    try {
        token = await getToken();
        clientId.forEach(i => {
            tokennn(i);
        })
        console.log('testinggggg')
        const instance = autocannon({
            url: `${baseUrl}/api/business-events-producer-service/v0/produce/data-contract`,
            method: "POST",
            body: JSON.stringify({
                "contract": {
                    "_objectId": "e55d7ffbe5ba4d4ea0323cc7ff4a853f",
                    "name": "eventDC",
                    "outputs": [
                        {
                            "name": "businessEventInstanceId"
                        }
                    ],
                    "protocol": {
                        "name": "Business_Event_Provider",
                        "data": {
                            "businessEvent": "36bff171ba9f40bd8d06a9123dc01796"
                        }
                    }
                },
                "requestAttributes": {
                    "context": "global"
                },
                "inputs": {
                    "schemaWrapper": {
                        "name": "testname"
                    }
                }
            }),
            headers: {
                'x-ohcm-user': token,
                'Content-Type': 'application/json',
                'x-trace-id': '9e280edd-9cb4-5e11-8249-88e7c367a64c',
                'x-sender-service': 'business-events-producer-service',
                'x-sender-workstream': 'business-events'
            },
            connections: 100, //The number of concurrent connections to use.
            pipelining: 1, // default
            duration: 60, // default in seconds
            connectionRate: 100, // max number of requests to make per second from an individual connection.
            timeout: 100
        }, finishedTest)
        function handleResponse(client, statusCode, resBytes, responseTime) {

            client.setHeaders({
                'x-ohcm-user': token,
                'Content-Type': 'application/json',
                'x-trace-id': '9e280edd-9cb4-5e11-8249-88e7c367a64c',
                'x-sender-service': 'business-events-producer-service',
                'x-sender-workstream': 'business-events'
            })
        }
        instance.on('response', handleResponse)
        autocannon.track(instance)
        return instance;
    } catch (err) {
        console.log('error executing script ', JSON.stringify(err._data, null, 2));
    }

}

test()

