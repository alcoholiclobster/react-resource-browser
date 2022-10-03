import { useCallback, useState } from 'react';
import { Range } from 'react-range';

interface TimeRangeProps {
	onChange: (timestamp: number) => void;

	min: number;
	max: number;

	disabled?: boolean;
}

export function TimeRange({ onChange, min, max, disabled }: TimeRangeProps) {
	const [value, setValue] = useState(0);

	const handleChange = useCallback(
		(values: number[]) => {
			setValue(values[0]);
			onChange((values[0] / 100) * (max - min) + min);
		},
		[min, max]
	);

	return (
		<Range
			step={1}
			min={0}
			max={100}
			disabled={disabled}
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
