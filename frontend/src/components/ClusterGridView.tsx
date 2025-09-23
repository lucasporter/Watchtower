import { useState, useEffect, useRef } from 'react';
import type { Cluster, Node, ClusterCreate, NodeCreate } from '../types/host';
import { clustersApi, nodesApi } from '../services/api';
import { CreateClusterModal } from './CreateClusterModal';
import { CreateNodeModal } from './CreateNodeModal';
import { NodeDetails } from './NodeDetails';
import { EditNodeModal } from './EditNodeModal';

interface ClusterGridViewProps {
  onNodeClick: (node: Node) => void;
}

export function ClusterGridView({ onNodeClick }: ClusterGridViewProps) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateNodeModalOpen, setIsCreateNodeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: Node | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    node: null
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await clustersApi.list();
      setClusters(data);
      
      if (data.length > 0) {
        setSelectedClusterId(data[0].id);
      } else {
        // Create placeholder cluster and node if none exist
        await createPlaceholderCluster();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clusters');
    } finally {
      setLoading(false);
    }
  };

  const createPlaceholderCluster = async () => {
    try {
      // Create placeholder cluster
      const newCluster: ClusterCreate = {
        name: "UntitledCluster",
        description: "Placeholder cluster created automatically"
      };
      
      const createdCluster = await clustersApi.create(newCluster);
      
      // Create placeholder node without IP
      const newNode: NodeCreate = {
        name: "UntitledNode",
        ip_address: "", // No IP assigned
        cluster_id: createdCluster.id,
        ssh_port: 22,
        operating_system: "Unknown",
        notes: "Placeholder node created automatically - assign an IP address to enable monitoring"
      };
      
      await nodesApi.create(newNode);
      
      // Reload clusters to get the updated data
      const updatedClusters = await clustersApi.list();
      setClusters(updatedClusters);
      setSelectedClusterId(createdCluster.id);
    } catch (err) {
      console.error('Failed to create placeholder cluster:', err);
      setError('Failed to create placeholder cluster');
    }
  };

  const handleClusterCreated = () => {
    loadClusters();
  };

  const handleNodeCreated = () => {
    loadClusters();
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNodeId(node.id);
    onNodeClick(node);
  };

  const handleBackToGrid = () => {
    setSelectedNodeId(null);
  };

  const handleNodeRightClick = (e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      node: null
    });
  };

  const handleDeleteNode = async () => {
    if (!contextMenu.node) return;
    
    if (confirm(`Are you sure you want to delete "${contextMenu.node.name}"?`)) {
      try {
        await nodesApi.delete(contextMenu.node.id);
        handleContextMenuClose();
        loadClusters();
      } catch (err) {
        console.error('Failed to delete node:', err);
        alert('Failed to delete node');
      }
    }
  };

  const handleEditNode = () => {
    if (contextMenu.node) {
      setNodeToEdit(contextMenu.node);
      setIsEditModalOpen(true);
    }
    handleContextMenuClose();
  };

  const handleRefreshNode = async () => {
    if (!contextMenu.node) return;
    
    try {
      // TODO: Implement refresh functionality - this would typically call an API endpoint
      // that re-runs health checks and tests for the specific node
      handleContextMenuClose();
      // Reload clusters to get updated status
      loadClusters();
    } catch (err) {
      console.error('Failed to refresh node:', err);
      alert('Failed to refresh node');
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Element)) {
        handleContextMenuClose();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const getNodeStatusColor = (node: Node) => {
    if (!node.ip_address || node.ip_address.trim() === '') {
      return 'gray';
    }
    return node.is_alive ? 'green' : 'red';
  };

  const getNodeStatusDot = (node: Node) => {
    if (!node.ip_address || node.ip_address.trim() === '') {
      return 'bg-gray-400';
    }
    return node.is_alive ? 'bg-green-500' : 'bg-red-500';
  };

  const selectedCluster = clusters.find(c => c.id === selectedClusterId);

  if (loading) return (
    <div className="flex justify-center items-center h-full bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
        <div className="text-lg text-gray-300">Loading clusters...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-full bg-gray-900">
      <div className="text-center">
        <div className="text-red-400 text-lg mb-2">Error loading clusters</div>
        <div className="text-gray-400">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg shadow-lg m-4">
      {/* Cluster Tabs */}
      <div className="cluster-tabs border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex px-6 py-0">
          {clusters.map((cluster, index) => (
            <button
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`tab-button ${selectedClusterId === cluster.id ? 'active' : ''} px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                selectedClusterId === cluster.id
                  ? 'border-green-500 text-green-400 bg-gray-900'
                  : 'border-transparent text-gray-400 hover:text-green-400 hover:border-green-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{cluster.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedClusterId === cluster.id
                    ? 'bg-green-900 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {cluster.nodes.length}
                </span>
              </div>
            </button>
          ))}
          
          {/* Plus Tab */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="tab-button px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-green-400 hover:border-green-600 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Cluster</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content - Sidebar + Grid */}
      <div className="flex-1 flex bg-gray-900">
        {selectedCluster && (
          <>
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 bg-gray-800 border-r border-gray-700">
              <div className="h-full flex flex-col">
                                 <div className="px-8 py-6 border-b border-gray-700">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                         </svg>
                       </div>
                                               <div>
                          <h3 className="text-lg font-semibold text-gray-100">Cluster Nodes</h3>
                          <p className="text-sm text-gray-400">
                            {selectedCluster.nodes.length} nodes in this cluster
                          </p>
                        </div>
                     </div>
                     <button
                       onClick={() => setIsCreateNodeModalOpen(true)}
                       className="inline-flex items-center p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                       title="Add Node"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                       </svg>
                     </button>
                   </div>
                 </div>
                
                <div className="flex-1 overflow-y-auto">
                                                       {selectedCluster.nodes.length === 0 ? (
                    <div className="px-8 py-6 text-center">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="text-gray-400 text-sm">No nodes in this cluster</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {selectedCluster.nodes.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => handleNodeClick(node)}
                          className="px-8 py-6 hover:bg-gray-700 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-green-500 bg-gray-800/50 hover:bg-gray-700/80"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`
                              w-4 h-4 rounded-full flex-shrink-0 shadow-lg
                              ${getNodeStatusDot(node)}
                            `} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-100 truncate text-base">
                                {node.hostname || node.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

                                                               {/* Grid View */}
            <div className="flex-1 p-8 overflow-auto">
                {selectedNodeId ? (
                  // Node Details View
                  <div className="h-full">
                    <div className="mb-6">
                      <button
                        onClick={handleBackToGrid}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-gray-100 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Grid View
                      </button>
                    </div>
                    <NodeDetails nodeId={selectedNodeId} onBack={handleBackToGrid} />
                  </div>
                ) : (
                  // Grid View
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-gray-100 mb-3">{selectedCluster.name}</h2>
                      {selectedCluster.description && (
                        <p className="text-gray-400 text-lg">{selectedCluster.description}</p>
                      )}
                    </div>

                    {selectedCluster.nodes.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="text-xl font-bold text-gray-100 mb-3">No nodes in this cluster</div>
                        <div className="text-gray-400 mb-6 text-lg">Add some nodes to get started with monitoring</div>
                        <button
                          onClick={() => setIsCreateNodeModalOpen(true)}
                          className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add First Node
                        </button>
                      </div>
                    ) : (
                      <>
                                                <div className="flex justify-between items-center mb-8">
                          <div className="text-base text-gray-400 font-medium">
                            {selectedCluster.nodes.length} node{selectedCluster.nodes.length !== 1 ? 's' : ''} in this cluster
                          </div>
                          <button
                            onClick={() => setIsCreateNodeModalOpen(true)}
                            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Node
                          </button>
                        </div>
                        
                        <div className="node-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                          {selectedCluster.nodes.map((node) => (
                            <div
                              key={node.id}
                              onClick={() => handleNodeClick(node)}
                              onContextMenu={(e) => handleNodeRightClick(e, node)}
                              className={`node-card node-card-${getNodeStatusColor(node)} aspect-square rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform bg-gray-800 border-green-500 hover:border-green-400 relative overflow-hidden group ${node.is_alive ? 'ring-1 ring-green-500/20' : ''}`}
                            >
                              {/* Status indicator bar */}
                              <div className={`absolute top-0 left-0 right-0 h-1 ${node.is_alive ? 'bg-green-500' : 'bg-red-500'}`} />
                              
                              <div className="h-full flex flex-col justify-center items-center p-4 text-center relative">
                                {/* Status dot with glow effect */}
                                <div className={`status-dot status-dot-${getNodeStatusDot(node)} w-5 h-5 rounded-full mb-4 shadow-lg ${
                                  node.is_alive ? 'shadow-green-500/50 animate-pulse' : 'shadow-red-500/50'
                                }`} />
                                
                                <div className="node-name font-bold text-gray-100 truncate w-full mb-2 text-lg">
                                  {node.name}
                                </div>
                                
                                <div className="node-ip text-sm text-gray-400 truncate w-full mb-1">
                                  {node.ip_address || 'No IP assigned'}
                                </div>
                                
                                {node.hostname && (
                                  <div className="text-xs text-gray-500 truncate w-full mb-3">
                                    {node.hostname}
                                  </div>
                                )}
                                
                                <div className="mt-auto pt-3">
                                  <div className={`status-badge status-badge-${node.passing_unit_tests ? 'green' : 'red'} inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                    node.passing_unit_tests 
                                      ? 'bg-green-900 text-green-400 border border-green-700' 
                                      : 'bg-red-900 text-red-400 border border-red-700'
                                  }`}>
                                    {node.passing_unit_tests ? '✓ Tests Pass' : '✗ Tests Fail'}
                                  </div>
                                </div>
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
          </>
        )}
      </div>

            {/* Create Cluster Modal */}
      <CreateClusterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClusterCreated={handleClusterCreated}
      />

      {/* Create Node Modal */}
      {selectedCluster && (
        <CreateNodeModal
          isOpen={isCreateNodeModalOpen}
          onClose={() => setIsCreateNodeModalOpen(false)}
          onNodeCreated={handleNodeCreated}
          clusterId={selectedCluster.id}
          clusterName={selectedCluster.name}
        />
      )}

      {/* Edit Node Modal */}
      <EditNodeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setNodeToEdit(null);
        }}
        onNodeUpdated={handleNodeCreated}
        node={nodeToEdit}
      />

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.node && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
           <button
             onClick={handleEditNode}
             className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors duration-200 flex items-center space-x-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
             <span>Edit Node</span>
           </button>
           <button
             onClick={handleRefreshNode}
             className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors duration-200 flex items-center space-x-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             <span>Refresh Node</span>
           </button>
           <div className="border-t border-gray-700 my-1"></div>
           <button
             onClick={handleDeleteNode}
             className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200 flex items-center space-x-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
             <span>Delete Node</span>
           </button>
         </div>
       )}
     </div>
   );
} 
