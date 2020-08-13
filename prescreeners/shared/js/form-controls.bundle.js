/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
(function () {
  // Shortcuts for manipulating the DOM. A micromicro framework, if you will.
  var DOM_MANIPULATORS = {
    'showElem': function showElem(elem_id) {
      return function () {
        var elem = document.getElementById(elem_id);

        if (elem) {
          if (elem.classList.contains('hidden')) {
            elem.classList.remove('hidden');
          }
        }
      };
    },
    'hideElem': function hideElem(elem_id) {
      return function () {
        var elem = document.getElementById(elem_id);

        if (elem) {
          if (!elem.classList.contains('hidden')) {
            elem.classList.add('hidden');
          }
        }
      };
    },
    'getElem': function getElem(elemId) {
      return document.getElementById(elemId);
    },
    'toggleErrorStateHTML': function toggleErrorStateHTML(isValid) {
      if (isValid) return '';
      return "<div class=\"usa-alert usa-alert--error usa-alert--slim\">\n                    <div class=\"usa-alert__body\" role=\"alert\" aria-live=\"assertive\">\n                        <em class=\"usa-alert__text\">\n                            Please enter a number.\n                        </em>\n                    </div>\n                </div>";
    },
    'validateNumberField': function validateNumberField(errorElemId) {
      return function (event) {
        var numberFieldValid = FORM_CONTROLS['numberFieldValid'](event);
        var errorElem = DOM_MANIPULATORS.getElem(errorElemId);
        errorElem.innerHTML = DOM_MANIPULATORS['toggleErrorStateHTML'](numberFieldValid);
      };
    }
  };
  var STATE_OPTIONS = {
    // For each state, an array of Object-shaped options.
    // `apply` options include URLs and descriptions of how a household can apply.
    // `other_resources` options include URLs and descriptions of non-SNAP food resources.
    'VA': {
      'apply': [{
        'url': 'https://commonhelp.dss.virginia.gov/CASWeb/faces/loginCAS.xhtml',
        'description': 'Apply online using CommonHelp. (You may have to create an account to apply.)'
      }, {
        'url': 'https://www.dss.virginia.gov/localagency/index.cgi',
        'description': 'Apply at a local Social Services office near you.'
      }],
      'other_resources': [{
        'url': 'https://www.foodpantries.org/st/virginia',
        'description': 'Foodpantries.org'
      }, {
        'url': 'https://www.feedingamerica.org/find-your-local-foodbank',
        'description': 'Feeding America'
      }]
    },
    'IL': {
      'apply': [{
        'url': 'https://abe.illinois.gov/abe/access/',
        'description': 'Apply online using ABE.'
      }],
      'other_resources': [{
        'url': 'https://www.dhs.state.il.us/page.aspx?item=31245',
        'description': 'Food Connections'
      }]
    }
  }; // Shortcuts for showing/hiding specific elements on the page.

  var FORM_CONTROLS = {
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
    'hideErrors': DOM_MANIPULATORS['hideElem']('errors'),
    'showErrors': DOM_MANIPULATORS['showElem']('errors'),
    'hideResults': DOM_MANIPULATORS['hideElem']('results'),
    'showResults': DOM_MANIPULATORS['showElem']('results'),
    'numberFieldValid': function numberFieldValid(event) {
      var value = event.target.value;
      if (value === '') return true; // Fields can be blank

      return !isNaN(parseInt(value));
    }
  }; // Handles form submission and rendering results.

  var FORM_SUBMIT_FUNCS = {
    'sendData': function sendData() {
      // Form fields that are present for all states:
      var form = DOM_MANIPULATORS.getElem('prescreener-form');
      var elements = form.elements;
      var jsonData = {};

      for (var _i = 0; _i < elements.length; _i++) {
        var elem = elements[_i];

        switch (elem.type) {
          case 'select-one':
            jsonData[elem.id] = elem.value;
            break;

          case 'radio':
            {
              var checked = document.querySelector("input[name=\"".concat(elem.name, "\"]:checked"));
              checked ? jsonData[elem.name] = checked.value : null;
              break;
            }

          case 'text':
            jsonData[elem.id] = elem.value;
            break;
        }
      } // Send state_or_territory and emergency allotment config to API:


      var formSettings = document.getElementById('prescreener-form');
      jsonData['state_or_territory'] = formSettings.dataset.stateOrTerritory;
      jsonData['use_emergency_allotment'] = formSettings.dataset.useEmergencyAllotment;
      var response = new SnapAPI.SnapEstimateEntrypoint(jsonData).calculate();
      FORM_SUBMIT_FUNCS['responseToHTML'](response);
    },
    responseToHTML: function responseToHTML(response) {
      if (response.status !== 'OK') {
        FORM_CONTROLS['hideResults']();
        FORM_CONTROLS['hideExplanationButton']();
        FORM_CONTROLS['hideResultExplanation']();
        var errorsHTML = FORM_SUBMIT_FUNCS['responseErrorsToHTML'](response.errors);
        DOM_MANIPULATORS.getElem('errors').innerHTML = errorsHTML;
        FORM_CONTROLS['showErrors']();
        return;
      }

      var resultHTML = FORM_SUBMIT_FUNCS['responseResultToHTML'](response);
      var explanationHTML = FORM_SUBMIT_FUNCS['responseExplanationToHTML'](response.eligibility_factors);
      var incomeExplanationHTML = FORM_SUBMIT_FUNCS['responseIncomeExplanationToHTML'](response.eligibility_factors);
      DOM_MANIPULATORS.getElem('results').innerHTML = resultHTML;
      DOM_MANIPULATORS.getElem('result-explanation').innerHTML = explanationHTML;
      DOM_MANIPULATORS.getElem('income-explanation').innerHTML = incomeExplanationHTML;
      FORM_CONTROLS['showResults']();
      FORM_CONTROLS['hideErrors']();
      FORM_CONTROLS['showExplanationButton']();
      FORM_CONTROLS['hideResultExplanation']();
      FORM_CONTROLS['hideIncomeExplanationButton']();
      FORM_CONTROLS['hideIncomeExplanation'](); // Scroll to bring the results into view:

      DOM_MANIPULATORS.getElem('results').scrollIntoView();
    },
    'responseErrorsToHTML': function responseErrorsToHTML(errors) {
      var html = "<h1>Errors:</h1>";

      for (var _i2 = 0; _i2 < errors.length; _i2++) {
        var error = errors[_i2];
        html += "<li>".concat(error, "</li>");
      }

      return html;
    },
    'optionsHTML': function optionsHTML(options_array, options_title) {
      var html = "<p>".concat(options_title, "\n                            <ul class=\"usa-link\">");

      for (var _i3 = 0; _i3 < options_array.length; _i3++) {
        var option = options_array[_i3];
        html += "<li>\n                        <a class=\"usa-link\" href=\"".concat(option.url, "\" rel=\"noopener noreferrer\">\n                            ").concat(option.description, "\n                        </a>\n                    </li>");
      }

      html += "</ul></p>";
      return html;
    },
    'responseResultToHTML': function responseResultToHTML(response) {
      var html = '<h2 id="results-section-title">Results:</h2>';
      var is_eligible = response.estimated_eligibility;
      var estimated_monthly_benefit = response.estimated_monthly_benefit;
      var emergency_allotment_estimated_benefit = response.emergency_allotment_estimated_benefit;
      var formSettings = document.getElementById('prescreener-form');
      var stateAbbr = formSettings.dataset.stateOrTerritory;
      var nextStepOptions = STATE_OPTIONS[stateAbbr]; // SNAP JS API estimates household is ineligible:

      if (!is_eligible) {
        html += "<p>You <strong>might not</strong> be eligible for SNAP benefits.</p>\n                    <p>This result is only an estimate based on your inputs, not an official application or decision. <strong>You can still apply for SNAP benefits</strong>.</p>";
        html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');
        html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['other_resources'], 'Other resources for food assistance:');
        return html;
      } // SNAP JS API estimates household is eligible:


      html += '<p>You may be <b>eligible</b> for SNAP benefits.</p>'; // If emergency allotments are active, and estimated benefit is less than EA amount:

      if (emergency_allotment_estimated_benefit && estimated_monthly_benefit !== emergency_allotment_estimated_benefit) {
        var additional_amount = emergency_allotment_estimated_benefit - estimated_monthly_benefit;
        html += "<p>If you apply and are approved, your benefit may be $".concat(estimated_monthly_benefit, " per month.</p><p>Due to the current pandemic, you could receive an additional $").concat(additional_amount, " per month. (This additional amount is temporary.)</p>"); // If no emergency allotments, or EA is the same as regular benefit amount:
      } else {
        html += "<p>If you apply and are approved, your benefit may be $".concat(estimated_monthly_benefit, " per month.</p>");
      }

      html += FORM_SUBMIT_FUNCS['optionsHTML'](nextStepOptions['apply'], 'Ways to apply:');
      return html;
    },
    'responseExplanationToHTML': function responseExplanationToHTML(eligibility_factors) {
      var html = '';
      eligibility_factors.sort(function (a, b) {
        return a.sort_order - b.sort_order;
      });
      var eligibility_tests = eligibility_factors.filter(function (factor) {
        return factor.type === 'test';
      });
      html += "<a class=\"usa-link explanation-link clicked\">\n                    Why did I get this result?\n                </a>\n                <h2>SNAP requirements</h2>\n                <p>To be eligible for SNAP benefits, a household needs to meet three requirements:</p>";

      for (var i = 0; i < eligibility_tests.length; i++) {
        var eligibility_test = eligibility_tests[i];
        var name = eligibility_test.name;
        var result_in_words = eligibility_test.result ? 'Pass' : 'Fail';
        var result_span_class = eligibility_test.result ? 'pass-green' : 'fail-red';
        html += "<h3>".concat(name, ": <span class=\"").concat(result_span_class, "\">").concat(result_in_words, "</span></h3>");
        var explanation = eligibility_test.explanation;

        for (var k = 0; k < explanation.length; k++) {
          var explanation_graph = explanation[i];
          html += "<p>".concat(explanation_graph, "</p>");
        }
      }

      var eligibility_amount = eligibility_factors.filter(function (factor) {
        return factor.type === 'amount';
      })[0];
      html += "<h2>".concat(eligibility_amount.name, "</h2>");

      for (var i = 0; i < eligibility_amount.explanation.length; i++) {
        var _explanation_graph = eligibility_amount.explanation[i];
        html += "<p>".concat(_explanation_graph, "</p>");
      }

      return html;
    },
    'responseIncomeExplanationToHTML': function responseIncomeExplanationToHTML(eligibility_factors) {
      var html = "<a class=\"usa-link explanation-link clicked\">How are gross and net income calculated?</a>";
      eligibility_factors.sort(function (a, b) {
        return a.sort_order - b.sort_order;
      });
      var income_factors = eligibility_factors.filter(function (factor) {
        return factor.type === 'income';
      });

      for (var i = 0; i < income_factors.length; i++) {
        var income_factor = income_factors[i];
        var name = income_factor.name;
        var explanation_graphs = income_factor.explanation;
        html += "<h3>".concat(name, "</h3>");

        for (var k = 0; k < explanation_graphs.length; k++) {
          var explanation_graph = explanation_graphs[i];
          html += "<p>".concat(explanation_graph, "</p>");
        }
      }

      return html;
    }
  }; // Set up form submit function.

  DOM_MANIPULATORS.getElem('prescreener-form').addEventListener('submit', function (event) {
    event.preventDefault();
    FORM_SUBMIT_FUNCS['sendData']();
  }); // Set up toggle of citizenship infobox in response to citizenship question.

  DOM_MANIPULATORS.getElem('input__all_citizens_question_true').addEventListener('change', function () {
    FORM_CONTROLS['hideCitizenshipInfobox']();
  });
  DOM_MANIPULATORS.getElem('input__all_citizens_question_false').addEventListener('change', function () {
    FORM_CONTROLS['showCitizenshipInfobox']();
  }); // Set up toggle of medical expenses question in response to elderly or disabled question result.

  DOM_MANIPULATORS.getElem('input__household_includes_elderly_or_disabled_true').addEventListener('change', function () {
    FORM_CONTROLS['showMedicalExpensesForElderlyOrDisabled']();
  });
  DOM_MANIPULATORS.getElem('input__household_includes_elderly_or_disabled_false').addEventListener('change', function () {
    FORM_CONTROLS['hideMedicalExpensesForElderlyOrDisabled']();
  }); // Set up show explanation button.

  DOM_MANIPULATORS.getElem('show-explanation').addEventListener('click', function () {
    FORM_CONTROLS['showResultExplanation']();
    FORM_CONTROLS['hideExplanationButton']();
    FORM_CONTROLS['showIncomeExplanationButton']();
  }); // Set up show income explanation button.

  DOM_MANIPULATORS.getElem('show-income-explanation').addEventListener('click', function () {
    FORM_CONTROLS['showIncomeExplanation']();
    FORM_CONTROLS['hideIncomeExplanationButton']();
  }); // Set up validation for number fields.

  var number_field_ids = ['monthly_job_income', 'monthly_non_job_income', 'resources', 'dependent_care_costs', 'medical_expenses_for_elderly_or_disabled', 'court_ordered_child_support_payments', 'rent_or_mortgage', 'homeowners_insurance_and_taxes', 'utility_costs'];

  var _loop = function _loop() {
    var field_id = number_field_ids[i];
    var number_elem = DOM_MANIPULATORS.getElem(field_id);

    if (number_elem) {
      number_elem.addEventListener('input', function (event) {
        DOM_MANIPULATORS['validateNumberField']("".concat(field_id, "_error_elem"))(event);
      });
    }
  };

  for (var i = 0; i < number_field_ids.length; i++) {
    _loop();
  }
})();

/***/ })
/******/ ]);