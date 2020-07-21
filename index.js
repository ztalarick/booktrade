const express = require("express");
const app = express();
const configRoutes = require("./routes");


const drivers = require('./data/drivers.js');



configRoutes(app);

const server = app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});

//for graceful shutdown
process.on('SIGINT', async () => {
  await drivers.driver.close();
  server.close();
});
