import { formatNumber, formatValueSign } from '../../../utils';
import { AggregatedStateAmount } from '../../../store';
import classNames from 'classnames';
import { memo } from 'react';
import styles from './styles.module.css';

interface AmountRowProps {
	amount: AggregatedStateAmount;
	currentTimestamp: number;
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

export const AmountRow = ({ amount, currentTimestamp }: AmountRowProps) => {
	const isChangeVisible =
		amount.change !== 0 && currentTimestamp === amount.changeTimestamp;

	const amountChange = isChangeVisible ? (
		<MemoizedAmountDifference value={amount.change} />
	) : null;

	return (
		<td>
			{formatNumber(amount.value)} {amountChange}
		</td>
	);
};
