'use strict';

const autocomplete = document.querySelector('.autocomplete');
const input = document.querySelector("#autocomplete-input");
const listbox = document.querySelector("#autocomplete-listbox");
const toggleButton = document.querySelector("#autocomplete-button");
const statusUpdate = document.querySelector("#autocomplete-status");
const demoNotice = document.querySelector("#demo-notice");
// quick way to toggle aria-selected and aria-activedescendant for demo purposes.
const withoutAria = new URLSearchParams(location.search).get("without-aria") === "1";

let matchingOptions = [];
let highlightedSuggestionIndex = -1;   // option currently highlighted via navigation.
let chosenOption = null;    // option that the person actually chosen - pressed 'Enter' or clicked on with their mouse.

let debounceTimerId = null;

let abortController = null;


function updateStatus(msg) {
    statusUpdate.textContent = msg;
}

async function loadSuggestions(query) {
    abortController?.abort();
    abortController = new AbortController();

    try {
        matchingOptions = await fetchSuggestions(query, abortController.signal);
        openSuggestions();
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        matchingOptions = [];
        hideSuggestions();
        updateStatus("Suggestions could not be loaded. Please try again.");
    }
}

function openSuggestions() {
    listbox.replaceChildren();
    input.removeAttribute("aria-activedescendant");

    if (matchingOptions.length === 0) {
        updateStatus("No products found.");
        hideSuggestions();
        return;
    }

    updateStatus("");
    matchingOptions.forEach((suggestion, index) => {
        const option = document.createElement("li");

        option.id = `${listbox.id}-option-${index}`;
        // have to be 'option' because they're children of a listbox
        // and selectable (aria-selected).
        option.setAttribute("role", "option");
        // accessible name will come from content.
        option.textContent = suggestion.label;

        // match keyboard highlighting style.
        option.addEventListener("mouseenter", () => highlightSuggestion(index));

        option.addEventListener("mousedown", (event) => {
            // Prevent the input from losing focus before selection occurs.
            event.preventDefault();
        });

        option.addEventListener("click", () => {
            chooseSuggestion(index);
        });

        listbox.append(option);
    });

    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
    toggleButton.setAttribute("aria-expanded", "true");
}

function highlightSuggestion(index) {
    const options = listbox.querySelectorAll('[role="option"]');

    if (options.length === 0) {
        highlightedSuggestionIndex = -1;
        input.removeAttribute("aria-activedescendant");
        return;
    }

    highlightedSuggestionIndex = Math.max(0, Math.min(index, options.length - 1));

    options.forEach((option) => {
        option.removeAttribute("aria-selected");
        option.classList.remove("is-active");
    });

    const activeOption = options[highlightedSuggestionIndex];
    // maintain visual focus on the descendant element inside the focused
    // input. `activeOption.focus()` is not the right choice here it will 
    // take focus away from the listbox container.
    activeOption.classList.add("is-active");
    if (!withoutAria) {
        // without aria-selected and active-descendant focus will stay 
        // on the input. Screen readers will stay on text input and
        // announce input content not the currently highlighted option
        // in the dropdown list.
        activeOption.setAttribute("aria-selected", "true");
        input.setAttribute("aria-activedescendant", activeOption.id);
    }
    activeOption.scrollIntoView({ block: "nearest" });
}

// remove the "visual focus" from an option but leave the listbox open.
function clearHighlightedSuggestion() {
    const options = listbox.querySelectorAll('[role="option"]');

    options.forEach((option) => {
        option.removeAttribute("aria-selected");
        option.classList.remove("is-active");
    });

    highlightedSuggestionIndex = -1;
    input.removeAttribute("aria-activedescendant");
}

// Update the input textbox with the option chosen from the list.
function chooseSuggestion(index) {
    const suggestion = matchingOptions[index];

    if (!suggestion) {
        return;
    }

    input.value = suggestion.value;
    chosenOption = suggestion;
    hideSuggestions();
}

// List is not visible, focus is no longer on any list
// items and nothing is actively highlighted.
function hideSuggestions() {
    clearHighlightedSuggestion();

    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-expanded", "false");
}

// close the popup when focus leaves the combobox.
autocomplete.addEventListener("focusout", (event) => {
    // focusout bubbles up so this will handle focusout on 
    // multiple elements inside the container.
    const nextFocusedElement = event.relatedTarget;
    if (!nextFocusedElement || !autocomplete.contains(nextFocusedElement)) {
        hideSuggestions();
    }
});

