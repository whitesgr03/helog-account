import { useReducer, useMemo } from 'react';

import {
	ModalContext,
	AppDataAPIContext,
	AlertContext,
	type State,
} from './AppContext';

type Actions =
	| { type: 'updatedAlert'; alert: State['alert'] }
	| { type: 'updatedModal'; modal: State['modal'] };

const reducer = (state: State, action: Actions): State => {
	switch (action.type) {
		case 'updatedAlert':
			return {
				...state,
				alert:
					action.alert.length === 0 || state.alert.length >= 2
						? action.alert
						: state.alert.concat(action.alert),
			};
		case 'updatedModal':
			document.body.removeAttribute('style');
			if (action.modal.component) document.body.style.overflow = 'hidden';
			return { ...state, modal: { ...state.modal, ...action.modal } };
	}
};

export const AppProvider = ({ children }: { children: React.ReactElement }) => {
	const [state, dispatch] = useReducer(reducer, {
		alert: [],
		modal: { component: null, clickToClose: true },
	});

	const api = useMemo(
		() => ({
			onAlert: (alert: State['alert']) => {
				dispatch({
					type: 'updatedAlert',
					alert,
				});
			},
			onModal: (modal: State['modal']) => {
				dispatch({
					type: 'updatedModal',
					modal,
				});
			},
		}),
		[],
	);

	return (
		<AppDataAPIContext.Provider value={api}>
			<ModalContext.Provider value={state.modal}>
				<AlertContext.Provider value={state.alert}>
					{children}
				</AlertContext.Provider>
			</ModalContext.Provider>
		</AppDataAPIContext.Provider>
	);
};
