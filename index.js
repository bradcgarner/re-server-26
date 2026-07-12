'use strict';

const cors        = require('cors');
const express     = require('express');
const logger      = require('log123').createLogger(''); // logs to console if no filename
const app         = express();
const compression = require('compression');
require('dotenv').config();

const PORT = process.env.PORT;

app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({limit: '5mb', extended: true}));

app.use(compression());

const allowedOrigins = typeof process.env.ALLOWED_ORIGINS  === 'string' ?
  process.env.ALLOWED_ORIGINS.split(',') : [] ;

app.use(
  cors({
    origin: function(origin, callback){
      const _origin = `${origin}`; // this converts undefined to 'undefined' to allow PostMan if .env includes undefined as an origin
      const index = allowedOrigins.indexOf(_origin);
      if(index !== -1){
        callback(null, true);
      } else {
        // eslint-disable-next-line no-console
        console.error(`origin ${origin} blocked`);
        callback(new Error(`origin not allowed by CORS: ${origin}`));
      }
    }
  })
);

let server; 

function runServer(port=PORT) {

  return new Promise(resolve => {
      server = app.listen(port, () => {
				logger.info(`\nAs of ${new Date()}, RE Server is listening on port ${port}.`);
				resolve();
			})
			.on('error', err => {
				logger.error(`Express failed to start ${err}`);
			});
  })
	.then(()=>{
		const { router: openRouter} = require('./open');
		const { router: authRouter} = require('./auth');
		const { router: generalRouter} = require('./general');
		const { router: activitiesRouter} = require('./activities');
		const { router: contactsRouter} = require('./contacts');
		const { router: dealsRouter} = require('./deals');
		const { router: proformaeRouter} = require('./proformae');
		const { router: dailyPlansRouter} = require('./daily-plans');

		app.use('/api/open', openRouter);
		app.use('/api/auth', authRouter);
		app.use('/api/general', generalRouter);
		app.use('/api/activities', activitiesRouter);
		app.use('/api/contacts', contactsRouter);
		app.use('/api/deals', dealsRouter);
		app.use('/api/proformae', proformaeRouter);
		app.use('/api/daily-plans', dailyPlansRouter);

		console.log('All server modules have loaded. Ready for use. Done.');
		return;
	});
}

// if called directly, vs 'required as module'
if (require.main === module) { // i.e. if server.js is called directly (so indirect calls, such as testing, don't run this)
  runServer().catch(err => logger.error(err));
}

module.exports = { app, runServer };