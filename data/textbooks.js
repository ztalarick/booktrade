//this module creates functions that query the nodejs database
const neo4j = require('neo4j-driver')
const drivers = require('./drivers.js');
const driver = drivers.driver;
const spawn = require("child_process").spawn;

//creates a textbook from an isbn number, other data is filled by webscraping
//TODO webscrape price data
async function create_textbook(isbn){
  if(!isbn || typeof isbn !== 'string') return Promise.reject('Invalid isbn');

  //run python script by spawning a child process
  const scraper = spawn('python3', ["./data/scrape/campusbooks.py", isbn]);
  scraper.stdout.on('data', async (data) => {
    // the child process needes its own driver
    const child_driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Booktrade!"));
    const session = child_driver.session();

    //convert the data to a string then to an object
    //also the python script puts the keys for isbn like "isbn 10" and "isbn 13" get rid of space
    let data_object = JSON.parse(data.toString());
    try {
      // the query
      let result = await session.run('CREATE (t:Textbook {title: $titleParam, authors: $authorsParam, edition: $editionParam, format: $formatParam, isbn: $isbnParam, isbn13: $isbn13Param}) RETURN t',
    {
      titleParam: data_object.title,
      authorsParam: data_object.Authors,
      editionParam: data_object.Edition,
      formatParam: data_object.Format,
      isbnParam: isbn,
      isbn13Param: data_object.ISBN13
    });
    } catch (e) {
      console.log(e);
    } finally {
      await session.close();
      await child_driver.close();
    }
  });
  scraper.stderr.on('data', (data) => {
    console.log('Error in campusbooks.py: ' + data);
  });
}

module.exports = {
  create_textbook: create_textbook
};
