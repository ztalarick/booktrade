const express = require('express');
const router = express.Router();
const textbooks = require('../data/textbooks.js');

//gets a textbook with isbn
//if its not found then one will be created
// the request must then be repeated again, because to create a new textbook a child process
// must be created and that cannot be synced with the main process to return the new textbook
router.get('/textbook/:isbn', async (req, res) => {
  let result;
  let isbn = req.params.isbn.replace('-', '');
  try {
    if(isbn.length === 13){
      result = await textbooks.get_textbook_isbn13(isbn);
    }else{
      result = await textbooks.get_textbook(isbn);
    }
    if(typeof result === 'undefined' || result.records.length === 0){ //if no textbook found
      result = await textbooks.create_textbook(isbn);

      res.status(404).json({error: 'textbook not found, try again.', textbook: result});
    }else{
      res.status(200).json({textbook: result.records[0].get('t')});
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({error: "Something went wrong."});
  }
});


module.exports = router;
