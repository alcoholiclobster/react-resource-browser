import { AggregatedState, AggregatedStateAmount } from '../../../store';
import styles from './styles.module.css';
import { useMemo } from 'react';

interface ResourcesTableProps {
	aggregatedState: Pick<AggregatedState, 'resources' | 'timestamp'>;
}

function formatValue(value: number) {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatChange(value: number) {
	return value > 0 ? `+${value}` : value;
}

function renderAmountChange(value: number) {
	const className = value > 0 ? styles.changePositive : styles.changeNegative;

	return (
		<span className={styles.changeLabel + ' ' + className}>
			({formatChange(value)})
		</span>
	);
}

function renderAmountRow(
	amount: AggregatedStateAmount,
	currentTimestamp: number
) {
	const isChangeVisible =
		amount.change !== 0 && currentTimestamp === amount.changeTimestamp;

	const amountChange = isChangeVisible ? (
		<> {renderAmountChange(amount.change)}</>
	) : (
		<></>
	);

	return (
		<td>
			{formatValue(amount.value)}
			{amountChange}
		</td>
	);
}

export function ResourcesTable({ aggregatedState }: ResourcesTableProps) {
	const rows = useMemo(
		() =>
			Object.entries(aggregatedState.resources).flatMap(
				([resource, users]) =>
					Object.entries(users)
						.sort(([, { value: a }], [, { value: b }]) => b - a)
						.map(([name, amount]) => (
							<tr key={`${resource}_${name}`}>
								<td>{name}</td>
								<td>{resource}</td>
								{renderAmountRow(
									amount,
									aggregatedState.timestamp
								)}
							</tr>
						))
			),
		[aggregatedState]
	);

	return (
		<>
			<table className={styles.resourcesTable}>
				<thead>
					<tr>
						<th>PLAYER</th>
						<th>RESOURCE</th>
						<th>AMOUNT</th>
					</tr>
				</thead>
				<tbody>{rows}</tbody>
			</table>
			{rows.length === 0 ? (
				<p className={styles.label}>Select time point</p>
			) : (
				<></>
			)}
		</>
	);
}
