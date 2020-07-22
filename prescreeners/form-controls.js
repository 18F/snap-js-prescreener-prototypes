(() => {
    const DOM_MANIPULATORS = {
        'showElem': function showElem(elem_id) {
            return function () {
                const elem = document.getElementById(elem_id);
                if (elem) {
                    if (elem.classList.contains('hidden')) {
                        elem.classList.remove('hidden');
                    }
                }
            }
        },
        'hideElem': function hideElem(elem_id) {
            return function () {
                const elem = document.getElementById(elem_id);
                if (elem) {
                    if (!elem.classList.contains('hidden')) {
                        elem.classList.add('hidden');
                    }
                }
            }
        },
        'getElem': function (elemId) {
            return document.getElementById(elemId);
        },
        'toggleErrorStateHTML': function (isValid) {
            if (isValid) return '';

            return (
                `<div class="usa-alert usa-alert--error usa-alert--slim">
                    <div class="usa-alert__body" role="alert" aria-live="assertive">
                        <em class="usa-alert__text">
                            Please enter a number.
                        </em>
                    </div>
                </div>`
            );
        },
        'validateNumberField': function (errorElemId) {
            return function(event) {
                const numberFieldValid = FORM_CONTROLS['numberFieldValid'](event);
                const errorElem = DOM_MANIPULATORS.getElem(errorElemId);
                errorElem.innerHTML = DOM_MANIPULATORS['toggleErrorStateHTML'](numberFieldValid);
            }
        }
    };

    const STATE_OPTIONS = {
        // For each state, an array of Object-shaped options.
        // `apply` options include URLs and descriptions of how a household can apply.
        // `other_resources` options include URLs and descriptions of non-SNAP food resources.
        'VA': {
            'apply': [
                {
                    'url': 'https://commonhelp.dss.virginia.gov/CASWeb/faces/loginCAS.xhtml',
                    'description': 'Apply online using CommonHelp. (You may have to create an account to apply.)'
                },
                {
                    'url': 'https://www.dss.virginia.gov/localagency/index.cgi',
                    'description': 'Apply at a local Social Services office near you.',
                }
            ],
            'other_resources': [
                {
                    'url': 'https://www.foodpantries.org/st/virginia',
                    'description': 'Foodpantries.org',
                },
                {
                    'url': 'https://www.feedingamerica.org/find-your-local-foodbank',
                    'description': 'Feeding America',
                }
            ]
        },
        'IL': {
            'apply': [
                {
                    'url': 'https://abe.illinois.gov/abe/access/',
                    'description': 'Apply online using ABE.',
                }
            ],
            'other_resources': [
                {
                    'url': 'https://www.dhs.state.il.us/page.aspx?item=31245',
                    'description': 'Food Connections',
                }
            ]
        }
    };

    const FORM_CONTROLS = {
        'showCitizenshipInfobox': DOM_MANIPULATORS['showElem']('citizenship_info_box'),
        'hideCitizenshipInfobox': DOM_MANIPULATORS['hideElem']('citizenship_info_box'),
        'showMedicalExpensesForElderlyOrDisabled': DOM_MANIPULATORS['showElem']('medical_expenses_for_elderly_or_disabled_question'),
        'hideMedicalExpensesForElderlyOrDisabled': DOM_MANIPULATORS['hideElem']('medical_expenses_for_elderly_or_disabled_question'),
        'showExplanationButton': DOM_MANIPULATORS['showElem']('show-explanation'),
        'hideExplanationButton': DOM_MANIPULATORS['hideElem']('show-explanation'),
        'showResultExplanation': DOM_MANIPULATORS['showElem']('result-explanation'),
        'hideResultExplanation': DOM_MANIPULATORS['hideElem']('result-explanation'),
        'hideErrors': DOM_MANIPULATORS['hideElem']('errors'),
        'showErrors': DOM_MANIPULATORS['showElem']('errors'),
        'hideResults': DOM_MANIPULATORS['hideElem']('results'),
        'showResults': DOM_MANIPULATORS['showElem']('results'),
        'numberFieldValid': (event) => {
            const value = event.target.value;

            if (value === '') return true; // Fields can be blank

            return !isNaN(parseInt(value));
        }
    };

    const FORM_SUBMIT_FUNCS = {
        'sendData': function () {
            // Form fields that are present for all states
            const jsonData = {
                'household_size': document.getElementById('household_size').value,
                'household_includes_elderly_or_disabled': document.querySelector('input[name="household_includes_elderly_or_disabled"]:checked').value,
                'monthly_job_income': document.getElementById('monthly_job_income').value,
                'monthly_non_job_income': document.getElementById('monthly_non_job_income').value,
                'resources': document.getElementById('resources').value,
                'dependent_care_costs': document.getElementById('dependent_care_costs').value,
                'medical_expenses_for_elderly_or_disabled': document.getElementById('medical_expenses_for_elderly_or_disabled').value,
                'rent_or_mortgage': document.getElementById('rent_or_mortgage').value,
                'homeowners_insurance_and_taxes': document.getElementById('homeowners_insurance_and_taxes').value,
            };

            // Form fields that are present for some states but not all...

            // Utility allowance radio button (VA)
            if (document.querySelector('input[name="utility_allowance"]:checked')) {
                jsonData['utility_allowance'] = document.querySelector('input[name="utility_allowance"]:checked').value;
            }

            // Utility allowance select box (IL)
            if (document.getElementById('utility_allowance')) {
                jsonData['utility_allowance'] = document.getElementById('utility_allowance').value;
            }

            // Send state_or_territory and emergency allotment config to API:
            const formSettings = document.getElementById('prescreener-form');
            jsonData['state_or_territory'] = formSettings.dataset.stateOrTerritory;
            jsonData['use_emergency_allotment'] = formSettings.dataset.useEmergencyAllotment;

            const response = new SnapAPI.SnapEstimateEntrypoint(jsonData).calculate();

            FORM_SUBMIT_FUNCS['responseToHTML'](response);
        },
        responseToHTML: function (response) {
            if (response.status !== 'OK') {
                FORM_CONTROLS['hideResults']();
                FORM_CONTROLS['hideExplanationButton']();
                FORM_CONTROLS['hideResultExplanation']();

                const errorsHTML = FORM_SUBMIT_FUNCS['responseErrorsToHTML'](response.errors);
                DOM_MANIPULATORS.getElem('errors').innerHTML = errorsHTML;

                FORM_CONTROLS['showErrors']();
                return;
            }

            const resultHTML = FORM_SUBMIT_FUNCS['responseResultToHTML'](response);
            const explanationHTML = FORM_SUBMIT_FUNCS['responseExplanationToHTML'](response.eligibility_factors);

            DOM_MANIPULATORS.getElem('results').innerHTML = resultHTML;
            DOM_MANIPULATORS.getElem('result-explanation').innerHTML = explanationHTML;

            FORM_CONTROLS['showResults']();
            FORM_CONTROLS['hideErrors']();
            FORM_CONTROLS['showExplanationButton']();
            FORM_CONTROLS['hideResultExplanation']();

            // Scroll to bottom to bring the results into view:
            window.scrollTo(0, document.body.scrollHeight);
        },
        'responseErrorsToHTML': function (errors) {
            let html = `<h1>Errors:</h1>`;

            for (const error of errors) {
                html += (`<li>${error}</li>`);
            }

            return html;
        },
        'optionsHTML': function (options_array, options_title) {
            let html = `<div class="result-big">${options_title}
                            <ul>`;

            for (const option of options_array) {
                html += (
                    `<li>
                        <a href="${option.url}" rel="noopener noreferrer">
                            ${option.description}
                        </a>
                    </li>`
                );
            }

            html += `</ul></div>`;
            return html;
        },
        'responseResultToHTML': function (response) {
            let html = '<h1 id="results-section-title">Results:</h1>';

            const is_eligible = response.estimated_eligibility;
            const estimated_monthly_benefit = response.estimated_monthly_benefit;
            const emergency_allotment_estimated_benefit = response.emergency_allotment_estimated_benefit;

            const formSettings = document.getElementById('prescreener-form');
            const stateAbbr = formSettings.dataset.stateOrTerritory;
            const nextStepOptions = STATE_OPTIONS[stateAbbr];

            // SNAP JS API estimates household is ineligible:
            if (!is_eligible) {
                html += (
                    `<div class="result-big">You <strong>might not</strong> be eligible for SNAP benefits.</div>
                    <div class="result-big">This result is only an estimate based on your inputs, not an official application or decision. <strong>You can still apply for SNAP benefits</strong>.</div>`
                );

                html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');

                html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['other_resources'], 'Other resources for food assistance:');

                return html;
            }

            // SNAP JS API estimates household is eligible:
            html += '<div class="result-big">You may be <b>eligible</b> for SNAP benefits.</div>';

            // If emergency allotments are active, and estimated benefit is less than EA amount:
            if (emergency_allotment_estimated_benefit && estimated_monthly_benefit !== emergency_allotment_estimated_benefit) {
                const additional_amount = emergency_allotment_estimated_benefit - estimated_monthly_benefit;

                html += (
                    `<div class="result-big">If you apply and are approved, your benefit may be $${estimated_monthly_benefit} per month.</div><div class="result-big">Due to the current pandemic, you could receive an additional $${additional_amount} per month. (This additional amount is temporary.)</div>`
                );
            // If no emergency allotments, or EA is the same as regular benefit amount:
            } else {
                html += `<div class="result-big">If you apply and are approved, your benefit may be $${estimated_monthly_benefit} per month.</div>`;
            }

            html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');

            return html;
        },
        'responseExplanationToHTML': function (eligibility_factors) {
            let html = '';

            eligibility_factors.sort((a, b) => {
                return a.sort_order - b.sort_order;
            });

            const eligibility_tests = eligibility_factors.filter((factor) => {
                return factor.type === 'test';
            });

            html += (
                `<div class="result-big">
                    Why did I get this result?
                </div>
                <p>To be eligible for SNAP benefits, a household needs to meet three requirements:</p>`
            );

            for (const eligibility_test of eligibility_tests) {
                const name = eligibility_test.name;
                const result_in_words = (eligibility_test.result)
                    ? 'Pass'
                    : 'Fail';
                const result_span_class = (eligibility_test.result)
                    ? 'pass-green'
                    : 'fail-red';

                html += `<h3>${name}: <span class="${result_span_class}">${result_in_words}</span></h3>`
            }

            return html;
        }
    };

    // Set up on form submit.
    DOM_MANIPULATORS.getElem('prescreener-form').addEventListener('submit', function (event) {
        event.preventDefault();
        FORM_SUBMIT_FUNCS['sendData']();
    });

    // Set up toggle of citizenship infobox in response to citizenship question.
    DOM_MANIPULATORS.getElem('input__all_citizens_question_true').addEventListener('change', () => {
        FORM_CONTROLS['hideCitizenshipInfobox']();
    });

    DOM_MANIPULATORS.getElem('input__all_citizens_question_false').addEventListener('change', () => {
        FORM_CONTROLS['showCitizenshipInfobox']();
    });

    // Set up toggle of medical expenses question in response to elderly or disabled question result.
    DOM_MANIPULATORS.getElem('input__household_includes_elderly_or_disabled_true').addEventListener('change', () => {
        FORM_CONTROLS['showMedicalExpensesForElderlyOrDisabled']();
    });

    DOM_MANIPULATORS.getElem('input__household_includes_elderly_or_disabled_false').addEventListener('change', () => {
        FORM_CONTROLS['hideMedicalExpensesForElderlyOrDisabled']();
    });

    // Set up show explanation button
    DOM_MANIPULATORS.getElem('show-explanation').addEventListener('click', () => {
        FORM_CONTROLS['showResultExplanation']();
        FORM_CONTROLS['hideExplanationButton']();
    });

    // Set up validation for number fields
    const number_field_ids = [
        'monthly_job_income',
        'monthly_non_job_income',
        'resources',
        'dependent_care_costs',
        'medical_expenses_for_elderly_or_disabled',
        'court_ordered_child_support_payments',
        'rent_or_mortgage',
        'homeowners_insurance_and_taxes',
        'utility_costs',
    ];

    for (const field_id of number_field_ids) {
        const number_elem = DOM_MANIPULATORS.getElem(field_id);

        if (number_elem) {
            number_elem.addEventListener('input', (event) => {
                DOM_MANIPULATORS['validateNumberField'](`${field_id}_error_elem`)(event);
            });
        }
    }
})()