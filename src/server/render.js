/*
The MIT License (MIT)

Copyright (c) 2014 Stephan Hoyer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Taken in large part from https://github.com/StephanHoyer/mithril-node-render
Modified to work asynchronously and wait for a counter to finish!
*/

/* eslint-disable new-cap */
const VOIDTAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function camelToDash(str) {
	return str
		.replace(/\W+/g, '-')
		.replace(/([a-z\d])([A-Z])/g, '$1-$2');
}

function escapeHtml(input, replaceDoubleQuote) {
	return String(input)
		.replace(/\&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/\>/g, '&gt;')
		.replace(/\"/g, replaceDoubleQuote ? '&quot;' : '"');
}

function createAttrString(attrs) {
	if(!attrs) return '';
	if(Object.keys(attrs).length === 0) return '';

	return Object.keys(attrs).map(function(name) {
		if (typeof attrs[name] === 'function') {
			return '';
		} else if (typeof attrs[name] === 'boolean') {
			return attrs[name] ? ' ' + name : '';
		} else if (name === 'style') {
			let styles = attrs.style;

			if (typeof styles === 'object') {
				styles = Object.keys(styles).map(function(property) {
					return [camelToDash(property).toLowerCase(), styles[property]].join(':');
				}).join(';');
			}

			return ' style="' + escapeHtml(styles, true) + '"';
		} else {
			return ' ' + escapeHtml(name === 'className' ? 'class' : name) + '="' + escapeHtml(attrs[name], true) + '"';
		}
	}).join('');
}

function *createChildrenContent(counter, view) {
	if(Array.isArray(view.children) && view.children.length === 0) return '';

	return yield* render(counter, view.children); //eslint-disable-line no-use-before-define
}

function *renderComponent(counter, view) {
	counter.reset();
	let scope = view.controller ? new view.controller() : {};
	yield counter.promise();

	let result = yield* render(counter, view.view(scope)); //eslint-disable-line no-use-before-define
	if(scope.onunload) scope.onunload();

	return result;
}

export default function *render(counter, view) {
	let type = typeof view;

	if(type === 'undefined' || view === null) {
		return '';
	} else if (type === 'string') {
		return escapeHtml(view);
	} else if(type === 'number' || type === 'boolean') {
		return view;
	} else if (Array.isArray(view)) {
		let res = '';
		for(let x = 0; x < view.length; x++) {
			res += yield render(counter, view[x]);
		}
		return res;
	} else if (view.view) {
		return yield* renderComponent(counter, view);
	} else if (view.$trusted) {
		return view.toString();
	} else {
		let children = yield* createChildrenContent(counter, view);

		if (!children && VOIDTAGS.indexOf(view.tag.toLowerCase()) !== -1) {
			return '<' + view.tag + createAttrString(view.attrs) + '>';
		} else {
			return [
				'<', view.tag, createAttrString(view.attrs), '>',
				children,
				'</', view.tag, '>'
			].join('');
		}
	}
}
