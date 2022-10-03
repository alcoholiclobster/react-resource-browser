import axios from 'axios';
import { store } from './store';
import {
	setSelectedTime,
	fetchResources,
	requestResourcesAtTimestamp,
} from './resources';

describe('resourcesSlice', () => {
	it('should fetch and parse changes', async () => {
		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data: `{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
				   {'timestamp': 16, 'name': 'John', 'resource': 'silver', 'value': -5}`,
		});

		await store.dispatch(fetchResources());
		const state = store.getState().resources;

		expect(state.resourceChanges.length).toBe(2);
		expect(state.resourceChanges[0]).toStrictEqual({
			timestamp: 15,
			name: 'Bob',
			resource: 'wood',
			value: 5,
		});
	});

	it('should calculate resource at a time point', async () => {
		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data: `{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
			       {'timestamp': 16, 'name': 'Alex', 'resource': 'silver', 'value': 999}
			       {'timestamp': 17, 'name': 'Alex', 'resource': 'silver', 'value': 1}
				   {'timestamp': 18, 'name': 'Bob', 'resource': 'wood', 'value': -2}
				   {'timestamp': 19, 'name': 'Alex', 'resource': 'wood', 'value': 50}`,
		});

		await store.dispatch(fetchResources());
		await store.dispatch(requestResourcesAtTimestamp({ timestamp: 19 }));
		let state = store.getState().resources;

		expect(state.selectedResources.timestamp).toBe(19);
		expect(state.selectedResources.resources.wood.Alex).toBe(50);
		expect(state.selectedResources.resources.wood.Bob).toBe(3);
		expect(state.selectedResources.resources.silver.Alex).toBe(1000);

		await store.dispatch(requestResourcesAtTimestamp({ timestamp: 16 }));
		state = store.getState().resources;
		expect(state.selectedResources.resources.wood.Bob).toBe(5);
		expect(state.selectedResources.resources.silver.Alex).toBe(999);
		expect(state.selectedResources.resources.wood.Alex).toBeUndefined();
		expect(state.selectedResources.timestamp).toBe(16);
	});

	it('should select time and respect limits', async () => {
		store.dispatch(setSelectedTime({ time: 50 }));

		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data: `{'timestamp': 0, 'name': 'Bob', 'resource': 'wood', 'value': 5}
				   {'timestamp': 15, 'name': 'John', 'resource': 'silver', 'value': -5}`,
		});

		await store.dispatch(fetchResources());

		expect(store.getState().resources.selectedTime).toBe(15);

		store.dispatch(setSelectedTime({ time: 5 }));
		expect(store.getState().resources.selectedTime).toBe(5);

		store.dispatch(setSelectedTime({ time: 20 }));
		expect(store.getState().resources.selectedTime).toBe(15);

		store.dispatch(setSelectedTime({ time: -5 }));
		expect(store.getState().resources.selectedTime).toBe(0);
	});
});
