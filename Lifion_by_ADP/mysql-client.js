/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
const mysql = require('mysql2/promise');
const Errors = require('ohcm-errors');
const retry = require('ohcm-retry-pattern');
const getClusterHost = require('../utils/cluster-host');

class MysqlClient {
  constructor(config) {
    this.user = config.user;
    this.password = config.password;
    this.host = config.host;
    this.database = config.database;
    this.connectionLimit = config.connectionLimit;
    this._connectionType = config.connectionType || 'standard';
    this.client = null;
  }

  async createConnection() {
    try {
      if (this.client) return this.client;
      const conConfig = { host: getClusterHost(this.host, 'RDS'), user: this.user, password: this.password, database: this.database };
      if (this._connectionType === 'pool') {
        conConfig.connectionLimit = this.connectionLimit;
        this.client = await mysql.createPool(conConfig);
      } else {
        this.client = await mysql.createConnection(conConfig);
      }
      this.client.executeWithRetry = retry(this.client.execute.bind(this.client));
      this.client.queryWithRetry = retry(this.client.query.bind(this.client));
      return this.client;
    } catch (error) {
      throw new Errors({ message: 'unable to create connection' }).append(error);
    }
  }

  async getConnection() {
    await this.createConnection();
    if (this._connectionType === 'pool') {
      return this.client.getConnection();
    }
    return this.client;
  }

  async executeStatement(executeConfig) {
    const { query, values, prepareStatement = false, shouldRetry = false, connection = null } = executeConfig;
    await this.createConnection();
    const selectedCon = connection || this.client;
    if (prepareStatement || (Array.isArray(values) && values.length > 0)) {
      return (shouldRetry) ? selectedCon.executeWithRetry(query, values) : selectedCon.execute(query, values);
    }
    return (shouldRetry) ? selectedCon.queryWithRetry(query) : selectedCon.query(query);
  }

  async isConnected() {
    try {
      const executeObject = { query: 'SELECT 1', values: [], prepareStatement: true, retry: true };
      await this.executeStatement(executeObject);
      return true;
    } catch (exception) {
      return false;
    }
  }

  async releaseConnection(connection) {
    if (this._connectionType === 'pool') {
      return connection.release();
    }
    return true;
  }

  async closeConnection() {
    return this.client.end();
  }
}

module.exports = MysqlClient;

