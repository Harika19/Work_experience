const Chance = require('chance');
// const db = require('../mysql-store/mysql-connection');
const mysql = require('mysql2/promise');

const chance = new Chance();


function convertToTimeStamp(isoString) {
  if (isoString) {
    const timeStamp = isoString.split('.')[0];
    return timeStamp.replace('T', ' ');
  }
  return null;
}

function getValues(batchSize) {
  const schedulerJobInstanceValues = [];
  for (let i = 0; i < batchSize; i++) {
    const clientId = '10857fb9-3671-4d3f-8c50-d506e5fa59e8';
    // let jobId = 'e550f504-55f6-5da0-8b2d-9e13c3a83ca7';
    const executionTime = convertToTimeStamp(new Date().toISOString());
    const entityId = chance.guid();
    // let eventId = chance.guid();
    const businessEventId = chance.guid();
    const eventId = chance.guid();
    // let triggerType = 'automatic';
    const status = null;
    // let execData = `{"status": "Completed", "execRequestId": "${execRequestId}"}`;
    const dateCreated = convertToTimeStamp(new Date().toISOString());
    const lastModified = convertToTimeStamp(new Date().toISOString());

    schedulerJobInstanceValues.push([
      clientId, eventId, businessEventId, entityId, executionTime, status, dateCreated, lastModified,
    ]);
  }

  return schedulerJobInstanceValues;
}

async function insertInstance(recordsToBeInserted, batchSize = 10) {
  //  let connection;
  while (recordsToBeInserted) {
    const query = 'INSERT INTO ScheduledBusinessEvents(clientId, eventId, businessEventId, entityId, executionTime, status, dateCreated, lastModified) VALUES ?';
    const values = getValues(batchSize);

    try {
      // eslint-disable-next-line no-await-in-loop
      const connection = await mysql.createConnection({
        host: 'mysql-business-events',
        database: 'business_events',
        user: 'rootroot',
        password: 'rootroot',
        port: 3306,
      });
      await connection.query(query, [values]);
    } catch (error) {
      console.log('failed to create new instane', error);
    }
    recordsToBeInserted -= batchSize;
  }
}

// const eventId = 'ee70a2493f06481e806748d1c39b70c0';
const noOfRecords = 100;
const batchSize = 10;

insertInstance(noOfRecords, batchSize)
  .then(() => console.log('inserted!!!'));
