<template>
  <a-config-provider :locale="locale">
    <a-layout id="components-layout" style="min-height: 100vh">
      <a-back-top :visibilityHeight="10" />
      <!-- <a-layout-sider class="sider-qcd" v-model="collapsed">
        <Sider :collapsed="collapsed" @change-collapsed="collapsed = !collapsed" />
      </a-layout-sider> -->
      <a-layout>
        <a-layout-header class="shadow" style="background: #fff">
          <Header />
        </a-layout-header>
        <a-layout-content style="margin: 0 16px">
          <Breadcrumb />
          <nuxt style="minheight: calc(100vh - 170px)" />
        </a-layout-content>
        <a-layout-footer class="text-center text-base">
          <!-- ©COPYRIGHT BY ARROWTECH {{ $moment().year() }} -->
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script>
import ja_JP from "ant-design-vue/es/locale/ja_JP";
import en_US from "ant-design-vue/es/locale/en_US";
import vi_VN from "ant-design-vue/es/locale/vi_VN";
import Sider from "@/components/Common/Sider";
import Header from "@/components/Common/Header";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { mapState, mapMutations, mapActions } from "vuex";
import { SVGicon } from "../assets/const.js";
import jwtDecode from "jwt-decode";

export default {
  middleware: ["auth", "quickaccess"],
  components: { Breadcrumb, Sider, Header },
  data() {
    return {
      locale: {},
      collapsed: true,
      isXlScreen: false,
      fillBackground: null
    };
  },
  computed: {
    ...mapState({
      lang: state => state.lang
    })
  },
  watch: {
    lang() {
      this.setLocaleProvider();
    },
    collapsed() {
      if (this.collapsed) this.fillBackground.classList.remove("collapse-trigger-open");
      else this.fillBackground.classList.add("collapse-trigger-open");
    }
  },
  created() {
    this.loadLocalData();
    this.getJiraProjectAPI();
  },
  mounted() {
    this.setLocaleProvider();
    this.setUserInfo();
    this.appendCollapseBackground();
    this.responsive();
  },
  methods: {
    ...mapMutations({
      setUserInfo: "setUserInfo"
    }),
    ...mapActions({
      loadLocalData: "loadLocalData",
      getAllJiraProject: "modules/jira-project/getAllJiraProject"
    }),
    setLocaleProvider() {
      const curLocale = this.lang;
      switch (this.lang) {
        case "ja":
          this.locale = ja_JP;
          break;
        case "en":
          this.locale = en_US;
          break;
        case "vi":
          this.locale = vi_VN;
          break;
        default:
          break;
      }
    },
    appendCollapseBackground() {
      let slider = document.querySelector("#components-layout");
      let div = document.createElement("div");
      div.classList.add("collapse-trigger");
      slider.appendChild(div);
      div.addEventListener("click", () => (this.collapsed = !this.collapsed));
      this.fillBackground = div;
    },
    responsive() {
      let self = this;
      let ruleXL = "(min-width: 1200px)";
      let ruleElse = "(max-width: 1199px)";
      function breakPoint(media) {
        if (media.matches) {
          self.isXlScreen = media.media == ruleXL ? true : false;
        }
      }

      let xl = window.matchMedia(ruleXL);
      let x = window.matchMedia(ruleElse);

      breakPoint(x); // call in first
      breakPoint(xl); // call in first

      x.addListener(breakPoint); // add to DOM
      xl.addListener(breakPoint); // add to DOM
    },
    setUserRole() {
      let token = localStorage.getItem("token");
      let decoded = jwtDecode(token);
      this.role = decoded.permissions;
    },
    async getJiraProjectAPI() {
      let listJiraProject = await this.getAllJiraProject();
      if (!listJiraProject?.length) {
        this.$notification.error({
          message: "Empty jira project",
          description: "Sorry, not found any project. Please contact admin for more infomation",
          duration: 2.5
        });
      }
    }
  }
};
</script>
<style>
.ant-back-top {
  right: 2rem;
  bottom: 2rem;
}

.ant-layout-header {
  padding: 0;
  height: 48px;
  line-height: 48px;
}

#components-layout .trigger {
  font-size: 18px;
  padding: 0 18px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout .trigger:hover {
  color: #1890ff;
}
</style>

<style lang="less">
.sider-qcd {
  position: fixed;
  height: 100%;
  z-index: 101;
}

.collapse-trigger {
  display: none;
}

.collapse-trigger-open {
  z-index: 100;
  position: fixed;
  display: block;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: #00152954;
  transition: 0.2;
}
</style>
