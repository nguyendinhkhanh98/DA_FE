<template>
  <span class="ant-input-search ant-input-search-enter-button ant-input-group-wrapper">
    <div class="ant-input-wrapper ant-input-group">
      <input class="ant-input" :placeholder="$t('search')" :value="value" @change="onChangeSearchInput($event)" />
      <span class="ant-input-group-addon">
        <button class="ant-btn ant-btn-primary ant-input-search-button">
          <a-icon type="search" />
        </button>
      </span>
    </div>
  </span>
</template>

<script>
export default {
  name: "CustomInput",
  props: {
    value: String
  },
  methods: {
    onChangeSearchInput(e) {
      this.$emit("change", e.target.value);
    }
  }
};
</script>
