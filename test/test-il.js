const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

// Shared helpers to simplify repeated form interactions:
const helpers = require('./helpers');
const fillOutForm = helpers.fillOutForm;
const clickForExplanation = helpers.clickForExplanation;
const clickForIncomeExplanation = helpers.clickForIncomeExplanation;

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

    it('a 1-person eligible household', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `
            Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $204 per month.
            Ways to apply:
            Apply online using ABE.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation();
        const explanationText = await page.evaluate(() => document.querySelector('#why-did-i-get-this-result').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation();
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#how-are-gross-and-net-income-calculated').innerText);
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a 2-person eligible household', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $374 per month.
            Ways to apply:
            Apply online using ABE.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation();
        const explanationText = await page.evaluate(() => document.querySelector('#why-did-i-get-this-result').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');


        await clickForIncomeExplanation();
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#how-are-gross-and-net-income-calculated').innerText);
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('an ineligible household', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '6,000',
            'resources': '0',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You might not be eligible for SNAP benefits.
            This result is only an estimate based on your inputs, not an official application or decision.
            You can still apply for SNAP benefits.
            Ways to apply:
            Apply online using ABE.
            Other resources for food assistance:
            Food Connections`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation();
        const explanationText = await page.evaluate(() => document.querySelector('#why-did-i-get-this-result').innerText);
        assert.include(explanationText, 'Gross Income Test: Fail');
        assert.include(explanationText, 'Net Income Test: Fail');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation();
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#how-are-gross-and-net-income-calculated').innerText);
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });
});