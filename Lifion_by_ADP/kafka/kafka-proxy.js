/* eslint-disable max-len */

const AWS = require('aws-sdk');
const Errors = require('ohcm-errors');
const Logger = require('@lifion/logger');
const secretsClient = require('ohcm-secrets');
const { partialKafkaClusterName, kafkaSecret, errorCodes: { KAFKA_ERROR } } = require('../constants');
const { Environment } = require('../utils');
const { name, version } = require('../../package.json');

const { DEVELOPMENT_ENV_CLUSTER, OTHER_ENV_CLUSTER } = partialKafkaClusterName;
const { SERVICE_NAME, SECRET_KEY } = kafkaSecret;
const logger = new Logger({
  filename: __filename,
  name,
  version,
});
const dependency = { logger };

class KafkaProxy {
  constructor(config) {
    this.kafkaConfig = config;
    this.kafkaClient = new AWS.Kafka({ apiVersion: '2018-11-14', region: process.env.AWS_MSK_REGION || process.env.AWS_REGION });
    this.kafkaAuthenticationMechanism = Environment.getKafkaAuthenticationMechanism();
  }

  async getKafkaBrokers() {
    try {
      const partialClusterName = process.env.DEPLOYMENT_ENVIRONMENT === 'local' ? DEVELOPMENT_ENV_CLUSTER : OTHER_ENV_CLUSTER;
      const { ClusterInfoList } = await this.kafkaClient.listClustersV2({ ClusterNameFilter: partialClusterName }).promise();
      const { ClusterArn } = ClusterInfoList[0];
      const {
        BootstrapBrokerStringTls,
        BootstrapBrokerStringSaslIam,
        BootstrapBrokerStringSaslScram,
      } = await this.kafkaClient.getBootstrapBrokers({ ClusterArn }).promise();

      let brokerString;
      switch (this.kafkaAuthenticationMechanism) {
        case 'SASL_SCRAM':
          brokerString = BootstrapBrokerStringSaslScram; break;
        case 'SASL_IAM':
          brokerString = BootstrapBrokerStringSaslIam; break;
        default:
          brokerString = BootstrapBrokerStringTls || '';
      }

      return brokerString.split(',');
    } catch (error) {
      const ohcmError = new Errors({
        message: 'Unable to retreive Kafka brokers',
        code: KAFKA_ERROR.CANNOT_RETREIVE_KAFKA_BROKER,
        details: this.kafkaConfig,
      }).append(error);
      logger.error(ohcmError);
      throw ohcmError;
    }
  }

  async getKafkaConfig() {
    const kafkaBrokers = await this.getKafkaBrokers();
    let sasl;
    if (this.kafkaAuthenticationMechanism === 'SASL_SCRAM') {
      const { username, password } = await secretsClient.getSecret(SECRET_KEY, { serviceName: SERVICE_NAME });
      sasl = {
        mechanism: 'scram-sha-512',
        username,
        password,
      };
    }

    return {
      ...this.kafkaConfig,
      kafka: {
        ...this.kafkaConfig.kafka,
        brokers: kafkaBrokers,
        ssl: true,
        sasl,
      },
    };
  }
}

module.exports = { KafkaProxy, dependency };
