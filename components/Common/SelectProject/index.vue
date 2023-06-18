<template>
  <a-dropdown style="width: 100%; text-align: left" class="select-language">
    <a-menu slot="overlay" v-model="selectedKeys" @click="handleSeletedProject($event.key)">
      <a-menu-item v-for="project in listJiraProject" :key="project.name"> {{ project.name }} </a-menu-item>
    </a-menu>
    <a-button icon="project"> {{ this.projectSelected }} </a-button>
  </a-dropdown>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "SelectProject",
  data() {
    return {
      selectedKeys: []
    };
  },
  computed: {
    ...mapState({
      jiraUrl: state => state.jiraUrl,
      listJiraProject: state => state.modules["jira-project"].listJiraProject
    }),
    projectSelected() {
      let jiraProject = this.listJiraProject.find(item => item.url == this.jiraUrl);

      if (jiraProject) {
        this.selectedKeys = [jiraProject.name];
        return jiraProject.name;
      }
      return this.$t("project");
    }
  },
  methods: {
    ...mapMutations({
      setJiraUrl: "setJiraUrl"
    }),
    handleSeletedProject(key) {
      this.selectedKeys = [key];
      let itemProject = this.listJiraProject.find(item => item.name == key);
      this.setJiraUrl(itemProject?.url);
    }
  }
};
</script>
