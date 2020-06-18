const puppeteer = require('puppeteer');
const assert = require('chai').assert;

describe('async', () => {
    it('should have correct expectation', () => {

        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const file_url = 'http://localhost:8081/prescreeners/va.html';

            await page.goto(file_url);
            await page.select('#household_size', '1');
            await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');
            await page.click('label[for="input__all_citizens_question_true"]');
            await page.type('#monthly_job_income', '0');
            await page.type('#monthly_non_job_income', '0');
            await page.type('#resources', '0');
            await page.click('#prescreener-form-submit');
            await page.screenshot({ fullPage: true, path: 'screenshot.png' });

            await page.waitForSelector('.result-headline', {
                'visible': true,
                'timeout': 5000
            });

            const innerText = await page.evaluate(() => document.querySelector('#results').innerText)
            const expectedInnerText = `Results:
                You may be eligible for SNAP benefits.
                If approved, your benefit could be as much as $194 per month.
                Apply here: https://commonhelp.virginia.gov/.`;

            assert.equal(innerText.replace(/\s+/g, ''), expectedInnerText.replace(/\s+/g, ''));

            await browser.close();
        })();
    });
});