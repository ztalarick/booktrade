// run $sudo neo4j start
const neo4j = require('neo4j-driver');
const users = require('./data/users.js');

const drivers = require('./data/drivers.js');

async function main(){

  await users.clear();

  await users.create_user("someEmail@domain.com", "password" );
  await users.create_user("someEmail2@domain.com", "password2");

  try{
    //should fail
    await users.create_user("someEmail2@domain.com", "password2");
  }catch(e){
    console.log(e);
  }

  await users.getAll();
  // on application exit:
  await drivers.driver.close()
}

// main();


//TODO fix this tomorrow for some reason the python script crashes or something when being run
const spawn = require("child_process").spawn;
const scraper = spawn('python', ["./data/scrape/campusbooks.py", "013359162X"])
scraper.stdout.on('data', (data) => {
  console.log("test");
  console.log(data.toString());
});
