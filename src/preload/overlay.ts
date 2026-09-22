import { contextBridge, ipcRenderer } from 'electron'
import { FlyoverPayload } from '../shared/types'

contextBridge.exposeInMainWorld('overlay', {
  onFlyover: (callback: (payload: FlyoverPayload) => void): void => {
    ipcRenderer.on('flyover:play', (_event, payload) => callback(payload))
  },
  notifyComplete: (): void => ipcRenderer.send('flyover:complete')
})
