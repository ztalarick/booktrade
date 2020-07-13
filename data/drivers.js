// This module is to export the same driver variable to all other database files
// password = Booktrade!

const neo4j = require('neo4j-driver')
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Booktrade!"));

module.exports = {
  driver: driver
}
