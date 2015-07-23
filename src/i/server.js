import request from '../request/server';

export default function(server) {
	let req = request(server);

	return function(ctx, params) {
		let counter = ctx.state.counter;

		return {
			browser: false,
			error: ctx.throw.bind(ctx),
			param: (name) => params[name],
			request: req(ctx),
			startComputation: counter.increase.bind(counter),
			endComputation: counter.decrease.bind(counter),
			redraw: () => {},
			route: (path) => {
				if(!path) return ctx.path;
				ctx.redirect(path);
			}
		};
	};
}
