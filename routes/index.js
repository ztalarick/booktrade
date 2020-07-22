const log = require('./log');
const account = require('./account');

const constructorMethod = app => {
  app.use('', log);
  app.use('/', account);

  app.use('', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
