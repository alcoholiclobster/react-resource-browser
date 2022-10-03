import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchResources,
	requestResourcesAtTimestamp,
} from '../../store/resources';
import { ResourcesLoadingStatus, RootState } from '../../store/types';
import ResourcesTable from '../ResourcesTable';
import TimeRange from '../TimeRange';
import styles from './App.module.css';

export function App() {
	const dispatch = useAppDispatch();
	const resourcesStatus = useAppSelector(
		(state: RootState) => state.resources.status
	);
	const [resourcesChangesCount] = useAppSelector((state: RootState) => [
		state.resources.resourceChanges.length,
		state.resources.timeFrom,
	]);

	const [minTimestamp, maxTimestamp] = useAppSelector((state: RootState) => [
		state.resources.timeFrom,
		state.resources.timeTo,
	]);

	const resources = useAppSelector(
		(state: RootState) => state.resources.selectedResources
	);

	const [timestamp, setTimestamp] = useState(minTimestamp);
	// const isLoadingSelected = useAppSelector(
	// 	(state: RootState) => state.resources.isLoadingSelected
	// );

	useEffect(() => {
		if (resourcesStatus === ResourcesLoadingStatus.Idle) {
			dispatch(fetchResources());
		}
	}, [resourcesStatus, dispatch]);

	useEffect(() => {
		if (resourcesStatus !== ResourcesLoadingStatus.Loaded) {
			return;
		}

		dispatch(
			requestResourcesAtTimestamp({ timestamp: timestamp })
		);
	}, [timestamp, resourcesStatus, dispatch]);

	return (
		<div className={styles.app}>
			<h1>Resource Browser {resourcesStatus}</h1>
			<p>Data items count: {resourcesChangesCount}</p>
			<p>Selected timestamp: {timestamp}</p>
			<TimeRange
				onChange={setTimestamp}
				min={minTimestamp}
				max={maxTimestamp}
				disabled={resourcesStatus !== ResourcesLoadingStatus.Loaded}
			/>
			<ResourcesTable resources={resources.resources} />
		</div>
	);
}
