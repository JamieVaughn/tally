import * as puppeteer from 'puppeteer'
import fs from 'fs' 
// import cron from 'node-cron'
import { students } from '../input/students.js'

// Object.entries(students).forEach(async ([student, id]) => {
//   console.log('student', student)
//   await tally(id, student)
// })

function readWriteFile() {
  fs.readFile('./input/students.txt', 'utf-8', (err, data) => {
    if(err) throw err
    console.log(data)
    fs.writeFile('./output/students.html', `<div>${data}</div>`, err => {
      if(err) throw err
      console.log('File creation was successful.')
    })
  })
}

const tally = async (studentName) => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(`https://www.freecodecamp.org/${students[studentName]}`)

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

  // puppeteer.expect(await userPage.$eval('.username', node => node.innerText)).toBe(students[studentName]);

  // if(!userPg) return {notFound: true}

  const limit = await page.evaluate(async () => {
    const pages = await Array.from(document.querySelectorAll(".timeline-pagination_list_item"))
    const textNode = await pages.find(
      p => p.firstChild.nodeName == "#text"
    ).innerText
    return Number(textNode.split(" ")[2])
  })
  // to kind of do the above with XPath:
  // const [el] = await page.$x('//*[@id="content-start"]/div/div[2]/div[3]/div/table')
  // const txt = await el.getProperty('textContent')
  // const innerContent = await txt.jsonValue()

  let iteration = 1;
  let result = {};
  const hrefs = []
  let data

  do {
    data = await tallyCurPg(result);
    hrefs.push(...data)
    iteration++;
    try {
      await page.click('aria/Go to next page')
    } catch (err) {}
  } while ( iteration <= limit)

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
    return await hrefs
  }

  console.log('final result:', await result)
  await browser.close()
  fs.writeFile(`./output/${studentName}.json`, JSON.stringify(result, null, 2), err => {
    if(err) throw err
    console.error(err) 
  })
  fs.writeFile(`./output/${studentName}-hrefs.json`, JSON.stringify(hrefs, null, 2), err => {
    if(err) throw err
    console.error(err) 
  })
  return await result
}

tally('lance')

// jackie
// sandra


// browser console version
// function tallyTimeline() {
//   const pages = document.querySelectorAll(".timeline-pagination_list_item");
//   const textNode = Array.from(pages).find(
//     p => p.firstChild.nodeName == "#text"
//   );
//   const limit = Number(textNode.innerText.split(" ")[2]);
//   let iteration = 0;
//   const countObj = {};
//   let hasButton = document.querySelector("button[aria-label='Go to next page']");
//   while (hasButton && iteration <= limit) {
//     iteration++;
//     tallyThisPage(countObj);
//     hasButton.click();
//     hasButton = document.querySelector("button[aria-label='Go to next page']");
//   }

//   function tallyThisPage(obj) {
    // var xpath = "//h2[text()='Timeline']";
    // var matchingElement = document.evaluate(
    //   xpath,
    //   document,
    //   null,
    //   XPathResult.FIRST_ORDERED_NODE_TYPE,
    //   null
    // ).singleNodeValue;
    // return Array.from(
    //   matchingElement.nextElementSibling.querySelectorAll("tbody a")
    // )
    //   .map(i => i.href.split("/")[5])
    //   .reduce((a, c) => {
    //     a[c] != null ? a[c]++ : (a[c] = 1);
    //     return a;
    //   }, obj);
//   }
//   return countObj;
// }
