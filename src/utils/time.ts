export async function wait(ms: number = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
