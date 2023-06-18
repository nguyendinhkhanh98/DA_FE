<template>
  <div class="sider-qcd-container">
    <div class="text-center logo">
      <i class="fab fa-jira"></i>
      <span v-show="!collapsed" class="ml-1 title-ellipsis">Jira QCD</span>
    </div>

    <a-divider class="m-0 sider-qcd-item" style="background: rgba(255, 255, 255, 0.25);"></a-divider>

    <div class="sider-qcd-item sider-qcd-menu">
      <a-menu :value="null" mode="vertical" theme="dark" class="w-100">
        <a-menu-item v-if="isRender('home')" ref="home">
          <nuxt-link to="/">
            <a-icon type="dashboard" />
            <span>{{ $t("dashboard") }}</span>
          </nuxt-link>
        </a-menu-item>

        <template v-for="menu of currentHistory">
          <a-menu-item v-if="isRender(menu.key)" :ref="menu.key" :key="menu.key">
            <nuxt-link :to="menu.link">
              <a-icon v-if="menu['a-icon']" :type="menu['a-icon']" />
              <i v-else :class="menu.icon" class="custom-icon"></i>
              <span>{{ $t(menu.name) }}</span>
            </nuxt-link>
          </a-menu-item>
        </template>
      </a-menu>
    </div>

    <a-divider class="m-0 sider-qcd-item" style="background: rgba(255, 255, 255, 0.25);"></a-divider>

    <div class="sider-qcd-item sider-qcd-trigger text-center w-100" @click="$emit('change-collapsed')">
      <a-icon :type="collapsed ? 'double-right' : 'double-left'" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import author from "@/utils/author";

export default {
  props: {
    collapsed: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      currentHistory: state => state.currentHistory
    }),
    ...mapGetters({
      role: "role"
    })
  },
  methods: {
    isRender(screenKey) {
      if (!author[screenKey]) return true;
      let permissions = author[screenKey]["view-access"];
      // find with array permission or user
      for (const key in permissions) {
        if (permissions[key] == 1 && this.role.indexOf(key) >= 0) return true;
      }
      return false;
    }
  }
};
</script>

<style lang="less" scoped>
.sider-qcd-container {
  height: 100%;

  .logo {
    height: 48px;
    margin: 16px;
    color: aliceblue;
    font-size: 28px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .title-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sider-qcd-trigger {
    color: white;
    height: 48px;
    line-height: 48px;
    background-color: #002140;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sider-qcd-item {
    display: block;
  }

  .sider-qcd-menu {
    // https://css-tricks.com/custom-scrollbars-in-webkit/

    height: calc(100% - 74px - 48px - 2px);
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>

<style lang="less">
.ant-menu-item {
  .custom-icon {
    margin: 0;
    font-size: 16px;
    line-height: 40px;

    & + span {
      opacity: 1;
      transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
  }
}

.ant-menu-inline-collapsed > .ant-menu-item {
  .custom-icon {
    margin: 0;
    font-size: 16px;
    line-height: 40px;

    & + span {
      display: inline-block;
      max-width: 0;
      opacity: 0;
    }
  }
}

.ant-menu.ant-menu-dark .ant-menu-item-selected {
  background-color: #001529;
}
</style>
