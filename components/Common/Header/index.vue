<template>
  <a-row class="header-content">
    <div class="ant-col-xs-0 ant-col-sm-0 ant-col-md-18 ant-col-lg-19 ant-col-xl-19 ant-col-xxl-20 menu-header">
      <a-menu mode="horizontal" class="w-30" v-for="menuItemData of siders" :key="menuItemData.key">
        <!-- <SiderNode v-for="menu of siders" :menuItemData="menu" :role="role" :key="menu.key" :parent-node="true" /> -->
        <a-sub-menu
          v-if="menuItemData?.items && menuItemData?.items?.length && isRender(menuItemData.key)"
          :ref="menuItemData.key"
          :key="menuItemData.key"
        >
          <span slot="title" :class="{ 'mr-3': !parentNode, 'menu-title': true }">
            <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
            <i v-else :class="menuItemData.icon"></i>
            <span :class="{ 'sider-text-header': parentNode }">
              <span>{{ $t(menuItemData.name) }}</span>
            </span>
          </span>
          <!-- eslint-disable -->
          <a-sub-menu
            v-for="item of menuItemData?.items"
            :key="item.key"
            v-if="isRender(item.key) && item?.items?.length"
            :ref="item.key"
          >
            <a-menu-item class="menu-title" v-if="item.link" :to="item.link">
              <a-icon v-if="item['a-icon']" :type="item['a-icon']" />
              <i v-else :class="item.icon"></i>
              <span :class="{ 'sider-text-header': parentNode }">{{ $t(item.name) }}</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else-if="isRender(item.key) && !item?.items?.length" :ref="item.key" :key="`${item.key}`">
            <nuxt-link class="menu-title" v-if="item.link" :to="item.link">
              <a-icon v-if="item['a-icon']" :type="item['a-icon']" />
              <i v-else :class="item.icon"></i>
              <span :class="{ 'sider-text-header': parentNode }">{{ $t(item.name) }}</span>
            </nuxt-link>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item
          v-else-if="isRender(menuItemData.key) && !menuItemData?.items?.length"
          :ref="menuItemData.key"
          :key="`${menuItemData.key}`"
        >
          <nuxt-link class="menu-title" v-if="menuItemData.link" :to="menuItemData.link">
            <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
            <i v-else :class="menuItemData.icon"></i>
            <span :class="{ 'sider-text-header': parentNode }">{{ $t(menuItemData.name) }}</span>
          </nuxt-link>
        </a-menu-item>
      </a-menu>
    </div>

    <div
      class="ant-col-xs-24 ant-col-sm-24 ant-col-md-6 ant-col-lg-5 ant-col-xl-5 ant-col-xxl-4 header-left right-tool-bar"
    >
      <a-button
        class="ant-btn ant-col-md-0"
        @click="isDrawerVisible = !isDrawerVisible"
        style="color: white; position: absolute; top: 7px; left: 4px"
      >
        <i style="color: rgba(0, 0, 0, 0.65)" class="fa fa-align-justify" />
      </a-button>

      <a-dropdown class="mt-2 mr-2">
        <a-menu slot="overlay" @click="onChangeLanguage">
          <!-- <a-menu-item key="ja"> <a-icon :component="Ja" />日本語 </a-menu-item> -->
          <a-menu-item key="vi"> <a-icon :component="Vi" />Tiếng Việt </a-menu-item>
          <a-menu-item key="en"> <a-icon :component="En" />English </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> {{ $t("language") }} </a-button>
      </a-dropdown>

      <a-dropdown class="mt-2" overlayClassName="cust-menu" :trigger="['click']">
        <!-- <a-menu slot="overlay" mode="horizontal">
          <SiderNode
            v-for="company of companyNav"
            :menuItemData="company"
            :role="role"
            :key="company.key"
            :parent-node="false"
        /></a-menu> -->

        <!-- eslint-disable -->
        <a-menu mode="horizontal" slot="overlay">
          <a-sub-menu
            v-if="menuItemData?.items && menuItemData?.items?.length && isRender(menuItemData.key)"
            :ref="menuItemData.key"
            v-for="menuItemData of companyNav"
            :key="menuItemData.key"
          >
            <span slot="title" :class="{ 'mr-3': !parentNode, 'menu-title': true }">
              <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
              <i v-else :class="menuItemData.icon"></i>
              <span :class="{ 'sider-text-header': parentNode }">
                <span>{{ $t(menuItemData.name) }}</span>
              </span>
            </span>
            <a-sub-menu
              v-for="item of menuItemData?.items"
              :key="item.key"
              v-if="isRender(item.key) && item?.items?.length"
              :ref="item.key"
            >
              <span slot="title" :class="{ 'mr-3': !parentNode, 'menu-title': true }">
                <a-icon v-if="item['a-icon']" :type="item['a-icon']" />
                <i v-else :class="item.icon"></i>
                <span :class="{ 'sider-text-header': parentNode }">
                  <span>{{ $t(item.name) }}</span>
                </span>
              </span>

              <!-- level 3 -->

              <a-sub-menu v-for="i of item?.items" :key="i.key" v-if="isRender(i.key) && i?.items?.length" :ref="i.key">
                <a-menu-item class="menu-title" v-if="i.link" :to="i.link">
                  <a-icon v-if="i['a-icon']" :type="i['a-icon']" />
                  <i v-else :class="i.icon"></i>
                  <span :class="{ 'sider-text-header': parentNode }">{{ $t(i.name) }}</span>
                </a-menu-item>
              </a-sub-menu>
              <a-menu-item v-else-if="isRender(i.key) && !i?.items?.length" :ref="i.key" :key="`${i.key}`">
                <nuxt-link class="menu-title" v-if="i.link" :to="i.link">
                  <a-icon v-if="i['a-icon']" :type="i['a-icon']" />
                  <i v-else :class="i.icon"></i>
                  <span :class="{ 'sider-text-header': parentNode }">{{ $t(i.name) }}</span>
                </nuxt-link>
              </a-menu-item>
              <!-- end -->
            </a-sub-menu>
            <a-menu-item v-else-if="isRender(item.key) && !item?.items?.length" :ref="item.key" :key="`${item.key}`">
              <nuxt-link class="menu-title" v-if="item.link" :to="item.link">
                <a-icon v-if="item['a-icon']" :type="item['a-icon']" />
                <i v-else :class="item.icon"></i>
                <span :class="{ 'sider-text-header': parentNode }">{{ $t(item.name) }}</span>
              </nuxt-link>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item
            v-else-if="isRender(menuItemData.key) && !menuItemData?.items?.length"
            :ref="menuItemData.key"
            :key="`${menuItemData.key}`"
          >
            <nuxt-link class="menu-title" v-if="menuItemData.link" :to="menuItemData.link">
              <a-icon v-if="menuItemData['a-icon']" :type="menuItemData['a-icon']" />
              <i v-else :class="menuItemData.icon"></i>
              <span :class="{ 'sider-text-header': parentNode }">{{ $t(menuItemData.name) }}</span>
            </nuxt-link>
          </a-menu-item>
        </a-menu>

        <a-tooltip title="Admin area" :getPopupContainer="a => a.parentNode">
          <a-button style="margin-left: 8px" icon="bank" shape="circle" />
        </a-tooltip>
      </a-dropdown>

      <a-menu @click="onClickMenu" mode="horizontal">
        <template v-for="menu of headers">
          <template v-if="menu.items && menu.items.length">
            <a-sub-menu :style="menu.position ? { float: 'right' } : {}" :key="menu.key">
              <span slot="title">
                {{ userFullName }}
              </span>
              <template v-for="item of menu.items">
                <template v-if="item.subItems && item.subItems.length">
                  <a-sub-menu :key="item.key">
                    <span slot="title" class="title mr-3">
                      <i :class="item.icon"></i>
                      {{ $t(item.name) }}
                    </span>
                    <a-menu-item v-for="subItem in item.subItems" :key="subItem.key">
                      <nuxt-link :to="subItem.link">
                        <i :class="subItem.icon"></i>
                        {{ $t(subItem.name) }}
                      </nuxt-link>
                    </a-menu-item>
                  </a-sub-menu>
                </template>
                <template v-else>
                  <a-menu-item :key="item.key">
                    <template v-if="item.key === 'language'">
                      <i :class="item.icon"></i>
                      {{ $t(item.name) }}:
                      <a-tooltip placement="bottom" :title="$t('en')">
                        <img class="mr-1" src="@/static/img/en-flag.png" @click="onChangeLanguage('en')" />
                      </a-tooltip>
                      <a-tooltip placement="bottom" :title="$t('ja')">
                        <img class="mr-1" src="@/static/img/ja-flag.png" @click="onChangeLanguage('ja')" />
                      </a-tooltip>
                    </template>
                    <nuxt-link v-else :to="item.link">
                      <i :class="item.icon"></i>
                      {{ $t(item.name) }}
                    </nuxt-link>
                  </a-menu-item>
                </template>
              </template>
            </a-sub-menu>
          </template>

          <template v-else>
            <a-menu-item :style="menu.position ? { float: 'right' } : {}" :key="menu.key">
              <nuxt-link :to="menu.link">
                <i :class="menu.icon"></i>
                {{ $t(menu.name) }}
              </nuxt-link>
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </div>

    <a-drawer
      placement="top"
      :closable="false"
      @close="isDrawerVisible = false"
      :visible="isDrawerVisible"
      :bodyStyle="{ padding: 0 }"
    >
      <a-menu class="mobile-menu">
        <SiderNode
          v-for="menu of siders"
          :menuItemData="menu"
          :role="role"
          :key="menu.key"
          :parent-node="true"
          isOnMobile
          @click="isDrawerVisible = false"
        />
      </a-menu>
    </a-drawer>
  </a-row>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import headers from "@/utils/header";
