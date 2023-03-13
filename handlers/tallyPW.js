import * as pw from 'playwright'
import fs from 'fs' 
import { students } from '../input/students.js'

const tally = async (studentName) => {
  const browser = await pw.chromium.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(`https://www.freecodecamp.org/${students[studentName]}`)

  // await page.waitForTimeout(5000)

  // let notFound
  // try {
  //   notFound = await page.waitForSelector('text/Page not found');
  //   if(notFound) return {notFound: true}
  // } catch (err) {
  //   console.log(err)
  // }

  // const userPg = await page.evaluate(async () => {
  //   // const notFound = await page.waitForSelector('text/Page not found')
  //   const timeline = await page.waitForSelector('text/Timeline')
  //   const username = await page.waitForSelector('.username')

  //   if(username.innerText === students[studentName] || timeline) return true

  //   return false
  // })

  // let userPg = await Promise.race([
  //   page.waitForSelector('text/Page not found'),
  //   page.waitForSelector('text/Timeline'),
  // ])

  // if(!userPg) return {notFound: true}
  const cssSelector = '.timeline-pagination_list_item'

  const pagination = await (await page.waitForSelector(`${cssSelector}:nth-of-type(2)`)).innerText()
  const limit = Number(pagination.split(" ")[2])

  let iteration = 1;
  let result = {};
  let data

  const getBtn = async () => await page.locator(`${cssSelector} [aria-label="Go to next page"]`).getAttribute('disabled') === ''

  do {
    data = await tallyCurPg(result);
    // isDisabled = await page.locator(`${cssSelector} [aria-label="Go to next page"]`).getAttribute('disabled')
    // hasBtn = await getBtn()
    // console.log('disable', hasBtn, iteration <= limit)
    if(!(await getBtn())) {
      await page.locator(`${cssSelector} [aria-label="Go to next page"]`).click()
    }
    iteration++;
  } while (iteration <= limit && (!(await getBtn())))

  async function tallyCurPg(count = {}) {
    const hrefs = await page.evaluate(() => {
      return Array
        .from(document.querySelectorAll("tr.timeline-row > td > a")) // for the <name>1.json files it used:  tr.timeline-row a
        .map(a => {
          return a.getAttribute('href')
        })
    })
    const challenges = hrefs.map(href => {
      const isProject = href.includes('project')
      const isCertificate = href.includes('certificat') // matches certification or certificate
      const kind = href.split('/')[3] ?? href
      if(isProject) {
        return 'project-'+ href.split('/').at(-1)
      } else if(isCertificate) {
        return 'certificate-'+ href.split('/').at(-1)
      } else {
        return kind
      }
    })
    const rollup = await challenges.reduce((a, c) => (a[c]&&=a[c]+1, a[c]||=1, a), count)
    if(!(iteration%30)) console.log(`rollup ${iteration}`, await rollup) // in-process debug logging
    return await {hrefs, challenges, rollup}
  }

  console.log('final result:', await result)
  await browser.close()
  fs.writeFile(`./output/${studentName}.json`, JSON.stringify(result, null, 2), err => {
    if(err) throw err
    console.error(err) 
  })
  fs.writeFile(`./output/${studentName}-data.json`, JSON.stringify(data, null, 2), err => {
    if(err) throw err
    console.error(err) 
  })
  return await result
}

tally('jamie')
