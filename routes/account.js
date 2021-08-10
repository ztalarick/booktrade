const express = require('express');
const router = express.Router();
const users = require('../data/users.js');
const Stripe = require('stripe');
const stripe = Stripe('key-here');
const { v4: uuidv4 } = require('uuid');


//Route to register an account
router.post('/account/register', async (req, res) => {
  try {
    stripe.customers.create(
        {
          email: req.body.email
        },
        async function(err, customer) {
          if(err){
            console.log(err);
            res.sendStatus(500)
          } else{
            await users.create_user(req.body.email, req.body.password, customer.id);
            res.redirect(200, '/account/login');
          }
        }
      );
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

//get account information
router.get('/account', async (req, res) => {
  try{
    let user = await users.get_user(req.session.user.email);

    stripe.customers.retrieve(
      user.records[0].get('u').properties.customer_id,
      function(err, customer) {
        if(err){
          console.log(err);
          res.sendStatus(500)
        }else {
          console.log(customer);
          res.sendStatus(200);
        }
      }
    );
  } catch(e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//updates billing address information
router.put('/account/billing', async (req, res) => {
  if (typeof req.body.line1 === "undefined") return res.sendStatus(400);
  if (typeof req.body.city === "undefined") req.body.city = null;
  if (typeof req.body.country === "undefined") req.body.country = "USA"
  if (typeof req.body.line2 === "undefined") req.body.line2 = null;
  if (typeof req.body.postal_code === "undefined") req.body.postal_code = null;
  if (typeof req.body.state === "undefined") req.body.state = null;

  try{
    let user = await users.get_user(req.session.user.email);

    stripe.customers.update(
      user.records[0].get('u').properties.customer_id,
      {address: req.body},
      function(err, customer) {
        if(err){
          console.log(err);
          res.sendStatus(500)
        }else {
          console.log(customer);
          res.sendStatus(200);
        }
      }
    );
  } catch(e) {
    console.log(e);
    res.sendStatus(500);
  }
});


//update shipping address information
router.put('/account/shipping', async (req, res) => {
  if (typeof req.body.line1 === "undefined") return res.sendStatus(400);
  if (typeof req.body.city === "undefined") req.body.city = null;
  if (typeof req.body.country === "undefined") req.body.country = "USA";
  if (typeof req.body.line2 === "undefined") req.body.line2 = null;
  if (typeof req.body.postal_code === "undefined") req.body.postal_code = null;
  if (typeof req.body.state === "undefined") req.body.state = null;

    let user = await users.get_user(req.session.user.email);

    stripe.customers.update(
      user.records[0].get('u').properties.customer_id, //get the customer_id associated with the user from the database
      {shipping: {address: req.body}},
      function(err, customer) {
        if(err){
          console.log(err);
          res.sendStatus(500)
        }else {
          console.log(customer);
          res.sendStatus(200);
        }
      }
    );
});

//update payment method
router.put('/account/payment', async (req, res) => {
  if(typeof req.body.cc_num === "undefined" ||
    typeof req.body.exp_month === "undefined" ||
    typeof req.body.exp_year === "undefined" ||
    typeof req.body.cvc === "undefined"){
      return res.sendStatus(400); // bad request, not correct information / format
    }
    try{
      const user = await users.get_user(req.session.user.email)
      const customer_id = user.records[0].get('u').properties.customer_id
    } catch(e) {
      console.log(e);
      return res.sendStatus(500);
    }


    const card = await stripe.customers.createSource(
      customer_id,
      {source: {
        object: 'card',
        number: req.body.cc_num,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc
      }}
    );

    await users.update_payment_method(req.session.email, card.id)
    res.sendStatus('200');

});

module.exports = router;
