// ==UserScript==
// @name         ThinkTime - Add Print View button for Knowlege Base articles
// @namespace    http://tampermonkey.net/
// @version      0.78
// @description  Add Print View button for Knowlege Base articles on ThinkTime platform
// @author       You
// @match        https://myjysk.thinktime.com/ui/knowledge-bases/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thinktime.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  window.addEventListener("load", () => {
    addButton('<span style="font-size:28px;">&#128196;</span>', applyPrintView);
  });

  function addButton(text, onclick, cssObj) {
    // cssObj = cssObj || {position: 'absolute', bottom: '7%', left:'4%', 'z-index': 3}
    cssObj = cssObj || {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      "z-index": 3,
    };
    let button = document.createElement("button"),
      btnStyle = button.style;
    document.body.appendChild(button);
    button.className = "tt-icon-button medium";
    button.innerHTML = text;
    button.onclick = onclick;
    Object.keys(cssObj).forEach(function (key) {
      btnStyle[key] = cssObj[key];
    });
    return button;
  }

  function applyPrintView() {
    // Remove CLASS from HTML
    document.querySelector("html").removeAttribute("class");

    // Remove BASE tag from HEAD if exists
    const baseTag = document.querySelector("base");
    if (baseTag) {
      baseTag.parentNode.removeChild(baseTag);
    }

    // Replace BODY content with the article's body content
    const articleBody = document.querySelector(
      "[class^='kb-item-content-wrapper-module__body']"
    );
    document.body.innerHTML = articleBody.innerHTML;

    // Remove the STYLE attribute from the BODY element
    document.body.removeAttribute("style");

    // Apply styles to the edited date
    const editedDate = document.querySelector(
      "[class^='kb-item-view-info-module__date']"
    );
    editedDate.style.cssText = "font-style: italic; font-size: 10pt;";
    editedDate.parentNode.style.marginBottom = "1.75em";

    // Apply styles to the author/date footer
    const footer = document.querySelector(
      "[class^='kb-article-footnote-module__footnote']"
    );
    footer.style.cssText =
      "display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; flex-direction: column; padding-top: 30px; padding-bottom: 30px; font-style: italic; font-size: 10pt;";

    // Remove article-wide view button and views/attachments counter
    document
      .querySelector("[class^='kb-article-view-module__expand']")
      .remove();
    document
      .querySelector("[class^='kb-item-view-info-module__sections']")
      .remove();

    // Unwrapping tt-rtf-sandbox to avoid excessive text information
    const ttRtfSandboxes = document.querySelectorAll("tt-rtf-sandbox");
    ttRtfSandboxes.forEach((ttRtfSandbox) => {
      const sectionElement = document.createElement("section");
      while (ttRtfSandbox.firstChild) {
        sectionElement.appendChild(ttRtfSandbox.firstChild);
      }
      ttRtfSandbox.replaceWith(sectionElement);
    });

    // Unwrap inner sections from outer sections
    const outerSections = document.querySelectorAll("div > section");
    outerSections.forEach((outerSection) => {
      const innerSections = outerSection.querySelectorAll("section");
      innerSections.forEach((innerSection) => {
        while (innerSection.firstChild) {
          outerSection.appendChild(innerSection.firstChild);
        }
      });
      innerSections.forEach((innerSection) => {
        innerSection.remove();
      });
    });

    // Remove sections footers
    document
      .querySelectorAll("[class^='article-section-module__footer']")
      .forEach((el) => el.remove());

    // Remove unnecessary tags
    [
      "nav",
      "aside",
      "footer",
      "style",
      "object",
      "script",
      "noscript",
      "tt-icon-button",
      "app-content",
      "grammarly-desktop-integration",
    ].forEach((tagName) => {
      const elementsToRemove = document.getElementsByTagName(tagName);
      Array.from(elementsToRemove).forEach((element) => element.remove());
    });

    // Remove all linked styles
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    linkElements.forEach((linkElement) => linkElement.remove());

    // Remove attributes from HTML section
    const htmlElement = document.documentElement;
    htmlElement.removeAttribute("class");
    htmlElement.removeAttribute("style");
    htmlElement.removeAttribute("data-js-focus-visible");

    // Remove some attributes (including IDs and CLASSes) for all tags
    const attributesToRemove = [
      "id",
      "class",
      "base",
      "data-cy",
      "data-test-landmark",
      "data-new-gr-c-s-check-loaded",
      "data-gr-ext-installed",
    ];
    const allElements = document.getElementsByTagName("*");
    for (const element of allElements) {
      attributesToRemove.forEach((attributeName) =>
        element.removeAttribute(attributeName)
      );
    }

    // Remove excessive DIVs in created date section
    // Get the reference to the innermost div element
    const innermostDiv = document.querySelector("div div div");
    // Get the reference to its parent element (the middle div)
    const middleDiv = innermostDiv.parentNode;
    // Move the content of the innermost div to the parent of the middle div
    while (innermostDiv.firstChild) {
      middleDiv.parentNode.insertBefore(innermostDiv.firstChild, middleDiv);
    }
    // Remove the middle div
    middleDiv.remove();

    // Add printable styles to HEAD
    const printableStyle = `
    <style>
        * {
        font-family: Verdana;
        line-height: 1.5;
        }

        h1, h2 {
        line-height: 1.2;
        }

        h2 {
        border-top: 1px solid lightgray;
        margin-top: 1.75em;
        padding-top: 0.75em;
        }

        h2:first-child {
        margin-top: 0;
        }

        h1 {
        font-size: 1.8em;
        }

        h2 {
        font-size: 1.35em;
        }

        figcaption {
        font-size: smaller;
        color: gray;
        }

        li {
        margin-top: 5px;
        margin-bottom: 5px;
        }

        @media print {
        p {
            break-inside: avoid;
        }
        h1, h2, h3, h4, h5, h6 {
            -webkit-break-after: avoid;
            break-after: avoid;
        }
        }
    </style>`;
    document.head.insertAdjacentHTML("beforeend", printableStyle);
  }
})();
