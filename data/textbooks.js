const neo4j = require('neo4j-driver')
const drivers = require('./drivers.js');
const driver = drivers.driver;

async function create_textbook(title, authors, isbn_13, isbn, edition, released, format){
  const session = driver.session();

}
