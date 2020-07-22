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
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $194 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

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
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('a 2-person eligible household with EA', async () => {
        fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '1000',
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
            If you apply and are approved, your benefit may be $165 per month.
            Due to the current pandemic, you could receive an additional $190 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('a household with elderly or disabled members and a utility deduction', async () => {
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

        await page.waitForSelector('#results-section-title', {
            'visible': true,
            'timeout': 5000
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $355 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('a household with elderly or disabled members and no utility deduction', async () => {
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

        await page.waitForSelector('#results-section-title', {
            'visible': true,
            'timeout': 5000
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $280 per month.
            Due to the current pandemic, you could receive an additional $75 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('an ineligible household', async () => {
        fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '6000',
            'monthly_non_job_income': '0',
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
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.
            Other resources for food assistance:
            Foodpantries.org
            Feeding America`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });
});