/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				'primary-0': 'var(--primary-0)',
				'primary-1': 'var(--primary-1)',
				'primary-2': 'var(--primary-2)',
				'primary-3': 'var(--primary-3)',
				'offwhite': 'var(--offwhite)',
				'grayscale-0': 'var(--grayscale-0)',
				'grayscale-1': 'var(--grayscale-1)',
				'grayscale-2': 'var(--grayscale-2)',
				'grayscale-3': 'var(--grayscale-3)',
				'grayscale-black': 'var(--grayscale-black)',
				'secondary-0': 'var(--secondary-0)',
				'secondary-1': 'var(--secondary-1)',
				'secondary-2': 'var(--secondary-2)',
				'secondary-3': 'var(--secondary-3)',
			},
			backgroundImage: {
				'automaxia-home': "url('assets/img/inicio-background.png')",
			},
			fontFamily: {
				'inter': ['"Inter", sans-serif'],
				'roboto': ['"Roboto", sans-serif'],
			}
		},
    screens: {
      'mobile': {'min': '0px', 'max': '768px'},
      'tablet': {'max': '950px'},
      'desktop': {'min': '769px', 'max': '9000px'},
      'sm': '576px',
      'md': '960px',
      'lg': '1440px'
    },
	},
	plugins: [
		require("daisyui"),
	],
	daisyui: {
		themes: false,
	}
}
