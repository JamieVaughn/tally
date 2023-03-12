import * as puppeteer from 'puppeteer'
import fs from 'fs' 
// import cron from 'node-cron'

const students = {
  jamie: 'fcc5201f47b-6b22-4273-9e62-b24cef2f8efc',
  brett: 'fcc321f603b-a7f6-4e89-ab59-a2d37a7cfbc3',
  sandra: 'fcc035112b5-cfa7-471f-a40a-0bad863c932c',
  lance: 'fcc7831610a-2fb3-47bb-96a5-602e267ef757',
  davidm: 'seaeagles',
  jackie: 'JSM-Dev',
  akul: 'fccbba861c9-ebd9-497e-8b4b-6b9bcd273f22',
  heatherrooo: 'heatherrooo',
}


const tally = async (student) => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(`https://www.freecodecamp.org/${student}`)

  const limit = await page.evaluate(async () => {
    const pages = await Array.from(document.querySelectorAll(".timeline-pagination_list_item"))
    const textNode = await pages.find(
      p => p.firstChild.nodeName == "#text"
    ).innerText;
    return Number(textNode.split(" ")[2])
  })

  let iteration = 1;
  let result = {};
  // let hasButton = await Promise.race([
  //   page.waitForSelector('aria/Go to next page'),
  //   page.waitForSelector('button[aria-label="Go to next page"][disabled]'),
  // ])

  do {
    await tallyCurPg(result);
    iteration++;
    try {
      await page.click('aria/Go to next page')
    } catch (err) {}
    // try {
    //   await page.click('aria/Go to next page')
    //   hasButton = await Promise.race([
    //     page.waitForSelector('aria/Go to next page'),
    //     page.waitForSelector('button[aria-label="Go to next page"][disabled]'),
    //   ])
    // } catch (err) {
    //   console.error(err, 'no next button')
    //   hasButton = null
    // }
  } while ( iteration <= limit) // && hasButton)

  async function tallyCurPg(count = {}) {
    const timeline = await page.evaluate(() => {
      return Array
        .from(document.querySelectorAll("tr.timeline-row a"))
        .map(a => {
          return a.getAttribute('href').split("/")[3]
        })
    })
    const rollup = await timeline.reduce((a, c) => {
      a[c] != null ? a[c]++ : (a[c] = 1);
      return a;
    }, count)
    console.log(`rollup ${iteration}`, await rollup)
    return await rollup
  }

  console.log('final result:', await result)
  await browser.close()
  return await result
}

Object.entries(students).forEach(([student, id]) => {
  console.log(student)
  tally(id)
})


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
