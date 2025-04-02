// preload.ts
import { contextBridge } from "electron";
import { enable, initialize } from "@electron/remote/main";

// Initialize and enable @electron/remote
initialize();
enable();

// If you need to expose any APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
	// Add any APIs you want to expose here
});
