import { useCallback, useState } from 'react';
import { Range } from 'react-range';

interface TimeRangeProps {
	onChange: (itemIndex: number) => void;

	itemsCount: number;
}

export function TimelineRange({ onChange, itemsCount }: TimeRangeProps) {
	const [value, setValue] = useState(-1);

	const handleChange = useCallback(
		(values: number[]) => {
			setValue(values[0]);
			onChange(values[0]);
		},
		[itemsCount]
	);

	return (
		<Range
			step={1}
			min={-1}
			max={itemsCount}
			disabled={itemsCount === 0}
			values={[value]}
			onChange={handleChange}
			renderTrack={({ props, children }) => (
				<div
					{...props}
					style={{
						...props.style,
						height: '6px',
						width: '100%',
						backgroundColor: '#ccc',
					}}>
					{children}
				</div>
			)}
			renderThumb={({ props }) => (
				<div
					{...props}
					style={{
						...props.style,
						height: '42px',
						width: '42px',
						backgroundColor: '#999',
					}}
				/>
			)}
		/>
	);
}
