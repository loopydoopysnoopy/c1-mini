import Express from 'express';
const app = Express();

import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(Express.static('public'))
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

const activeUsers = [];

import { messageStatus, inboundMessage} from './routes/messages.js';
import { verifyStatus, silentIndex, silentStart, silentCallback, silentCheck} from './routes/silent.js';
import { solanaVerify, solanaCheck } from './routes/solana.js';

app.post('/messageStatus', messageStatus);
app.post('/verifyStatus', verifyStatus);
app.get('/silent', silentIndex);
app.use('/silent/callback', silentCallback);
app.get('/solana', solanaVerify);
app.use('/solana/check', solanaCheck);

app.post('/inboundMessage', (req, res) => {
  const { from, text } = req.body;
  res.sendStatus(200);

  let user = activeUsers.find(obj => obj.number === from);
  if (user === undefined)  {
    user = { number: from, sms_memo:"", req_id:"" };
    activeUsers.push(user);
  }
  user.sms_memo = text; 
  inboundMessage(user);
  console.log(activeUsers);
});


app.use('/silent/start', async (req, res) => {
  const { number } = req.body;
  let user = activeUsers.find(obj => obj.number === number);
  if (user === undefined)  {
    res.render('silent', { error: 'App not expecting user : ' + number });
  } else user.req_id = await silentStart(req, res);
  console.log(user);
});

//this route handler does not need to be async
app.use('/silent/check', (req, res) => {
  const request_id = req.query.request_id;
  let user = activeUsers.find(obj => obj.req_id === request_id);
  if (user === undefined)  {
    res.render('silent', { error: 'Auth Request Not Found' });
  } else silentCheck(req, res, user);
  console.log(user);
});


app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    title: 'Not Found',
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    status: 500,
    title: 'Internal Server Error',
    detail: err.message,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});