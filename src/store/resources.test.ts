import axios from 'axios';
import { store } from './store';
import { fetchResources, setTimelineIndex } from './resources';

describe('resourcesSlice', () => {
	// it('should fetch and parse changes', async () => {
	// 	jest.spyOn(axios, 'get').mockResolvedValueOnce({
	// 		data: `{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
	// 			   {'timestamp': 16, 'name': 'John', 'resource': 'silver', 'value': -5}`,
	// 	});

	// 	await store.dispatch(fetchResources());
	// 	const state = store.getState().resources;

	// 	expect(state.changes.length).toBe(2);
	// 	expect(state.changes[0]).toStrictEqual({
	// 		timestamp: 15,
	// 		name: 'Bob',
	// 		resource: 'wood',
	// 		value: 5,
	// 	});
	// });

	it('should calculate resource at a time point', async () => {
		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data: `{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
			       {'timestamp': 16, 'name': 'Alex', 'resource': 'silver', 'value': 999}
			       {'timestamp': 17, 'name': 'Alex', 'resource': 'silver', 'value': 1}
				   {'timestamp': 18, 'name': 'Bob', 'resource': 'wood', 'value': -2}
				   {'timestamp': 19, 'name': 'Alex', 'resource': 'wood', 'value': 50}`,
		});

		await store.dispatch(fetchResources());
		await store.dispatch(setTimelineIndex(1));
		let state = store.getState().resources;

		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBe(999);
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.index).toBe(1);
		expect(state.aggregatedState.timestamp).toBe(16);

		await store.dispatch(setTimelineIndex(4));
		state = store.getState().resources;

		expect(state.aggregatedState.index).toBe(4);
		expect(state.aggregatedState.resources.wood.Alex).toBe(50);
		expect(state.aggregatedState.resources.wood.Bob).toBe(3);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);

		await store.dispatch(setTimelineIndex(0));
		state = store.getState().resources;
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBeUndefined();
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.index).toBe(0);
		expect(state.aggregatedState.timestamp).toBe(15);

		await store.dispatch(setTimelineIndex(-1));
		state = store.getState().resources;
		expect(state.aggregatedState.resources.wood).toBeUndefined();
		expect(state.aggregatedState.resources.silver).toBeUndefined();
		expect(state.aggregatedState.resources.wood).toBeUndefined();
		expect(state.aggregatedState.index).toBe(-1);

		await store.dispatch(setTimelineIndex(2));
		state = store.getState().resources;
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.timestamp).toBe(17);

		await store.dispatch(setTimelineIndex(0));
		state = store.getState().resources;
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBeUndefined();
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.timestamp).toBe(15);

		await store.dispatch(setTimelineIndex(4));
		state = store.getState().resources;
		expect(state.aggregatedState.timestamp).toBe(19);
		expect(state.aggregatedState.resources.wood.Alex).toBe(50);
		expect(state.aggregatedState.resources.wood.Bob).toBe(3);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);
	});

	// it('should select time and respect limits', async () => {
	// 	store.dispatch(setSelectedTime({ timestamp: 50 }));

	// 	jest.spyOn(axios, 'get').mockResolvedValueOnce({
	// 		data: `{'timestamp': 0, 'name': 'Bob', 'resource': 'wood', 'value': 5}
	// 			   {'timestamp': 15, 'name': 'John', 'resource': 'silver', 'value': -5}`,
	// 	});

	// 	await store.dispatch(fetchResources());

	// 	expect(store.getState().resources.selectedTime).toBe(15);

	// 	store.dispatch(setSelectedTime({ timestamp: 5 }));
	// 	expect(store.getState().resources.selectedTime).toBe(5);

	// 	store.dispatch(setSelectedTime({ timestamp: 20 }));
	// 	expect(store.getState().resources.selectedTime).toBe(15);

	// 	store.dispatch(setSelectedTime({ timestamp: -5 }));
	// 	expect(store.getState().resources.selectedTime).toBe(0);
	// });
});
