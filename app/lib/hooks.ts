import { useCallback, useEffect, useState } from "react";

export function usePersistentState<T>(
	key: string,
	defaultValue: T,
	serializer: {
		parse: (value: string) => T;
		stringify: (value: T) => string;
	} = {
		parse: JSON.parse,
		stringify: JSON.stringify,
	},
): [T, (value: T | ((prevState: T) => T)) => void] {
	const [state, setState] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? serializer.parse(item) : defaultValue;
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return defaultValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((prevState: T) => T)) => {
			try {
				setState((prevState) => {
					const newValue = value instanceof Function ? value(prevState) : value;
					window.localStorage.setItem(key, serializer.stringify(newValue));
					return newValue;
				});
			} catch (error) {
				console.warn(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, serializer],
	);

	return [state, setValue];
}

export function useHotKey(
	key: string,
	callback: (event: KeyboardEvent) => void,
	options: {
		shiftKey?: boolean;
		ctrlKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
		preventDefault?: boolean;
	} = {},
): void {
	const {
		shiftKey = false,
		ctrlKey = false,
		altKey = false,
		metaKey = false,
		preventDefault = true,
	} = options;

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (
				event.key === key &&
				event.shiftKey === shiftKey &&
				event.ctrlKey === ctrlKey &&
				event.altKey === altKey &&
				event.metaKey === metaKey
			) {
				if (preventDefault) {
					event.preventDefault();
				}
				callback(event);
			}
		},
		[key, callback, shiftKey, ctrlKey, altKey, metaKey, preventDefault],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}
