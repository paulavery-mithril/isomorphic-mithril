import {EventEmitter} from 'events';

export default class Counter extends EventEmitter {
	increase() {
		this.count++;
		this.done = false;
	}

	decrease() {
		this.count--;

		if(this.count === 0) {
			this.done = true;
			this.emit('done');
		}
	}

	reset() {
		this.count = 0;
		this.done = true;
	}

	promise() {
		return new Promise((resolve) => {
			if(!this.done) {
				this.once('done', resolve);
			} else {
				resolve();
			}
		});
	}
}
