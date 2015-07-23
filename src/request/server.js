import https from 'https';
import Request from './Request';

function address(server) {
	let port = server.address().port;
	let protocol = server instanceof https.Server ? 'https' : 'http';

	return protocol + '://127.0.0.1:' + port;
}

export default function(server) {
	return function(ctx) {
		let base = address(server);
		let headers = ctx.headers;
		let counter = ctx.state.counter;

		return function request(method, url, background) {
			if(!background) {
				return new Request(counter.increase.bind(counter), counter.decrease.bind(counter), method, base + url).set(headers);
			} else {
				return new Promise(()=>{}, ()=>{});
			}
		};
	};
}
