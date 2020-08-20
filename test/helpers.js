const fillOutForm = async (steps) => {
    // Household size
    await page.select('#household_size', steps['household_size']);

    // Does your household include someone who is 60 or older, or someone who is disabled?
    (steps['household_includes_elderly_or_disabled'])
        ? await page.click('label[for="input__household_includes_elderly_or_disabled_true"]')
        : await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');

    // Is everyone on the application a U.S. citizen?
    (steps['all_citizens'])
        ? await page.click('label[for="input__all_citizens_question_true"]')
        : await page.click('label[for="input__all_citizens_question_false"]');

    // Monthly household income from jobs or self-employment
    await page.type('#monthly_job_income', steps['monthly_job_income']);

    // Monthly household income from other sources
    await page.type('#monthly_non_job_income', steps['monthly_non_job_income']);

    // Total resources
    await page.type('#resources', steps['resources']);

    // Dependent care costs
    if (steps['dependent_care_costs']) {
        await page.type('#dependent_care_costs', steps['dependent_care_costs']);
    }

    // Monthly out of pocket medical expenses for household members who are age 60 or older or disabled
    if (steps['medical_expenses_for_elderly_or_disabled']) {
        await page.type(
            '#medical_expenses_for_elderly_or_disabled',
            steps['medical_expenses_for_elderly_or_disabled']
        );
    }

    // Monthly court-ordered child support payments
    if (steps['court_ordered_child_support_payments']) {
        await page.type(
            '#court_ordered_child_support_payments',
            steps['court_ordered_child_support_payments']
        );
    }

    // Monthly rent or mortgage amount
    if (steps['rent_or_mortgage']) {
        await page.type('#rent_or_mortgage', steps['rent_or_mortgage']);
    }

    // Monthly homeowners insurance and taxes
    if (steps['homeowners_insurance_and_taxes']) {
        await page.type(
            '#homeowners_insurance_and_taxes',
            steps['homeowners_insurance_and_taxes']
        );
    }

    // Do you pay utility bills for air conditioning or heating?
    // NOTE: This step is VA-specific; IL will need a different test.
    if (steps.hasOwnProperty('utility_allowance')) {
        (steps['utility_allowance'] === 'HEATING_AND_COOLING')
            ? await page.click('label[for="heating_cooling_true"]')
            : await page.click('label[for="heating_cooling_false"]');
    }

    await page.click('#prescreener-form-submit');

    await page.waitForSelector('#results-section-title', {
        'visible': true,
        'timeout': 4000
    });

    await page.evaluate(() => window.scrollTo(0,0));
}

const clickForExplanation = async () => {
    await page.click('#why-did-i-get-this-result-button');
}

const clickForIncomeExplanation = async () => {
    await page.click('#how-are-gross-and-net-income-calculated-button');
}

exports.clickForIncomeExplanation = clickForIncomeExplanation;
exports.clickForExplanation = clickForExplanation;
exports.fillOutForm = fillOutForm;