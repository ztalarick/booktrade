//This module is to create functions that query the database for users

// run $sudo neo4j start
const neo4j = require('neo4j-driver')
const bcrypt = require('bcrypt');
const saltRounds = 13; //This is the number that decides how powerful the hash is

const drivers = require('./drivers.js');
const driver = drivers.driver;

//function to attach the sessionID to a user
//will be removed when logged out
//return true if a user was updated, otherwise false
async function attach_session(email, sessionID){
  if(!email || typeof email !== 'string') return Promise.reject("Invalid Email or Password.");
  if(!sessionID) return Promise.reject("Invalid Email or Password.");

  const session = driver.session();

  let result = await session.run('MATCH (u:User {email: $emailParam}) SET u.sessionId= $sessionIdParam RETURN u', {
    emailParam: email,
    sessionIdParam: sessionID
  });
  await session.close();
  return !(result.records.length === 0);
}

//function to check if a sessionId is in the database
//returns true if id is found, otherwise false
async function check_session(email, sessionId){
  if(!sessionId) return Promise.reject("Invalid sessionID.");
  if(!email) return Promise.reject("Invalid Email or Password.");

  const session = driver.session();
  //check if the sessionId is in the database
  let result = await session.run('MATCH (u:User {email: $emailParam, sessionId: $sessionIdParam}) RETURN u', {
    sessionIdParam: sessionId,
    emailParam: email
  });
  await session.close();
  return !(result.records.length === 0); //boolean on if there were any matches
}
// removes the sessionID from an email
//to be called when logging out
//removes the sessionId parameter from the user
async function remove_session(email, sessionId){
  if(!sessionId) return Promise.reject("Invalid sessionID.");
  if(!email) return Promise.reject("Invalid Email.");

  const session = driver.session();

  let result = await session.run('MATCH (u:User {email: $emailParam, sessionId: $sessionIdParam}) REMOVE u.sessionID RETURN u', {
    sessionIdParam: sessionId,
    emailParam: email
  });
  await session.close();
  return result;
}

//see if there is a user where email and password match
//returns true if there is a match, false otherwise
async function check_login(email, password){
  if(!password || typeof password !== 'string') return Promise.reject("Invalid Email or Password");
  if(!email || typeof email !== 'string') return Promise.reject("Invalid Email or Password.");

  let user = await get_user(email);
  //compare plaintext password to the hashed one in storage
  //email must be unique so there should never be multiple returns
  try {
    return bcrypt.compare(password, user.records[0].get('u').properties.password);
  } catch (e) {
    console.log(e);
    return false;
  }
}

//get a user by email
async function get_user(email){
  //connect to database
  const session = driver.session();

  //run query
  let result = await session.run('MATCH (u:User {email: $emailParam}) RETURN u', {
    emailParam: email
  });

  await session.close();
  //returns a result object
  return result;
}

