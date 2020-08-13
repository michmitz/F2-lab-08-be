require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns gemstones', async() => {

    const expectation = [
      {
        id: 1,
        name: 'quartz',
        color: 'white',
        weight: 3,
        is_precious: false,
        owner_id: 1
      },
      {
        id: 2,
        name: 'diamond',
        color: 'clear',
        weight: 5,
        is_precious: true,
        owner_id: 1
      },
      {
        id: 3,
        name: 'ruby',
        color: 'red',
        weight: 2,
        is_precious: true,
        owner_id: 1
      },
      {
        id: 4,
        name: 'sapphire',
        color: 'blue',
        weight: 1,
        is_precious: true,
        owner_id: 1
      }
    ];

    const data = await fakeRequest(app)
      .get('/gemstones')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
