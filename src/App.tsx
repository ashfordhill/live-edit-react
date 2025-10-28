import React from 'react';
import { Box } from './Box';
import { Circle } from './Circle';
import { TextBox } from './TextBox';

/**
 * Main App showcasing live-editable components
 * 
 * This is a proof-of-concept inspired by Bret Victor's "Inventing on Principle".
 * When you interact with the sliders, the source code updates in real-time
 * and hot-reloads automatically.
 */
export function App() {
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '3px solid #333',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0',
          fontSize: '36px',
          fontWeight: 'bold'
        }}>
          🎨 Live Edit React
        </h1>
        <p style={{ 
          margin: 0,
          fontSize: '18px',
          color: '#666'
        }}>
          Interact with components and watch the source code update in real-time
        </p>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '14px',
          color: '#999',
          fontStyle: 'italic'
        }}>
          Inspired by Bret Victor's work on immediate feedback
        </p>
      </header>

      <Box />
      <Circle />
      <TextBox />

      <footer style={{
        marginTop: '60px',
        padding: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666',
        borderTop: '1px solid #e0e0e0'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          💡 <strong>How it works:</strong> Sliders send HTTP requests to a Vite plugin
        </p>
        <p style={{ margin: 0 }}>
          The plugin modifies your source files directly using AST transformations,
          then Vite's HMR hot-reloads the changes
        </p>
      </footer>
    </div>
  );
}