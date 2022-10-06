import { AggregatedState } from '../../../store';
import { AmountRow } from './AmountRow';
import styles from './styles.module.css';
import { useMemo } from 'react';

interface ResourcesTableProps {
	aggregatedState: Pick<AggregatedState, 'resources' | 'timestamp'>;
}

export const ResourcesTable = ({ aggregatedState }: ResourcesTableProps) => {
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
								<AmountRow
									amount={amount}
									currentTimestamp={aggregatedState.timestamp}
								/>
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
			) : null}
		</>
	);
};
