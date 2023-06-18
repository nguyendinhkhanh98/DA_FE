<template>
  <a-menu :mode="mode">
    <!-- sider node -->
    <template v-for="menuItemData of siders">
      <a-sub-menu
        v-if="menuItemData.items && menuItemData.items.length && isRender(menuItemData.key)"
        :ref="menuItemData.key"
        :key="menuItemData.key"
      >
        <span slot="title">
          <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
          <i v-else :class="menuItemData.icon"></i>
          <span class="sider-text">{{ $t(menuItemData.name) }} <i class="fas fa-angle-down ml-1"></i></span>
        </span>

        <!-- sider node -->
        <template v-for="subItem of menuItemData.items">
          <a-sub-menu
            v-if="subItem.items && subItem.items.length && isRender(subItem.key)"
            :ref="subItem.key"
            :key="subItem.key"
          >
            <span slot="title">
              <a-icon v-if="subItem['a-icon']" :type="subItem['a-icon']" />
              <i v-else :class="subItem.icon"></i>
              <span>{{ $t(subItem.name) }}</span>
            </span>

            <!-- sider node -->
            <template v-for="littleItem of subItem.items">
              <a-sub-menu
                v-if="littleItem.items && littleItem.items.length && isRender(littleItem.key)"
                :ref="littleItem.key"
                :key="littleItem.key"
              >
                <span slot="title">
                  <a-icon v-if="littleItem['a-icon']" :type="littleItem['a-icon']" />
                  <i v-else :class="littleItem.icon"></i>
                  <span>{{ $t(littleItem.name) }}</span>
                </span>

                <template v-for="item of littleItem.items">
                  <sider-node :littleItem="item" :key="item.key" :role="role" />
                </template>
              </a-sub-menu>

              <a-menu-item v-else-if="isRender(littleItem.key)" :ref="littleItem.key" :key="littleItem.key">
                <nuxt-link :to="littleItem.link">
                  <a-icon v-if="littleItem['a-icon']" :type="littleItem['a-icon']" />
                  <i v-else :class="littleItem.icon"></i>
                  <span>{{ $t(littleItem.name) }}</span>
                </nuxt-link>
              </a-menu-item>
            </template>
          </a-sub-menu>

          <a-menu-item v-else-if="isRender(subItem.key)" :ref="subItem.key" :key="subItem.key">
            <nuxt-link :to="subItem.link">
              <a-icon v-if="subItem['a-icon']" :type="subItem['a-icon']" />
              <i v-else :class="subItem.icon"></i>
              <span>{{ $t(subItem.name) }}</span>
            </nuxt-link>
          </a-menu-item>
        </template>
      </a-sub-menu>

      <a-menu-item v-else-if="isRender(menuItemData.key)" :ref="menuItemData.key" :key="menuItemData.key">
        <nuxt-link :to="menuItemData.link">
          <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
          <i v-else :class="menuItemData.icon"></i>
          <span class="sider-text">{{ $t(menuItemData.name) }}</span>
        </nuxt-link>
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script>
import author from "@/utils/author";
import siders from "@/utils/sider";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      siders
    };
  },

  props: {
    mode: String
  },
  computed: {
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
.sider-text {
  font-size: inherit;
  font-style: normal;
  font-weight: 700;
  color: #001529a6;
}
</style>
