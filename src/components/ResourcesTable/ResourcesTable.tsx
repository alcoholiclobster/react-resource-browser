import { ResourceTimePoint } from '../../store/types';

interface ResourcesTableProps {
	resources: ResourceTimePoint['resources'];
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
	const rows = Object.entries(resources).flatMap(([resource, users]) =>
		Object.entries(users)
			.sort(([, a], [, b]) => b - a)
			.map(([name, amount]) => (
				<tr key={`${resource}_${name}`}>
					<td>{name}</td>
					<td>{resource}</td>
					<td>{amount}</td>
				</tr>
			))
	);

	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Resource</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>{rows}</tbody>
		</table>
	);
}
