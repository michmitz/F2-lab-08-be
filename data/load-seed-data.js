const client = require('../lib/client');
// import our seed data:
const gemstones = require('./gemstones.js');
const usersData = require('./users.js');
const cutsData = require('./cuts.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      cutsData.map(cut => {
        return client.query(`
                      INSERT INTO cuts (cut_style)
                      VALUES ($1);
                    `,
        [cut.cut_style]);
      })
    );


    await Promise.all(
      gemstones.map(gemstone => {
        return client.query(`
                    INSERT INTO gemstones (name, color, weight, is_precious, owner_id, cut_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [gemstone.name, gemstone.color, gemstone.weight, gemstone.is_precious, user.id, gemstone.cut_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
