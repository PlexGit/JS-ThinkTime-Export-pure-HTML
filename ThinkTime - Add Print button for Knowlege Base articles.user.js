// ==UserScript==
// @name          ThinkTime - Add Print View button for Knowlege Base articles
// @namespace     http://tampermonkey.net/
// @version       1.02
// @description   Add Print View button for Knowlege Base articles on ThinkTime platform
// @author        Oleksandr Pylypchak
// @match         https://*.thinktime.com/ui/knowledge-bases/*/articles/*
// @match         https://*.thinktime.com/ui/knowledge-bases/articles/*
// @match         https://*.thinktime.com/ui/news/*/articles/*
// @match         https://*.thinktime.com/ui/news/articles/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=thinktime.com
// @grant         none
// @updateURL     https://gist.github.com/PlexGit/db248956219578ca1620c9493a92c8a0/raw/ThinkTime%2520-%2520Add%2520Print%2520button%2520for%2520Knowlege%2520Base%2520articles.user.js
// @downloadURL   https://gist.github.com/PlexGit/db248956219578ca1620c9493a92c8a0/raw/ThinkTime%2520-%2520Add%2520Print%2520button%2520for%2520Knowlege%2520Base%2520articles.user.js
// ==/UserScript==

(function() {
	"use strict";

	window.addEventListener("load", () => {
		addButton('<span style="font-size:28px;">&#128196;</span>', applyPrintView);
	});

	function addButton(text, onclick, cssObj) {
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
		button.title = "Print View & Save HTML";
		button.onclick = onclick;
		Object.keys(cssObj).forEach(function(key) {
			btnStyle[key] = cssObj[key];
		});
		return button;
	}

	async function applyPrintView() {
		const originUrl = window.location.href;
		const originalTitle = document.title;

		// --- DATE FORMATTING (DD.MM.YYYY HH:mm:ss) ---
		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = now.getFullYear();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');

		const formattedTimestamp = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
		const fileSafeTimestamp = `${day}.${month}.${year} - ${hours}-${minutes}-${seconds}`;

		// Remove elements by class name prefix
		[
			"Collapsible__contentInner",
			"Collapsible__contentOuter",
			"Collapsible",
			"article-section-module__footer",
			"news-item-view-info-module__avatar",
			"news-item-view-info-module__attachment",
			"article-attachments-module__sectionBlock",
			"news-item-view-info-module__dot",
			"news-item-view-info-module__sections",
			"kb-article-view-module__expand",
			"kb-item-view-info-module__sections"
		].forEach((prefix) => {
			const allElements = document.querySelectorAll('*');
			allElements.forEach((element) => {
				Array.from(element.classList).forEach((className) => {
					if (className.startsWith(prefix)) {
						element.remove();
					}
				});
			});
		});

		const htmlElement = document.documentElement;
		htmlElement.removeAttribute("class");
		htmlElement.removeAttribute("style");
		htmlElement.removeAttribute("lang");
		htmlElement.removeAttribute("data-js-focus-visible");

		const wysiwygElements = document.querySelectorAll('[style*="--wysiwyg"]');
		wysiwygElements.forEach(el => {
			el.style.removeProperty('--wysiwyg-font-family');
			el.style.removeProperty('--wysiwyg-font-size');
			if (el.getAttribute('style') === '') {
				el.removeAttribute('style');
			}
		});

		const baseTag = document.querySelector("base");
		if (baseTag) {
			baseTag.parentNode.removeChild(baseTag);
		}

		const articleBody = document.querySelector("[class^='kb-item-content-wrapper-module__body']");
		if (articleBody) { document.body.innerHTML = articleBody.innerHTML; }

		const newsArticleBody = document.querySelector("[class^='news-item-content-wrapper-module__body']");
		if (newsArticleBody) { document.body.innerHTML = newsArticleBody.innerHTML; }

		document.body.removeAttribute("style");
		document.documentElement.removeAttribute("style");
		document.body.removeAttribute("lang");
		document.documentElement.removeAttribute("lang");

		[
			"nav", "aside", "footer", "style", "button", "form", "object", "script", "noscript",
			"tt-icon-button", "app-content", "grammarly-popups", "grammarly-desktop-integration",
		].forEach((tagName) => {
			const elementsToRemove = document.getElementsByTagName(tagName);
			Array.from(elementsToRemove).forEach((element) => element.remove());
		});

		const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
		linkElements.forEach((linkElement) => linkElement.remove());

		// Making NEWS STRUCTURE article-like
		function getElementByClassPrefix(prefix) {
			const allElements = document.querySelectorAll('*');
			for (const element of allElements) {
				for (const className of element.classList) {
					if (className.startsWith(prefix)) { return element; }
				}
			}
			return null;
		}
		const prefix1 = "news-item-view-info-module__meta";
		const prefix2 = "news-article-view-footnote-module__footnote";
		const element1 = getElementByClassPrefix(prefix1);
		const element2 = getElementByClassPrefix(prefix2);
		if (element1 && element2) {
			const tempInnerHTML = element1.innerHTML;
			element1.innerHTML = element2.innerHTML;
			element2.innerHTML = tempInnerHTML;
		}

		const spanElements = document.querySelectorAll('[class^="news-item-view-info-module__ownerName--"]');
		spanElements.forEach(spanElement => {
			const parentDiv = spanElement.parentNode;
			if (parentDiv) {
				parentDiv.replaceChild(document.createTextNode(spanElement.textContent), spanElement);
			}
		});

		function convertSpanToDiv(classPrefix) {
			const spanElements = document.querySelectorAll(`[class^="${classPrefix}"]`);
			spanElements.forEach(spanElement => {
				const newDiv = document.createElement('div');
				newDiv.className = spanElement.className;
				newDiv.textContent = spanElement.textContent;
				spanElement.parentNode.replaceChild(newDiv, spanElement);
			});
		}
		convertSpanToDiv("news-item-view-info-module__date--");

		const editedDate = document.querySelector("[class^='kb-item-view-info-module__date']");
		if (editedDate) {
			editedDate.style.cssText = "font-style: italic; font-size: 10pt;";
			editedDate.parentNode.style.marginBottom = "1.75em";
		}
		const newsEditedDate = document.querySelector("[class^='news-article-view-footnote-module__footnote']");
		if (newsEditedDate) {
			newsEditedDate.style.cssText = "display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; flex-direction: column; padding-top: 30px; padding-bottom: 30px; font-style: italic; font-size: 10pt;";
		}
		const newsFootnote = document.querySelector("[class*=' news-article-view-module__details']");
		if (newsFootnote) {
			newsFootnote.style.cssText = "font-style: italic; font-size: 10pt;";
			newsFootnote.parentNode.style.marginBottom = "1.75em";
		}

		const footer = document.querySelector("[class^='kb-article-footnote-module__footnote']");
		if (footer) {
			footer.style.cssText = "display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; flex-direction: column; padding-top: 30px; padding-bottom: 30px; font-style: italic; font-size: 10pt;";
		}

		const ttRtfSandboxes = document.querySelectorAll("tt-rtf-sandbox");
		ttRtfSandboxes.forEach((ttRtfSandbox) => {
			const sectionElement = document.createElement("section");
			while (ttRtfSandbox.firstChild) { sectionElement.appendChild(ttRtfSandbox.firstChild); }
			ttRtfSandbox.replaceWith(sectionElement);
		});

		const outerSections = document.querySelectorAll("div > section");
		outerSections.forEach((outerSection) => {
			const innerSections = outerSection.querySelectorAll("section");
			innerSections.forEach((innerSection) => {
				while (innerSection.firstChild) { outerSection.appendChild(innerSection.firstChild); }
			});
			innerSections.forEach((innerSection) => { innerSection.remove(); });
		});

		const attributesToRemove = ["id", "class", "base", "data-cy", "data-test-landmark", "data-new-gr-c-s-check-loaded", "data-gr-ext-installed", "data-test-distinct"];
		const allElements = document.getElementsByTagName("*");
		for (const element of allElements) {
			attributesToRemove.forEach((attributeName) => element.removeAttribute(attributeName));
		}

		const allDivs = Array.from(document.querySelectorAll('div')).reverse();
		allDivs.forEach(parent => {
			if (parent.children.length === 1 && parent.children[0].tagName === 'DIV' && parent.cloneNode(false).textContent.trim() === "") {
				const innerDiv = parent.children[0];
				while (innerDiv.firstChild) { parent.appendChild(innerDiv.firstChild); }
				innerDiv.remove();
			}
		});

		function addDomainToLinks(domain) {
			const anchorTags = document.querySelectorAll('a');
			anchorTags.forEach(tag => {
				const href = tag.getAttribute('href');
				if (href && (href.startsWith('../') || href.startsWith('/'))) {
					tag.setAttribute('href', new URL(href, domain).href);
				}
			});
		}
		addDomainToLinks(window.location.origin);

		// --- IMAGE PROCESSING & SAVE LOGIC ---
		const images = document.querySelectorAll('img');
		const toBase64 = (img) => new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const tempImg = new Image();
			tempImg.crossOrigin = 'anonymous';
			tempImg.onload = () => {
				canvas.width = tempImg.naturalWidth;
				canvas.height = tempImg.naturalHeight;
				ctx.drawImage(tempImg, 0, 0);
				resolve(canvas.toDataURL('image/png'));
			};
			tempImg.onerror = () => resolve(null);
			tempImg.src = img.src;
		});

		for (let img of images) {
			if (img.src && !img.src.startsWith('data:')) {
				const b64 = await toBase64(img);
				if (b64) img.src = b64;
			}
		}

		const printableStyle = `
			* { font-family: "Verdana", "Arial", sans-serif; line-height: 1.5; }
			h1, h2, h3, h4, h5, h6 { text-wrap: balance; }
			h1, h2 { line-height: 1.2; }
			h2 { border-top: 1px solid lightgray; margin-top: 1.75em; padding-top: 0.75em; }
			h2::first-child { margin-top: 0; }
			h1 { font-size: 1.8em; }
			h2 { font-size: 1.35em; }
			figcaption { font-size: smaller; color: gray; }
			li { margin-top: 0.6rem; margin-bottom: 0.6rem; }
			img { max-width: 100%; }
			@media print {
				p { -webkit-break-inside: avoid; break-inside: avoid; }
				h1, h2, h3, h4, h5, h6 { -webkit-break-after: avoid; -webkit-break-inside: avoid; break-after: avoid; break-inside: avoid; }
				a[href^='http']:after { content: ' > ' attr(href); font-family: Monospace; }
			}
		`;

		const finalHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="original-page-name" content="${originalTitle.replace(/"/g, '&quot;')}">
    <meta name="original-url" content="${originUrl}">
    <meta name="save-timestamp" content="${formattedTimestamp}">
    <title>${originalTitle}</title>
    <style>${printableStyle}</style>
</head>
<body>
    ${document.body.innerHTML}
</body>
</html>`;

		const safeTitle = originalTitle.replace(/[\\/:"*?<>|]/g, '_').trim();
		const fileName = `${safeTitle} - ${fileSafeTimestamp}.html`;

		const blob = new Blob([finalHtml], { type: 'text/html' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName;
		a.click();
		URL.revokeObjectURL(a.href);

		document.head.insertAdjacentHTML("beforeend", `<style>${printableStyle}</style>`);
		console.log(`Saved as: ${fileName}`);
	}
})();
