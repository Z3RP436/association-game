import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme Datei
import 'primereact/resources/primereact.min.css';                // PrimeReact CSS
import 'primeicons/primeicons.css';                               // Icons
import 'primeflex/primeflex.css';                                 // Optional: Flex Layout
import 'primeflex/primeflex.css';
import 'primeflex/themes/primeone-dark.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


reportWebVitals();
