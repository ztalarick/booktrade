const express = require("express");
const app = express();

//const neo4j = require('neo4j-driver')

const drivers = require('./data/drivers.js');


// const configRoutes = require("./routes");
// configRoutes(app);

const server = app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});

//for graceful shutdown
process.on('SIGINT', async () => {
  await drivers.driver.close();
  server.close();
});