import siders from "@/utils/sider";
import { localize } from "vee-validate";

import Vi from "@/components/Common/Language/vi.vue";
import En from "@/components/Common/Language/en.vue";
import Ja from "@/components/Common/Language/ja.vue";
import SelectProject from "@/components/Common/SelectProject";
import SiderNode from "@/components/Common/Sider/SiderNode.vue";
import Navigation from "@/components/Common/Navigation";
import author from "@/utils/author";

export default {
  data() {
    return {
      Vi,
      En,
      Ja,
      headers,
      siders,
      lang: "vi",
      companyNav: [
        {
          key: "user-management",
          name: "user_management",
          "a-icon": "team",
          link: "/user-management",
          items: []
        },
        {
          key: "employee-management",
          name: "employee_management",
          "a-icon": "solution",
          link: "/employee-management",
          items: []
        },
        {
          key: "intern-management",
          name: "intern_management",
          "a-icon": "contacts",
          link: "/intern-management",
          items: [
            {
              key: "view-time",
              name: "view_time",
              icon: "fas fa-calendar-week mr-2",
              link: "/intern-management/view-time",
              items: []
            },
            {
              key: "list-intern",
              name: "list_intern",
              icon: "fas fa-users mr-2",
              link: "/intern-management/list-intern",
              items: []
            },
            {
              key: "list-salary",
              name: "list_salary",
              icon: "fas fa-file-invoice-dollar mr-2",
              link: "/intern-management/list-salary",
              items: []
            }
          ]
        },
        {
          key: "management-task",
          name: "management_task",
          icon: "fas fa-tasks mr-2",
          link: "",
          items: [
            {
              key: "create-task",
              name: "create_task",
              icon: "fas fa-plus mr-2",
              link: "/management-task/add"
            },
            {
              key: "list-task",
              name: "list_task",
              icon: "fas fa-list-ul mr-2",
              link: "/management-task"
            },
            {
              key: "project-role-config",
              name: "role_config",
              icon: "fas fa-user-tag mr-2",
              link: "/management-task/role-config"
            }
          ]
        },
        {
          key: "skill-set-management",
          name: "skill_set",
          "a-icon": "book",
          items: [
            {
              key: "skill-set-period-management",
              name: "period_management",
              icon: "far fa-bookmark mr-2",
              link: "/skill-set/period"
            },
            {
              key: "evaluate_work",
              name: "evaluate_work",
              icon: "fas fa-history mr-2",
              link: "/evaluate-work"
            },
            {
              key: "engineer-skill",
              name: "engineer_skill",
              icon: "fas fa-tools mr-2",
              link: "",
              items: [
                {
                  key: "skill-set-create-assessment",
                  name: "create_assessment",
                  icon: "fas fa-plus mr-2",
                  link: "/skill-set/add"
                },
                {
                  key: "skill-set-dashboard",
                  name: "list_assessment",
                  icon: "far fa-list-alt mr-2",
                  link: "/skill-set"
                },
                {
                  key: "skill-set-structure-category",
                  name: "skill_set_management",
                  icon: "fas fa-cog mr-2",
                  link: "/skill-set/category"
                },

                {
                  key: "skill-set-compare",
                  name: "compare_skill_set",
                  icon: "fas fa-exchange-alt mr-2",
                  link: "/skill-set/compare-skill-set"
                }
              ]
            },
            {
              key: "business-skill-set",
              name: "business_skill_set",
              icon: "fas fa-layer-group mr-2",
              link: "",
              items: [
                {
                  key: "create-assessment-business-skill",
                  name: "create_assessment_business_skill",
                  icon: "fas fa-plus mr-2",
                  link: "/business-skill-set/add"
                },
                {
                  key: "list-assessment-business-skill",
                  name: "list_assessment_business_skill",
                  icon: "far fa-list-alt mr-2",
                  link: "/business-skill-set"
                },
                {
                  key: "business-skill-category",
                  name: "business_skill_category",
                  icon: "fas fa-cog mr-2",
                  link: "/business-skill-set/category"
                }
              ]
            }
            // {
            //   key: "skill-set-sumarry-report-by-user",
            //   name: "download_skill_set_by_user",
            //   icon: "fas fa-download mr-2",
            //   link: "",
            //   items: [
            //     {
            //       key: "skill-set_summary",
            //       name: "export_skill_set_summary",
            //       icon: "fas fa-download mr-2",
            //       link: "/skill-set/download-skill-set-summary"
            //     },
            //     {
            //       key: "skill-set-individual",
            //       name: "export_skill_set_individual",
            //       icon: "fas fa-download mr-2",
            //       link: "/skill-set/download-skill-set-by-user"
            //     }
            //   ]
            // }
          ]
        },
        {
          key: "asset-management",
          name: "asset_management",
          "a-icon": "cluster",
          link: "",
          items: [
            {
              key: "asset-manager-dashboard",
              name: "asset_management",
              icon: "fas fa-tachometer-alt mr-2",
              link: "/asset-management",
              items: []
            },
            {
              key: "asset-type-management",
              name: "asset_type_management",
              icon: "fas fa-tasks mr-2",
              link: "/asset-type-management",
              items: []
            },
            {
              key: "asset-import-excel",
              name: "import_excel",
              icon: "fas fa-file-excel mr-2",
              link: "/asset-management/import",
              items: []
            },
            {
              key: "asset-export-excel",
              name: "export_excel",
              icon: "fas fa-file-excel mr-2",
              link: "/asset-management/export",
              items: []
            }
          ]
        },
        {
          key: "hr-management",
          name: "hr_management",
          "a-icon": "solution",
          items: [
            {
              key: "analysis-history-offwork",
              name: "analysis_history_offwork",
              icon: "fas fa-chart-line mr-2",
              link: "/hr-management/analysis"
            },
            {
              key: "human-resource-by-project",
              name: "human_resource_by_project",
              icon: "fas fa-chart-line mr-2",
              link: "/hr-management/hr-by-project"
            }
          ]
        }
        // {
        //   key: "slack-integration",
        //   name: "slack_integration",
        //   icon: "fab fa-slack mr-2",
        //   items: [
        //     {
        //       key: "send-worklog-report",
        //       name: "send_worklog_report",
        //       icon: "fas fa-paper-plane mr-2"
        //     },
        //     {
        //       key: "config-issue-report",
        //       name: "config_issue_report",
        //       icon: "fas fa-cog mr-2",
        //       link: "/config-issue-report"
        //     }
        //   ]
        // }
      ],
      isDrawerVisible: false,
      parentNode: true,
      isOnMobile: false
    };
  },
  components: {
    SelectProject,
    SiderNode,
    Navigation
  },
  mounted() {
    // Match to new token
    if (!Array.isArray(this.role)) this.logout();
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo
    }),
    ...mapGetters({
      role: "role"
    }),
    userFullName() {
      return this.userInfo && this.userInfo.fullName;
    }
  },
  methods: {
    ...mapMutations({
      setLanguage: "setLanguage"
    }),
    ...mapActions({
      logout: "modules/auth/logout"
    }),
    onClickMenu({ item, key, keyPath }) {
      switch (key) {
        case "logout":
          this.logout();
          break;
        default:
          break;
      }
    },
    onChangeLanguage(e) {
      let lang = e.key;
      this.lang = lang;
      this.$i18n.locale = lang;
      localize(lang);
      this.$moment.locale(lang);
      this.setLanguage(lang);
      localStorage.setItem("lang", lang);
    },
    isRender(screenKey) {
      if ((screenKey == "project-role-config" || screenKey == "create-task") && !this.role.includes("admin"))
        return false;

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
.header-content {
  .right-tool-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
}

.trigger {
  font-size: 18px;
  line-height: 48px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}
.right-bar {
  vertical-align: middle;
  float: right;
}
</style>

<style lang="less">
.cust-menu .ant-dropdown-menu-item,
.ant-dropdown-menu-submenu-title {
  margin: 5px;
}

.ant-drawer-body {
  padding: 0px;
}
.ant-drawer-body .ant-menu-submenu-title .menu-title {
  color: black;
}
.ant-drawer.ant-drawer-top.ant-drawer-open {
  top: 47px;
  z-index: 10;
}
.ant-drawer.ant-drawer-top {
  z-index: 10;
}
.mobile-menu {
  display: grid;
  grid-template-columns: 33% 33% 33%;
}
.mobile-menu i.ant-menu-submenu-arrow {
  display: none;
}
.mobile-menu .menu-title * {
  display: flex;
  justify-content: center;
}
.mobile-menu:before {
  content: none;
}
.ant-drawer-content-wrapper {
  height: auto !important;
}
.mobile-menu li {
  margin: 10px 0px;
}
.mobile-menu .ant-menu-submenu-title {
  overflow: visible;
}
.mobile-menu .ant-menu-item:last-child {
  margin: auto auto;
}
.mobile-menu .ant-btn.ant-btn-primary {
  padding: 5px;
}
.mobile-menu .fa-plus {
  margin-right: 3px !important;
}
.mobile-menu .ant-menu-item {
  margin-top: 14px;
}
.menu-header {
  display: flex;
}
</style>
