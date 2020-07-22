const express = require("express");
const app = express();
const configRoutes = require("./routes");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const drivers = require('./data/drivers.js');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 600000
    }
}));

configRoutes(app);
const server = app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});

//for graceful shutdown
process.on('SIGINT', async () => {
  await drivers.driver.close();
  server.close();
});
