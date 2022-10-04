import {
	AggregatedState,
	ResourceChange,
	ResourcesLoadingStatus,
	ResourcesState,
	RootState,
} from './types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import config from '../config';
import { eachLimit } from 'async';

const initialState: ResourcesState = {
	status: ResourcesLoadingStatus.Idle,
	isLoadingAggregatedState: false,
	aggregatedState: {
		index: -1,
		timestamp: -1,
		resources: {},
	},
	changes: [],
};

async function wait(ms: number = 0) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const resourcesSlice = createSlice({
	name: 'resources',
	initialState,
	reducers: {
		setLoadingAggregatedState(state) {
			state.isLoadingAggregatedState = true;
		},
	},

	extraReducers(builder) {
		builder
			.addCase(fetchResources.pending, (state) => {
				state.status = ResourcesLoadingStatus.Loading;
			})

			.addCase(fetchResources.fulfilled, (state, action) => {
				state.status = ResourcesLoadingStatus.Loaded;

				state.changes = action.payload.changes;
				state.aggregatedState = { ...initialState.aggregatedState };
			})

			.addCase(fetchResources.rejected, (state) => {
				state.status = ResourcesLoadingStatus.Error;
			})

			.addCase(setTimelineIndex.fulfilled, (state, action) => {
				state.isLoadingAggregatedState = false;
				if (!action.payload) {
					return;
				}
				state.aggregatedState = action.payload;
			});
	},
});

export const fetchResources = createAsyncThunk(
	'resources/fetchResources',
	async () => {
		const response = await axios.get<string>(config.endpoints.getResources);
		const changes: ResourceChange[] = [];

		// Limit items processed by tick to prevent app from freezing
		await eachLimit(
			response.data.split('\n'),
			config.maxChangesParsedPerTick,
			(line: string, callback) => {
				try {
					const item = JSON.parse(line.replace(/'/g, '"'));

					changes.push(item);
				} catch (error) {}

				setTimeout(callback, 0);
			}
		);

		return { changes };
	}
);

export const setTimelineIndex = createAsyncThunk(
	'resources/requestResourcesAtTimestamp',
	async (
		index: number,
		{ getState, dispatch }
	): Promise<AggregatedState | null> => {
		const state = (getState() as RootState).resources;
		if (
			state.isLoadingAggregatedState ||
			state.changes.length === 0 ||
			index === state.aggregatedState.index
		) {
			return null;
		}

		dispatch(resourcesSlice.actions.setLoadingAggregatedState());

		if (index < 0) {
			return initialState.aggregatedState;
		}
		if (index > state.changes.length - 1) {
			index = state.changes.length - 1;
		}

		const indexStep = index > state.aggregatedState.index ? 1 : -1;

		let currentIndex = state.aggregatedState.index;
		let result = cloneDeep(state.aggregatedState);
		let skipIndexStep = indexStep < 0;
		let processedCount = 0;

		// Calculate aggregated resource state from current position in timeline
		while (currentIndex !== index) {
			if (skipIndexStep) {
				skipIndexStep = false;
			} else {
				currentIndex += indexStep;
			}

			const change = state.changes[currentIndex];

			if (indexStep < 0 && currentIndex === index) {
				result.index = currentIndex;
				result.timestamp = change.timestamp;
				break;
			}

			if (!result.resources[change.resource]) {
				result.resources[change.resource] = {};
			}

			result.resources[change.resource][change.name] =
				(result.resources[change.resource][change.name] ?? 0) +
				change.value * indexStep;

			if (result.resources[change.resource][change.name] <= 0) {
				delete result.resources[change.resource][change.name];
			}

			result.index = currentIndex;
			result.timestamp = change.timestamp;

			processedCount++;
			if (processedCount > config.maxChangesProcessedPerTick) {
				processedCount = 0;
				// Wait for one tick to prevent app from freezing
				await wait();
			}
		}

		return result;
	}
);

export default resourcesSlice.reducer;
