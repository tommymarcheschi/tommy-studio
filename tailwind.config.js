/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Montserrat', 'system-ui', 'sans-serif']
			},
			colors: {
				accent: '#ff9900'
			}
		}
	},
	plugins: []
};
