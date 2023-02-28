const login = require("./login.json");
const puppeteer = require('puppeteer');


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://wwwdev.ebi.ac.uk/ena/submit/webin/login', {
    waitUntil: 'networkidle2',
	
  });
  await page.type('[name="username"]', login["wwwdev.ebi.ac.uk/ena"]["username"]);
  await page.type('[name="password"]', login["wwwdev.ebi.ac.uk/ena"]["password"]);
    await Promise.all([
    page.click('[name="action"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);	
  await page.pdf({ path: 'hn.pdf', format: 'a4' });
  await browser.close();
})();