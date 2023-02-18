import * as puppeteer from 'puppeteer'
import fs from 'fs'
import cron from 'node-cron'

const students = [
  {}
]

const tally = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto("https://learnwebcode.github.io/practice-requests/")

  // await page.screenshot({
  //   path: 'amazing.png', 
  //  fullPage: true // for long scrolling pages
  // })

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.info strong')).map(txt => txt.textContent)
  })
  // await fs.writeFile('names.txt', names.join('\r\n'), (err) => err && console.error(err))
  // https://stackoverflow.com/questions/72432428/i-am-getting-cb-argument-error-when-i-run-the-code

await page.click('#clickme')
const clickedData = await page.$eval('#data', el => el.textContent, (err) => err && console.error(err))
// await fs.writeFile('clicked.txt', clickedData, (err) => err && console.error(err))

await page.type('#ourfield', 'blue')
await Promise.all([
  await page.click('#ourform button'),
  await page.waitForNavigation(),
])
const info = await page.$eval('#message', el => el.textContent)
// await fs.writeFile('form_response.txt', info, (err) => err && console.error(err))
console.log(info)

const photos = await page.$$eval('img', (imgs) => {
  return imgs.map(img => img.src)
})
for (const photo of photos) {
  const image = await page.goto(photo)
  // await fs.writeFile(photo.split('/').pop(), await image.buffer(), (err) => err && console.error(err))
}

  await browser.close()
}

tally()
// setInterval(tally, 5000)
// cron.schedule('*/5 * * * * *', tally)


export const TallyFCC = (req, res) => {
  
  res.send('Hello')
}

