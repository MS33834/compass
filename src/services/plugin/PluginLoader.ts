import {
  Plugin,
  PluginConfig,
  PluginAPI,
  PluginManifest
} from '../../types/plugin';
import { pluginRegistry } from './PluginRegistry';
import { storage } from '../../lib/utils';

const PLUGIN_CACHE_KEY = 'plugin_cache';

export class PluginLoader {
  private loadedPlugins: Map<string, Plugin> = new Map();
  private pluginCache: Map<string, any> = new Map();
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.loadPluginCache();
  }

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      console.log('Initializing plugin system...');
      await this.loadBuiltInPlugins();
      console.log('Plugin system initialized');
    })();

    return this.initializationPromise;
  }

  private async loadBuiltInPlugins(): Promise<void> {
    const builtInPlugins = this.getBuiltInPlugins();
    
    for (const pluginConfig of builtInPlugins) {
      try {
        const plugin = await this.createPluginInstance(pluginConfig);
        if (plugin) {
          pluginRegistry.registerPlugin(plugin);
        }
      } catch (error) {
        console.error(`Failed to load plugin ${pluginConfig.id}:`, error);
      }
    }
  }

  private getBuiltInPlugins(): PluginConfig[] {
    return [
      {
        id: 'big-five-personality',
        name: '大五人格测评',
        description: '标准大五人格测试，包含60道题目',
        version: '1.0.0',
        author: 'BadHope Team',
        type: 'assessment',
        dependencies: [],
        permissions: ['read_data', 'write_data'],
        enabled: true,
        autoLoad: true,
        metadata: {}
      },
      {
        id: 'stress-test',
        name: '压力水平测试',
        description: '压力测评和分析工具',
        version: '1.0.0',
        author: 'BadHope Team',
        type: 'assessment',
        dependencies: [],
        permissions: ['read_data', 'write_data'],
        enabled: true,
        autoLoad: true,
        metadata: {}
      },
      {
        id: 'gad7-anxiety',
        name: 'GAD-7焦虑测试',
        description: 'GAD-7焦虑测评量表',
        version: '1.0.0',
        author: 'BadHope Team',
        type: 'assessment',
        dependencies: [],
        permissions: ['read_data', 'write_data'],
        enabled: true,
        autoLoad: true,
        metadata: {}
      },
      {
        id: 'mindfulness-training',
        name: '正念训练',
        description: '正念冥想和放松训练模块',
        version: '1.0.0',
        author: 'BadHope Team',
        type: 'training',
        dependencies: [],
        permissions: ['read_data'],
        enabled: true,
        autoLoad: true,
        metadata: {}
      },
      {
        id: 'theme-system',
        name: '主题系统',
        description: 'UI主题和样式管理',
        version: '1.0.0',
        author: 'BadHope Team',
        type: 'ui',
        dependencies: [],
        permissions: ['read_config'],
        enabled: true,
        autoLoad: true,
        metadata: {}
      }
    ];
  }

  private async createPluginInstance(config: PluginConfig): Promise<Plugin | null> {
    const api = this.createPluginAPI(config);

    const plugin: Plugin = {
      ...config,
      onInstall: async () => {
        console.log(`Installing plugin: ${config.id}`);
      },
      onUninstall: async () => {
        console.log(`Uninstalling plugin: ${config.id}`);
      },
      onActivate: async () => {
        console.log(`Activating plugin: ${config.id}`);
      },
      onDeactivate: async () => {
        console.log(`Deactivating plugin: ${config.id}`);
      },
      assessments: config.type === 'assessment' ? {} : undefined,
      trainings: config.type === 'training' ? {} : undefined,
      uiComponents: config.type === 'ui' ? {} : undefined,
      hooks: {},
      services: {}
    };

    return plugin;
  }

  private createPluginAPI(config: PluginConfig): PluginAPI {
    return {
      getConfig: () => ({ ...config }),
      getState: () => pluginRegistry.getPluginState(config.id),
      setState: (state: any) => {
        pluginRegistry.updatePluginState(config.id, state);
      },
      log: (message: string, level = 'info') => {
        console.log(`[${config.id}] [${level.toUpperCase()}] ${message}`);
      },
      getService: (name: string) => {
        const activePlugins = pluginRegistry.getActivePlugins();
        for (const plugin of activePlugins) {
          if (plugin.services && plugin.services[name]) {
            return plugin.services[name];
          }
        }
        return null;
      },
      registerComponent: (name: string, component: any) => {
        console.log(`Registering component: ${name} for plugin ${config.id}`);
      },
      registerHook: (name: string, hook: any) => {
        console.log(`Registering hook: ${name} for plugin ${config.id}`);
      },
      registerService: (name: string, service: any) => {
        console.log(`Registering service: ${name} for plugin ${config.id}`);
      }
    };
  }

  async loadPlugin(pluginId: string): Promise<Plugin | null> {
    const cached = this.loadedPlugins.get(pluginId);
    if (cached) {
      return cached;
    }

    const plugin = pluginRegistry.getPlugin(pluginId);
    if (!plugin) {
      return null;
    }

    if (plugin.onLoad) {
      try {
        await plugin.onLoad();
      } catch (error) {
        console.error(`Error in onLoad for ${pluginId}:`, error);
      }
    }

    if (plugin.onReady) {
      try {
        await plugin.onReady();
      } catch (error) {
        console.error(`Error in onReady for ${pluginId}:`, error);
      }
    }

    this.loadedPlugins.set(pluginId, plugin);
    return plugin;
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    if (this.loadedPlugins.has(pluginId)) {
      this.loadedPlugins.delete(pluginId);
    }
  }

  getLoadedPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  isLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }

  private loadPluginCache(): void {
    try {
      const cached = storage.get(PLUGIN_CACHE_KEY, null);
      if (cached && typeof cached === 'object') {
        this.pluginCache = new Map(Object.entries(cached));
      }
    } catch (e) {
      console.warn('Failed to load plugin cache');
    }
  }

  private savePluginCache(): void {
    try {
      const toSave = Object.fromEntries(this.pluginCache.entries());
      storage.set(PLUGIN_CACHE_KEY, toSave);
    } catch (e) {
      console.error('Failed to save plugin cache');
    }
  }

  setCache(key: string, value: any): void {
    this.pluginCache.set(key, value);
    this.savePluginCache();
  }

  getCache(key: string): any {
    return this.pluginCache.get(key);
  }

  clearCache(): void {
    this.pluginCache.clear();
    this.savePluginCache();
  }

  async loadAllPlugins(): Promise<void> {
    const allPlugins = pluginRegistry.getAllPlugins();
    for (const plugin of allPlugins) {
      if (pluginRegistry.isPluginActive(plugin.id)) {
        await this.loadPlugin(plugin.id);
      }
    }
  }
}

export const pluginLoader = new PluginLoader();
