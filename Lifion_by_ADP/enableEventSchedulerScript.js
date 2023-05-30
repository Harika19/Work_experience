const mysql = require('mysql2/promise');

let connection;
async function getConnection(user, password) {
  if (!connection) {
    try {
      connection = await mysql.createPool({
        user,
        password,
        host: 'mysql-business-events',
        port: 3306,
      });
    } catch (err) {
      console.log(err);
    }
    return connection;
  }
  return connection;
}


async function enableEventScheduler(user, psw) {
  const connection = await getConnection(user, psw);
  const [dbList] = await connection.query('SHOW DATABASES');
  const beDbList = dbList.filter(db => db.Database.startsWith('bus')).map(db => db.Database);
  console.log('Number of DBs for which schema to be updated: ', beDbList.length);
  for (let i = 0; i < beDbList.length; i++) {
    await connection.query(`ALTER EVENT ${beDbList[i]}.jobs_polling_event_scheduler ENABLE;`);
    if (i % 10 === 0) console.log(i+1);
  }
  return 'completed';
}

// get schema seeder mysql psw
enableEventScheduler('be_schema_seeder', 'NCUXH@5F@edUI61V').then(res => console.log(res)).catch(err => console.log('error occured while enabling event scheduler', err));

// test in ditc 
enableEventScheduler('rootroot', 'rootroot').then(res => console.log(res)).catch(err => console.log('error occured while enabling event scheduler', err));