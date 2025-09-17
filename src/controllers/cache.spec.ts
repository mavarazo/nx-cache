import request from 'supertest';
import app from '../app';
import { recordCache } from '../config/cache';
import mockFs from 'mock-fs';
import config from '../config/config';
import path from 'path';

describe('cache controller', () => {
  const testCacheDir = path.join('virtual', 'cache');

  beforeAll(() => {
    config.cacheDir = testCacheDir;
  });

  afterEach(() => {
    recordCache.clear();
    mockFs.restore();
  });

  describe('get record', () => {
    it('should return status 200 from cache', async () => {
      jest.spyOn(recordCache, 'get').mockReturnValue(Buffer.from('cached'));

      const res = await request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer read-token')
        .expect(200);

      expect(res.headers['content-type']).toContain('application/octet-stream');
      expect(res.body).toBeDefined();
    });

    it('should return status 200 from storage', async () => {
      recordCache.clear();
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);

      mockFs({
        [config.cacheDir]: {
          '12345': 'Bingo',
        },
      });

      const res = await request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer read-token')
        .expect(200);

      expect(res.headers['content-type']).toContain('application/octet-stream');
      expect(res.body.toString()).toEqual('Bingo');
    });

    it('should return status 401 without token', async () => {
      const res = await request(app).get('/v1/cache/12345').expect(401);

      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toEqual('Missing or invalid token');
    });

    it('should return status 403 with invalid token', async () => {
      const res = await request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer some-token')
        .expect(403);

      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toEqual('Forbidden');
    });

    it('should return status 404 when not on disk', async () => {
      recordCache.clear();
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);

      mockFs({ [config.cacheDir]: {} }); // leerer Cache-Ordner

      const res = await request(app)
        .get('/v1/cache/67890')
        .set('Authorization', 'Bearer read-token')
        .expect(404);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toEqual({
        message: "Record with hash '67890' not found",
      });
    });
  });

  describe('save record', () => {
    it('should return 202 and save record', async () => {
      recordCache.clear();
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);

      mockFs({ [config.cacheDir]: {} });

      const res = await request(app)
        .put('/v1/cache/13579')
        .set('Authorization', 'Bearer write-token')
        .send('test')
        .expect(202);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toEqual({
        message: "Record with hash '13579' saved",
      });
    });

    it('should return status 401 without token', async () => {
      const res = await request(app).put('/v1/cache/13579').expect(401);

      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toEqual('Missing or invalid token');
    });

    it('should return status 403 with read token', async () => {
      const res = await request(app)
        .put('/v1/cache/13579')
        .set('Authorization', 'Bearer read-token')
        .expect(403);

      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toEqual('Forbidden');
    });

    it('should return status 409 if record already exists in cache', async () => {
      jest.spyOn(recordCache, 'get').mockReturnValue(Buffer.from('cached'));

      const res = await request(app)
        .put('/v1/cache/12345')
        .set('Authorization', 'Bearer write-token')
        .send('test')
        .expect(409);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toEqual({
        message: "Record with hash '12345' already exists",
      });
    });

    it('should return status 409 if record already exists on disk', async () => {
      recordCache.clear();
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);

      mockFs({
        [config.cacheDir]: {
          '12345': 'exists',
        },
      });

      const res = await request(app)
        .put('/v1/cache/12345')
        .set('Authorization', 'Bearer write-token')
        .send('test')
        .expect(409);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toEqual({
        message: "Record with hash '12345' already exists",
      });
    });
  });
});
