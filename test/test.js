const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

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

    const fillOutForm = async (steps) => {
        await page.select('#household_size', steps['household_size']);

        if (steps['household_includes_elderly_or_disabled']) {
            await page.click('label[for="input__household_includes_elderly_or_disabled_true"]');
        } else {
            await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');
        }

        if (steps['all_citizens']) {
            await page.click('label[for="input__all_citizens_question_true"]');
        } else {
            await page.click('label[for="input__all_citizens_question_false"]');

        }
        await page.type('#monthly_job_income', steps['monthly_job_income']);
        await page.type('#monthly_non_job_income', steps['monthly_non_job_income']);
        await page.type('#resources', steps['monthly_job_income']);

        await page.click('#prescreener-form-submit');
    }

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