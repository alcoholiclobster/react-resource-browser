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

const months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

function renderDate(timestamp: number) {
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
			{date.getDay()} {months[date.getMonth()]} {date.getFullYear()}{' '}
			<b>
				{date.getHours().toString().padStart(2, '0')}:
				{date.getMinutes().toString().padStart(2, '0')}:
				{date.getSeconds().toString().padStart(2, '0')}
			</b>
		</p>
	);
}

export function ResourceBrowser() {
	const dispatch = useAppDispatch();
	const [loadingStatus, timelineItemsCount, aggregatedState] = useAppSelector(
		(state: RootState) => [
			state.resources.status,
			state.resources.changes.length,
			state.resources.aggregatedState,
		]
	);
	const [currentPosition, setCurrentPosition] = useState(-1);
	const changePosition = (amount: number) => {
		setCurrentPosition(
			Math.max(
				-1,
				Math.min(timelineItemsCount - 1, currentPosition + amount)
			)
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
		<p className={styles.loadingLabel}>Data is loading...</p>
	) : (
		<div>
			<div className={styles.controls}>
				{renderDate(aggregatedState.timestamp)}
				<TimelineRange
					value={currentPosition}
					onChange={setCurrentPosition}
					itemsCount={timelineItemsCount - 1}
				/>
				<div className={styles.controlsButtons}>
					<button
						className={styles.controlsButton}
						onClick={() => changePosition(-1)}>
						◄ Prev
					</button>
					<button
						className={styles.controlsButton}
						onClick={() => changePosition(1)}>
						Next ►
					</button>
				</div>
			</div>
			<ResourcesTable aggregatedState={aggregatedState} />
		</div>
	);
}
