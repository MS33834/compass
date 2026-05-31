export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  type: 'assessment' | 'training' | 'ui' | 'core';
  dependencies: string[];
  permissions: string[];
  enabled: boolean;
  autoLoad: boolean;
  metadata: Record<string, any>;
}

export interface PluginLifecycle {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onUpdate?: (oldVersion: string, newVersion: string) => Promise<void>;
  onLoad?: () => Promise<void>;
  onReady?: () => Promise<void>;
}

export interface PluginComponents {
  assessments?: Record<string, any>;
  trainings?: Record<string, any>;
  uiComponents?: Record<string, any>;
  hooks?: Record<string, any>;
  services?: Record<string, any>;
}

export interface PluginHooks {
  beforeAssessment?: (data: any) => any;
  afterAssessment?: (result: any) => any;
  beforeRender?: (context: any) => any;
  afterRender?: (result: any) => any;
  onCalculate?: (answers: any) => any;
  onGenerateReport?: (data: any) => any;
  onSave?: (data: any) => Promise<void>;
  onLoad?: (data: any) => Promise<any>;
}

export interface PluginAPI {
  getConfig: () => PluginConfig;
  getState: () => any;
  setState: (state: any) => void;
  log: (message: string, level?: 'info' | 'warn' | 'error' | 'debug') => void;
  getService: (name: string) => any;
  registerComponent: (name: string, component: any) => void;
  registerHook: (name: string, hook: any) => void;
  registerService: (name: string, service: any) => void;
}

export interface BasePlugin extends PluginConfig, PluginLifecycle {
  [key: string]: any;
}

export type Plugin = BasePlugin;

export interface PluginRegistry {
  plugins: Map<string, Plugin>;
  activePlugins: Set<string>;
  pluginStates: Map<string, any>;
}

export interface PluginManifest {
  version: string;
  plugins: PluginConfig[];
  globalSettings: {
    autoLoadDefaults: boolean;
    sandboxMode: boolean;
    strictPermissions: boolean;
  };
  theme: any;
}

export interface PluginError {
  pluginId: string;
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface PluginEvent {
  type: 'install' | 'uninstall' | 'activate' | 'deactivate' | 'update' | 'error';
  pluginId: string;
  data?: any;
  timestamp: number;
}
