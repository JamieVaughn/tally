import { chromium } from 'playwright'
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const username = process.env.REDDIT_USERNAME
const pw = process.env.REDDIT_CREDENTIAL
let user = {
  username,
  pw,
  sort: 'new' // new, top, controversial
}

async function commentRollup ({username, pw, sort}) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log in to Reddit
  await page.goto('https://old.reddit.com/login');
  await page.fill('input#user_login', username);
  await page.fill('input#passwd_login', pw);
  await Promise.all([
    page.click('form#login-form button[type="submit"]'),
    page.waitForNavigation(),
  ]);

  // Navigate to user's comment history page
  let comments = []
  let iter = 1
  let last_id = ''
  // Scrape comment history by page by queryString
  do {
    await page.goto(`https://old.reddit.com/user/${username}/comments?count=${iter*25}&after=${last_id}${sort ? '&sort='+sort : ''}`);
    comments = await page.$$eval('form.usertext', (elements) => {
      return elements.map((el) => {
        const id = el.querySelector('input[type="hidden"]').value
        const context = el.nextElementSibling.querySelector('a[data-event-action=context]').getAttribute('href')
        const comment = el.querySelector('.usertext-body')
        const text = comment.textContent;
        const html = comment.innerHTML;
        return { html, text, id, context };
      }) ?? [];
    });
    fs.appendFile(`./reddit/${username}_${sort}_comments.js`, `\nconst commentsTo${iter*25} = ` + JSON.stringify(comments, null, 2), err => {
      if(err) throw err
      console.error(err) 
    })
    iter++
    last_id = await comments[comments.length - 1]?.id ?? last_id
  } while (comments.length >= 25)
  

  console.log(`finished at count: ${iter * 25}, with last_id: ${last_id}`);

  // fs.writeFile(`./reddit/${username}_comments.js`, JSON.stringify(comments, null, 2), err => {
  //   if(err) throw err
  //   console.error(err) 
  // })

  await browser.close();
}

commentRollup(user)
