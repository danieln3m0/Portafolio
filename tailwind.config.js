/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lenguaje itssharl.ee: blanco roto calido + texto indigo/pizarra.
        // El color vive en los blobs iridiscentes y el glow, no en la UI.
        paper: '#eae9e5',       // blanco roto calido (fondo dominante)
        'paper-2': '#e2e1dc',   // superficie / tarjeta clara
        slate: '#646787',       // tarjeta oscura periwinkle (media)
        ink: '#3a3c58',         // texto principal (indigo pizarra)
        muted: '#7e80a1',       // texto secundario (periwinkle)
        line: 'var(--line)',    // hairlines
        mint: '#9fe8cb',        // resplandor de acento
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
