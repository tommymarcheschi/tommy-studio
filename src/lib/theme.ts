import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const initial = browser
		? localStorage.getItem('tommy-theme') ??
		  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		: 'light';

	const { subscribe, set, update } = writable<'dark' | 'light'>(initial);

	if (browser) {
		subscribe((value) => {
			localStorage.setItem('tommy-theme', value);
			document.documentElement.classList.toggle('dark', value === 'dark');
		});
	}

	return {
		subscribe,
		toggle: () => update((v) => (v === 'dark' ? 'light' : 'dark')),
		set
	};
}

export const theme = createThemeStore();
