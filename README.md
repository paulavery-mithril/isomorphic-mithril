# Isomorphic Mithril via Koa.js
This module allows you, to render mithril templates on the client as well as on the server. It supports data retrieval in the veign of `m.request()` and basically presents your users with a fully rendered page on first page load.
It makes use of a modified version of Stephan Hoyers [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render) code.

## Example
The example below makes use of ES6 syntax.
It also does not show a way to serve the client side script. Run it through browserify, and serve it however you would like.

**views.js:**
The definition of your views. Routes should be defined compatible with `m.router`. They will be made available under these rules on the server and will be mounted via `m.mount` in the browser.

```js
import m from 'mithril';

export default {
	'/post/:post...': {
		controller({i}) {
			this.post = m.prop({});
			i.request('GET', `/post/${i.param('post')}`).end(this.post);
		},
		view(ctrl) {
			return m('div', [ctrl.post().content]);
		}
	}
};
```

**frame.js:**
A server only frame to wrap your views in. As mithril can not mount into the entire document, but rather only into `document.body`, we have to specify the remainder of a valid html document. A `<!doctype html>` tag will be prepended to the rendered pages automatically.

```js
import m from 'mithril';

export default {
	view(ctrl, body) {
		return m('html', [
			m('body', [
				body
			])
		]);
	}
}
```

**Server:**
The module provides an extended koa constructor. It allows you to call `.mount` to attach your views.

```js
import isomorphic from 'isomorphic-mithril';
import route from 'koa-route';

import frame from './frame';
import views from './views';

let app = isomorphic();
app.mount(frame, '/', views);
app.use(route.get('/post/:postId', function* () {
	this.body = {content: 'Some content'}
}));

app.listen(process.env.PORT || 3000);
```

**Browser:**
Very similar to the server side, just specify a html element instead of a frame and your done.

```js
import Isomorphic from 'isomorphic-mithril';
import views from './views';
import m from 'mithril';

let app = new Isomorphic();
app.mount(document.body, '/', views);

app.listen(m);
```

## Details
This module abstracts away sever mithril.js features and makes them usable in the browser as well as on a server. First you instantiate a new application instance:

```js
let app = new Isomorphic();
```

### Server
If you are executing this on the server, `app` is now a koa application. You can call all the usual things on it like `.use()`, `.listen()` etc.

In addition it provides a `.mount()` method. This method is built to resemble `m.mount()`. It takes the same three arguments as `m.mount()`, but the target (usually `document.body`) should now be a mithril component. This component will be called and rendered with the current view as its only argument.

Your server will automatically respond to any defined routes with the rendered view.

### client
On the client, your app will be an object with syntax closely resembling that of a koa instance. You also call `app.mount()`, this time exactly like you would call `m.mount()`. And to actually attach the routes, you call `m.listen(m)`. You have to pass your mithril instance, to prevent mutliple versions of mithril being used at once (yours and the one required by the module).

### The `i` object
One of the nicest things about mithril is the way it handles asynchronous events. Because calls to `m.request` or `m.startComputation`/`m.endComputation` do not work in server side rendering, your top-level views will be passed an object with a single property named `i`. Assigned to this property is an object with a multitude of methods, which can be used on the client as well on the server.

#### i.browser
Simple boolean specifying in which environment the code is running

#### i.error()
Throws an error in the browser and on the server calls `.throw()` on the current koa context. Useful to throw errors on the server, if e.g. the requested route does not exist.

#### i.param()
Works like `m.param()` on the client as well as on the server.

#### i.route()
Use like `m.route()`. Mode is always `pathname`. When called with one argument (used to redirect), `this.redirect()` is called on the koa route.

#### i.startComputation() / i.endComputation()
Work identical to `m.startComputation()` / `m.endComputation()`.
On the server components are rendered top down, waiting for the top level controller to end all computations before progressing. This should allow you to handle asynchronous tasks nicely.

#### i.redraw()
On the client simply calls `m.redraw`. On the server, this is a noop, as we should not have a need to manually redraw. Usually you would either call `m.redraw` to force a redraw while some asynchronous task is still running or after some event happened. Both of these use-cases are unimportant on the server.

#### i.request()
Similar to `m.request`, `i.request` queries a network source for data, returns a mithril promise and calls the computation handlers accordingly. The syntax is a different one though, as for proper isomorphism, we use [superagent](http://visionmedia.github.io/superagent/) as the underlying library.

The request method takes the method as its first and the url as its second argument:

```js
let something = i.query('GET', '/some/path/on/your/server').end();
```

You can chain all the methods superagent supports inbetween the `query` and `end` calls. As an additional utility, you may use the `.end()` method just like you would call `.then()`.

So this works:

```js
let somethingElse = m.prop('default');
i.query('GET', '/some/other/stuff').end(somethingElse);
```

On the server, any headers from the original request are copied (to preserve cookies etc.) before querying the koa server.
