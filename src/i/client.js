/* eslint-env browser */
import request from '../request/client';

export default function(m) {
	return {
		browser: true,
		error: () => window.location.replace(m.route()),
		param: m.route.param,
		request: request(m),
		startComputation: m.startComputation,
		endComputation: m.endComputation,
		redraw: m.redraw,
		route: m.route
	};
}
