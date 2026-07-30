import { registerSW } from 'virtual:pwa-register'

export const updateSW = registerSW({

  immediate: true,

  onNeedRefresh() {

    updateSW(true)

  },

  onOfflineReady() {

    console.log('App ready for offline use.')

  }

})