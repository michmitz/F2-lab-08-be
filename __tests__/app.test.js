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
        name: 'quartz',
        color: 'white',
        weight: 3,
        isPrecious: false
      },
      {
        name: 'diamond',
        color: 'clear',
        weight: 5,
        isPrecious: true
      },
      {
        name: 'ruby',
        color: 'red',
        weight: 2,
        isPrecious: true
      },
      {
        name: 'sapphire',
        color: 'blue',
        weight: 1,
        isPrecious: true
      }
    ];

    const data = await fakeRequest(app)
      .get('/gemstones')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
