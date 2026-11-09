import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { i18nReady } from './lib/i18n';
import './styles/compositions.css';

void i18nReady.then(() => {
// biome-ignore lint/style/noNonNullAssertion: standard React root element
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

});
