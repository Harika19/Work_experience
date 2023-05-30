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
//10857fb9-3671-4d3f-8c50-d506e5fa59e8
function getValues(batchSize) {
  const schedulerJobInstanceValues = [];
  for (let i = 0; i < batchSize; i++) {
    const scheduledBusinessEventKey = chance.guid();
    const eventId = chance.guid();
    const clientId = '002';
    const businessEventId = chance.guid();
    const entityId = chance.guid();
    const sorTriggerType = chance.guid();
    let executionTime = convertToTimeStamp(new Date().toISOString());
    let dateCreated = convertToTimeStamp(new Date().toISOString());
    let lastModified = convertToTimeStamp(new Date().toISOString());
    let mask = '15b30314e029a25958061b8cc6527fbe';
    

    schedulerJobInstanceValues.push([
      scheduledBusinessEventKey, eventId, clientId, businessEventId, entityId, sorTriggerType, executionTime, dateCreated, lastModified, mask
    ]);
  }

  return schedulerJobInstanceValues;
}

async function insertInstance(recordsToBeInserted, batchSize) {
  //  let connection;
  while (recordsToBeInserted) {
    const query = `INSERT INTO ScheduledBusinessEvents (scheduledBusinessEventKey, eventId, clientId, businessEventId, entityId, sorTriggerType, executionTime, dateCreated, lastModified, mask)
     VALUES ?`;
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


const noOfRecords = 1;
const batchSize = 1;

insertInstance(noOfRecords, batchSize)
  .then(() => console.log('inserted!!!'));
