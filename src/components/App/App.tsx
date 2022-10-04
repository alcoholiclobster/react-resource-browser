import ResourceBrowser from '../ResourceBrowser';
import styles from './App.module.css';

export function App() {
	return (
		<div className={styles.app}>
			<h1>Resource Browser</h1>
			<ResourceBrowser />
		</div>
	);
}
