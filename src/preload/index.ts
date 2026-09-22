import { contextBridge, ipcRenderer } from 'electron'
import { AppSettings } from '../shared/types'

contextBridge.exposeInMainWorld('meetingfly', {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Partial<AppSettings>): Promise<void> =>
    ipcRenderer.invoke('settings:save', settings),
  previewFlyover: (settings?: AppSettings): void => ipcRenderer.send('flyover:preview', settings),
  readImageAsDataUrl: (path: string): Promise<string | null> =>
    ipcRenderer.invoke('files:toDataUrl', path),
  openUrl: (url: string): void => ipcRenderer.send('shell:openExternal', url),
  pickFile: (opts: {
    title: string
    filters: Array<{ name: string; extensions: string[] }>
  }): Promise<string | null> => ipcRenderer.invoke('dialog:pickFile', opts),
  calendar: {
    getStatus: (): Promise<{ google: boolean; microsoft: boolean }> =>
      ipcRenderer.invoke('calendar:status'),
    connectGoogle: (clientId: string, clientSecret: string): Promise<void> =>
      ipcRenderer.invoke('calendar:google:connect', { clientId, clientSecret }),
    disconnectGoogle: (): Promise<void> => ipcRenderer.invoke('calendar:google:disconnect'),
    connectMicrosoft: (clientId: string): Promise<void> =>
      ipcRenderer.invoke('calendar:microsoft:connect', { clientId }),
    disconnectMicrosoft: (): Promise<void> => ipcRenderer.invoke('calendar:microsoft:disconnect')
  }
})
