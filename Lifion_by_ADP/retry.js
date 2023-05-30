const HTTPClient = require('ohcm-http-client');
const retry = require('ohcm-retry-pattern');

const httpClient = new HTTPClient({
  useRetryPattern: true,
  useOhcmErrors: true,
  retryOptions: {
    backoff: 1000,
    retries: 10,
  }
});

const url = `http://harika-sai-rama-lakshmi-puppala.ditc.us-east-1.lifion-nonprod.aws.adp/api/business-events-reactor-consumer-subscription-v1/v0/health`;

const reqOptions = {
  url,
  method: 'POST',
};

const shouldRetryError = (err) => {
  console.log('err:', err);
  const statusCode = err.get('status');
  console.log('statusCode:', statusCode);
  return statusCode === 429;
}

retry(httpClient.request, { retries: 2, backoff: 500, shouldRetryError })(reqOptions).then((res) => console.log('res:', res)).catch(err => console.log('err:', err)); 