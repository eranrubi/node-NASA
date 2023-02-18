const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Test /lauches', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /lauches', () => {
    it('should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /lauches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'Itamar',
      target: 'Kepler-1410 b',
      launchDate: 'January 4, 2028',
    };

    const missingLaunchData = {
      mission: 'USS Enterprise',
      target: 'Kepler-1410 b',
      launchDate: 'January 4, 2028',
    };

    const completeLaunchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'Itamar',
      target: 'Kepler-1410 b',
    };

    it('should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(completeLaunchDataWithoutDate);
    });

    it('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(missingLaunchData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    it('It should catch invalid dates', async () => {
      const brokenData = completeLaunchData;
      brokenData.launchDate = 'Eran';

      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid Date format',
      });
    });
  });
});
