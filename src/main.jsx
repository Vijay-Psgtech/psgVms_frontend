import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';   // ✅ Correct: only import here

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
