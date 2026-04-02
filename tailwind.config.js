/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#298c77',
                    50: '#f2fcf9',
                    100: '#e1f8f3',
                    200: '#c4f0e5',
                    300: '#9ae2d2',
                    400: '#6bccbb',
                    500: '#46b2a0',
                    600: '#298c77', // The user requested color
                    700: '#227061',
                    800: '#1e594f',
                    900: '#1b4a43',
                    950: '#0e2b27',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
