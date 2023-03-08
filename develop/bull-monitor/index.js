const BullMonitorExpress = require('@bull-monitor/express');
const BullAdapter = require('@bull-monitor/root/dist/bull-adapter.js');
const Queue = require('bull');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { ensureLoggedIn } = require('connect-ensure-login');
const express = require('express');
const config = require('./config');
passport.use(
  new LocalStrategy(function (username, password, cb) {
    //todo: config in .env
    if (username === config.username && password === config.password) {
      return cb(null, { user: 'nft' });
    }
    return cb(null, false);
  }),
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
const run = async () => {
  const app = express();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(
    session({ secret: 'keyboard cat', saveUninitialized: true, resave: true }),
  );
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize({}));
  app.use(passport.session({}));

  app.get('/ui/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' });
  });
  app.post(
    '/ui/login',
    passport.authenticate('local', {
      failureRedirect: '/ui/login?invalid=true',
    }),
    (req, res) => {
      res.redirect('/ui');
    },
  );
  const monitor = new BullMonitorExpress.BullMonitorExpress({
    queues: [
      ...config.queues.map((queue) => {
        return new BullAdapter.BullAdapter(
          new Queue(queue, `redis://${config.redis.host}:${config.redis.port}`),
          { readonly: false },
        );
      }),
    ],
    gqlIntrospection: true,
    metrics: {
      collectInterval: { hours: 1 },
      maxMetrics: 100,
      blacklist: ['1'],
    },
  });
  await monitor.init();
  app.use('/ui', ensureLoggedIn({ redirectTo: '/ui/login' }), monitor.router);

  app.listen(config.port, () => {
    console.log(`Running on ${config.port}...`);
    console.log(`For the UI, open http://localhost:${config.port}/ui`);
  });
};
// eslint-disable-next-line no-console
run().catch((e) => console.error(e));
