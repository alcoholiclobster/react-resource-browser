export interface RootState {
	resources: ResourcesState;
}

export interface AggregatedStateAmount {
	value: number;
	change: number;
}

export interface AggregatedState {
	index: number;
	timestamp: number;
	resources: {
		[resource: string]: {
			[name: string]: AggregatedStateAmount;
		};
	};
	totalResources: { resource: string; totalAmount: number }[];
}

export interface ResourceChange {
	timestamp: number;
	name: string;
	resource: string;
	value: number;
}

export enum ResourcesLoadingStatus {
	Idle = 'idle',
	Loading = 'loading',
	Loaded = 'loaded',
	Error = 'error',
}

export interface ResourcesState {
	status: ResourcesLoadingStatus;
	isLoadingAggregatedState: boolean;

	aggregatedState: AggregatedState;
	changes: ResourceChange[];
}
