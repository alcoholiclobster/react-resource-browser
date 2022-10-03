import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchResources,
	requestResourcesAtTimestamp,
} from '../../store/resources';
import { ResourcesLoadingStatus, RootState } from '../../store/types';
import TimeSelector from '../TimeSelector';
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

	useEffect(() => {
		if (resourcesStatus === ResourcesLoadingStatus.Idle) {
			dispatch(fetchResources());
		}
	}, [resourcesStatus, dispatch]);

	// useEffect(() => {
	// 	dispatch(requestResourcesAtTimestamp());
	// });

	return (
		<div className={styles.app}>
			<h1>Resource Browser {resourcesStatus}</h1>
			<p>Data items count: {resourcesChangesCount}</p>
			<TimeSelector />
		</div>
	);
}