//function to create a user
//email must be unique
//the customer_id is the ID associated with the stripe customer. this is used to store payment and shipping information
async function create_user(email, password, customer_id){
  if(!password || typeof password !== 'string') return Promise.reject("Invalid Email or Password");
  if(!email || typeof email !== 'string') return Promise.reject("Invalid Email or Password.");
  const session = driver.session();
  //hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  //see if email is already in database
  let search = await get_user(email);
  if(search.records.length != 0) return Promise.reject("Error, email '" + email + "' is not unique. There is already a user with that email.")

  try {
    let result = await session.run('CREATE (u:User {email: $emailParam, password: $passwordParam, customer_id: $customer_idParam}) RETURN u', {
       emailParam: email,
       passwordParam: hashedPassword,
       customer_idParam: customer_id
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

//creates a listing relationship between a user ---> textbook with property price and condition
async function create_listing(isbn, email, price, condition){
  const session = driver.session();
  const date = new Date().toUTCString();

  let result = await session.run(
    'MATCH (t:Textbook {isbn: $isbnParam}), (u:User {email: $emailParam}) CREATE (u)-[s:Selling {price: $priceParam, date: $dateParam, condition: $conditionParam, list_id: $list_idParam}]->(t) RETURN s',
    {
      isbnParam: isbn,
      emailParam: email,
      priceParam: price,
      dateParam: date,
      conditionParam: condition,
      list_idParam: list_id
    });

  await session.close();
  return result;
}

//function delete listing relationship between a user and a textbook when the book is Sold
// need to be changed because a user could sell 2 of the same textbook and this function would delete both
async function delete_listing(isbn, email){
  const session = driver.session();

  let result = await session.run(
    'MATCH  (u:User {email: $emailParam})-[s:Selling]->(t:Textbook {isbn: $isbnParam}) DELETE s',
  {
    isbnParam: isbn,
    emailParam: email
  });

  await session.close();
  return result;
}

//get all listings associated to a user with email
// returns both the listing and the textbook
async function get_listings(email){
  const session = driver.session();

  let result = await session.run(
    "MATCH (u:User {email: $emailParam})-[s:Selling]->(t:Textbook) RETURN u, s, t", {
    emailParam: email
  });

  await session.close();
  return result;
}


// creates a sold relationship between seller ---> textbook,
//includes the price, isbn, condition of textbook sold
async function create_sold(email1, email2, price, isbn, condition){
  const session = driver.session();
  const date = new Date().toUTCString();

  let result = await session.run(
    'MATCH (u:User {email: $email1Param}), (t:Textbook {isbn: $isbnParam}) CREATE (u)-[s:Sold {price: $priceParam, sold_to: $email2Param, date: $dateParam, condition: $conditionParam}]->(t) RETURN s',
    {
      email1Param: email1,
      email2Param: email2,
      isbnParam: isbn,
      priceParam: price,
      dateParam: date,
      conditionParam: condition
    });

  await session.close();
  return result;
}

//purchased relationship
// email1 purchased isbn from emal2 at price on date
async function create_purchased(email1, email2, price, isbn, charge_id, condition){
  const session = driver.session();
  const date = new Date().toUTCString();

  let result = await session.run(
    'MATCH (u:User {email: $email1Param}), (t:Textbook {isbn: isbnParam}) CREATE (u)-[p:Purchased {purchased_from: $email2Param, price: $priceParam, date: $dateParam, charge_id: $charge_idParam, condition: $conditionParam}]->(t) RETURN p',
    {
      email1Param: email1,
      email2Param: email2,
      isbnParam: isbn,
      priceParam: price,
      dateParam: date,
      charge_idParam: charge_id,
      conditionParam: condition
    });

  await session.close();
  return result;
}


// creates a shipping relationship
// to be called after purchase
// email1 shipping isbn to email2 with tracking_link package_num began on date with status
//status = not/in transit
async function create_shipping(email1, email2, isbn, tracking_link, package_num){
  const session = driver.session();
  const date = new Date().toUTCString();

  let result = await session.run(
    'MATCH (u1:User {email: $email1Param}), (u2:User {email: $email2Param}) CREATE (u1)-[s:Shipping {price: $priceParam, isbn: $isbnParam, date: $dateParam, tracking_link: $tracking_linkParam, package_num: $package_numParam, status: "Not in transit"}]->(u2) RETURN s',
    {
      email1Param: email1,
      email2Param: email2,
      isbnParam: isbn,
      priceParam: price,
      dateParam: date,
      tracking_linkParam: tracking_link,
      package_numParam: package_num
    });

  await session.close();
  return result;
}

// creates a receiving relationship
// to be called after purchase
// email1 receiving isbn from email2 with tracking_link package_num began on date with status
//status = not/in transit
async function create_receiving(email1, email2, isbn, tracking_link, package_num){
  const session = driver.session();
  const date = new Date().toUTCString();

  let result = await session.run(
    'MATCH (u1:User {email: $email1Param}), (u2:User {email: $email2Param}) CREATE (u1)-[r:Receiving {price: $priceParam, isbn: $isbnParam, date: $dateParam, tracking_link: $tracking_linkParam, package_num: $package_numParam, status: "Not in transit"}]->(u2) RETURN r',
    {
      email1Param: email1,
      email2Param: email2,
      isbnParam: isbn,
      priceParam: price,
      dateParam: date,
      tracking_linkParam: tracking_link,
      package_numParam: package_num
    });

  await session.close();
  return result;
}

//function to add a paymentMethod to a user
// the payment_id is from stripe and is used by
// stripe.paymentMethods.retrieve(payment_id, funct)
//in the future maybe make this a new node and create a relationship from the user to the payment method. In this case a usser could have many payment methods.
async function update_payment_method(email, payment_id){
  const session = driver.session();

  let result = await sessio.run(
    'MATCH (u:User {email: $emailParam}) SET u.payment_id: $payment_idParam RETURN u',
    {emailParam: email, payment_idParam: payment_id}
  );

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
  create_listing: create_listing,
  create_sold: create_sold,
  check_login: check_login,
  attach_session: attach_session,
  check_session: check_session,
  remove_session: remove_session,
  delete_listing: delete_listing,
  create_purchased: create_purchased,
  create_shipping: create_shipping,
  create_receiving: create_receiving,
  get_listings: get_listings,
  update_payment_method: update_payment_method
};
