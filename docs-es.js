/**
 * @license
 * Copyright 2019, Mulesoft.
 *
 * THE WORK (AS DEFINED BELOW) IS PROVIDED UNDER THE TERMS OF
 * THIS CREATIVE COMMONS PUBLIC LICENSE ("CCPL" OR "LICENSE").
 * THE WORK IS PROTECTED BY COPYRIGHT AND/OR OTHER APPLICABLE LAW.
 * ANY USE OF THE WORK OTHER THAN AS AUTHORIZED UNDER THIS LICENSE OR
 * COPYRIGHT LAW IS PROHIBITED.
 *
 * BY EXERCISING ANY RIGHTS TO THE WORK PROVIDED HERE,
 * YOU ACCEPT AND AGREE TO BE BOUND BY THE TERMS OF THIS LICENSE.
 * THE LICENSOR GRANTS YOU THE RIGHTS CONTAINED HERE IN CONSIDERATION
 * OF YOUR ACCEPTANCE OF SUCH TERMS AND CONDITIONS.
 *
 * See LICENSE.md for license content.
 */

import * as traceAgent from '@google-cloud/trace-agent';
import * as debugAgent from '@google-cloud/debug-agent';
import path from 'path';
import express from 'express';
import serveStatic from 'serve-static';
import fs from 'fs';
import compression from 'compression';
import config from './config.js';
import { requestLogger } from './lib/logging.js';
// import { isLocalhost } from './lib/Utils.js';

const IS_PRODUCTION = config.get('NODE_ENV') === 'production';

if (IS_PRODUCTION) {
  traceAgent.start();
  debugAgent.start();
}

const app = express();
export default app;

app.disable('etag');
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(requestLogger);
app.use(compression());

app.get('/_ah/health', (req, res) => {
  res.status(200).send('ok');
});

// app.use((req, res, next) => {
//   const host = req.get('host');
//   if (req.protocol === 'http' && !isLocalhost(host)) {
//     res.redirect(301, `https://${host}${req.url}`);
//     return;
//   }
//   next();
// });


const serveDemo = serveStatic('docs-dist');
const demoDev = (req, res) => {
  return () => {
    const index = path.join('docs-dist', 'index.html');
    fs.readFile(index, 'utf8', (err, data) => {
      if (err) {
        res.status(500).send({
          error: 'Unable to read demo app index file',
        });
      } else {
        res.set('Content-Type', 'text/html');
        res.send(data);
      }
    });
  };
};

app.get('*', (req, res) => {
  serveDemo(req, res, demoDev(req, res));
});

const server = app.listen(config.get('PORT'), () => {
  const { port } = server.address();
  /* eslint-disable-next-line no-console */
  console.log(`App listening on port ${port}`);
});
