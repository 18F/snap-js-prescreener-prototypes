const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;
const fillOutForm = require('./helpers').fillOutForm;

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
        fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('#results-section-title', {
            'visible': true,
            'timeout': 5000
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `
            Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $194 per month.
            Ways to apply:
            Apply online using ABE.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('a 2-person eligible household', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        await page.waitForSelector('#results-section-title', {
            'visible': true,
            'timeout': 5000
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $355 per month.
            Ways to apply:
            Apply online using ABE.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('an ineligible household', async () => {
        fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '6,000',
            'resources': '0',
        });

        await page.waitForSelector('#results-section-title', {
            'visible': true,
            'timeout': 5000
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
    });
});