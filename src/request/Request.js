import m from 'mithril';
import {Request as Superagent} from 'superagent';

export default class Request extends Superagent {
	constructor(increase, decrease, method, url, background) {
		super(method, url);

		this.background = background;
		this.asyncTriggers = {increase, decrease};
	}

	end(onSuccess, onError) {
		let deferred = m.deferred();
		let promise = deferred.promise;

		if(!this.background) this.asyncTriggers.increase();
		super.end((err, res) => {
			if(err) {
				deferred.reject(err);
			} else {
				deferred.resolve(res.body || res.text);
			}

			if(!this.background) this.asyncTriggers.decrease();
		});

		return arguments.length === 0 ? promise : promise.then(onSuccess, onError);
	}
}
