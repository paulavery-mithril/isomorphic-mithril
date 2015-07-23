export default function prepareComponent(component, i) {
	let newView, newController;
	let {controller, view} = component;

	if(view) newView = function() { return view.call(this, {i}, ...arguments); };
	if(controller) newController = function() { return controller.call(this, {i}, ...arguments); };

	return {view: newView, controller: newController};
}
