import TimeSelector from '../TimeSelector';
import styles from './App.module.css';

export function App() {
	return (
		<div className={styles.app}>
			<h1>Resource Browser</h1>
			<TimeSelector />
		</div>
	);
}
