//this module is to provide routes relating to purchasing a textbook
const express = require('express');
const router = express.Router();
const users = require('../data/users.js');
const textbooks = require('../data/textbooks.js');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51HAJL2AqnGgYIobrTfsLtnIVDSKFpI2Qcxg1aAZmcz2zSaILkrOVLUsjB4M8BaKasbwD3Wd5ECt8BqPpUbHiEyTx00pt4Bszd0');

//add textbook listing with list_id to the shopping cart cookie
router.post('/purchase/cart/:list_id', async  (req, res) => {
  if(typeof req.session.cart === 'undefined'){
    req.session.cart = {cart_list: []};
  }
  try {
    req.session.cart.cart_list.push(req.params.list_id);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500)
  }
});

//remove textbook listing with list_id from the shopping cart cookie
// 200 on sucess
// 500 on some error
// 400 when list_id is not in the cookie, or cookie is empty
router.delete('/purchase/cart/:list_id', async (req, res) => {
  if(typeof req.session.cart === 'undefined'){
    return res.sendStatus(400);
  }
  try {
    const index = req.session.cart.cart_list.indexof(req.params.list_id);
    if (index > -1) {
    req.session.cart.cart_list.splice(index, 1);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//purchases items in the shopping cart
//TODO automated email to alert seller
//TODO USPS shipping stuff
router.get('/purchase', async (req, res) => {
  if(typeof req.session.cart === 'undefined'){ //if there is no shopping cart
    return res.sendStatus(400);
  }
  try{
    const buyer = await users.get_user(req.session.user.email);
    let listing;
    let i;
    for(i = 0; i < req.session.cart.cart_list.length; i++){
      // get listing
      listing = textbooks.get_listing(req.session.cart.cart_list[i]);

      //convert stored price to int then convert to cents
      let price = Number(listing.records[0].get('s').properties.price) * 100

      // charge user (buyer)
      const charge = await stripe.charges.create({
        amount: price,
        currency: 'usd',
        receipt_email: req.session.user.email,
        customer: buyer.records[0].get('u').properties.customer_id,
        source: buyer.records[0].get('u').properties.payment_id,
        description: "Booktrade charge.",

      });
      const captured_charge = await stripe.charges.capture(charge.id);
      // alert seller (through automated email)
      // USPS API shipping stuff
      // email receipt to buyer (stripe does this automatically)
      // add purchase/sold information to the database
      await users.create_purchased(req.session.user.email, listing.records[0].get('u').properties.email,
      listing.records[0].get('s').properties.price, listing.records[0].get('t').properties.isbn, captured_charge.id, listing.records[0].get('s').properties.condition);


      
      //TODO add payout_id
      await users.create_sold(req.session.user.email, listing.records[0].get('u').properties.email,
      listing.records[0].get('s').properties.price, listing.records[0].get('t').properties.isbn, listing.records[0].get('s').properties.condition);
      // create shipping/receiving relaionships
      // remove previous listing relationships
    }
    //delete users cart
    req.session.user.cart.cart_list = [];
    //return status 200
  } catch(e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
