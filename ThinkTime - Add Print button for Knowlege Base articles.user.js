// ==UserScript==
// @name         ThinkTime - Add Print View button for Knowlege Base articles
// @namespace    http://tampermonkey.net/
// @version      0.73
// @description  Add Print View button for Knowlege Base articles on ThinkTime platform
// @author       You
// @match        https://myjysk.thinktime.com/ui/knowledge-bases/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thinktime.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	window.addEventListener('load', () => {
		addButton('<span style="font-size:28px;">&#128196;</span>', applyPrintView)
	})

	function addButton(text, onclick, cssObj) {
		// cssObj = cssObj || {position: 'absolute', bottom: '7%', left:'4%', 'z-index': 3}
		cssObj = cssObj || {
			position: 'fixed',
			bottom: '24px',
			right: '24px',
			'z-index': 3
		}
		let button = document.createElement('button'),
			btnStyle = button.style;
		document.body.appendChild(button);
		button.className = 'tt-icon-button medium';
		button.innerHTML = text;
		button.onclick = onclick;
		Object.keys(cssObj).forEach(function(key) {
			btnStyle[key] = cssObj[key];
		});
		return button;
	}

	function applyPrintView() {
		// Actual modifier code

		// BODY replacement
		const articleBody = document.querySelector("[class^='kb-item-content-wrapper-module__body']")
		document.body.innerHTML = articleBody.innerHTML;
		// document.body.removeAttribute('data-new-gr-c-s-check-loaded');
		// document.body.removeAttribute('data-gr-ext-installed');
		// document.body.removeAttribute('style');

		// Edited date italic
		document.querySelector("[class^='kb-item-view-info-module__date']").style = `font-style: italic; font-size: 10pt;`;

		// Author/date footer inline style
		document.querySelector("[class^='kb-article-footnote-module__footnote']").style = `display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; padding-top: 30px; padding-bottom: 30px; flex-direction: column; font-style: italic; font-size: 10pt;`;

		// Remove article wide view button
		document.querySelector("[class^='kb-article-view-module__expand']").remove();


		// Remove views/attachments counter
		document.querySelector("[class^='kb-item-view-info-module__sections']").remove();

		// =========================
		// MASS CLEANING STARTS HERE
		// =========================

		// Unwrapping tt-rtf-sandbox to avoid excessive text information
		// Get a list of all <tt-rtf-sandbox> elements
		const ttRtfSandboxes = document.querySelectorAll('tt-rtf-sandbox');
		// Loop through each <tt-rtf-sandbox> element
		ttRtfSandboxes.forEach(ttRtfSandbox => {
			// Create a new section element to hold the content
			const sectionElement = document.createElement('section');
			// Move all child nodes of <tt-rtf-sandbox> to the new section element
			while (ttRtfSandbox.firstChild) {
				sectionElement.appendChild(ttRtfSandbox.firstChild);
			}
			// Get the parent element (the parent node) of <tt-rtf-sandbox>
			const parentElement = ttRtfSandbox.parentNode;
			// Replace <tt-rtf-sandbox> with the new section element
			parentElement.replaceChild(sectionElement, ttRtfSandbox);
		});

		// Make inner section to replace outer section
		// Get references to the outer section elements
		const outerSections = document.querySelectorAll('div > section');
		// Loop through each outer section
		outerSections.forEach(outerSection => {
			// Get references to the inner section elements inside the outer section
			const innerSections = outerSection.querySelectorAll('section');
			// Move the content of the inner section to the outer section
			innerSections.forEach(innerSection => {
				while (innerSection.firstChild) {
					outerSection.appendChild(innerSection.firstChild);
				}
			});
			// Remove the inner sections
			innerSections.forEach(innerSection => {
				innerSection.remove();
			});
		});

		//Remove sections footers
		document.querySelectorAll("[class^='article-section-module__footer']").forEach(el => el.remove());

		// Remove unnecessary tags
		function removeTagByName(tagName) {
			const elementsToRemove = Array.from(document.getElementsByTagName(tagName));
			elementsToRemove.forEach(element => element.remove());
		}
		removeTagByName('tt-icon-button');
		removeTagByName('style');
		removeTagByName('object');
		removeTagByName('script');
		removeTagByName('app-content');
		removeTagByName('grammarly-desktop-integration');

		// Remove all linked styles
		const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
		for (const linkElement of linkElements) {
			linkElement.remove();
		}

		// Remove attributes from HTML section
		document.documentElement.removeAttribute('class');
		document.documentElement.removeAttribute('style');
		document.documentElement.removeAttribute('data-js-focus-visible');

		// Remove some attributes (including IDs and CLASSes) for all tags
		function removeAttributeByName(attributeName) {
			const allElements = document.getElementsByTagName('*');
			for (const element of allElements) {
				element.removeAttribute(attributeName);
			}
		}
        removeAttributeByName('id');
		removeAttributeByName('class');
        removeAttributeByName('base');
		removeAttributeByName('data-cy');
		removeAttributeByName('data-test-landmark');
		removeAttributeByName('data-new-gr-c-s-check-loaded');
		removeAttributeByName('data-gr-ext-installed');

		// Remove excessive DIVs in created date section
		// Get the reference to the innermost div element
		const innermostDiv = document.querySelector('div div div');
		// Get the reference to its parent element (the middle div)
		const middleDiv = innermostDiv.parentNode;
		// Move the content of the innermost div to the parent of the middle div
		while (innermostDiv.firstChild) {
			middleDiv.parentNode.insertBefore(innermostDiv.firstChild, middleDiv);
		}
		// Remove the middle div
		middleDiv.remove();

		// Add printable styles to HEAD
		document.head.insertAdjacentHTML("beforeend", `<style>*{font-family:Verdana;line-height:1.5} h1,h2{line-height:1.2} h2{border-top:1px solid lightgray;margin-top:1.75em;padding-top:0.75em} h1{font-size:1.8em} h2{font-size:1.35em} figcaption{font-size:smaller;color:gray} li{margin-top:5px;margin-bottom:5px} @media print{p{break-inside:avoid h1,h2,h3,h4,h5,h6{-webkit-break-after:avoid;break-after:avoid}}}</style>`);
	}

})();
