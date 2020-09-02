const middleware = require('./middleware');
const account = require('./account');
const textbook = require('./textbook');
const search = require('./search');
const list = require('./list');
const purchase = require('./purchase');

const constructorMethod = app => {
  app.use('', middleware);
  app.use('/', account);
  app.use('/', textbook);
  app.use('/', search);
  app.use('/', list);
  app.use('/', purchase);

  app.use('', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
