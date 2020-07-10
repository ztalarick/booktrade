const express = require("express");
const app = express();

const neo4j = require('neo4j-driver')

const users = const users = require('./data/users.js');
const driver = users.driver;


// const configRoutes = require("./routes");
// configRoutes(app);

app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});

//for graceful shutdown
//TODO close database connection
// process.on('SIGTERM', () => {
//   console.info('SIGTERM signal received.');
//   console.log('Closing http server.');
//   server.close(() => {
//     console.log('Http server closed.');
//   });
//   console.log("Closing neo4j connection.");
//   //needs to be in async function
//   //await driver.close();
// });
