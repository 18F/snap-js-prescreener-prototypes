const puppeteer = require('puppeteer');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

// Shared helpers to simplify repeated form interactions:
const helpers = require('./helpers');
const fillOutForm = helpers.fillOutForm;
const clickForExplanation = helpers.clickForExplanation;
const clickForIncomeExplanation = helpers.clickForIncomeExplanation;

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
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '0',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $194 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;

        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
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
            If you apply and are approved, your benefit may be $355 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a 2-person eligible household with EA', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '1000',
            'monthly_non_job_income': '0',
            'resources': '0',
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

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a household with elderly or disabled members and a utility deduction', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '2000',
            'monthly_non_job_income': '0',
            'resources': '0',
            'rent_or_mortgage': '1900',
            'utility_allowance': 'HEATING_AND_COOLING',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $355 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a household with elderly or disabled members and no utility deduction', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '2000',
            'monthly_non_job_income': '0',
            'resources': '0',
            'rent_or_mortgage': '1900',
            'utility_allowance': 'NONE',
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

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('an income-ineligible household', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '6000',
            'monthly_non_job_income': '0',
            'resources': '0',
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

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Fail');
        assert.include(explanationText, 'Net Income Test: Fail');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('an asset-ineligible household', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '0',
            'monthly_non_job_income': '0',
            'resources': '6000',
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

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Fail');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a household ineligible because of both assets and income', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '6000',
            'monthly_non_job_income': '6000',
            'resources': '6000',
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

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Fail');
        assert.include(explanationText, 'Net Income Test: Fail');
        assert.include(explanationText, 'Asset Test: Fail');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('a household eligible because of the gross income exclusion for child support payments', async () => {
        await fillOutForm({
            'household_size': '1',
            'household_includes_elderly_or_disabled': false,
            'all_citizens': true,
            'monthly_job_income': '1400',
            'monthly_non_job_income': '0',
            'court_ordered_child_support_payments': '500',
            'resources': '1000',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $58 per month.
            Due to the current pandemic, you could receive an additional $136 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('an eligible household that uses all deductions', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '1500',
            'monthly_non_job_income': '250',
            'resources': '1000',
            'dependent_care_costs': '300',
            'medical_expenses_for_elderly_or_disabled': '50',
            'court_ordered_child_support_payments': '200',
            'rent_or_mortgage': '600',
            'homeowners_insurance_and_taxes': '15',
            'utility_allowance': 'HEATING_AND_COOLING',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $355 per month.
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you. `;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);

        await clickForExplanation({});
        const explanationText = await page.evaluate(() => document.querySelector('#result-explanation').innerText);
        assert.include(explanationText, 'Gross Income Test: Pass');
        assert.include(explanationText, 'Net Income Test: Pass');
        assert.include(explanationText, 'Asset Test: Pass');

        await clickForIncomeExplanation({});
        const incomeExplanationText = await page.evaluate(() => document.querySelector('#income-explanation').innerText);
        assert.include(incomeExplanationText, 'How are gross and net income calculated?');
        assert.include(incomeExplanationText, 'Gross Income');
        assert.include(incomeExplanationText, 'Net Income');
    });

    it('an eligible household that uses all deductions except child support payments', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '1500',
            'monthly_non_job_income': '250',
            'resources': '1000',
            'dependent_care_costs': '300',
            'medical_expenses_for_elderly_or_disabled': '50',
            'court_ordered_child_support_payments': '0',
            'rent_or_mortgage': '600',
            'homeowners_insurance_and_taxes': '15',
            'utility_allowance': 'HEATING_AND_COOLING',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $278 per month.
            Due to the current pandemic, you could receive an additional $77 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('an eligible household that uses all deductions except child support payments and utility costs', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '1500',
            'monthly_non_job_income': '250',
            'resources': '1000',
            'dependent_care_costs': '300',
            'medical_expenses_for_elderly_or_disabled': '50',
            'rent_or_mortgage': '600',
            'homeowners_insurance_and_taxes': '15',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $187 per month.
            Due to the current pandemic, you could receive an additional $168 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });

    it('an eligible household that uses all deductions except child support payments, utility costs, and medical expenses deduction', async () => {
        await fillOutForm({
            'household_size': '2',
            'household_includes_elderly_or_disabled': true,
            'all_citizens': true,
            'monthly_job_income': '1500',
            'monthly_non_job_income': '250',
            'resources': '1000',
            'dependent_care_costs': '300',
            'rent_or_mortgage': '600',
            'homeowners_insurance_and_taxes': '15',
        });

        const innerText = await page.evaluate(() => document.querySelector('#results').innerText);
        const expectedInnerText = `Results:
            You may be eligible for SNAP benefits.
            If you apply and are approved, your benefit may be $97 per month.
            Due to the current pandemic, you could receive an additional $168 per month. (This additional amount is temporary.)
            Ways to apply:
            Apply online using CommonHelp. (You may have to create an account to apply.)
            Apply at a local Social Services office near you.`;
        assert.equalIgnoreSpaces(innerText, expectedInnerText);
    });
});