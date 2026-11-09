# Accessbile form validation with an Error Summary in React
This project includes a form-level error summary that appears when validation fails on *submission*. The pattern is based on guidance from the [WebAIM Form Validation and Error Recovery](https://webaim.org/techniques/formvalidation/#error), [GOV.UK Design System](https://design-system.service.gov.uk/components/error-summary/) and [eBay’s client-side form validation pattern](https://opensource.ebay.com/mindpatterns/messaging/form-validation/) and has been adapted as part of a small React application for personal learning purposes.

## Demonstration

Click on the thumbnails below to see demonstrations of the error summary with a screen reader. In both cases I am triggering form validation by pressing `Enter` to submit the form.

**Narrator and Edge (version 156.0.4314.58)**

[![Click to play Narrator and Edge demo video on YouTube](https://img.youtube.com/vi/diQaqXdq5Xg/0.jpg)](https://youtu.be/diQaqXdq5Xg)

**NVDA 2026.3 (2026.3.0.58174) and Firefox 159.0.1**

[![Click to play NVDA and Firefox demo video on YouTube](https://img.youtube.com/vi/Oob1p_JY5ao/0.jpg)](https://youtu.be/Oob1p_JY5ao)

## Error summary and validation feedback
When submission fails, focus is moved programmatically to the error summary region so that people are immediately informed that errors are present. Those using a screen reader will have the errors announced to them. Each error is presented a link to the relevant form field, allowing people to quickly navigate to and correct invalid inputs. The error summary is a landmark that can be accessed easily via screen reader keyboard commands e.g. `d` and `Shift+d`, or in the screen reader's elements list.

Inline error messages are associated with their inputs using `aria-describedby`, ensuring that error information is available to assistive technologies while the field is focused.

## PasswordInput component
A reusable password input with show/hide toggle functionality. Password requirements are displayed upfront in an effort to reduce potential input errors, and the toggle button's state changes are announced to screen readers via an `aria-live` region (`role="status"`). The component demonstrates accessible form patterns including proper labeling, `aria-describedby` for associating requirements and errors, and keyboard operability.

## Keyboard navigation
Keyboard interaction and focus behaviour are tested across browsers to verify that:

- Focus is correctly managed on validation failure.
- Error links are reachable and operable using the keyboard.
- Normal tab order is preserved when no errors are present.

Sequential tab order within the error summary is not strictly asserted after programmatic focus, as browser engines differ in how they handle focus history.

Tests instead focus on accessibility outcomes - focus placement, keyboard reachability, and correct navigation - rather than browser-specific tab mechanics.

### WebKit Tab Order/Keyboard Accessibility Issue 

Keyboard accessibility is not enabled by default on MacOS. People have to [enable themselves at the OS or Safari level](https://dequeuniversity.com/mac/keyboard-access-mac). It does not appear to be available via Playwright.  

None of the suggested workarounds I found in these links worked for me:  
- https://github.com/microsoft/playwright/issues/2114  
- https://github.com/microsoft/playwright/issues/5609  
- https://github.com/modernweb-dev/web/issues/1919


## WCAG Success criteria

This project demonstrates conformance with the following WCAG success criteria:

**[3.3.1 — Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html) (Level A)**  
"If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text."

**[3.3.3 — Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html) (Level AA) (conditionally)**  
"If an input error is detected and suggestions for correction are known, they are provided."

**[3.3.2 — Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html) (Level A)**  
"Labels or instructions are provided when content requires user input."

**[2.4.3 — Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html) (Level A) (contextually)**  
"If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability."

**[2.4.1 — Bypass Blocks](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html) (Level A) (indirectly)**
* Users can jump directly to invalid fields
* Error summary links move focus to the field in error
* Keyboard and screen reader users benefit equally

**[2.1.1 — Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) (Level A)**  
"All functionality of the content is operable through a keyboard interface."

**[SC 1.4.1 - Use Of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html) (Level A)**
"Color is not the only way of distinguishing information."

## How to run the code

1. `npm install`  
2. `npm run dev`  
3. Open `http://localhost:5173` to view the form  

To run tests:

`npx playwright test`

## Tech Stack

* [Vite](https://vite.dev/)  
* [React](https://react.dev/)  
* [Axe-core](https://github.com/dequelabs/axe-core)  
* [Playwright](https://playwright.dev/)  
* [NVDA](https://www.nvaccess.org/)
* [Narrator](https://support.microsoft.com/en-us/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1)


## NVDA "stale" or previous announcements bug

When testing with with NVDA and Firefox the error summary updates visually as expected, but NVDA announced the previous heading or list items. The issue could not be reproduced with Narrator and Firefox or with NVDA and Edge.

### Test environment

- Windows 10 Pro
- Firefox 159.0.1
- Edge 156.0.4314.58
- Chrome 157.0.8103.39
- Narrator
- NVDA 2026.3 (2026.3.0.58174)

### Issue

The form validation is correct, and the heading text updates, but NVDA announces the **previous** heading and error list items. For example, after submitting with two invalid fields, fixing one field, and submitting again, the heading reads “There is a problem,” while NVDA announces “There are 2 problems.” If both fields are then invalid again, the heading reads “There are 2 problems,” while NVDA announces “There is a problem.”

This video demonstrates the issue with the headings:

[![Click to play NVDA bug demo video on YouTube](https://img.youtube.com/vi/ndOE1sVxFzo/0.jpg)](https://youtu.be/ndOE1sVxFzo)

### Attempted fix #1: Deferred focus with `setTimeout`

```jsx
useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    const timer = window.setTimeout(() => {
        summaryRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
}, [errors]);
```

Deferring the `.focus()` call in the `ErrorSummary` effect caused NVDA to announce the current heading, *but it also announced the invalid field’s `aria-describedby` error message before the error summary*


[![Click to play NVDA timeout bug demo video on YouTube](https://img.youtube.com/vi/KP7zrcjs5Zs/0.jpg)](https://youtu.be/KP7zrcjs5Zs)

### Adding a React `key`

Adding a key to the heading resolved the stale heading announcement, but further testing showed that list items could still be announced stale:

```jsx
<h2 key={JSON.stringify(errors)} className={styles.heading} id="error-summary-title">
```

[![Click to play NVDA stale error list demo video on YouTube](https://img.youtube.com/vi/yYw02AvudgA/0.jpg)](https://youtu.be/yYw02AvudgA)

Adding the key to the entire section recreated the summary whenever the errors changed and resolved the stale announcements:

```jsx
<section key={JSON.stringify(errors)} className={styles.container} ref={summaryRef} tabIndex="-1" aria-labelledby="error-summary-title">
```