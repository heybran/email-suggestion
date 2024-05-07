# `<email-suggestion>`

A web component to detect email domain typo and suggest correct email domain. Under the hood, it's using `Levenshtein Distance` algorithm to detect mistyped email addresses.

[Demo](https://email-suggestion.netlify.app/demo.html)

## Installation

Via [npm](https://www.npmjs.com/package/email-suggestion) or download [email-suggestion.js](email-suggestion.js) directly and use it in your project.

```
npm install email-suggestion
```

## Usage

Add your list of domains that you want to suggest into `data-domains` attribute. And to add a custom prompt message asking user to confirm their email address, you can use the `data-suggestion` attribute, here component will show a `confirm()` prompt with message: `It's possible your email is gwonzhang@gmail.com?`. `$email%` will be replaced with the suggested email address to the email entered by the user.
```html
<email-suggestion data-domains="gmail.com, zoho.com, proton.me" data-suggestion="It's possible your email is %email%?">
	<label for="email">Email</label>
	<input id="email" name="email" type="email">
</email-suggestion>
```
