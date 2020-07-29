const express = require('express');
const router = express.Router();
const users = require('../data/users.js');
const textbooks = require('../data/textbooks.js');

//create listing
router.post('/list', async (req, res) => {
  //check proper JSON format
  if(!req.body.isbn || !req.body.price || !req.body.condition) res.sendStatus(400);
  try {
    //must create listing from both user -> textbook and textbook -> user
    await users.create_listing(req.body.isbn, req.session.user.email, req.body.price, req.body.condition);
    await textbooks.textbook_to_user(req.body.isbn, req.session.user.email, req.body.price, req.body.condition);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  } finally {
    res.sendStatus(200);
  }
});

router.get('/list', async (req, res) => {
  try {
    let result = await textbooks.get_listings(req.session.user.email);
  } catch (e) {
    console.log(e);
    res.sendStatus(500)
  } finally {
    if(typeof result === 'undefined' || result.records.length === 0) res.sendStatus(401);
    res.status(200).json({
      listings: result.records
    });
  }
});


module.exports = router;
