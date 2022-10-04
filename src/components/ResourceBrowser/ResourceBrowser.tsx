import { useState, useEffect } from 'react';
import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchResources,
	setTimelinePosition,
} from '../../store/slices/resources';
import { ResourcesLoadingStatus } from '../../store/types';
import ResourcesTable from '../ResourcesTable';
import TimelineRange from '../TimelineRange';

export function ResourceBrowser() {
	const dispatch = useAppDispatch();
	const [
		loadingStatus,
		timelineItemsCount,
		aggregatedResources,
		currentTimestamp,
	] = useAppSelector((state: RootState) => [
		state.resources.status,
		state.resources.changes.length,
		state.resources.aggregatedState.resources,
		state.resources.aggregatedState.timestamp,
	]);
	const [currentPosition, setCurrentPosition] = useState(-1);

	useEffect(() => {
		if (loadingStatus === ResourcesLoadingStatus.Idle) {
			dispatch(fetchResources());
		}
	}, [loadingStatus, dispatch]);
	useEffect(() => {
		if (loadingStatus !== ResourcesLoadingStatus.Loaded) {
			return;
		}

		dispatch(setTimelinePosition(currentPosition));
	}, [currentPosition, loadingStatus, dispatch]);

	const currentDateString =
		currentPosition >= 0
			? `Time: ${new Date(currentTimestamp * 1000).toISOString()}`
			: 'Select time';

	return (
		<>
			<p>
				Data items count:{' '}
				{loadingStatus === ResourcesLoadingStatus.Loading
					? 'loading...'
					: timelineItemsCount}
			</p>
			<p>{currentDateString}</p>

			<TimelineRange
				onChange={setCurrentPosition}
				itemsCount={timelineItemsCount}
			/>
			<ResourcesTable resources={aggregatedResources} />
		</>
	);
}
