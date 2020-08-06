# SNAP Prescreener Prototypes

## Preamble

This is a sketchpad prototype built by 18F's [Eligibility APIs Initiative](https://github.com/18F/eligibility-rules-service/blob/master/README.md) to explore the financial factors of SNAP eligibility.

:warning: ***None of the eligibility rules expressed in this repository should be considered official interpretations of SNAP rules or policy. This is a sketchpad prototyping repo only.*** :warning:

## What does this do?

This repo holds prototype prescreeners for SNAP benefits. A prescreener can help someone decide if it is worth their time and energy to submit a full application to SNAP by giving them an understanding of their likely eligibility and their estimated benefit amount.

Right now the repo holds a prototype for one state, Virginia.

### What problems does this aim to solve?

* As a person who might be eligible for SNAP, I want to find out if I am likely eligible and what my monthly benefit amount might be.
* As an oragnization that assists clients who may be eligible for SNAP, I want to offer a resource that can give them an estimate of their SNAP eligibility.

### Try it locally

Open `va/va.html` in the browser of your choice.

# Development

### Guides and more documentation

See the [project wiki](https://github.com/18F/snap-js-prescreener-prototypes/wiki) for guides and project documentation.

### JS structure

+ `api.js`: A JS library that accepts estimates SNAP eligibility and benefits given inputs about household income and expenses. This is the bundled form of [18F/snap-js-api-prototype](https://github.com/18F/snap-js-api-prototype).
+ `form-controls-va.js`: JS for front-end form interactions. Sends data to the `SnapAPI` library exposed by `api.js`; formats and presents the results. Hard-coded as a Virginia-specific prescreener.

### Commands

Build the form-controls Javascript into a minified, browser-ready bundled state:

```
npm run build
```

Run pa11y accessibility check against the HTML files (JS interactions not yet tested for accessibility):

```
npm run pa11y
```

See `package.json` for all developer commands.

### Browser targeting

This prescreener targets Chrome, Safari, Firefox, Microsoft Edge, and Internet Explorer 11.

### Developer notes

+ This prescreener prototype is serverless and uses front-end Javascript only. It does not collect any PII.
