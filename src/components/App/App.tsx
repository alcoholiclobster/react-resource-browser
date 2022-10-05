import config from '../../config';
import ResourceBrowser from '../ResourceBrowser';
import styles from './styles.module.css';

export function App() {
	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h2>Resource Browser Demo</h2>
				<p>
					This a demo application that shows the Resource Browser
					component in action. Use slider below to select a time point
					at which current resources count should be calculated and
					displayed.
				</p>
				<a href={config.projectRepoUrl} target="_blank">
					Source code on GitHub →
				</a>
			</div>
			<div className={styles.card}>
				<ResourceBrowser />
			</div>
		</div>
	);
}
