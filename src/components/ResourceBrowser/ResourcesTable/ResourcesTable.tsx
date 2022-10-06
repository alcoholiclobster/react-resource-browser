import { AggregatedState, AggregatedStateAmount } from '../../../store';
import { AmountCell } from './AmountCell';
import styles from './styles.module.css';
import { memo, useMemo } from 'react';
import { formatNumber } from '../../../utils';

interface ResourcesTableProps {
	aggregatedState: AggregatedState;
}

interface TotalResourceRow {
	resource: string;
	amount: number;
}

interface UserResourceRow {
	user: string;
	resource: string;
	amount: number;
	change: number;
}

const TotalResourceRow = ({ resource, amount }: TotalResourceRow) => (
	<tr>
		<td></td>
		<td>
			<b>{resource}</b>
		</td>
		<td>
			<b>{formatNumber(amount)}</b>
		</td>
	</tr>
);

const MemoizedTotalResourceRow = memo(
	TotalResourceRow,
	(prevProps, nextProps) => prevProps.amount === nextProps.amount
);

const UserResourceRow = ({
	user,
	resource,
	amount,
	change,
}: UserResourceRow) => (
	<tr>
		<td>{user}</td>
		<td>{resource}</td>
		<AmountCell amount={amount} change={change} />
	</tr>
);

const MemoizedUserResourceRow = memo(
	UserResourceRow,
	(prevProps, nextProps) => {
		return (
			prevProps.amount === nextProps.amount &&
			prevProps.change === nextProps.change
		);
	}
);

export const ResourcesTable = ({ aggregatedState }: ResourcesTableProps) => {
	const rows = useMemo(() => {
		return aggregatedState.totalResources.flatMap(
			({ resource, totalAmount }) => [
				// Total amount of the resource
				<MemoizedTotalResourceRow
					key={`${resource}__total`}
					resource={resource}
					amount={totalAmount}
				/>,
				// Resource amounts for each user
				...Object.entries(aggregatedState.resources[resource])
					.sort(([, { value: a }], [, { value: b }]) => b - a)
					.map(([user, amount]) => (
						<MemoizedUserResourceRow
							key={`${resource}_${user}`}
							user={user}
							resource={resource}
							amount={amount.value}
							change={amount.change}
						/>
					)),
			]
		);
	}, [aggregatedState]);

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
