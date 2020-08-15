const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { values } = require('../data/users.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'jon@arbuckle.net',
  hash: '12345',
};

app.get('/gemstones', async(req, res) => {
  const data = await client.query(`
        SELECT gemstones.id, gemstones.name, gemstones.color, gemstones.weight, gemstones.is_precious, cuts.cut_style AS cut_style   
        from gemstones
        JOIN cuts
        ON gemstones.cut_id = cuts.id`);

  res.json(data.rows);
});

app.get('/cuts', async(req, res) => {
  const data = await client.query(`
        SELECT * FROM cuts`);

  res.json(data.rows);
});

app.get('/gemstones/:id', async(req, res) => {
  const gemstoneId = req.params.id;

  const data = await client.query(`
        SELECT gemstones.id, gemstones.name, gemstones.color, gemstones.weight, gemstones.is_precious, cuts.cut_style AS cut_style   
        from gemstones
        JOIN cuts
        ON gemstones.cut_id=cuts.id
        WHERE gemstones.id=$1
        `, [gemstoneId]);

  res.json(data.rows[0]);
});

app.delete('/gemstones/:id', async(req, res) => {
  const gemstoneId = req.params.id;

  const data = await client.query('DELETE FROM gemstones WHERE gemstones.id=$1;', [gemstoneId]);

  res.json(data.rows[0]);
});

app.post('/gemstones', async(req, res) => {
  try {
    const newGemstone = {
      name: req.body.name,
      color: req.body.color,
      weight: req.body.weight,
      is_precious: req.body.is_precious,
      cut_id: req.body.cut_id
    };

    const data = await client.query(`
    INSERT INTO gemstones(name, color, weight, is_precious, owner_id, cut_id)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *
    `, [newGemstone.name, newGemstone.color, newGemstone.weight, newGemstone.is_precious, fakeUser.id, newGemstone.cut_id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
