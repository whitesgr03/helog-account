import { createContext, useContext, type ReactNode } from 'react';

interface AppDataAPI {
	onAlert: (_alert: State['alert']) => void;
	onModal: (_modal: State['modal']) => void;
}

export interface State {
	modal: { component: ReactNode; clickToClose?: boolean };
	alert: {
		message: string;
		error: boolean;
		delay: number;
	}[];
}

export const AlertContext = createContext([] as State['alert']);
export const ModalContext = createContext({} as State['modal']);
export const AppDataAPIContext = createContext({} as AppDataAPI);

export const useAlert = () => useContext(AlertContext);
export const useModal = () => useContext(ModalContext);
export const useAppDataAPI = () => useContext(AppDataAPIContext);
