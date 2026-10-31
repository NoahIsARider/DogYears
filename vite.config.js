import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{house:resolve('index.html'),forest:resolve('forest.html'),interludes:resolve('interludes.html')}}}});
