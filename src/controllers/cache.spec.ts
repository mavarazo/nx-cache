import request from 'supertest';
import app from '../app';
import { Readable, Writable } from 'stream';
import fs from 'fs';
import { recordCache } from '../config/cache';
import config from '../config/config';

jest.mock('fs');

describe('cache controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    recordCache.clear();
  });

  describe('get record', () => {
    it('should return status 200 from cache', (done) => {
      // arrange
      jest.spyOn(recordCache, 'get').mockReturnValue(Buffer.from('cached'));

      // act
      request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer read-token')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/octet-stream',
          );
          expect(res.body).not.toBeUndefined;
        })
        .end(done);
    });

    it('should return status 200 from storage', (done) => {
      // arrange
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);

      const mockStream = Readable.from(['bingo']);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

      // act
      request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer read-token')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/octet-stream',
          );
          expect(res.body).not.toBeUndefined;
        })
        .end(done);
    });

    it('should return status 401', (done) => {
      request(app)
        .get('/v1/cache/12345')
        .expect(401)
        .expect((res) => {
          expect(res.text).toEqual('error: missing or invalid token');
        })
        .end(done);
    });

    it('should return status 403', (done) => {
      request(app)
        .get('/v1/cache/12345')
        .set('Authorization', 'Bearer write-token')
        .expect(403)
        .expect((res) => {
          expect(res.text).toEqual('error: forbidden');
        })
        .end(done);
    });

    it('should return status 404', (done) => {
      request(app)
        .get('/v1/cache/67890')
        .set('Authorization', 'Bearer read-token')
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual({
            error: "record with hash '67890' not found",
          });
        })
        .end(done);
    });
  });

  describe('save record', () => {
    it('should return status 202', (done) => {
      // arrange
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.writeFile as unknown as jest.Mock).mockImplementation(
        (_path, _data, callback) => {
          callback(null); // simulate successful write
        },
      );

      // act
      request(app)
        .put('/v1/cache/13579')
        .set('Authorization', 'Bearer write-token')
        .set('Content-Length', '4')
        .send('test')
        .expect(202)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('application/json');
          expect(res.body).toEqual({
            message: "record with hash '13579' saved",
          });
        })
        .end(done);
    });

    it('should return status 401', (done) => {
      request(app)
        .put('/v1/cache/13579')
        .expect(401)
        .expect((res) => {
          expect(res.text).toEqual('error: missing or invalid token');
        })
        .end(done);
    });

    it('should return status 403', (done) => {
      request(app)
        .put('/v1/cache/13579')
        .set('Authorization', 'Bearer read-token')
        .expect(403)
        .expect((res) => {
          expect(res.text).toEqual('error: forbidden');
        })
        .end(done);
    });

    it('should return status 409 from cache', (done) => {
      // arrange
      jest.spyOn(recordCache, 'get').mockReturnValue(Buffer.from('cached'));
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // act
      request(app)
        .put('/v1/cache/12345')
        .set('Authorization', 'Bearer write-token')
        .set('Content-Length', '4')
        .send('test')
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            error: "record with hash '12345' already exists",
          });
        })
        .end(done);
    });

    it('should return status 409 from storage', (done) => {
      // arrange
      jest.spyOn(recordCache, 'get').mockReturnValue(undefined);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // act
      request(app)
        .put('/v1/cache/12345')
        .set('Authorization', 'Bearer write-token')
        .set('Content-Length', '4')
        .send('test')
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            error: "record with hash '12345' already exists",
          });
        })
        .end(done);
    });
  });
});
