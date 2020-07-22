const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 13;
const users = require('../data/users.js');

//Route to register an account
//TODO implement payment method
router.post('/account/register', async (req, res) => {

  try {
    users.create_user(req.body.email, req.body.password)
  } catch (e) {
    console.log(e);
    res.status(400).json({error: e});
  } finally {
    res.sendStatus(200);
  }
});

module.exports = router;
