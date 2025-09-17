import http from 'http';
import app from './app';
import config from './config/config';

const server = http.createServer(app);

server.on('checkContinue', (req, res) => {
  res.writeContinue();
  app(req, res);
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
