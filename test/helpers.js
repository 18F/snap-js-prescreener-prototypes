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

    if (steps['rent_or_mortgage']) {
        await page.type('#rent_or_mortgage', steps['rent_or_mortgage']);
    }

    if (steps['va_utility_allowance_true']) {
        await page.click('label[for="heating_cooling_true"]')
    }

    if (steps['va_utility_allowance_false']) {
        await page.click('label[for="heating_cooling_false"]')
    }

    await page.click('#prescreener-form-submit');
}

exports.fillOutForm = fillOutForm;