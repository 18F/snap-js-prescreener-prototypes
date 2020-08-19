// This is the JS that powers the benefit calculator.
// Its responsibilities includes:
//     * Front-end validation for the calculator form
//     * Sending user input to the SnapAPI library
//     * Rendering results, including explanations

// The JS is organized into four main objects:
//     * DOM_MANIPULATORS: Functions for maniuplating the DOM: show/hide, error states
//     * STATE_OPTIONS: Data on next steps for applying for SNAP or seeking food assistance, which vary by state
//     * FORM_CONTROLS: A layer of abstraction over DOM_MANIPULATORS; DOM manipulation funcs + specific form elements
//     * FORM_SUBMIT_FUNCS: Functions for handling form submission, results and error state rendering

// This file is written in ES6 and compiled down to more universally browser-compatible JS with `npm run build`.
(() => {
    // Shortcuts for manipulating the DOM. A micromicro framework, if you will.
    const DOM_MANIPULATORS = {
        'showElem': (elem_id) => {
            return () => {
                const elem = document.getElementById(elem_id);
                if (elem) {
                    if (elem.classList.contains('hidden')) {
                        elem.classList.remove('hidden');
                    }
                }
            }
        },
        'hideElem': (elem_id) => {
            return () => {
                const elem = document.getElementById(elem_id);
                if (elem) {
                    if (!elem.classList.contains('hidden')) {
                        elem.classList.add('hidden');
                    }
                }
            }
        },
        fieldErrorHTML: (message, role, aria_live_level) => {
            return (
                `<div class="usa-alert usa-alert--error usa-alert--slim">
                    <div class="usa-alert__body" role="${role}" aria-live="${aria_live_level}">
                        <em class="usa-alert__text">${message}</em>
                    </div>
                </div>`
            );
        },
        'validateNumberField': (elem_id) => {
            return (event) => {
                const number_field_valid = FORM_CONTROLS['numberFieldValid'](event.target.value);
                const input_elem = document.getElementById(elem_id);
                const error_elem = document.getElementById(`${elem_id}_error_elem`);

                if (number_field_valid) {
                    error_elem.innerHTML = '';
                    input_elem.setAttribute('aria-invalid', 'false');
                } else {
                    error_elem.innerHTML = DOM_MANIPULATORS['fieldErrorHTML'](
                        'Please enter a number.',
                        'alert',
                        'assertive'
                    );
                    input_elem.setAttribute('aria-invalid', 'true');
                }
            }
        },
        clearClientErrorOnSelect: (error_elem_id) => {
            const error_field_elem = document.getElementById(`${error_elem_id}_error_elem`);
            if (error_field_elem) { error_field_elem.innerHTML = ''; }

            let error_input_elem_by_id = document.getElementById(error_elem_id); // Non-radio buttons
            let error_input_elem_by_name = document.getElementsByName(error_elem_id)[0]; // Radio buttons

            if (error_input_elem_by_id) {
                error_input_elem_by_id.setAttribute('aria-invalid', 'false');
            }
            if (error_input_elem_by_name) {
                error_input_elem_by_name.setAttribute('aria-invalid', 'false');
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

    // Shortcuts for showing/hiding specific elements on the page.
    const FORM_CONTROLS = {
        'showCitizenshipInfobox': DOM_MANIPULATORS['showElem']('citizenship_info_box'),
        'hideCitizenshipInfobox': DOM_MANIPULATORS['hideElem']('citizenship_info_box'),
        'showMedicalExpensesForElderlyOrDisabled': DOM_MANIPULATORS['showElem']('medical_expenses_for_elderly_or_disabled_question'),
        'hideMedicalExpensesForElderlyOrDisabled': DOM_MANIPULATORS['hideElem']('medical_expenses_for_elderly_or_disabled_question'),
        'showExplanationButton': DOM_MANIPULATORS['showElem']('show-explanation'),
        'hideExplanationButton': DOM_MANIPULATORS['hideElem']('show-explanation'),
        'showResultExplanation': DOM_MANIPULATORS['showElem']('result-explanation'),
        'hideResultExplanation': DOM_MANIPULATORS['hideElem']('result-explanation'),
        'showIncomeExplanationButton': DOM_MANIPULATORS['showElem']('show-income-explanation'),
        'hideIncomeExplanationButton': DOM_MANIPULATORS['hideElem']('show-income-explanation'),
        'showIncomeExplanation': DOM_MANIPULATORS['showElem']('income-explanation'),
        'hideIncomeExplanation': DOM_MANIPULATORS['hideElem']('income-explanation'),
        'hideServerErrorMessages': DOM_MANIPULATORS['hideElem']('server-error-messages'),
        'showServerErrorMessages': DOM_MANIPULATORS['showElem']('server-error-messages'),
        'hideResults': DOM_MANIPULATORS['hideElem']('results'),
        'showResults': DOM_MANIPULATORS['showElem']('results'),
        'numberFieldValid': (value) => {
            if (value === '') return true; // Fields can be blank

            return !isNaN(parseInt(value));
        }
    };

    // Handles form submission and rendering results.
    const FORM_SUBMIT_FUNCS = {
        'checkForm': () => {
            // Pull input data from the form:
            const form = document.getElementById('prescreener-form');
            const elements = form.elements;
            const jsonData = {};

            for (let i = 0; i < elements.length; i++) {
                let elem = elements[i];

                switch(elem.type) {
                    case 'select-one':
                        jsonData[elem.id] = elem.value;
                        break;
                    case 'radio': {
                        let checked = document.querySelector(`input[name="${elem.name}"]:checked`);
                        (checked)
                            ? jsonData[elem.name] = checked.value
                            : jsonData[elem.name] = undefined;
                        break;
                    }
                    case 'text':
                        jsonData[elem.id] = elem.value;
                        break;
                }
            }

            // Validate:
            const errors = [];

            if (jsonData['household_size'] === '') {
                errors.push({
                    name: 'household_size',
                    message: 'Select a household size',
                });
            }

            if (jsonData['monthly_job_income'] === '') {
                errors.push({
                    name: 'monthly_job_income',
                    message: 'Enter monthly household pre-tax income from jobs or self-employment',
                });
            }

            if (jsonData['monthly_non_job_income'] === '') {
                errors.push({
                    name: 'monthly_non_job_income',
                    message: 'Enter monthly household income from other sources',
                });
            }

            if (jsonData['resources'] === '') {
                errors.push({
                    name: 'resources',
                    message: 'Enter total resources amount',
                });
            }

            if (jsonData['household_includes_elderly_or_disabled'] === undefined) {
                errors.push({
                    name: 'household_includes_elderly_or_disabled',
                    message: 'Select "yes" or "no" if your household includes someone who is 60 or older, or someone who is disabled',
                });
            }

            if (jsonData['all_citizens_question'] === undefined) {
                errors.push({
                    name: 'all_citizens_question',
                    message: 'Select "yes" or "no" if everyone on the application is a U.S. citizen',
                });
            }

            // Validation for number fields:
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

            for (let i = 0; i < number_field_ids.length; i++) {
                let field_id = number_field_ids[i];
                const number_elem = document.getElementById(field_id);

                if (number_elem) {
                    if (!FORM_CONTROLS['numberFieldValid'](number_elem.value)) {
                        errors.push({
                            name: field_id,
                            message: `Please enter a number.`,
                        });
                    }
                }
            }

            // Only auto-update the error message state if the user
            // has already attempted to submit and received error messages.
            if (window.hasShownErrors) {
                FORM_SUBMIT_FUNCS['updateClientErrorMessages'](errors);
            }

            return {
                'errors': errors,
                'jsonData': jsonData,
            }
        },
        'onSubmit': () => {
            const checkFormResults = FORM_SUBMIT_FUNCS['checkForm']();
            const errors = checkFormResults['errors'];
            const jsonData = checkFormResults['jsonData'];

            if (errors.length === 0) {
                // If valid, send data to API library:
                FORM_SUBMIT_FUNCS['sendData'](jsonData);
            } else {
                window.hasShownErrors = true;
                FORM_SUBMIT_FUNCS['updateClientErrorMessages'](errors);

                const errors_header = document.getElementById('errors-header');
                errors_header.scrollIntoView();

                const first_error_elem = document.querySelector('[aria-invalid="true"]');
                if (first_error_elem) { first_error_elem.focus(); }
            }
        },
        updateClientErrorMessages: (errors) => {
            const errors_header = document.getElementById('errors-header');
            let errors_header_html = '';

            if (errors.length === 0) {
                errors_header.innerHTML = errors_header_html;
                return;
            }

            // Set per-field client side errors first ...
            for (let i = 0; i < errors.length; i++) {
                let error = errors[i];
                let error_name = error['name'];
                let error_message = error['message'];
                let error_field_elem = document.getElementById(`${error_name}_error_elem`);
                let error_input_elem_by_id = document.getElementById(error_name); // Non-radio buttons
                let error_input_elem_by_name = document.getElementsByName(error_name)[0]; // Radio buttons

                if (error_field_elem) {
                    let error_message_alert = DOM_MANIPULATORS['fieldErrorHTML'](error_message, '', 'off');
                    error_field_elem.innerHTML = error_message_alert;
                }

                if (error_input_elem_by_id) {
                    error_input_elem_by_id.setAttribute('aria-invalid', 'true');
                }
                if (error_input_elem_by_name) {
                    error_input_elem_by_name.setAttribute('aria-invalid', 'true');
                }
            }

            // ... and set overall error list afterwards, so that VoiceOver will
            // read it out immediately due to its role="alert" attribute.
            errors_header_html += `<div class="error-total">${errors.length} ${errors.length === 1 ? 'error' : 'errors'}</div>`;
            errors_header_html += `<ul class="usa-list">`;
            for (let i = 0; i < errors.length; i++) {
                let error = errors[i];
                errors_header_html += (`<li>${error['message']}</li>`);
            }
            errors_header_html += `</ul>`;

            errors_header.innerHTML = errors_header_html;
        },
        'sendData': (jsonData) => {
            // Send state_or_territory and emergency allotment config to API
            // in addition to user input data:
            const form = document.getElementById('prescreener-form');
            jsonData['state_or_territory'] = form.dataset.stateOrTerritory;
            jsonData['use_emergency_allotment'] = form.dataset.useEmergencyAllotment;

            const response = new SnapAPI.SnapEstimateEntrypoint(jsonData).calculate();

            FORM_SUBMIT_FUNCS['responseToHTML'](response);
        },
        responseToHTML: (response) => {
            if (response.status !== 'OK') {
                FORM_CONTROLS['hideResults']();
                FORM_CONTROLS['hideExplanationButton']();
                FORM_CONTROLS['hideResultExplanation']();

                const errorsHTML = FORM_SUBMIT_FUNCS['responseErrorsToHTML'](response.errors);
                document.getElementById('server-error-messages').innerHTML = errorsHTML;

                FORM_CONTROLS['showServerErrorMessages']();
                return;
            }

            const resultHTML = FORM_SUBMIT_FUNCS['responseResultToHTML'](response);
            const explanationHTML = FORM_SUBMIT_FUNCS['responseExplanationToHTML'](response.eligibility_factors);
            const incomeExplanationHTML = FORM_SUBMIT_FUNCS['responseIncomeExplanationToHTML'](response.eligibility_factors);

            document.getElementById('results').innerHTML = resultHTML;
            document.getElementById('result-explanation').innerHTML = explanationHTML;
            document.getElementById('income-explanation').innerHTML = incomeExplanationHTML;

            FORM_CONTROLS['showResults']();
            FORM_CONTROLS['hideServerErrorMessages']();
            FORM_CONTROLS['showExplanationButton']();
            FORM_CONTROLS['hideResultExplanation']();
            FORM_CONTROLS['hideIncomeExplanationButton']();
            FORM_CONTROLS['hideIncomeExplanation']();

            // Scroll to bring the results into view:
            document.getElementById('results').scrollIntoView();
        },
        'responseErrorsToHTML': (errors) => {
            let html = `<h1>Errors:</h1>`;

            for (let i = 0; i < errors.length; i++) {
                let error = errors[i];

                html += (`<li>${error}</li>`);
            }

            return html;
        },
        'optionsHTML': (options_array, options_title) => {
            let html = `<p>${options_title}
                            <ul class="usa-link">`;

            for (let i = 0; i < options_array.length; i++) {
                let option = options_array[i];

                html += (
                    `<li>
                        <a class="usa-link" href="${option.url}" rel="noopener noreferrer">
                            ${option.description}
                        </a>
                    </li>`
                );
            }

            html += `</ul></p>`;
            return html;
        },
        'responseResultToHTML': (response) => {
            let html = '<h2 id="results-section-title">Results:</h2>';

            const is_eligible = response.estimated_eligibility;
            const estimated_monthly_benefit = response.estimated_monthly_benefit;
            const emergency_allotment_estimated_benefit = response.emergency_allotment_estimated_benefit;

            const formSettings = document.getElementById('prescreener-form');
            const stateAbbr = formSettings.dataset.stateOrTerritory;
            const nextStepOptions = STATE_OPTIONS[stateAbbr];

            // SNAP JS API estimates household is ineligible:
            if (!is_eligible) {
                html += (
                    `<p>You <strong>might not</strong> be eligible for SNAP benefits.</p>
                    <p>This result is only an estimate based on your inputs, not an official application or decision. <strong>You can still apply for SNAP benefits</strong>.</p>`
                );

                html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');

                html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['other_resources'], 'Other resources for food assistance:');

                return html;
            }

            // SNAP JS API estimates household is eligible:
            html += '<p>You may be <b>eligible</b> for SNAP benefits.</p>';

            // If emergency allotments are active, and estimated benefit is less than EA amount:
            if (emergency_allotment_estimated_benefit && estimated_monthly_benefit !== emergency_allotment_estimated_benefit) {
                const additional_amount = emergency_allotment_estimated_benefit - estimated_monthly_benefit;

                html += (
                    `<p>If you apply and are approved, your benefit may be $${estimated_monthly_benefit} per month.</p><p>Due to the current pandemic, you could receive an additional $${additional_amount} per month. (This additional amount is temporary.)</p>`
                );
            // If no emergency allotments, or EA is the same as regular benefit amount:
            } else {
                html += `<p>If you apply and are approved, your benefit may be $${estimated_monthly_benefit} per month.</p>`;
            }

            html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');

            return html;
        },
        'responseExplanationToHTML': (eligibility_factors) => {
            let html = '';

            eligibility_factors.sort((a, b) => {
                return a.sort_order - b.sort_order;
            });

            const eligibility_tests = eligibility_factors.filter((factor) => {
                return factor.type === 'test';
            });

            html += (
                `<a class="usa-link explanation-link clicked">
                    Why did I get this result?
                </a>
                <h2>SNAP requirements</h2>
                <p>To be eligible for SNAP benefits, a household needs to meet three requirements:</p>`
            );

            for (let i = 0; i < eligibility_tests.length; i++) {
                let eligibility_test = eligibility_tests[i];

                const name = eligibility_test.name;
                const result_in_words = (eligibility_test.result)
                    ? 'Pass'
                    : 'Fail';
                const result_span_class = (eligibility_test.result)
                    ? 'pass-green'
                    : 'fail-red';

                html += `<h3>${name}: <span class="${result_span_class}">${result_in_words}</span></h3>`;

                let explanation = eligibility_test.explanation;

                for (var k = 0; k < explanation.length; k++) {
                    let explanation_graph = explanation[k];
                    html += `<p>${explanation_graph}</p>`;
                }
            }

            const eligibility_amount = eligibility_factors.filter((factor) => {
                return factor.type === 'amount';
            })[0];

            html += `<h2>${eligibility_amount.name}</h2>`;

            for (let i = 0; i < eligibility_amount.explanation.length; i++) {
                let explanation_graph = eligibility_amount.explanation[i];
                html += `<p>${explanation_graph}</p>`;
            }

            return html;
        },
        'responseIncomeExplanationToHTML': (eligibility_factors) => {
            let html = `<a class="usa-link explanation-link clicked">How are gross and net income calculated?</a>`;

            eligibility_factors.sort((a, b) => {
                return a.sort_order - b.sort_order;
            });

            const income_factors = eligibility_factors.filter((factor) => {
                return factor.type === 'income';
            });

            for (let i = 0; i < income_factors.length; i++) {
                let income_factor = income_factors[i];
                const name = income_factor.name;
                const explanation_graphs = income_factor.explanation;

                html += `<h3>${name}</h3>`;

                for (var k = 0; k < explanation_graphs.length; k++) {
                    let explanation_graph = explanation_graphs[k];
                    html += `<p>${explanation_graph}</p>`;
                }
            }

            return html;
        }
    };

    // Set up form submit function.
    document.getElementById('prescreener-form').addEventListener('submit', (event) => {
        event.preventDefault();
        FORM_SUBMIT_FUNCS['onSubmit']();
    });

    // Set up toggle of citizenship infobox in response to citizenship question.
    document.getElementById('input__all_citizens_question_true').addEventListener('change', () => {
        FORM_CONTROLS['hideCitizenshipInfobox']();
    });

    document.getElementById('input__all_citizens_question_false').addEventListener('change', () => {
        FORM_CONTROLS['showCitizenshipInfobox']();
    });

    // Set up toggle of medical expenses question in response to elderly or disabled question result.
    document.getElementById('input__household_includes_elderly_or_disabled_true').addEventListener('change', () => {
        FORM_CONTROLS['showMedicalExpensesForElderlyOrDisabled']();
    });

    document.getElementById('input__household_includes_elderly_or_disabled_false').addEventListener('change', () => {
        FORM_CONTROLS['hideMedicalExpensesForElderlyOrDisabled']();
    });

    // Set up show explanation button.
    document.getElementById('show-explanation').addEventListener('click', () => {
        FORM_CONTROLS['showResultExplanation']();
        FORM_CONTROLS['hideExplanationButton']();
        FORM_CONTROLS['showIncomeExplanationButton']();
    });

    // Set up show income explanation button.
    document.getElementById('show-income-explanation').addEventListener('click', () => {
        FORM_CONTROLS['showIncomeExplanation']();
        FORM_CONTROLS['hideIncomeExplanationButton']();
    });

    // Set up validation for number fields.
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

    for (let i = 0; i < number_field_ids.length; i++) {
        let field_id = number_field_ids[i];
        const number_elem = document.getElementById(field_id);

        if (number_elem) {
            number_elem.addEventListener('input', (event) => {
                DOM_MANIPULATORS['validateNumberField'](field_id)(event);
                FORM_SUBMIT_FUNCS['checkForm']();
            });
        }
    }

    const select_field_id = 'household_size';
    const select_elem = document.getElementById(select_field_id);

    if (select_elem) {
        select_elem.addEventListener('change', () => {
            DOM_MANIPULATORS['clearClientErrorOnSelect'](select_field_id);
            FORM_SUBMIT_FUNCS['checkForm']();
        });
    }

    const radio_field_ids = [
        'household_includes_elderly_or_disabled',
        'all_citizens_question',
    ];

    for (let i = 0; i < radio_field_ids.length; i++) {
        let radio_field_id = radio_field_ids[i];
        let radio_elems = document.getElementsByName(radio_field_id);

        if (radio_elems) {
            for (let k = 0; k < radio_elems.length; k++) {
                let radio_elem = radio_elems[k];
                radio_elem.addEventListener('change', () => {
                    DOM_MANIPULATORS['clearClientErrorOnSelect'](radio_field_id);
                    FORM_SUBMIT_FUNCS['checkForm']();
                });
            }
        }
    }
})()