// frontend/src/App.tsx
import { ClusterGridView } from './components/ClusterGridView';
import type { Node } from './types/host';

function App() {
  const handleNodeClick = (node: Node) => {
    // This is now handled internally by ClusterGridView
  };

  return (
    <div className="app-container min-h-screen bg-gray-900">
      {/* Header */}
      <header className="header bg-gray-800 shadow-lg border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-400">Watchtower</h1>
                <span className="text-sm text-gray-400">System Monitor</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content flex h-[calc(100vh-80px)]">
        <div className="flex-1 overflow-hidden bg-gray-900">
          <ClusterGridView onNodeClick={handleNodeClick} />
        </div>
      </div>
    </div>
  );
}

export default App;

