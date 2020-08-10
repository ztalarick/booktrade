// This module is to provide functions to interface with Stripe's API
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51HAJL2AqnGgYIobrTfsLtnIVDSKFpI2Qcxg1aAZmcz2zSaILkrOVLUsjB4M8BaKasbwD3Wd5ECt8BqPpUbHiEyTx00pt4Bszd0');


//test keys
const PUBLIC_KEY = "pk_test_51HAJL2AqnGgYIobr6AeZNKeQwq5D0z3gyxJc3HKXAeXWzclT2Mp0sd4QxOxj3fkRGqlS5g8DM2FsWHRXIHEYyfVL00SLToDnKz";
const SECRET_KEY = "sk_test_51HAJL2AqnGgYIobrTfsLtnIVDSKFpI2Qcxg1aAZmcz2zSaILkrOVLUsjB4M8BaKasbwD3Wd5ECt8BqPpUbHiEyTx00pt4Bszd0";

//this function takes an email and creates a stripe customer with the information
// returns an ID to be associated with the user in the database
// the stripe customer must be updated with payment and shipping information before buying.
async function create_customer(email){
  if(!email) return Promise.reject("no email given");

stripe.customers.create(
    {
      email: email
    },
    function(err, customer) {
      if(err) console.log(err);
    }
  );
}

module.exports = {
  create_customer: create_customer
};
