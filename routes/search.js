const express = require('express');
const router = express.Router();
const textbooks = require('../data/textbooks.js');


//queries database for title
router.get('/search/:title', async (req, res) => {
  try {
    let result = await textbooks.get_textbook_title(req.params.title);
    if(typeof result === 'undefined' || result.records.length === 0){ //if no textbook found
      res.status(404).json({error: 'textbook not found, try again.'});
    }else{
      res.status(200).json({textbook: result.records});
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({error: "Something went wrong."});
  }
});


module.exports = router;
