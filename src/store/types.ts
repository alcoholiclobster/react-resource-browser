export interface RootState {
	resources: ResourcesState;
}

export interface ResourceChangeItem {
	timestamp: number;
	name: string;
	resource: string;
	value: number;

	totalAmount: number;
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
	timeFrom: number;
	timeTo: number;

	resourceChanges: ResourceChangeItem[];
}
