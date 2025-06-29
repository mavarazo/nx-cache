import request from 'supertest';
import app from '../app';
import { Readable, Writable } from 'stream';
import fs from 'fs';

jest.mock('fs');

describe('cache controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    process.env.API_KEY_READ_TOKEN = 'read-token';
    process.env.API_KEY_WRITE_TOKEN = 'write-token';
  });

  describe('get record', () => {
    it('should return status 200', (done) => {
      // arrange
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
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should return status 401', (done) => {
      request(app)
        .get('/v1/cache/67890')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'missing or invalid token',
          });
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
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
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('save record', () => {
    it('should return status 202', (done) => {
      // arrange
      const mockWriteStream = new Writable();
      mockWriteStream._write = (chunk, encoding, callback) => {
        callback();
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

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
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });

      process.nextTick(() => {
        mockWriteStream.emit('finish');
      });
    });

    it('should status 401', (done) => {
      request(app)
        .put('/v1/cache/13579')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'missing or invalid token',
          });
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should status 403', (done) => {
      request(app)
        .put('/v1/cache/13579')
        .set('Authorization', 'Bearer read-token')
        .expect(403)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'forbidden',
          });
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should status 409', (done) => {
      // arrange
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
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
