import axios from 'axios';
import config from '../config';

export async function getResourcesChanges(): Promise<string> {
	const response = await axios.get<string>(
		config.endpoints.getResourcesChanges
	);

	return response.data;
}
