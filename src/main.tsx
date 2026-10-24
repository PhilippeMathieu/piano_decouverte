import { render } from 'preact';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles/app.css';
import { App } from './app';
import { setupInstall, setupUpdates } from './core/app/pwa';

setupInstall();
setupUpdates();
render(<App />, document.getElementById('app')!);
