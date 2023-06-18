<template>
  <div class="tag-tooltip">
    <span class="text-overflow-dynamic-container" ref="container">
      <a-tooltip :getPopupContainer="getPopupContainer" placement="bottomLeft">
        <template slot="title">
          <span v-for="tag in listTags" :key="tag.id">
            <a-tag :color="'#0052cc'" class="m-1">
              {{ tag.name }}
            </a-tag>
          </span>
        </template>
        <span class="text-overflow-dynamic-ellipsis">
          <span v-for="tag in listTags" :key="tag.id">
            <a-tag :color="'#0052cc'">
              {{ tag.name }}
            </a-tag>
          </span>
        </span>
      </a-tooltip>
      <span
        class="text-overflow-dynamic-ellipsis"
        style="max-width: none; width: max-content; visibility: hidden"
        ref="fullSize"
      >
        <span v-for="tag in listTags" :key="tag.id">
          <a-tag :color="'#0052cc'">
            {{ tag.name }}
          </a-tag>
        </span>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  name: "tag-tooltip",
  props: {
    listTags: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isOverflow: false
    };
  },
  methods: {
    getPopupContainer(trigger) {
      return trigger.parentNode.parentNode;
    },
    onResize(e) {
      this.isOverflow = this.$refs.fullSize.clientWidth >= this.$refs.container.clientWidth;
    }
  },
  mounted() {
    this.isOverflow = this.$refs.fullSize.clientWidth >= this.$refs.container.clientWidth;
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>