import axios from 'axios';
import { store } from './store';
import { setSelectedTime, fetchResources } from './resources';

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

			totalAmount: 5,
		});
	});

	it('should count total amount', async () => {
		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data: `{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
			       {'timestamp': 16, 'name': 'Alex', 'resource': 'silver', 'value': 999}
			       {'timestamp': 17, 'name': 'Alex', 'resource': 'silver', 'value': 1}
				   {'timestamp': 18, 'name': 'Bob', 'resource': 'wood', 'value': -2}
				   {'timestamp': 19, 'name': 'Alex', 'resource': 'wood', 'value': 50}`,
		});

		await store.dispatch(fetchResources());
		const state = store.getState().resources;

		expect(state.resourceChanges[0].totalAmount).toBe(5);
		expect(state.resourceChanges[1].totalAmount).toBe(999);
		expect(state.resourceChanges[2].totalAmount).toBe(1000);
		expect(state.resourceChanges[3].totalAmount).toBe(3);
		expect(state.resourceChanges[4].totalAmount).toBe(50);
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
