const express = require('express');
const router = express.Router();
const users = require('../data/users.js');
const { v4: uuidv4 } = require('uuid');

/*
* TODO - tomorrow fix authentication
* need to work on saving correct information in cookies
* add middleware to check authentication
*/


//Route to register an account
//TODO implement payment method
router.post('/account/register', async (req, res) => {
  try {
    await users.create_user(req.body.email, req.body.password);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(400).json({error: e});
  }
});

//Route to login
router.post('/account/login', async (req, res) => {
  if((req.body.email) && (req.body.password) && await users.check_login(req.body.email, req.body.password)){ //if good login
    let sessionid = uuidv4(); //generate sessionID
    req.session.user = {email: req.body.email, sessionId: sessionid}; //set cookies
    users.attach_session(req.body.email, sessionid); //attach sessionID
    res.sendStatus(200);
  } else{ //bad username or password
    res.status(401).json({error: "Wrong email or password."});
  }
});

//route to logout
router.get('/account/logout', async (req, res) => {
  if((req.session.user) && await users.remove_session(req.session.user.email, req.session.user.sessionId)){ //if successfully removed sessionid
    req.session.destroy(); //destroy session
    res.sendStatus(200);
  }else{
    res.sendStatus(500);
  }

});

router.get('/account/test', async (req, res) => {
  if(!(req.session.user) || !(await users.check_session(req.session.user.email, req.session.user.sessionId))){
    res.status(401).json({error: "not authenticated"});
  }else{
    res.sendStatus(200);
  }
});

//get billing information
router.get('/account/billing', async (req, res) => {
  //TODO
});

//updates billing information
router.put('/account/billing', async (req, res) => {
  //TODO
});

//get shipping information
router.get('/account/shipping', async (req, res) => {
  //TODO
});

//update shipping information
router.put('/account/shipping', async (req, res) => {
  //TODO
});

router.get('/account/billing', async (req, res) => {
  //TODO
});

//get account information
router.get('/account', async (req, res) => {
  //TODO
});

module.exports = router;
