import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchResources, setTimelineIndex } from '../../store/resources';
import { ResourcesLoadingStatus, RootState } from '../../store/types';
import ResourcesTable from '../ResourcesTable';
import TimelineRange from '../TimelineRange';
import styles from './App.module.css';

export function App() {
	const dispatch = useAppDispatch();
	const resourcesStatus = useAppSelector(
		(state: RootState) => state.resources.status
	);
	const timelineItemsCount = useAppSelector(
		(state: RootState) => state.resources.changes.length
	);

	const resources = useAppSelector(
		(state: RootState) => state.resources.aggregatedState
	);

	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (resourcesStatus === ResourcesLoadingStatus.Idle) {
			dispatch(fetchResources());
		}
	}, [resourcesStatus, dispatch]);

	useEffect(() => {
		if (resourcesStatus !== ResourcesLoadingStatus.Loaded) {
			return;
		}

		dispatch(setTimelineIndex(currentIndex));
	}, [currentIndex, resourcesStatus, dispatch]);

	return (
		<div className={styles.app}>
			<h1>Resource Browser {resourcesStatus}</h1>
			<p>Data items count: {timelineItemsCount}</p>
			<p>Selected index: {currentIndex}</p>
			<TimelineRange
				onChange={setCurrentIndex}
				itemsCount={timelineItemsCount}
			/>
			<ResourcesTable resources={resources.resources} />
		</div>
	);
}
