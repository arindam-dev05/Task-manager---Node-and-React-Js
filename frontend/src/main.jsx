// main.jsx
// The actual entry point Vite loads (see index.html's <script> tag).
// Mounts <App /> into the #root div.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
