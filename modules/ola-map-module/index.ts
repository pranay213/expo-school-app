// Reexport the native module. On web, it will be resolved to OlaMapModule.web.ts
// and on native platforms to OlaMapModule.ts
export { default } from './src/OlaMapModule';
export { default as OlaMapModuleView } from './src/OlaMapModuleView';
export * from  './src/OlaMapModule.types';
