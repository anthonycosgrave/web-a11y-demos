# Using `aria-activedescendant` to make an accessible typeahead  

A typeahead is also known as an ["editable Combobox with list autocomplete"](http://w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/) in the ARIA APG.

In this repo I have 2 separate versions of an accessible typeahead:

1. uses a hardcoded array of European capital cities.  
2. a more advanced version that gets product data live from [DummyJSON](https://dummyjson.com/docs/products).  

## `aria-activedescendant` and "virtual focus"
Normally, assistive technology reports the element that has the *actual* browser focus, e.g. the input element the user types in.

`aria-activedescendant` tells assistive technology which element should be treated as active while the input retains actual browser focus. This is sometimes known as "virtual focus".

For example, the below tells assistive technology to treat `city-option-1` as the active item, even though focus has not moved from the input. 

```
<input
    id="city"
    role="combobox"
    aria-controls="city-listbox"
    aria-expanded="true"
    aria-autocomplete="list"
    aria-activedescendant="city-option-1">
```

And the active option is identified in the listbox:

```
<ul id="city-listbox" role="listbox">
    <li id="city-option-0" role="option">Berlin</li>
    <li id="city-option-1" role="option" aria-selected="true">Dublin</li>
    <li id="city-option-2" role="option">Lisbon</li>
</ul>
```

`aria-selected="true"` identifies "Dublin" as the option currently active in the popup, It doesn't mean that the value has been committed to the input. The value is committed only when the user actually chooses the option.

When the list closes or no option is active, `aria-activedescendant` is removed from the input.

## Demonstration

The videos below are screen recordings of the `calling-api` version that uses product data.

They were recorded using:  

- Windows 10
- Narrator  
- NVDA 2026.1.1 (2026.1.1.55980)  
- Firefox Version 159.0.1  
- Edge Version 156.0.4314.58

### Without any of the accessible functionality
For the purposes of demonstration the control in these videos do not include any of the recommendations from ARIA APG.

**NVDA and Firefox**  

[![Click to play video on YouTube](https://img.youtube.com/vi/9Xh7WGIUczI/0.jpg)](https://www.youtube.com/watch?v=9Xh7WGIUczI)

**Narrator and Edge**  

[![Click to play video on YouTube](https://img.youtube.com/vi/NYsgLLZyan8/0.jpg)](https://www.youtube.com/watch?v=NYsgLLZyan8)

### With the accessible functionality

With the proper `aria-*` attributes and properties included the controls provide a lot more information to the screen readers as you will hear in these videos.

**NVDA and Firefox**

[![Click to play video on YouTube](https://img.youtube.com/vi/GYpWMvURCJE/0.jpg)](https://www.youtube.com/watch?v=GYpWMvURCJE)

**Narrator and Edge**

[![Click to play video on YouTube](https://img.youtube.com/vi/k1w9eJmA4h8/0.jpg)](https://www.youtube.com/watch?v=k1w9eJmA4h8)

## Keyboard support
Implemented according to the requirements listed in the ["Keyboard Support"](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/#kbd_label) section on the APG pattern page.

## ARIA attributes and properties
- `role="combobox"` identifies the editable input and its popup.
- `aria-autocomplete="list"` indicates that typing produces a list of
  suggestions.
- `aria-controls` points to the popup controlled by the input.
- `aria-expanded` communicates whether the popup is open.
- `role="listbox"` identifies the popup as a list of suggestions.
- `role="option"` identifies each suggestion.
- `aria-selected="true"` identifies the active suggestion.
- `aria-activedescendant` communicates the active suggestion while the input
  retains DOM focus.

## To run the project(s)
For a quick browser preview, open either project's `index.html` with VS Code's Live Server extension.

To serve the `calling-api` project from the command line:

```
cd calling-api
npm install
npm run dev
```

Open the URL printed in the terminal (by default, `http://localhost:4173`).
Stop the server with Ctrl+C.

For a demonstration-only comparison with the active-option ARIA attributes
disabled, open `http://localhost:4173/?without-aria=1`.
The normal page remains the accessible example; the comparison mode is
intentionally incomplete and is not intended for regular use.

## Playwright tests
The `calling-api` version has Playwright tests. Install its dependencies once:

```
cd calling-api
npm install
```

Run the tests from the `calling-api` directory:

```
npm test
```

or if you'd prefer:

```
npx playwright test
```