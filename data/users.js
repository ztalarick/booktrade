//This module is to create functions that query the database

// run $sudo neo4j start
const neo4j = require('neo4j-driver')
const bcrypt = require('bcrypt');
const saltRounds = 13; //This is the number that decides how powerful the hash is

// password = Booktrade!
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Booktrade!"));

const session = driver.session();

//function to create a user
async function create_user(username, password, email){
  const session = driver.session();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  if(!username || typeof username !== 'string') return Promise.reject("Invalid Username");
  if(!password || typeof password !== 'string') return Promise.reject("Invalid Password");
  if(!username || typeof email !== 'string') return Promise.reject("Invalid Email");

  try {
    let result = await session.run('CREATE (u:User {username: $usernameParam, password: $passwordParam, email: $emailParam}) RETURN u',
     { usernameParam: username,
       passwordParam: hashedPassword,
       emailParam: email
     })
  } catch (e){
    console.log(e);
  } finally {
      await session.close();
  }
}

//get a users in database
//note as of now username is not unique
async function getAll(){
  const session = driver.session();

  let result = await session.run('MATCH (u:User) RETURN u LIMIT 25');
  result.records.forEach(record => {
            console.log(record.get('u'))
          })

  await session.close();

}

// Deletes all nodes with no relationship FOR DEBUGGING ONLY
async function clear(){
  const session = driver.session();
  session.run('match (a) delete a');
}

module.exports = {
  driver: driver,
  create_user: create_user,
  getAll: getAll,
  clear: clear
}
