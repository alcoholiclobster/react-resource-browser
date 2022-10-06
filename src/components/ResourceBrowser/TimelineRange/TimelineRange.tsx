import { IRenderThumbParams, IRenderTrackParams } from 'react-range/lib/types';
import { Range } from 'react-range';
import styles from './styles.module.css';
import { useCallback } from 'react';

interface TimeRangeProps {
	onChange: (itemIndex: number) => void;
	value: number;

	itemsCount: number;
}

export const TimelineRange = ({
	onChange,
	value,
	itemsCount,
}: TimeRangeProps) => {
	const handleChange = useCallback(
		(values: number[]) => {
			onChange(values[0]);
		},
		[itemsCount]
	);

	const renderTrack = useCallback(
		({ props, children }: IRenderTrackParams) => (
			<div
				{...props}
				style={{
					...props.style,
					height: '8px',
					width: '100%',
					backgroundColor: '#bbb',
					alignSelf: 'center',
				}}>
				{children}
			</div>
		),
		[]
	);

	const renderThumb = useCallback(
		({ props }: IRenderThumbParams) => (
			<div
				{...props}
				style={{
					...props.style,
					height: '32px',
					width: '32px',
					borderRadius: '15px',
					border: '5px solid #fff',
					boxSizing: 'border-box',
					backgroundColor: 'var(--accent-color)',
				}}
				className={styles.timelineTrack}
			/>
		),
		[]
	);

	return (
		<Range
			step={1}
			min={-1}
			max={Math.max(0, itemsCount)}
			disabled={itemsCount === 0}
			values={[value]}
			onChange={handleChange}
			renderTrack={renderTrack}
			renderThumb={renderThumb}
		/>
	);
};
