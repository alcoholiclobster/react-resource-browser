import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	ResourceChangeItem,
	ResourcesLoadingStatus,
	ResourcesState,
	ResourceTimePoint,
	RootState,
} from './types';
import axios from 'axios';
import config from '../config';
import { eachLimit, everyLimit } from 'async';

const initialState: ResourcesState = {
	status: ResourcesLoadingStatus.Idle,
	isLoadingSelected: false,

	selectedTime: 0,
	selectedResources: {
		index: -1,
		timestamp: 0,
		resources: {},
	},

	timeFrom: 0,
	timeTo: 0,

	resourceChanges: [],
};

const resourcesSlice = createSlice({
	name: 'resources',
	initialState,
	reducers: {
		setSelectedTime(state, { payload }: PayloadAction<{ time: number }>) {
			state.selectedTime = payload.time;

			state.selectedTime = Math.max(
				state.timeFrom,
				Math.min(state.timeTo, state.selectedTime)
			);
		},

		setLoadingSelected(state) {
			state.isLoadingSelected = true;
		},

		completeLoadingSelected(
			state,
			{ payload }: PayloadAction<ResourceTimePoint>
		) {
			state.isLoadingSelected = false;
			state.selectedResources = payload;
		},
	},

	extraReducers(builder) {
		builder
			.addCase(fetchResources.pending, (state) => {
				state.status = ResourcesLoadingStatus.Loading;
			})

			.addCase(fetchResources.fulfilled, (state, action) => {
				state.status = ResourcesLoadingStatus.Loaded;
				state.resourceChanges = action.payload.changes;

				if (state.resourceChanges.length > 0) {
					state.timeFrom = state.resourceChanges[0].timestamp;
					state.timeTo =
						state.resourceChanges[
							state.resourceChanges.length - 1
						].timestamp;

					state.selectedResources = {
						index: -1,
						timestamp: -1,
						resources: {},
					};
				} else {
					state.timeFrom = 0;
					state.timeTo = 0;
				}

				state.selectedTime = Math.max(
					state.timeFrom,
					Math.min(state.timeTo, state.selectedTime)
				);
			})

			.addCase(fetchResources.rejected, (state) => {
				state.status = ResourcesLoadingStatus.Error;
			});

		// .addCase(requestResourcesAtTimestamp.fulfilled, (state, action) => {
		// 	console.log('no payload');
		// 	if (!action.payload) {
		// 		return;
		// 	}

		// 	// state.selectedResources = action.payload.selectedResources;
		// 	// state.selectedTime = action.payload.selectedResources.timestamp;

		// 	console.log(state.selectedResources);
		// });
	},
});

export const fetchResources = createAsyncThunk(
	'resources/fetchResources',
	async () => {
		const response = await axios.get<string>(config.endpoints.getResources);

		const changes: ResourceChangeItem[] = [];

		await eachLimit(
			response.data.split('\n'),
			config.maxChangesProcessedByTick,
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

export const requestResourcesAtTimestamp = createAsyncThunk(
	'resources/requestResourcesAtTimestamp',
	async ({ timestamp }: { timestamp: number }, { getState, dispatch }) => {
		const state = getState() as RootState;
		if (state.resources.isLoadingSelected) {
			return null;
		}

		dispatch(resourcesSlice.actions.setLoadingSelected());

		const result: ResourceTimePoint = {
			timestamp,
			index: 0,
			resources: {},
		};

		let index = 0;
		await everyLimit(
			state.resources.resourceChanges,
			config.maxChangesProcessedByTick,
			(item: ResourceChangeItem, callback) => {
				if (item.timestamp > timestamp) {
					return callback(null, false);
				}

				if (!result.resources[item.resource]) {
					result.resources[item.resource] = {};
				}

				result.resources[item.resource][item.name] =
					(result.resources[item.resource][item.name] ?? 0) +
					item.value;

				result.index = index;
				result.timestamp = item.timestamp;

				index++;

				setTimeout(() => callback(null, true), 0);
			}
		);

		dispatch(resourcesSlice.actions.completeLoadingSelected(result));
	}
);

export const { setSelectedTime } = resourcesSlice.actions;

export default resourcesSlice.reducer;
