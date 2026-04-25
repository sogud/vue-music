<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import {defineComponent} from 'vue'
import MHeader from 'components/m-header/m-header'
import Player from 'components/player/player'
import Tab from 'components/tab/tab'

export default defineComponent({
  name: 'AppRoot',
  components: {
    MHeader,
    Tab,
    Player
  },
  setup() {
    return {}
  }
})
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
