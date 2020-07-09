const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

describe('IL SNAP prescreener', () => {
    before(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    beforeEach(async () => {
        const file_url = 'http://localhost:8081/prescreeners/il.html';
        await page.goto(file_url);
        await page.waitForSelector('#household_size');
    });

    after(async () => {
        await page.close();
        await browser.close();
    })

    it('shows the correct results HTML for a 1-person eligible household', async () => {
        await page.select('#household_size', '1');
        await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');
        await page.click('label[for="input__all_citizens_question_true"]');
        await page.type('#monthly_job_income', '0');
        await page.type('#monthly_non_job_income', '0');
        await page.type('#resources', '0');
        await page.click('#prescreener-form-submit');

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit could be as much as $194 per month.</div>
            <div class="result-headline">Apply here: <a href="https://abe.illinois.gov/abe/access/" target="_blank" rel="noopener noreferrer">https://abe.illinois.gov/abe/access/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results HTML for a 2-person eligible household', async () => {
        await page.select('#household_size', '2');
        await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');
        await page.click('label[for="input__all_citizens_question_true"]');
        await page.type('#monthly_job_income', '0');
        await page.type('#monthly_non_job_income', '0');
        await page.type('#resources', '0');
        await page.click('#prescreener-form-submit');

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit could be as much as $355 per month.</div>
            <div class="result-headline">Apply here: <a href="https://abe.illinois.gov/abe/access/" target="_blank" rel="noopener noreferrer">https://abe.illinois.gov/abe/access/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results HTML for an ineligible household', async () => {
        await page.select('#household_size', '1');
        await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');
        await page.click('label[for="input__all_citizens_question_true"]');
        await page.type('#monthly_job_income', '6000');
        await page.type('#monthly_non_job_income', '0');
        await page.type('#resources', '0');
        await page.click('#prescreener-form-submit');

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1><div class="result-headline">You may not be eligible for SNAP benefits.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });
});