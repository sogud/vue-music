import { contextBridge } from 'electron'
import { otodeskApi } from './api'

contextBridge.exposeInMainWorld('otodesk', otodeskApi)
