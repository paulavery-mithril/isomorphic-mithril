/* eslint-env browser */
import m from 'mithril';
import i from './i/client';
import prepareComponent from './prepare';

export default class Isomorphic {
	constructor() {
		if(!(this instanceof Isomorphic)) return new Isomorphic();
	}

	mount(node, defaultRoute, routes) {
		this.node = node;
		this.defaultRoute = defaultRoute;
		this.routes = routes;
	}

	listen(mithril) {
		let iso = i(mithril);

		/* Assign our i object to each route */
		let routes = Object.keys(this.routes).reduce((sum, path) => {
			sum[path] = prepareComponent(this.routes[path], iso);
			return sum;
		}, {});

		mithril.route.mode = 'pathname';
		mithril.route(this.node, this.defaultRoute, routes);
	}
}
