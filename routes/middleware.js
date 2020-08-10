const express = require('express');
const router = express.Router();
const users = require('../data/users.js')

router.all('*', async(req, res, next) => {
  let userAuthenticated;
  try{ //needs to be in try catch because in non authenticated requests req.session will be undefined
    userAuthenticated = await users.check_session(req.session.user.email, req.session.user.sessionId);
  }catch(e){
    userAuthenticated = false;
    // console.log(e);
  }

  message = `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${userAuthenticated?'Authenticated':'Non-authenticated'} user)`

  console.log(message);
  next();
});

//check if a user is authenticated
router.all('*', async (req, res, next) => {
  try{
    if(await users.check_session(req.session.user.email, req.session.user.sessionId)){
      next(); //if user is authenticated then keep going
    }else{
      res.sendStatus(401); //if user is not authenticated then stop route
    }
  }catch(e) {
    // console.log(e);
    //there is some error here, problably that there is no req.session, so they are tryng to register
    //list all routes that do not need authentication here:
    if(req.originalUrl === "/account/login" || req.originalUrl === "/account/register"){
      next();
    }else{
      res.sendStatus(401);
    }
  }
});

//middleware to clear cookie if the user is no longer logged in
// app.use((req, res, next) => {
//     if (req.cookies.AuthCookie && !req.session.username) {
//         res.clearCookie('AuthCookie');
//         console.log('CLEAR COOKIE');
//     }
//     next();
// });

module.exports = router;
