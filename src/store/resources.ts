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

const calculateResourcesState = (
	fromState: ResourceTimePoint,
	fromIndex: number,
	toTimestamp: number
) => {};

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

					const item = state.resourceChanges[0];
					const totalResources = new Map<
						string,
						Map<string, number>
					>();

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
			})

			.addCase(requestResourcesAtTimestamp.fulfilled, (state, action) => {
				state.selectedResources = action.payload.selectedResources;
				state.selectedTime = action.payload.selectedResources.timestamp;
			});
	},
});

export const fetchResources = createAsyncThunk(
	'resources/fetchResources',
	async () => {
		const response = await axios.get<string>(config.endpoints.getResources);

		const changes: ResourceChangeItem[] = [];
		// const resourceTotalAmounts = new Map<string, Map<string, number>>();

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
	async ({ timestamp }: { timestamp: number }, { getState }) => {
		const state = getState() as RootState;

		const resourceTotalAmounts = new Map<string, Map<string, number>>();

		let index = 0;
		await everyLimit(
			state.resources.resourceChanges,
			config.maxChangesProcessedByTick,
			(item: ResourceChangeItem, callback) => {
				if (item.timestamp > timestamp) {
					return callback(null, false);
				}
				
				let totalResources = resourceTotalAmounts.get(item.resource);
				if (!totalResources) {
					totalResources = new Map();
					resourceTotalAmounts.set(item.resource, totalResources);
				}

				totalResources.set(
					item.name,
					(totalResources.get(item.name) ?? 0) + item.value
				);

				index++;

				setTimeout(callback, 0, null, true);
			}
		);

		const selectedResources: ResourceTimePoint = {
			timestamp,
			index,
			resources: {},
		};

		for (const [resource, users] of resourceTotalAmounts.entries()) {
			if (!selectedResources.resources[resource]) {
				selectedResources.resources[resource] = {};
			}

			for (const [user, amount] of users.entries()) {
				selectedResources.resources[resource][user] = amount;
			}
		}

		return {
			selectedResources,
		};
	}
);

export const { setSelectedTime } = resourcesSlice.actions;

export default resourcesSlice.reducer;
