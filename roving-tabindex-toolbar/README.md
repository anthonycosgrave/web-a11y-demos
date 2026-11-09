# Roving `tabindex`
This technique is for managing navigation within a "toolbar" where the child elements of a group that should be treated as a *single* TAB stop. 

Based on the guidelines from [ARIA Authoring Practices Guide (APG) for "Developing a Keyboard Interface"](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex).

## Demonstration
Follow the numbered points in the list to demonstrate the functionality.
TODO NVDA YouTube video
TODO Narrator YouTube video

## Keyboard interaction
Only one button at a time has `tabindex="0"` and all others have `tabindex="-1"` ensuring that only the currently focused button is in the tab order.

As the user navigates with arrow keys (or clicks a button), the `tabindex="0"` is moved to that button using JavaScript. The previously focused button gets `tabindex="-1"`. This "roving" tabindex allows keyboard navigation within the toolbar while keeping the tab flow simple. 

A user can `TAB` or `SHIFT + TAB` into the toolbar and the first element in the group (the bold text button) will take focus. The user can navigate between each button using `LEFT` and `RIGHT` arrow keys. Navigation wraps from first to last and last to first. `HOME` will take the user to the first button in the toolbar. `END` will take the user to the last button in the toolbar.

Each button (if not disabled) can be activated with `SPACE` or `ENTER` the same way any native HTML button element can. The bold, italic and underline buttons operate as toggles i.e. when activated they remain pressed until the user untoggles them.

## Toggle buttons 
The `aria-pressed` attribute holds the current *pressed* state of the toggle buttons - Bold, Italic and Underline. `true` when pressed/activated and `false` when no longer activated. 

## `visually-hidden`
Each button's accessible name is provided via a "visually hidden" nested span that is available assistive technologies through the accessibility tree.

## Handling disabled buttons
For the purposes of demonstration `Undo` and `Redo` are communicated to a screen reader user as disabled via `aria-disabled="true"`. Using the HTML `disabled` attribute would remove the buttons from the page's tab order making them inaccessible via keyboard navigation and unavailable to assistive technologies.

## To run the example
Open up the index.html locally and interact with it.