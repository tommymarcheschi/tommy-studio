import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ViewMode = 'grid' | 'list' | 'single' | 'masonry';

function createViewModeStore() {
	const initial = browser
		? (localStorage.getItem('tommy-view') as ViewMode) || 'grid'
		: 'grid';

	const { subscribe, set } = writable<ViewMode>(initial);

	return {
		subscribe,
		set: (value: ViewMode) => {
			if (browser) localStorage.setItem('tommy-view', value);
			set(value);
		}
	};
}

export const viewMode = createViewModeStore();

// Whether the inline toggle has scrolled out of view (so nav should show it)
export const showNavToggle = writable(false);
