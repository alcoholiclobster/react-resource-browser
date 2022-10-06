import { formatNumber, formatValueSign } from '../../../utils';
import classNames from 'classnames';
import { memo } from 'react';
import styles from './styles.module.css';

interface AmountCellProps {
	amount: number;
	change: number;
}

interface AmountDifferenceProps {
	value: number;
}

const AmountDifference = ({ value }: AmountDifferenceProps) => (
	<span
		className={classNames(
			styles.changeLabel,
			value > 0 && styles.changePositive,
			value < 0 && styles.changeNegative
		)}>
		({formatValueSign(value)})
	</span>
);

const MemoizedAmountDifference = memo(AmountDifference);

export const AmountCell = ({ amount, change }: AmountCellProps) => {
	const changeText = change ? (
		<MemoizedAmountDifference value={change} />
	) : null;

	return (
		<td>
			{formatNumber(amount)} {changeText}
		</td>
	);
};
