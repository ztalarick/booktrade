// run $sudo neo4j start
const neo4j = require('neo4j-driver');
const users = require('./data/users.js');
const textbooks = require('./data/textbooks.js');
const drivers = require('./data/drivers.js');

async function main(){

  await users.clear();
  //
  await users.create_user("someEmail@domain.com", "password" );
  console.log(await users.check_login("someEmail@domain.com", "password"));
  console.log(await users.check_login("someEmail@domain.com", "wrongPass"));
  console.log(await users.check_login("bademail@domain.com", "password"));
  // await users.create_user("someEmail2@domain.com", "password2");
  //
  // try{
  //   //should fail
  //   await users.create_user("someEmail2@domain.com", "password2");
  // }catch(e){
  //   console.log(e);
  // }
  //

  // await textbooks.create_textbook("013359162X");
  //
  // await textbooks.textbook_to_user("013359162X", "someEmail@domain.com", 250);

  // on application exit:
  await drivers.driver.close()

}

main();
