<template>
  <a-sub-menu
    v-if="menuItemData?.items && menuItemData?.items.length && isRender(menuItemData.key)"
    :ref="menuItemData.key"
    :key="menuItemData.key"
  >
    <span slot="title" :class="{ 'mr-3': !parentNode, 'menu-title': true }">
      <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
      <i v-else :class="menuItemData.icon"></i>
      <span :class="{ 'sider-text-header': parentNode }">
        <span>{{ $t(menuItemData.name) }}</span>
        <i v-if="parentNode && !isOnMobile" class="fas fa-angle-down ml-1"></i>
      </span>
    </span>
    <sider-node v-for="item of menuItemData?.items" :key="item.key" :menuItemData="item" :role="role" />
  </a-sub-menu>

  <a-menu-item
    v-else-if="isRender(menuItemData.key) && !menuItemData?.items.length"
    :ref="menuItemData.key"
    :key="`${menuItemData.key}`"
  >
    <nuxt-link class="menu-title" v-if="menuItemData.link" :to="menuItemData.link">
      <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
      <i v-else :class="menuItemData.icon"></i>
      <span :class="{ 'sider-text-header': parentNode }">{{ $t(menuItemData.name) }}</span>
    </nuxt-link>
    <span v-else @click="sendWorklogToSlack">
      <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
      <i v-else :class="menuItemData.icon"></i>
      <span :class="{ 'sider-text-header': parentNode }">{{ $t(menuItemData.name) }}</span>
    </span>
  </a-menu-item>
</template>

<script>
import author from "@/utils/author";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "SiderNode",
  props: {
    menuItemData: Object,
    role: Array,
    parentNode: Boolean,
    isOnMobile: Boolean
  },
  data() {
    return {
      optionsPanel: null
    };
  },
  computed: {
    ...mapGetters({
      roleUser: "role"
    })
  },
  methods: {
    ...mapActions({
      sendWorklogTableToSlack: "modules/slack-integration/sendWorklogTableToSlack"
    }),
    isRender(screenKey) {
      if ((screenKey == "project-role-config" || screenKey == "create-task") && !this.roleUser.includes("admin"))
        return false;

      if (!author[screenKey]) return true;
      let permissions = author[screenKey]["view-access"];

      // find with array permission or user
      for (const key in permissions) {
        if (permissions[key] == 1 && this.role.indexOf(key) >= 0) return true;
      }
      return false;
    },
    async sendWorklogToSlack() {
      this.$confirm({
        title: "Are you sure you want to send worklog report to the designated Slack channel?",
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk: async () => {
          this.$notification.info({ message: "Sending worklog data to slack ...", duration: 0, key: "sending-msg" });

          let res = await this.sendWorklogTableToSlack();
          this.$notification.info({ message: res.data });
          this.$notification.close("sending-msg");
        },
        onCancel() {}
      });
    }
  },
  created() {
    console.log("menuItemData", this.menuItemData);
  }
};
</script>

<style lang="less" scoped>
.sider-text-header {
  font-size: inherit;
  font-style: normal;
  font-weight: 700;
  color: #001529a6;
}
</style>
