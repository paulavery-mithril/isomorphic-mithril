import m from 'mithril';
import i from '../i/server';
import render from './render';
import prepareComponent from '../prepare';
import Counter from './Counter';

function extractParams(route, path) {
	let params = [];

	path.replace(new RegExp(route.regex), function() {
		let keys = route.path.match(/:[^\/]+/g) || [];
		let values = [].slice.call(arguments, 1, -2);

		keys.forEach((key, j) => {
			let rawKey = key.replace(/:|\./g, '');
			params[rawKey] = decodeURIComponent(values[j]);
		});
	});

	return params;
}

export default class Views {
	constructor() {
		this.setDefault('/');
		this.setRoutes({});
	}

	middleware() {
		let views = this;

		return function *viewMiddleware(next) {
			for(let x = 0; x < views.routes.length; x++) {
				let route = views.routes[x];
				let matcher = new RegExp(route.regex);

				if(matcher.test(this.path)) {
					let counter = this.state.counter = new Counter();
					let util = views.i(this, extractParams(route, this.path));
					let component = prepareComponent(route.component, util);

					let html = '<!DOCTYPE html>' + (yield* render(counter, m.component(views.frame, component)));
					if(this.status === 404) this.body = html;
					return;
				}
			}

			yield* next;
		};
	}

	setDefault(route) {
		this.defaultRoute = route;
	}

	setRoutes(routes) {
		this.routes = Object.keys(routes).map(path => {
			return {
				path: path,
				regex: '^' + path.replace(/:[^\/]+?\.{3}/g, '(.*?)').replace(/:[^\/]+/g, '([^\\/]+)') + '\/?$',
				component: routes[path]
			};
		});
	}

	setFrame(frame) {
		this.frame = frame;
	}

	setServer(server) {
		this.i = i(server);
	}
}
