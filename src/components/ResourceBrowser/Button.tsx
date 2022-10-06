import { PropsWithChildren } from 'react';
import styles from './styles.module.css';

interface ButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export const Button = ({
	children,
	onClick,
	disabled,
}: PropsWithChildren<ButtonProps>) => (
	<button
		className={styles.controlsButton}
		disabled={disabled}
		onClick={onClick}>
		{children}
	</button>
);
