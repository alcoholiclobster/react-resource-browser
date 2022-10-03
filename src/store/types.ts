export interface RootState {
	resources: ResourcesState;
}

export interface ResourceTimePoint {
	index: number,
	timestamp: number;
	resources: {
		[resource: string]: {
			[name: string]: number;
		};
	};
}

export interface ResourceChangeItem {
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

	selectedTime: number;
	selectedResources: ResourceTimePoint;

	timeFrom: number;
	timeTo: number;

	resourceChanges: ResourceChangeItem[];
}
