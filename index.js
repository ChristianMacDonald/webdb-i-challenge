const server = require('./server.js');
const db = require('./data/dbConfig');

const PORT = process.env.PORT || 4000;

server.post('/api/accounts', validateAccount, async (req, res) => {
  try {
    let createdAccountId = await db('accounts').insert(req.body);
    let createdAccount = await db('accounts').where({ id: createdAccountId[0] });
    res.status(201).json(createdAccount);
  } catch (err) {
    res.status(500).json({ error: 'There was an error while saving the account to the database.' });
  }
});

server.get('/api/accounts', async (req, res) => {
  try {
    let accounts = await db('accounts');
    if (accounts.length) {
      res.status(200).json(accounts);
    } else {
      res.status(404).json({ message: 'The account with the specified ID does not exist.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'The accounts information could not be retrieved.' });
  }
});

server.get('/api/accounts/:id', validateAccountId, (req, res) => {
  res.status(200).json(req.accounts);
});

server.put('/api/accounts/:id', validateAccountId, async (req, res) => {
  try {
    await db('accounts').where({ id: req.params.id }).update(req.body);
    let account = await db('accounts').where({ id: req.params.id });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ error: 'The account information could not be modified.' });
  }
});

server.delete('/api/accounts/:id', validateAccountId, async (req, res) => {
  try {
    await db('accounts').where({ id: req.params.id }).del();
    res.status(200).json(req.accounts);
  } catch (err) {
    res.status(500).json({ error: 'The account could not be removed.'});
  }
});

async function validateAccountId(req, res, next) {
  try {
    let accounts = await db('accounts').where({ id: req.params.id });
    if (accounts.length) {
      req.accounts = accounts;
      next();
    } else {
      res.status(404).json({ message: 'The account with the specified ID does not exist.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'The account information could not be retrieved.' });
  }
}

async function validateAccount(req, res, next) {
  if (req.body) {
    if (req.body.name) {
      if (req.body.budget) {
        next();
      } else {
        res.status(400).json({ message: 'Missing required budget field.' });
      }
    } else {
      res.status(400).json({ message: 'Missing required name field.' });
    }
  } else {
    res.status(400).json({ message: 'Missing account data.' });
  }
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});