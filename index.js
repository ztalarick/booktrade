const express = require("express");
const app = express();
const configRoutes = require("./routes");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const drivers = require('./data/drivers.js');

//apparently i dont have to use this
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//maybe set cookie  to expire by:
// cookie: {maxAge: [time]}
app.use(session({
    name: 'AuthCookie',
    secret: 'booktrade is sick',
    resave: false,
    saveUninitialized: true
}));
//middleware to clear cookie if the user is no longer logged in
// app.use((req, res, next) => {
//     if (req.cookies.AuthCookie && !req.session.username) {
//         res.clearCookie('AuthCookie');
//         console.log('CLEAR COOKIE');
//     }
//     next();
// });

configRoutes(app);
const server = app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});

//for graceful shutdown
process.on('SIGINT', async () => {
  await drivers.driver.close();
  server.close();
});
