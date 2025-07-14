// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let tokens = {}; // memory store for tokens and sync tokens
let channelId = null;

// === AUTH ===
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get('/auth', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens: newTokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(newTokens);
  tokens = newTokens;
  await watchCalendar();
  res.redirect('http://localhost:5173');
});

async function watchCalendar() {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  channelId = `chan-${Date.now()}`;
  await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: process.env.GOOGLE_CALENDAR_WEBHOOK,
    },
  });
}

app.post('/notifications', async (req, res) => {
  res.sendStatus(200);
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const events = await calendar.events.list({
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  latestEvents = events.data.items;
});

let latestEvents = [];

app.get('/events', (req, res) => {
  res.json(latestEvents);
});

app.listen(process.env.PORT, () => {
  console.log('Backend running on http://localhost:' + process.env.PORT);
});
