// run $sudo neo4j start
const neo4j = require('neo4j-driver')
const users = require('./data/users.js')


async function main(){
  await users.clear();
  
  await users.create_user("username", "password", "someEmail@domain.com");
  await users.create_user("username2", "password2", "someEmail2@domain.com");

  await users.getAll();

  // on application exit:
  await users.driver.close()
}

main();
