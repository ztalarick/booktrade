const log = require('./log');

const constructorMethod = app => {
  app.use('', log);

  app.use('', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
