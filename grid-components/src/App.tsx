import { useState } from 'react';
import { Grid } from './components/Grid';
import { useEditableConfig } from './context/EditableConfigContext';

const HamburgerMenu = () => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }}></div>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }}></div>
    <div style={{ width: '100%', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }}></div>
  </div>
);

const StatusIndicator = ({ status, label }: { status: 'online' | 'offline' | 'away'; label: string }) => (
  <div style={{ width: '100%', height: '100%', padding: '16px', backgroundColor: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: status === 'online' ? '#10b981' : status === 'away' ? '#f59e0b' : '#ef4444' }}></div>
    <div style={{ fontSize: '14px', color: '#92400e', fontWeight: 600 }}>{label}</div>
  </div>
);

const UserProfile = ({ name, role }: { name: string; role: string }) => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', fontWeight: 700, fontSize: '16px' }}>{name[0]}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{name}</div>
      <div style={{ fontSize: '12px', color: '#e0e7ff' }}>{role}</div>
    </div>
  </div>
);

const NotificationBell = ({ count }: { count: number }) => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '32px' }}>🔔</div>
    {count > 0 && (
      <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#fff', color: '#ef4444', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{count}</div>
    )}
  </div>
);

const SearchBar = () => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '6px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
    <div style={{ fontSize: '18px', marginRight: '8px' }}>🔍</div>
    <input type="text" placeholder="Search..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#1f2937', backgroundColor: 'transparent', fontWeight: 500 }} />
  </div>
);

const StatsCard = ({ icon, label, value, trend }: { icon: string; label: string; value: string; trend: number }) => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ fontSize: '20px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>{label}</div>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: '#064e3b' }}>{value}</div>
    <div style={{ fontSize: '12px', color: trend >= 0 ? '#065f46' : '#7f1d1d', fontWeight: 600 }}>
      {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
    </div>
  </div>
);

const ProgressWidget = ({ label, progress }: { label: string; progress: number }) => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c2d12' }}>{label}</div>
    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
    </div>
    <div style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600, textAlign: 'right' }}>{progress}%</div>
  </div>
);

const SettingsButton = () => (
  <div style={{ width: '100%', height: '100%', padding: '16px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '32px' }}>⚙️</div>
  </div>
);

export function App() {
  const [editMode, setEditMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { resetToDefault } = useEditableConfig();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset layout to default? This will clear all your changes.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      await resetToDefault();
    } catch (err) {
      alert('Failed to reset layout. Check console for details.');
    } finally {
      setIsResetting(false);
    }
  };

  const components = [
    <HamburgerMenu />,
    <StatusIndicator status="online" label="System Online" />,
    <UserProfile name="John Doe" role="Administrator" />,
    <NotificationBell count={5} />,
    <SearchBar />,
    <StatsCard icon="💰" label="Revenue" value="$24.5K" trend={12.5} />,
    <ProgressWidget label="Storage Used" progress={67} />,
    <SettingsButton />,
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#1a1a2e' : '#f9fafb', padding: '40px 20px', transition: 'background-color 0.3s' }}>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: darkMode ? '#f9fafb' : '#1f2937', transition: 'color 0.3s' }}>
            Drag & Drop Grid Layout
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReset}
            disabled={isResetting}
            style={{
              padding: '10px 24px',
              backgroundColor: isResetting ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isResetting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
              opacity: isResetting ? 0.6 : 1,
            }}
          >
            {isResetting ? '⏳ Resetting...' : '🔄 Reset Layout'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 24px',
              backgroundColor: darkMode ? '#fbbf24' : '#4b5563',
              color: darkMode ? '#1f2937' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
            }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: '10px 24px',
              backgroundColor: editMode ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
            }}
          >
            {editMode ? '✏️ Edit Mode' : '👁️ View Mode'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Grid
          id="main-grid"
          editMode={editMode}
          darkMode={darkMode}
        >
          {components.map((comp, idx) => (
            <div key={idx}>
              {comp}
            </div>
          ))}
        </Grid>
      </div>

      {editMode && (
        <div
          style={{
            maxWidth: '1400px',
            margin: '30px auto 0',
            padding: '16px',
            backgroundColor: darkMode ? '#16213e' : '#fff',
            borderRadius: '8px',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            color: darkMode ? '#d1d5db' : '#4b5563',
            fontSize: '13px',
            lineHeight: '1.6',
            transition: 'all 0.3s',
          }}
        >
          <div style={{ fontWeight: 600, color: darkMode ? '#f9fafb' : '#1f2937', marginBottom: '8px', transition: 'color 0.3s' }}>💡 Tips:</div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Click and drag the center area to move items (avoid corners for resizing)</li>
            <li>Resize by dragging from the <strong>bottom-right pink corner</strong> handle</li>
            <li>Drop one component on another to create a nested grid (shows 📂 icon)</li>
            <li>Use <strong>🔼/🔽 Root Pad</strong> buttons (top-right) to adjust main grid padding</li>
            <li>Use <strong>🔼/🔽 Pad</strong> buttons to adjust padding inside parent grids</li>
            <li>Click "✕ Uncombine" button on nested grids to extract items</li>
            <li>Double right-click to toggle between vertical/horizontal layout modes</li>
            <li>Active nested grids show a highlighted border</li>
            <li>Switch to View Mode to see the final clean layout</li>
          </ul>
        </div>
      )}
    </div>
  );
}
