import { useMemo } from 'react';
import { AggregatedState } from '../../store/types';
import styles from './styles.module.css';

interface ResourcesTableProps {
	resources: AggregatedState['resources'];
}

function formatAmount(amount: number) {
	return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
	const rows = useMemo(
		() =>
			Object.entries(resources).flatMap(([resource, users]) =>
				Object.entries(users)
					.sort(([, a], [, b]) => b - a)
					.map(([name, amount]) => (
						<tr key={`${resource}_${name}`}>
							<td>{name}</td>
							<td>{resource}</td>
							<td>{formatAmount(amount)}</td>
						</tr>
					))
			),
		[resources]
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
