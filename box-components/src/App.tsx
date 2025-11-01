import React from 'react';
import { Box } from './components/Box';
import { TextBox } from './components/TextBox';
import { IconBox } from './components/IconBox';
import { EditableConfigProvider } from './context/EditableConfigContext';
import { registry } from './definitions/registry';
import { BoxDef } from './definitions/Box';
import { TextBoxDef } from './definitions/TextBox';
import { IconBoxDef } from './definitions/IconBox';

registry.registerMultiple([BoxDef, TextBoxDef, IconBoxDef]);

function AppContent() {
  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          borderBottom: '3px solid #333',
          paddingBottom: '20px',
        }}
      >
        <h1
          style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            fontWeight: 'bold',
          }}
        >
          🎨 Live Edit React v2
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '18px',
            color: '#666',
          }}
        >
          Right-click on components to edit their properties
        </p>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          Properties are stored in .liveedit.config.json
        </p>
      </header>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#333' }}>
          📦 Box Component
        </h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Box leId="main-container" />
        </div>
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#333' }}>
          🎨 Icon Box Component
        </h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <IconBox leId="header-icon" />
        </div>
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#333' }}>
          📝 Text Box Component
        </h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <TextBox leId="subtitle-text" />
        </div>
      </section>

      <footer
        style={{
          marginTop: '60px',
          padding: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          💡 <strong>How it works:</strong> Right-click a component to open the edit overlay
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          Adjust sliders, color pickers, and text fields to edit properties
        </p>
        <p style={{ margin: 0 }}>
          Changes are sent to the Vite plugin and saved to .liveedit.config.json
        </p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <EditableConfigProvider>
      <AppContent />
    </EditableConfigProvider>
  );
}