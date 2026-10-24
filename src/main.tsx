import { render } from 'preact';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/app.css';
import { App } from './app';
import { setupInstall, setupUpdates } from './core/app/pwa';

setupInstall();
setupUpdates();
render(<App />, document.getElementById('app')!);
