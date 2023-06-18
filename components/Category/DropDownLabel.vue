<template>
  <span ref="label-dropdown" class="dropdown">
    <a-icon type="tag" @click="isOpen = !isOpen" />

    <div class="dropdown-list" v-if="isOpen">
      <a-button>Hihi here is content</a-button>
    </div>
  </span>
</template>

<script>
export default {
  name: "DropDownLabel",
  data() {
    return {
      isOpen: false
    };
  },
  created() {
    window.addEventListener("click", this.checkClickOn);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.checkClickOn);
  },
  methods: {
    callToClose() {
      this.isOpen = false;
    },
    checkClickOn(event) {
      let wrapperContainer = this.$refs["label-dropdown"];
      if (!wrapperContainer.contains(event.target)) {
        this.isOpen = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dropdown {
  position: relative;
  width: fit-content;

  &-list {
    background: white;
    position: absolute;
    z-index: 10;
    border: 1px solid red;
    border-radius: 4px;
  }

  i {
    color: black;
  }
}
</style>
