/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens enlazados a variables CSS (canales RGB) para tema claro/oscuro.
        // El color vive en los blobs iridiscentes y el glow, no en la UI.
        paper: 'rgb(var(--paper) / <alpha-value>)',       // fondo dominante
        'paper-2': 'rgb(var(--paper-2) / <alpha-value>)', // superficie / tarjeta clara
        slate: 'rgb(var(--slate) / <alpha-value>)',       // tarjeta media periwinkle
        ink: 'rgb(var(--ink) / <alpha-value>)',           // texto principal
        muted: 'rgb(var(--muted) / <alpha-value>)',       // texto secundario
        line: 'var(--line)',                              // hairlines
        mint: 'rgb(var(--mint) / <alpha-value>)',         // resplandor de acento
      },
      fontFamily: {
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '1340px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
