import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	ResourceChangeItem,
	ResourcesLoadingStatus,
	ResourcesState,
} from './types';
import axios from 'axios';
import config from '../config';
import { eachLimit } from 'async';

const initialState: ResourcesState = {
	status: ResourcesLoadingStatus.Idle,

	selectedTime: 0,
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
	},

	extraReducers(builder) {
		builder
			.addCase(fetchResources.pending, (state) => {
				state.status = ResourcesLoadingStatus.Loading;
			})

			.addCase(fetchResources.fulfilled, (state, action) => {
				state.status = ResourcesLoadingStatus.Loaded;
				state.resourceChanges = action.payload;

				if (state.resourceChanges.length > 0) {
					state.timeFrom = state.resourceChanges[0].timestamp;
					state.timeTo =
						state.resourceChanges[
							state.resourceChanges.length - 1
						].timestamp;
				} else {
					state.timeFrom = 0;
					state.timeTo = 0;
				}

				state.selectedTime = Math.max(
					state.timeFrom,
					Math.min(state.timeTo, state.selectedTime)
				);

				console.log(state.resourceChanges.length);
			})

			.addCase(fetchResources.rejected, (state) => {
				state.status = ResourcesLoadingStatus.Error;
			});
	},
});

export const fetchResources = createAsyncThunk(
	'resources/fetchResources',
	async () => {
		const response = await axios.get<string>(config.endpoints.getResources);

		const items: ResourceChangeItem[] = [];
		const totalResourcesByUser = new Map<string, Map<string, number>>();

		await eachLimit(
			response.data.split('\n'),
			config.maxChangesProcessedByTick,
			(line: string, callback) => {
				try {
					const item = JSON.parse(line.replace(/'/g, '"'));
					let totalResources = totalResourcesByUser.get(item.name);
					if (!totalResources) {
						totalResources = new Map();
						totalResourcesByUser.set(item.name, totalResources);
					}

					let totalAmount = totalResources.get(item.resource) ?? 0;
					if (totalResources.has(item.resource)) {
						totalAmount =
							totalResources.get(item.resource) + item.value;
					} else {
						totalAmount = item.value;
					}
					totalResources.set(item.resource, totalAmount);

					items.push({
						...item,

						totalAmount,
					});
				} catch (error) {}

				setTimeout(callback, 0);
			}
		);

		return items;
	}
);

export const { setSelectedTime } = resourcesSlice.actions;

export default resourcesSlice.reducer;
