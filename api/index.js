const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const { format } = require('date-fns');
const { de } = require('date-fns/locale');

const token = process.env.T_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const apiUrl = 'https://api.rocketbeans.tv/v1';

bot.onText(/\/sendeplan/, async (msg) => {
  const chatId = msg.chat.id;

  const shows = await getShows();
  const response = shows.map(s => {
    return `${getStarttime(s)}: ${getLiveEmoji(s)} ${s.title}\nmit ${getBohnen(s)}\n`
  }).join('\n')
  bot.sendMessage(chatId, response);
});

function getStarttime(show) {
  let prefix = '';

  if (new Date(show.timeStart).getTime() < Date.now()) prefix = 'seit ';;

  return prefix + format(new Date(show.timeStart), 'HH:mm', { locale: de }) + ' Uhr';
}

function getBohnen(show) {
  return show.bohnen.map(_ => _.name).join(', ');
}

function getLiveEmoji(show) {
  if (show.type === 'live') return '🔴';
  if (show.type === 'premiere') return '🔵';

  return '⚪️'
}

async function getShows() {
  const dayNow = Math.round((Date.now()) / 1000);
  const dayNext = Math.round((Date.now() + (1000 * 60 * 60 * 24 * 2)) / 1000);
  const { data } = await get(`${apiUrl}/schedule/normalized?startDay=${dayNow}&endDay=${dayNext}`);
  const showList = data.map(_ => _.elements).flat()
  showList.sort((a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime());
  const nextShows = showList.filter(show => new Date(show.timeEnd).getTime() > Date.now()).slice(0, 5)

  return nextShows;
}

function get(url) {
  return fetch(url)
    .then(res => res.json())
}