<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item v-for="(path, index) of listPath" :key="index">
      <nuxt-link v-if="index !== listPath.length - 1" :to="path.to">
        <!-- <i class="fas fa-home fa-lg" v-if="!index"></i> -->
        <span v-if="!index">Home</span>
        <span v-else>{{ path.name }}</span>
      </nuxt-link>
      <span v-else>
        <!-- <i class="fas fa-home fa-lg" v-if="!index"></i> -->
        <span v-if="!index">Home</span>
        {{ path.name }}
      </span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      listPath: []
    };
  },
  computed: {
    ...mapState({
      lang: state => state.lang
    })
  },
  watch: {
    $route(to, from) {
      this.initBreadCrumb(to.fullPath);
    },
    lang() {
      this.initBreadCrumb(this.$router.history.current.fullPath);
    }
  },
  mounted() {
    this.initBreadCrumb(this.$router.history.current.fullPath);
  },
  methods: {
    initBreadCrumb(fullPath) {
      var listPath = fullPath === "/" ? [""] : fullPath.split("/");
      this.listPath = [];
      for (let i = 0; i < listPath.length; i++) {
        if (listPath[i].charAt(0) !== "?") {
          const body = {
            name: this.$t(listPath[i].split("?")[0].replace(/-/g, "_")),
            to: i ? ("/" + listPath.slice(1, i + 1)).replace(",", "/").split("?")[0] : "/"
          };
          this.listPath.push(body);
        }
      }
    }
  }
};
</script>

<style></style>
