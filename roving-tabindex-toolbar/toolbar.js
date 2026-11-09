// For demonstration purposes only, not to be taken as production level code.
document.addEventListener('DOMContentLoaded', () => {
    const toolbar = document.querySelector('[role="toolbar"]');
    const toolbarButtons = Array.from(toolbar.querySelectorAll("button"));
    const firstButton = toolbarButtons[0];
    const lastButton = toolbarButtons[toolbarButtons.length - 1];

    toolbar.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            focusNextButton(document.activeElement);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focusPreviousButton(document.activeElement);
        } else if (e.key === 'Home') {
            e.preventDefault();
            focusButton(firstButton);
        } else if (e.key === 'End') {
            e.preventDefault();
            focusButton(lastButton);
        } else {
            // debug, even the disabled ones.
            console.log('Pressed ' + e.target.children[1].innerText);
        }
    });

    toolbarButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (btn.getAttribute('aria-disabled') === 'true') {
                return;
            }
            focusButton(btn);
        });
    });

    function focusNextButton(current) {
        if (current.nextElementSibling) {
            focusButton(current.nextElementSibling);
        } else {
            focusButton(firstButton);
        }
    }

    function focusPreviousButton(current) {
        if (current.previousElementSibling) {
            focusButton(current.previousElementSibling);
        } else {
            focusButton(lastButton);
        }
    }

    function focusButton(btn) {
        toolbarButtons.forEach(function (button) {
            button.setAttribute("tabindex", "-1");
        });

        btn.setAttribute("tabindex", "0");
        btn.focus();
    }

    const toggleButtons = document.querySelectorAll("button[aria-pressed]");

    toggleButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (btn.getAttribute("aria-pressed") === "true") {
                btn.setAttribute("aria-pressed", "false");
            } else {
                btn.setAttribute("aria-pressed", "true");
            }
        });
    });

});