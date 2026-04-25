<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result" :key="item.id">
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text" v-html="`${item.name}-${item.singer}`"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import NoResult from 'base/no-result/no-result'
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import {mapActions} from 'vuex'

  const perpage = 20

  export default {
    props: {
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        page: 1,
        pullup: true,
        beforeScroll: true,
        hasMore: true,
        result: [],
        total: 0
      }
    },
    methods: {
      refresh() {
        this.$refs.suggest.refresh()
      },
      search() {
        this.page = 1
        this.hasMore = true
        this.total = 0
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = res.songs.map((item) => createSong(item))
            this.total = res.total
            this._checkMore()
          }
        })
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(res.songs.map((item) => createSong(item)))
            this.total = res.total
            this._checkMore()
          }
        })
      },
      listScroll() {
        this.$emit('listScroll')
      },
      selectItem(item) {
        this.insertSong(item)
        this.$emit('select', item)
      },
      _checkMore() {
        this.hasMore = this.result.length < this.total
      },
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query(newQuery) {
        if (newQuery) {
          this.search()
        } else {
          this.result = []
          this.hasMore = false
        }
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
