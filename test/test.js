const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const file_url = 'file:///Users/alexrsoble/hs-apis/snap-js-prescreener-prototypes/prescreeners/va.html';

    await page.goto(file_url);

    await page.select('#household_size', '1');
    await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');

    await page.type('#monthly_job_income', '0');
    await page.type('#monthly_non_job_income', '0');
    await page.type('#resources', '0');

    await page.click('#prescreener-form-submit');
    await page.screenshot();

    page
        .waitForSelector('#result-headline', {'visible': true});

    const html = await page.content();
    console.log(html);

    // await browser.close();
})();
