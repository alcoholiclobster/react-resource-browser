import { fetchResources, setTimelinePosition } from './resources';
import axios from 'axios';
import { store } from '../store';

describe('resourcesSlice', () => {
	async function fetchMockData(data: string) {
		jest.spyOn(axios, 'get').mockResolvedValueOnce({
			data,
		});

		await store.dispatch(fetchResources());
	}

	function getState() {
		return store.getState().resources;
	}

	it('should fetch and parse changes', async () => {
		await fetchMockData(
			`{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
			 {'timestamp': 16, 'name': 'John', 'resource': 'silver', 'value': -5}`
		);

		expect(getState().changes.length).toBe(2);
		expect(getState().changes[0]).toStrictEqual({
			timestamp: 15,
			name: 'Bob',
			resource: 'wood',
			value: 5,
		});
	});

	it('should navigate timeline and calculate aggregated state', async () => {
		await fetchMockData(
			`{'timestamp': 15, 'name': 'Bob', 'resource': 'wood', 'value': 5}
			 {'timestamp': 16, 'name': 'Alex', 'resource': 'silver', 'value': 999}
			 {'timestamp': 17, 'name': 'Alex', 'resource': 'silver', 'value': 1}
			 {'timestamp': 18, 'name': 'Bob', 'resource': 'wood', 'value': -2}
			 {'timestamp': 19, 'name': 'Alex', 'resource': 'wood', 'value': 50}`
		);

		await store.dispatch(setTimelinePosition(1));

		let state = getState();
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBe(999);
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.index).toBe(1);
		expect(state.aggregatedState.timestamp).toBe(16);

		await store.dispatch(setTimelinePosition(4));
		state = getState();
		expect(state.aggregatedState.index).toBe(4);
		expect(state.aggregatedState.resources.wood.Alex).toBe(50);
		expect(state.aggregatedState.resources.wood.Bob).toBe(3);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);

		await store.dispatch(setTimelinePosition(4));
		state = getState();
		expect(state.aggregatedState.index).toBe(4);
		expect(state.aggregatedState.resources.wood.Alex).toBe(50);
		expect(state.aggregatedState.resources.wood.Bob).toBe(3);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);

		await store.dispatch(setTimelinePosition(0));
		state = getState();
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBeUndefined();
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.index).toBe(0);
		expect(state.aggregatedState.timestamp).toBe(15);

		await store.dispatch(setTimelinePosition(-1));
		state = getState();
		expect(state.aggregatedState.resources.wood).toBeUndefined();
		expect(state.aggregatedState.resources.silver).toBeUndefined();
		expect(state.aggregatedState.resources.wood).toBeUndefined();
		expect(state.aggregatedState.index).toBe(-1);

		await store.dispatch(setTimelinePosition(2));
		state = getState();
		expect(state.aggregatedState.resources.wood.Bob).toBe(5);
		expect(state.aggregatedState.resources.silver.Alex).toBe(1000);
		expect(state.aggregatedState.resources.wood.Alex).toBeUndefined();
		expect(state.aggregatedState.timestamp).toBe(17);
	});

	it('should check timeline index limits', async () => {
		await fetchMockData(
			`{'timestamp': 0, 'name': 'Bob', 'resource': 'wood', 'value': 5}
		     {'timestamp': 15, 'name': 'John', 'resource': 'silver', 'value': -5}`
		);

		await store.dispatch(setTimelinePosition(100));
		expect(getState().aggregatedState.index).toBe(1);

		await store.dispatch(setTimelinePosition(-100));
		expect(getState().aggregatedState.index).toBe(-1);
	});

	it('should handle empty data', async () => {
		await fetchMockData('');
		await store.dispatch(setTimelinePosition(100));

		expect(getState().aggregatedState.index).toBe(-1);
		expect(getState().changes.length).toBe(0);
	});
});
