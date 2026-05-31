import { useState, useEffect } from 'react';
import { Plugin, PluginConfig } from '../../types/plugin';
import { pluginRegistry } from '../../services/plugin/PluginRegistry';
import { pluginLoader } from '../../services/plugin/PluginLoader';

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activePlugins, setActivePlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    const allPlugins = pluginRegistry.getAllPlugins();
    const activeIds = Array.from(pluginRegistry.getActivePlugins().map(p => p.id));
    
    setPlugins(allPlugins);
    setActivePlugins(activeIds);
    setLoading(false);
  };

  const handleTogglePlugin = async (pluginId: string) => {
    const isActive = activePlugins.includes(pluginId);
    
    if (isActive) {
      const success = pluginRegistry.deactivatePlugin(pluginId);
      if (success) {
        await pluginLoader.unloadPlugin(pluginId);
      }
    } else {
      const success = pluginRegistry.activatePlugin(pluginId);
      if (success) {
        await pluginLoader.loadPlugin(pluginId);
      }
    }
    
    loadPlugins();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      assessment: 'bg-blue-100 text-blue-800',
      training: 'bg-green-100 text-green-800',
      ui: 'bg-purple-100 text-purple-800',
      core: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      assessment: '📊',
      training: '💪',
      ui: '🎨',
      core: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载插件系统...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">插件管理中心</h1>
            <p className="text-indigo-100">管理系统插件，扩展功能</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-1">🧩</div>
            <div className="text-sm opacity-90">
              {plugins.length} 个插件 • {activePlugins.length} 个激活
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PluginStatCard 
          title="总插件数"
          value={plugins.length}
          icon="📦"
          color="bg-blue-500"
        />
        <PluginStatCard 
          title="激活插件"
          value={activePlugins.length}
          icon="✅"
          color="bg-green-500"
        />
        <PluginStatCard 
          title="待激活"
          value={plugins.length - activePlugins.length}
          icon="⏸️"
          color="bg-yellow-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">插件列表</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {plugins.map(plugin => (
            <div key={plugin.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">
                    {getTypeIcon(plugin.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plugin.type)}`}>
                        {plugin.type}
                      </span>
                      <span className="text-gray-500 text-sm">v{plugin.version}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{plugin.description}</p>
                    <p className="text-sm text-gray-500 mt-2">作者: {plugin.author}</p>
                    
                    {plugin.dependencies.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-500">依赖: </span>
                        {plugin.dependencies.map(dep => (
                          <span key={dep} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs mr-1">
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {plugin.permissions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">权限: </span>
                        {plugin.permissions.map(perm => (
                          <span key={perm} className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs mr-1">
                            {perm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activePlugins.includes(plugin.id)}
                      onChange={() => handleTogglePlugin(plugin.id)}
                      disabled={!plugin.enabled}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!plugin.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                  
                  {!plugin.enabled && (
                    <span className="text-xs text-gray-400">已禁用</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {plugins.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无插件</h3>
          <p className="text-gray-500">插件系统初始化中，请稍后再试</p>
        </div>
      )}
    </div>
  );
}

function PluginStatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-6 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-white/90 text-sm">{title}</div>
    </div>
  );
}
