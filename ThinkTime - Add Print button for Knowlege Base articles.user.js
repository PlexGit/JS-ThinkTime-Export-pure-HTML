// ==UserScript==
// @name         ThinkTime - Add Print View button for Knowlege Base articles
// @namespace    http://tampermonkey.net/
// @version      0.95
// @description  Add Print View button for Knowlege Base articles on ThinkTime platform
// @author       Oleksandr Pylypchak
// @match        https://*.thinktime.com/ui/knowledge-bases/*/articles/*
// @match        https://*.thinktime.com/ui/knowledge-bases/articles/*
// @match        https://*.thinktime.com/ui/news/*/articles/*
// @match        https://*.thinktime.com/ui/news/articles/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thinktime.com
// @grant        none
// @updateURL    https://gist.github.com/PlexGit/db248956219578ca1620c9493a92c8a0/raw/ThinkTime%2520-%2520Add%2520Print%2520button%2520for%2520Knowlege%2520Base%2520articles.user.js
// @downloadURL  https://gist.github.com/PlexGit/db248956219578ca1620c9493a92c8a0/raw/ThinkTime%2520-%2520Add%2520Print%2520button%2520for%2520Knowlege%2520Base%2520articles.user.js
// ==/UserScript==

(function() {
	"use strict";

	window.addEventListener("load", () => {
		addButton('<span style="font-size:28px;">&#128196;</span>', applyPrintView);
	});

	function addButton(text, onclick, cssObj) {
		// cssObj = cssObj || {position: 'absolute', bottom: '7%', left:'4%', 'z-index': 3}
		cssObj = cssObj || {
			position: "fixed",
			width: "48px",
			height: "48px",
			bottom: "24px",
			right: "24px",
			"border-radius": "50%",
			"z-index": 3,
		};
		let button = document.createElement("button"),
			btnStyle = button.style;
		document.body.appendChild(button);
		button.className = "icon-button-module__kindDefault--zIJk6";
		button.innerHTML = text;
		button.title = "Print View";
		button.onclick = onclick;
		Object.keys(cssObj).forEach(function(key) {
			btnStyle[key] = cssObj[key];
		});
		return button;
	}

	function applyPrintView() {

		// Remove elements by class name prefix
		[
			"Collapsible__contentInner",
			"Collapsible__contentOuter",
			"Collapsible",
			"article-section-module__footer",
			"news-item-view-info-module__avatar",
			"news-item-view-info-module__attachment", ,
			"article-attachments-module__sectionBlock",
			"news-item-view-info-module__dot",
			"news-item-view-info-module__sections",
			"kb-article-view-module__expand",
			"kb-item-view-info-module__sections"
		].forEach((prefix) => {
			// Select all elements on the page
			const allElements = document.querySelectorAll('*');
			allElements.forEach((element) => {
				// Check each class name of the element
				Array.from(element.classList).forEach((className) => {
					if (className.startsWith(prefix)) {
						element.remove(); // Remove the element if any of its classes start with the prefix
					}
				});
			});
		});

		// Remove attributes from HTML section
		const htmlElement = document.documentElement;
		htmlElement.removeAttribute("class");
		htmlElement.removeAttribute("style");
		htmlElement.removeAttribute("lang");
		htmlElement.removeAttribute("data-js-focus-visible");

		// Remove specific WYSIWYG CSS variables from style attributes
		const wysiwygElements = document.querySelectorAll('[style*="--wysiwyg"]');
		wysiwygElements.forEach(el => {
			el.style.removeProperty('--wysiwyg-font-family');
			el.style.removeProperty('--wysiwyg-font-size');
			// Optional: If the style attribute is now empty, remove it entirely
			if (el.getAttribute('style') === '') {
				el.removeAttribute('style');
			}
		});

		// Remove BASE tag from HEAD if exists
		const baseTag = document.querySelector("base");
		if (baseTag) {
			baseTag.parentNode.removeChild(baseTag);
		}

		//________________________________________________________________________
		// Replace BODY content with the article's body content
		const articleBody = document.querySelector(
			"[class^='kb-item-content-wrapper-module__body']"
		);
		if (articleBody) {
			document.body.innerHTML = articleBody.innerHTML;
		}
		// Replace BODY content with the NEWS article's body content
		const newsArticleBody = document.querySelector(
			"[class^='news-item-content-wrapper-module__body']"
		);
		if (newsArticleBody) {
			document.body.innerHTML = newsArticleBody.innerHTML;
		}

		// Remove the STYLE and LANG attribute from the HTML and BODY element
		document.body.removeAttribute("style");
		document.documentElement.removeAttribute("style");
		document.body.removeAttribute("lang");
		document.documentElement.removeAttribute("lang");

		// Remove unnecessary tags
		[
			"nav",
			"aside",
			"footer",
			"style",
			"button",
			"form",
			// "iframe",
			"object",
			"script",
			"noscript",
			"tt-icon-button",
			"app-content",
			"grammarly-popups",
			"grammarly-desktop-integration",
		].forEach((tagName) => {
			const elementsToRemove = document.getElementsByTagName(tagName);
			Array.from(elementsToRemove).forEach((element) => element.remove());
		});

		// Remove all linked styles
		const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
		linkElements.forEach((linkElement) => linkElement.remove());

		// Making NEWS STRUCTURE article-like ________________________________________________

		// SWAP foot and meta info to make it look like regular article
		// Function to find the first element whose class name starts with a given prefix
		function getElementByClassPrefix(prefix) {
			const allElements = document.querySelectorAll('*');
			for (const element of allElements) {
				// Check if any class name of the element starts with the given prefix
				for (const className of element.classList) {
					if (className.startsWith(prefix)) {
						return element; // Return the element if a match is found
					}
				}
			}
			return null; // If no element with the prefix is found
		}
		// Prefixes to look for
		const prefix1 = "news-item-view-info-module__meta";
		const prefix2 = "news-article-view-footnote-module__footnote";
		// Get the elements by class prefix
		const element1 = getElementByClassPrefix(prefix1);
		const element2 = getElementByClassPrefix(prefix2);
		if (element1 && element2) {
			// Swap inner content
			const tempInnerHTML = element1.innerHTML;
			element1.innerHTML = element2.innerHTML;
			element2.innerHTML = tempInnerHTML;
		} else {
			console.log("One or both elements not found");
		}

		//Rearranging tree - Author and date
		// Select all elements where the class starts with the given prefix
		const spanElements = document.querySelectorAll('[class^="news-item-view-info-module__ownerName--"]');
		// Loop through all matching elements and unwrap them
		spanElements.forEach(spanElement => {
			// Get the parent element (the div)
			const parentDiv = spanElement.parentNode;
			// Replace the span with its content
			if (parentDiv) {
				parentDiv.replaceChild(document.createTextNode(spanElement.textContent), spanElement);
			}
		});

		function convertSpanToDiv(classPrefix) {
			// Select all span elements where the class starts with the given prefix
			const spanElements = document.querySelectorAll(`[class^="${classPrefix}"]`);
			// Loop through all matching elements
			spanElements.forEach(spanElement => {
				// Create a new div element
				const newDiv = document.createElement('div');
				// Copy the class from the span to the new div
				newDiv.className = spanElement.className;
				// Copy the content from the span to the new div
				newDiv.textContent = spanElement.textContent;
				// Replace the span with the new div
				spanElement.parentNode.replaceChild(newDiv, spanElement);
			});
		}
		convertSpanToDiv("news-item-view-info-module__date--");

        /*
		//Rearranging update date
		function convertDivToSpan(classPrefix) {
			// Select all div elements where the class starts with the given prefix
			const divElements = document.querySelectorAll(`[class*=" ${classPrefix}"]`);
			// Loop through all matching elements
			divElements.forEach(divElement => {
				// Create a new span element
				const newSpan = document.createElement('span');
				// Copy the class from the div to the new span
				newSpan.className = divElement.className;
				// Copy the content from the div to the new span
				newSpan.textContent = divElement.textContent;
				// Replace the div with the new span
				divElement.parentNode.replaceChild(newSpan, divElement);
			});
		}
		convertDivToSpan("news-article-view-module__details--");
        */

		// Apply styles to the edited date and other article metadata
		const editedDate = document.querySelector(
			"[class^='kb-item-view-info-module__date']"
		);
		if (editedDate) {
			editedDate.style.cssText = "font-style: italic; font-size: 10pt;";
			editedDate.parentNode.style.marginBottom = "1.75em";
		}
		const newsEditedDate = document.querySelector(
			"[class^='news-article-view-footnote-module__footnote']"
		);
		if (newsEditedDate) {
			newsEditedDate.style.cssText =
				"display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; flex-direction: column; padding-top: 30px; padding-bottom: 30px; font-style: italic; font-size: 10pt;";
			// newsEditedDate.parentNode.style.marginBottom = "1.75em";
		}
		const newsFootnote = document.querySelector(
			"[class*=' news-article-view-module__details']"
		);
		if (newsFootnote) {
			newsFootnote.style.cssText = "font-style: italic; font-size: 10pt;";
			newsFootnote.parentNode.style.marginBottom = "1.75em";
		}

		// Apply styles to the author/date footer
		const footer = document.querySelector(
			"[class^='kb-article-footnote-module__footnote']"
		);
		if (footer) {
			footer.style.cssText =
				"display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; flex-direction: column; padding-top: 30px; padding-bottom: 30px; font-style: italic; font-size: 10pt;";
		}

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

		// Remove some attributes (including IDs and CLASSes) for all tags
		const attributesToRemove = [
			"id",
			"class",
			"base",
			"data-cy",
			"data-test-landmark",
			"data-new-gr-c-s-check-loaded",
			"data-gr-ext-installed",
			"data-test-distinct"
		];
		const allElements = document.getElementsByTagName("*");
		for (const element of allElements) {
			attributesToRemove.forEach((attributeName) =>
				element.removeAttribute(attributeName)
			);
		}

		/*
		// Remove excessive DIVs in created date section
		// Get the reference to the innermost div element
		const innermostDiv = document.querySelector("div div div");
		// Check if the innermostDiv exists
		if (innermostDiv) {
			// Get the reference to its parent element (the middle div)
			const middleDiv = innermostDiv.parentNode;
			// Check if middleDiv exists and has a parent
			if (middleDiv && middleDiv.parentNode) {
				// Move the content of the innermost div to the parent of the middle div
				while (innermostDiv.firstChild) {
					middleDiv.parentNode.insertBefore(innermostDiv.firstChild, middleDiv);
				}
				// Remove the middle div
				middleDiv.remove();
			} else {
				console.warn('Middle div or its parent does not exist.');
			}
		} else {
			console.warn('Innermost div not found.');
		}
        */

		// Target and collapse lonely inner DIVs regardless of depth
		// This turns <div><div><div>Content</div></div></div> into <div>Content</div>
		const allDivs = Array.from(document.querySelectorAll('div')).reverse();

		allDivs.forEach(parent => {
			// 1. Must have exactly one child element
			// 2. That child must be a DIV
			// 3. The parent itself must not contain any direct text (lonely wrapper)
			if (parent.children.length === 1 &&
				parent.children[0].tagName === 'DIV' &&
				parent.cloneNode(false).textContent.trim() === "") {

				const innerDiv = parent.children[0];

				// Move all content from the lonely inner DIV to the parent
				while (innerDiv.firstChild) {
					parent.appendChild(innerDiv.firstChild);
				}

				// Remove the redundant inner DIV
				innerDiv.remove();
			}
		});

		// ADD DOMAIN TO LINKS (make links absolute)
		function addDomainToLinks(domain) {
			const anchorTags = document.querySelectorAll('a');
			anchorTags.forEach(tag => {
				const href = tag.getAttribute('href');
				if (href && (href.startsWith('../') || href.startsWith('/'))) {
					const absoluteURL = new URL(href, domain).href;
					tag.setAttribute('href', absoluteURL);
				}
			});
		}
		// Get the current domain
		const currentDomain = window.location.origin;
		// Modify the links on the current page
		addDomainToLinks(currentDomain);

		// Add printable styles to HEAD
		const printableStyle = `
    <style>
        * {
            font-family: "Verdana", "Arial", sans-serif;
            line-height: 1.5;
        }
        h1, h2, h3, h4, h5, h6 {
            text-wrap: balance;
        }
        h1, h2 {
            line-height: 1.2;
        }
        h2 {
            border-top: 1px solid lightgray;
            margin-top: 1.75em;
            padding-top: 0.75em;
        }
        h2::first-child {
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
            margin-top: 10px;
            margin-bottom: 10px;
        }
        img {
            max-width: 100%;
        }
        @media print {
            p {
                -webkit-break-inside: avoid;
                break-inside: avoid;
            }
            h1, h2, h3, h4, h5, h6 {
                -webkit-break-after: avoid;
                -webkit-break-inside: avoid;
                break-after: avoid;
                break-inside: avoid;
            }
            a[href^='http']:after {
                content: ' > ' attr(href);
                font-family: Monospace;
            }
        }
    </style>`;
		document.head.insertAdjacentHTML("beforeend", printableStyle);
	}
})();
