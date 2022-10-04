import { configureStore } from '@reduxjs/toolkit';
import resources from './slices/resources';

export const store = configureStore({
	reducer: {
		resources,
	},
	devTools: process.env.NODE_ENV !== 'production',
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			thunk: true,
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
