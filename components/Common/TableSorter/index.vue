<template>
  <div class="ant-table-column-sorter" @click="handleChangeSorter">
    <a-icon type="caret-up" class="ant-table-column-sorter-up" :class="{ on: order == 'ascend' }" />
    <a-icon type="caret-down" class="ant-table-column-sorter-down mt-1" :class="{ on: order == 'descend' }" />
  </div>
</template>

<script>
const status = ["none", "ascend", "descend"];

export default {
  model: {
    prop: "order",
    event: "change"
  },
  props: {
    order: {
      type: String,
      default: "none"
    }
  },
  data() {
    return {};
  },
  methods: {
    handleChangeSorter() {
      let index = status.findIndex(e => e == this.order);
      index = (index + 1) % status.length;
      this.$emit("change", status[index]);
    }
  }
};
</script>

<style lang="less" scoped>
.ant-table-column-sorter {
  display: inline-block !important;

  padding: 0 !important;
  width: 14px;
  height: 17px;
  margin-top: -8.5px;
  text-align: center;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  color: grey;
  cursor: pointer;

  i {
    display: block;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
    transform: scale(0.91666667) rotate(0deg);
    height: 4px;
    line-height: 4px;
  }
}

.on {
  color: #1890ff;
}
</style>
