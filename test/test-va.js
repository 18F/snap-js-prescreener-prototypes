const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;
const fillOutForm = require('./helpers').fillOutForm;

describe('VA SNAP prescreener', () => {
    before(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    beforeEach(async () => {
        const file_url = 'http://localhost:8081/prescreeners/va.html';
        await page.goto(file_url);
        await page.waitForSelector('#household_size');
    });

    after(async () => {
        await page.close();
        await browser.close();
    });

    it('shows the correct results HTML for a 1-person eligible household', async () => {
        fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit may be $194 per month.</div>
            <div class="result-headline">Apply here: <a href="https://commonhelp.virginia.gov/" target="_blank" rel="noopener noreferrer">https://commonhelp.virginia.gov/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results HTML for a 2-person eligible household', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit may be $355 per month.</div>
            <div class="result-headline">Apply here: <a href="https://commonhelp.virginia.gov/" target="_blank" rel="noopener noreferrer">https://commonhelp.virginia.gov/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results HTML for a 2-person eligible household with EA', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '1000',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit may be $165 per month.</div>
            <div class="result-headline">Due to the current pandemic, you could receive an additional $190 per month. (This additional amount is temporary.)</div>
            <div class="result-headline">Apply here: <a href="https://commonhelp.virginia.gov/" target="_blank" rel="noopener noreferrer">https://commonhelp.virginia.gov/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results for a household with elderly or disabled members and a utility deduction', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '2000',
            'monthly_non_job_income': '0',
            'resources': '0',
            'rent_or_mortgage': '1900',
            'va_utility_allowance_true': true,
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit may be $355 per month.</div>
            <div class="result-headline">Apply here: <a href="https://commonhelp.virginia.gov/" target="_blank" rel="noopener noreferrer">https://commonhelp.virginia.gov/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results for a household with elderly or disabled members and no utility deduction', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '2000',
            'monthly_non_job_income': '0',
            'resources': '0',
            'rent_or_mortgage': '1900',
            'va_utility_allowance_false': true,
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1>
            <div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>
            <div class="result-headline">If approved, your benefit may be $280 per month.</div>
            <div class="result-headline">Due to the current pandemic, you could receive an additional $75 per month. (This additional amount is temporary.)</div>
            <div class="result-headline">Apply here: <a href="https://commonhelp.virginia.gov/" target="_blank" rel="noopener noreferrer">https://commonhelp.virginia.gov/</a>.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });

    it('shows the correct results HTML for an ineligible household', async () => {
        fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '6000',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('.result-headline', {
            'visible': true,
            'timeout': 5000
        });

        const innerHTML = await page.evaluate(() => document.querySelector('#results').innerHTML);
        const expectedInnerHTML = `<h1>Results:</h1><div class="result-headline">You may not be eligible for SNAP benefits.</div>`;

        assert.equalIgnoreSpaces(innerHTML, expectedInnerHTML);
    });
});