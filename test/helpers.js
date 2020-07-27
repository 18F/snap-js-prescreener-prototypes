const fillOutForm = async (steps) => {
    await page.select('#household_size', steps['household_size']);

    (steps['household_includes_elderly_or_disabled'])
        ? await page.click('label[for="input__household_includes_elderly_or_disabled_true"]')
        : await page.click('label[for="input__household_includes_elderly_or_disabled_false"]');

    (steps['all_citizens'])
        ? await page.click('label[for="input__all_citizens_question_true"]')
        : await page.click('label[for="input__all_citizens_question_false"]');

    await page.type('#monthly_job_income', steps['monthly_job_income']);
    await page.type('#monthly_non_job_income', steps['monthly_non_job_income']);
    await page.type('#resources', steps['resources']);

    if (steps['court_ordered_child_support_payments']) {
        await page.type(
            '#court_ordered_child_support_payments',
            steps['court_ordered_child_support_payments']
        );
    }

    if (steps['rent_or_mortgage']) {
        await page.type('#rent_or_mortgage', steps['rent_or_mortgage']);
    }

    if (steps['va_utility_allowance_true']) {
        await page.click('label[for="heating_cooling_true"]');
    }

    if (steps['va_utility_allowance_false']) {
        await page.click('label[for="heating_cooling_false"]');
    }

    await page.click('#prescreener-form-submit');

    await page.waitForSelector('#results-section-title', {
        'visible': true,
        'timeout': 4000
    });
}

const clickForExplanation = async () => {
    await page.click('#show-explanation');

    await page.waitForSelector('#result-explanation', {
        'visible': true,
        'timeout': 4000
    });
}

const clickForIncomeExplanation = async () => {
    await page.click('#show-income-explanation');

    await page.waitForSelector('#income-explanation', {
        'visible': true,
        'timeout': 4000
    });
}

exports.clickForIncomeExplanation = clickForIncomeExplanation;
exports.clickForExplanation = clickForExplanation;
exports.fillOutForm = fillOutForm;