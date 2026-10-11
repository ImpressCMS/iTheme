import { defineConfig } from 'vite'
import icmsTheme from './build/vite-plugin-icms-theme/index.js'

export default defineConfig({
    plugins: [
        icmsTheme({
            entries: [
                'js/theme.js',
                'css/style.css',
                'css/style_admin.css',
                'css/rtl/style.css',
            ],
            exclude: ['index.html'],
        }),
    ],
})
