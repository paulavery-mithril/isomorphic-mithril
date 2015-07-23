import Koa from 'koa';
import http from 'http';
import Views from './server/Views';

export default class Isomorphic extends Koa {
	constructor() {
		super();
		this.views = new Views();
	}

	mount(frame, defaultRoute, routes) {
		this.views.setDefault(defaultRoute);
		this.views.setRoutes(routes);
		this.views.setFrame(frame);

		this.use(this.views.middleware());
	}

	listen(...args) {
		let server = super.listen(...args);
		this.views.setServer(server);

		return server;
	}
}
