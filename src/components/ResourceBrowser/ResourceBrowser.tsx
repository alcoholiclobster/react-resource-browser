import {
	ResourcesLoadingStatus,
	RootState,
	useAppDispatch,
	useAppSelector,
} from '../../store';
import {
	fetchResources,
	setTimelinePosition,
} from '../../store/slices/resources';
import { useEffect, useState } from 'react';
import ResourcesTable from './ResourcesTable';
import TimelineRange from './TimelineRange';
import styles from './styles.module.css';
import { clamp } from 'lodash';
import { getMonthName } from '../../utils';
import { Button } from './Button';

interface TimelineDateProps {
	timestamp: number;
}

interface LoadingStatusLabelProps {
	status: ResourcesLoadingStatus;
}

const TimelineDate = ({ timestamp }: TimelineDateProps) => {
	if (timestamp < 0) {
		return (
			<p className={styles.controlsTime}>
				<b>Time is not selected</b>
			</p>
		);
	}
	const date = new Date(timestamp * 1000);
	return (
		<p className={styles.controlsTime}>
			{date.getDate()} {getMonthName(date.getMonth())}{' '}
			{date.getFullYear()}{' '}
			<b>
				{date.getHours().toString().padStart(2, '0')}:
				{date.getMinutes().toString().padStart(2, '0')}:
				{date.getSeconds().toString().padStart(2, '0')}
			</b>
		</p>
	);
};

const LoadingStatusLabel = ({ status }: LoadingStatusLabelProps) => {
	let text = 'Data is loading...';
	if (status === ResourcesLoadingStatus.Error) {
		text = 'Failed to load data.';
	}

	return <p className={styles.loadingLabel}>{text}</p>;
};

export const ResourceBrowser = () => {
	const dispatch = useAppDispatch();

	const [loadingStatus, timelineItemsCount, aggregatedState] = useAppSelector(
		(state: RootState) => [
			state.resources.status,
			state.resources.changes.length,
			state.resources.aggregatedState,
		]
	);

	const [currentPosition, setCurrentPosition] = useState(-1);
	const addCurrentPosition = (amount: number) => {
		setCurrentPosition(
			clamp(currentPosition + amount, -1, timelineItemsCount - 1)
		);
	};

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

	return loadingStatus !== ResourcesLoadingStatus.Loaded ? (
		<LoadingStatusLabel status={loadingStatus} />
	) : (
		<div>
			<div className={styles.controls}>
				<TimelineDate timestamp={aggregatedState.timestamp} />
				<TimelineRange
					value={currentPosition}
					onChange={setCurrentPosition}
					itemsCount={timelineItemsCount - 1}
				/>
				<div className={styles.controlsButtons}>
					<Button
						onClick={() => addCurrentPosition(-1)}
						disabled={currentPosition === -1}>
						◄ Prev
					</Button>
					<Button
						onClick={() => addCurrentPosition(1)}
						disabled={currentPosition === timelineItemsCount - 1}>
						Next ►
					</Button>
				</div>
			</div>
			<ResourcesTable aggregatedState={aggregatedState} />
		</div>
	);
};
