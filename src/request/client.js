import Request from './Request';

export default function(m) {
	return function request(method, url, background) {
		return new Request(m.startComputation, m.endComputation, method, url, background);
	};
}
