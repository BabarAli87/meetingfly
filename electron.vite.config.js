"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const electron_vite_1 = require("electron-vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
exports.default = (0, electron_vite_1.defineConfig)({
    main: {
        plugins: [(0, electron_vite_1.externalizeDepsPlugin)()]
    },
    preload: {
        plugins: [(0, electron_vite_1.externalizeDepsPlugin)()],
        build: {
            rollupOptions: {
                input: {
                    index: (0, node_path_1.resolve)(__dirname, 'src/preload/index.ts'),
                    overlay: (0, node_path_1.resolve)(__dirname, 'src/preload/overlay.ts')
                }
            }
        }
    },
    renderer: {
        plugins: [(0, plugin_react_1.default)()],
        build: {
            rollupOptions: {
                input: {
                    settings: (0, node_path_1.resolve)(__dirname, 'src/renderer/settings/index.html'),
                    overlay: (0, node_path_1.resolve)(__dirname, 'src/renderer/overlay/index.html')
                }
            }
        }
    }
});
