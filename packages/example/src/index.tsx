import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { IProvider } from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
function App() {
  const [provider, setProvider] = useState<IProvider>();
  return (
    <div>
      <button
        onClick={async () => {
          try {
            setProvider(await detectProvider());
          } catch (error) {
            console.log(error, '=====error');
          }
        }}>
        init provider
      </button>
    </div>
  );
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
