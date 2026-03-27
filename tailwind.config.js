/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
                sans: ['Cairo', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f4fbf6',
                    100: '#e5f6eb',
                    200: '#caebd6',
                    300: '#9ddcae',
                    400: '#68c480',
                    500: '#3dd163', // Requested Green
                    600: '#2a8b43',
                    700: '#246d37',
                    800: '#1f572f',
                    900: '#194727',
                    950: '#0e2815',
                },
                ghaith: {
                    navy: '#1e3a5f', // Requested Navy
                    blue: '#3b9dd4', // Requested Blue
                    green: '#3dd163', // Requested Green
                }
            },
        },
    },
    plugins: [],
}