// input filtering
input.addEventListener("input", async () => {
    chosenOption = null;
    highlightedSuggestionIndex = -1;
    input.removeAttribute("aria-activedescendant");

    clearTimeout(debounceTimerId);
    abortController?.abort();

    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
        abortController?.abort();
        matchingOptions = [];
        hideSuggestions();
        return;
    }
    debounceTimerId = setTimeout(() => {
        loadSuggestions(query);
    }, 300);
});

// input click - show or hide options list.
input.addEventListener("click", async () => {
    if (!listbox.hidden) {
        hideSuggestions();
    } else if (input.value.trim().length >= 1) {
        const query = input.value.trim().toLowerCase();
        await loadSuggestions(query);
    } else {
        // show all options if input is empty.
        await loadSuggestions("");
    }
});

// Toggle button - show or hide options list.
toggleButton.addEventListener("click", async () => {
    if (!listbox.hidden) {
        hideSuggestions();
    } else if (input.value.trim().length >= 1) {
        const query = input.value.trim().toLowerCase();
        await loadSuggestions(query);
    } else {
        // Show the default options before any text is entered.
        await loadSuggestions("");
    }
    input.focus(); // Ensure focus returns to input.
});

input.addEventListener("keydown", async (event) => {
    const listIsOpen = !listbox.hidden;

    switch (event.key) {
        case "ArrowDown":
            event.preventDefault();

            // Alt + ArrowDown Open the list WITHOUT moving focus or changing selection
            if (event.altKey) {
                if (!listIsOpen) {
                    const query = input.value.trim().toLowerCase();
                    if (query === "") {
                        await loadSuggestions(query);
                    } else {
                        await loadSuggestions(query);
                    }
                    highlightedSuggestionIndex = -1;
                }
                break;
            }

            // Open the list or move to the NEXT option in the list.

            // if no input, open and highlight the first option.
            if (!listIsOpen) {
                if (input.value.trim() === "") {
                    await loadSuggestions("");
                    highlightedSuggestionIndex = -1;
                }
                else if (matchingOptions.length > 0) {
                    openSuggestions();
                }
            }

            if (matchingOptions.length > 0) {
                // % options.length will wrap the navigation around from last to first.
                const nextIndex = highlightedSuggestionIndex === -1
                    ? 0
                    : (highlightedSuggestionIndex + 1) % matchingOptions.length;
                highlightSuggestion(nextIndex);
            }
            break;
        case "ArrowUp":
            // Open the list or move to the PREVIOUS option in the list.
            event.preventDefault();

            // if no input, open and highlight the LAST option.
            if (!listIsOpen) {
                if (input.value.trim() === "") {
                    await loadSuggestions("");
                    highlightedSuggestionIndex = -1;
                }
                else if (matchingOptions.length > 0) {
                    openSuggestions();
                }
            }

            if (matchingOptions.length > 0) {
                // should wrap around in list navigation from first to last.
                const previousIndex =
                    highlightedSuggestionIndex === -1
                        ? matchingOptions.length - 1
                        : (highlightedSuggestionIndex - 1 + matchingOptions.length) % matchingOptions.length;

                highlightSuggestion(previousIndex);
            }
            break;
        case "Enter":
            // Select the currently focused option, OR, close the open listbox.
            if (listIsOpen) {
                event.preventDefault();

                if (highlightedSuggestionIndex >= 0) {
                    chooseSuggestion(highlightedSuggestionIndex);
                } else {
                    hideSuggestions();
                }
            }
            break;
        case "Escape":
            event.preventDefault();
            // Close the list. Don't change the input.

            if (listIsOpen) {
                hideSuggestions();
            } else {
                // clear the input if the list was already closed.
                input.value = "";
                chosenOption = null;
                matchingOptions = [];
                highlightedSuggestionIndex = -1;
                input.removeAttribute("aria-activedescendant");
            }
            break;
        case "Tab":
            // Leave the listbox.
            hideSuggestions();
            break;
        case "ArrowLeft":
        case "ArrowRight":
        case "Home":
        case "End":
            // return visual focus from the option to the textbox.
            // don't preventDefault() here, would stop textbox cursor moving.
            if (highlightedSuggestionIndex >= 0) {
                clearHighlightedSuggestion();
            }
            break;
        default:
            // printable characters: when an option is visually focused, any
            // typing should return visual focus to the textbox *before* 
            // any characters are inserted. 'input' handler will then apply
            // filter to the list.
            if (highlightedSuggestionIndex >= 0
                && event.key.length === 1
                && !event.ctrlKey
                && !event.metaKey   // Windows Key or OS X Cmd Key 
                && !event.altKey) {
                clearHighlightedSuggestion();
            }
            break;
    }
});

// Close the list when user has clicked away from it.
document.addEventListener("click", (event) => {
    if (!event.target.closest(".autocomplete")) {
        hideSuggestions();
    }
});