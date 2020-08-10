// run $sudo neo4j start
const neo4j = require('neo4j-driver');
const users = require('./data/users.js');
const textbooks = require('./data/textbooks.js');
const drivers = require('./data/drivers.js');

async function main(){

  // await users.clear();

  // await users.create_user("someEmail@domain.com", "password" );
  


  // await textbooks.create_textbook("013359162X");
  await textbooks.create_textbook("9780321637734");
  // console.log(await textbooks.get_textbook("013359162X"));
  // console.log("_____________________________");
  // console.log(await textbooks.get_textbook_title("modern"));

  // await textbooks.textbook_to_user("013359162X", "someEmail@domain.com", 250);

  // on application exit:
  await drivers.driver.close()

}

main();
