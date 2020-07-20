//This module is to create functions that query the database

// run $sudo neo4j start
const neo4j = require('neo4j-driver')
const bcrypt = require('bcrypt');
const saltRounds = 13; //This is the number that decides how powerful the hash is

const drivers = require('./drivers.js');
const driver = drivers.driver;

//get a user by email
async function get_user(email){
  //connect to database
  const session = driver.session();

  //run query
  let result = await session.run('MATCH (u:User {email: $emailParam}) RETURN u', {
    emailParam: email
  })

  await session.close();
  //returns a result object
  return result;
}

//function to create a user
//email must be unique
async function create_user(email, password){
  const session = driver.session();
  //hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  if(!password || typeof password !== 'string') return Promise.reject("Invalid Email or Password");
  if(!email || typeof email !== 'string') return Promise.reject("Invalid Email or Password.");

  //see if email is already in database
  let search = await get_user(email);
  if(search.records.length != 0) return Promise.reject("Error, email '" + email + "' is not unique. There is already a user with that email.")

  try {
    let result = await session.run('CREATE (u:User {email: $emailParam, password: $passwordParam}) RETURN u', {
       emailParam: email,
       passwordParam: hashedPassword
     })
  } catch (e){
    console.log(e);
  } finally {
      await session.close();
  }
}


//get all users in database up to 25
async function getAll(){
  const session = driver.session();

  let result = await session.run('MATCH (u:User) RETURN u LIMIT 25');
  result.records.forEach(record => {
            console.log(record.get('u'))
          })

  await session.close();

}

async function delete_user(email){
  const session = driver.session();

  let result = await session.run('MATCH (u:User {email: $emailParam}) DELETE u', {
    emailParam: email
  })

  await session.close();
  return result;
}

//creates a listing relationship between a user and a textbook with property price
async function textbook_to_user(isbn, email, price){
  const session = driver.session();

  let result = await session.run(
    'MATCH (t:Textbook {isbn: $isbnParam}), (u:User {email: $emailParam}) CREATE (u)-[s:Selling {price: $priceParam}]->(t) RETURN s',
    {
      isbnParam: isbn,
      emailParam: email,
      priceParam: price
    });

  await session.close();
  return result;
}

// creates a sold relationship between 2 users where u1 sold to u2,
//includes the price and isbn of textbook sold
//TODO include date somehow
async function user_to_user(email1, email2, price, isbn){
  const session = driver.session();

  let result = await session.run(
    'MATCH (u1:User {email: $email1Param}), (u2:User {email: $email2Param}) CREATE (u1)-[s:Sold {price: $priceParam, isbn: $isbnParam}]->(u2) RETURN s',
    {
      email1Param: email1,
      email2Param: email2,
      isbnParam: isbn,
      priceParam: price
    });

  await session.close();
  return result;
}

// Deletes all nodes FOR DEBUGGING ONLY
async function clear(){
  const session = driver.session();
  await session.run('MATCH (a) -[r] -> () DELETE a, r');
  await session.run('MATCH (a) DELETE a');
  await session.close();
}

module.exports = {
  driver: driver,
  create_user: create_user,
  getAll: getAll,
  clear: clear,
  get_user: get_user,
  delete_user: delete_user,
  textbook_to_user: textbook_to_user,
  user_to_user: user_to_user
}
