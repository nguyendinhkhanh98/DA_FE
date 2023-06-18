<template>
  <a-dropdown placement="bottomRight" :trigger="['click']">
    <a-tooltip placement="topLeft">
      <template slot="title">
        <span>{{ $t("toggle_column") }}</span>
      </template>
      <a-button type="primary" ghost class="span-toggle-columns">
        <i class="fas fa-table mr-1"></i>
      </a-button>
    </a-tooltip>
    <a-menu slot="overlay">
      <a-row
        class="ml-2 mr-2"
        v-for="(column, index) of plainOptions.filter(item => item.slots.title || item.title)"
        :key="column.key"
      >
        <a-checkbox :checked="column.checked" @change="onChange($event, column, index)">{{
          $t(column.title) || $t(column.slots.title)
        }}</a-checkbox>
      </a-row>
    </a-menu>
  </a-dropdown>
</template>
<script>
export default {
  props: {
    columns: { type: Array, default: () => [] }
  },
  data() {
    return {
      plainOptions: _.cloneDeep(this.columns).map(item => {
        item.checked = item.defaultChecked === false ? false : true;
        return item;
      })
    };
  },
  mounted() {},
  methods: {
    onChange(e, column, index) {
      this.plainOptions[index].checked = e.target.checked;
      let selectedColumns = this.columns.filter(column => {
        for (const option of this.plainOptions) {
          if (option.key === column.key) {
            return option.checked;
          }
        }
        return false;
      });
      this.$emit("change", selectedColumns);
    }
  }
};
</script>
<style lang="less" scoped>
.span-toggle-columns {
  @media (max-width: 767px) {
    & span {
      display: none;
    }

    & i {
      margin: 0px !important;
    }
  }
}
</style>
