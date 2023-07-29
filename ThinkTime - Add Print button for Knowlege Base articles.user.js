// ==UserScript==
// @name         ThinkTime - Add Print button for Knowlege Base articles
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add Print button for Knowlege Base articles
// @author       You
// @match        https://myjysk.thinktime.com/ui/knowledge-bases/*/topics/*/articles/*
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
        cssObj = cssObj || {position: 'fixed', bottom: '7%', left:'24px', 'z-index': 3}
        let button = document.createElement('button'), btnStyle = button.style;
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
        const articleBody = document.querySelector('.kb-item-content-wrapper-module__body--n6jg5');
        document.body.innerHTML = articleBody.innerHTML;

        // Remove author/date footer inline style
        // document.querySelector("[class^='kb-article-footnote-module__footnote']").remove();
        document.querySelector("[class^='kb-article-footnote-module__footnote']").style = `display: flex; align-items: flex-end; flex-wrap: wrap; gap: 5px; padding-top: 30px; padding-bottom: 30px; flex-direction: column; font-style: italic;`;

        // Remove article wide view button
        document.querySelector("[class^='kb-article-view-module__expand']").remove();

        // Remove views/attachments counter
        document.querySelector("[class^='kb-item-view-info-module__sections']").remove();

        // Remove unnecessary tags
        function removeTagByName(tagName) {
            const elementsToRemove = Array.from(document.getElementsByTagName(tagName));
            elementsToRemove.forEach(element => element.remove());
        }
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

        // Remove all classes for all tags
        function removeAttributeByName(attributeName) {
            const allElements = document.getElementsByTagName('*');
            for (const element of allElements) {
                element.removeAttribute(attributeName);
            }
        }
        removeAttributeByName('base');
        removeAttributeByName('class');
        removeAttributeByName('id');
        removeAttributeByName('data-cy');
        removeAttributeByName('data-test-landmark');
        removeAttributeByName('data-new-gr-c-s-check-loaded');
        removeAttributeByName('data-gr-ext-installed');

        // Add printable styles to HEAD
        document.head.insertAdjacentHTML("beforeend", `<style>*{font-family:Verdana;line-height:1.5}@media print{p{break-inside:avoid}h2,h3,h4,h5,h6{-webkit-break-after:avoid;break-after:avoid}}figcaption{font-size:smaller;color:gray}li{margin-top:5px;margin-bottom:5px}</style>`);
    }

})();
