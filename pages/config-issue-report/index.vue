<template>
  <a-card class="shadow">
    <a-spin :spinning="loading">
      <h1>{{ $t("config_issue_report") }}</h1>
      <div v-if="!missingSlackTokenOnServer && !loading">
        <div style="text-align: right" class="mb-1"><a-button type="primary" @click="save">Save</a-button></div>
        <a-table
          :columns="columns"
          :dataSource="
            aggregateProjectListFromAllURLs.filter(p =>
              filteredProjectKeys.length ? filteredProjectKeys.includes(p.key) : true
            )
          "
          :pagination="pagination"
          bordered
          @change="handleTableChange"
        >
          <span slot="no" slot-scope="text, record, index">{{
            index + (pagination.current - 1) * pagination.pageSize + 1
          }}</span>

          <div slot="filterDropdown" slot-scope="{ column }" class="p-2">
            <a-select
              v-if="column.key == 'name'"
              v-ant-ref="c => (searchForcus = c)"
              v-model="filteredProjectKeys"
              mode="multiple"
              allow-clear
              placeholder="Enter project name"
              style="width: 200px"
              optionFilterProp="optionFilterProp"
            >
              <a-select-option
                v-for="(project, index) in aggregateProjectListFromAllURLs"
                :key="index"
                :label="project.name"
                :value="project.key"
                :optionFilterProp="project.name"
              >
                <img
                  :src="project.avatarUrls['16x16']"
                  height="16"
                  width="16"
                  align="sub"
                  :alt="project.name"
                  class="mr-1"
                />{{ project.name }}
              </a-select-option>
            </a-select>
          </div>

          <a-icon slot="filterIcon" type="search" />

          <span slot="channel_title"
            >Channels/Users
            <a-popover>
              <template slot="content">
                Issue reports will be sent to selected channels and users. Only private channels to which the Slack app
                was added are available to be chosen.
              </template>
              <a-icon type="question-circle" />
            </a-popover>
          </span>
          <span slot="project_name" slot-scope="text, record">
            <img :src="record.avatarUrls['16x16']" height="16" width="16" align="sub" :alt="text" class="mr-1" />{{
              text
            }}</span
          >
          <template slot="channels" slot-scope="text, record">
            <a-select
              style="min-width: 300px"
              v-model="record.channelIDs"
              mode="multiple"
              optionFilterProp="optionFilterProp"
            >
              <a-select-option
                v-for="channel of availableChannels"
                :key="channel.id"
                :value="channel.id"
                :optionFilterProp="channel.name"
              >
                <img
                  v-if="!['#', 'lock'].includes(channel.avatarUrl)"
                  :src="channel.avatarUrl"
                  height="16"
                  width="16"
                  border="0"
                  style="vertical-align:middle"
                  :alt="channel.name"
                />
                <span v-else-if="channel.avatarUrl == '#'" style="font-weight: bold; vertical-align: middle">{{
                  channel.avatarUrl
                }}</span
                ><i class="fas fa-lock" v-else></i><span class="ml-1">{{ channel.name }}</span>
              </a-select-option>
            </a-select>
          </template>
        </a-table>
      </div>
      <div v-else-if="missingSlackTokenOnServer && !loading">
        Please configure the environment variable named 'SLACK_TOKEN' on the server in order to access this page.
      </div>
    </a-spin>
  </a-card>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { columns } from "./const";
export default {
  data() {
    return {
      columns,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      },
      missingSlackTokenOnServer: true,
      loading: false,
      filteredProjectKeys: []
    };
  },
  async mounted() {
    this.loading = true;
    if (!this.availableChannels.length) {
      let res = await this.getAvailableChannels();
      if (res == "Environment variable 'SLACK_TOKEN' was not properly configured on the server!") {
        this.$notification.info({ message: res, duration: 10 });
      } else this.missingSlackTokenOnServer = false;
    }
    if (!this.aggregateProjectListFromAllURLs.length && !this.missingSlackTokenOnServer) {
      await Promise.all([this.getAggregateProjectListFromAllURLs(), this.getSavedConfig()]);
      let clonedProjectList = _.cloneDeep(this.aggregateProjectListFromAllURLs);
      this.savedConfig.forEach(c => {
        let prj = clonedProjectList.find(p => p.key == c.key);
        if (prj.channelIDs?.length) prj.channelIDs = prj.channelIDs.concat(c.channelID);
        else prj.channelIDs = [c.channelID];
      });
      this.setAggregateProjectListFromAllURLs(clonedProjectList);
    }
    this.loading = false;
  },
  computed: {
    ...mapState({
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs,
      availableChannels: state => state.modules["slack-integration"].availableChannels,
      savedConfig: state => state.modules["slack-integration"].savedConfig
    })
  },
  methods: {
    ...mapMutations({
      setAggregateProjectListFromAllURLs: "modules/jira-project/setAggregateProjectListFromAllURLs",
      setAvailableChannels: "modules/slack-integration/setAvailableChannels",
      setSavedConfig: "modules/slack-integration/setSavedConfig"
    }),
    ...mapActions({
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs",
      getAvailableChannels: "modules/slack-integration/getAvailableChannels",
      setProjectKeysWithChannels: "modules/slack-integration/setProjectKeysWithChannels",
      getSavedConfig: "modules/slack-integration/getSavedConfig"
    }),
    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
    },
    async save() {
      let configuredProjects = this.aggregateProjectListFromAllURLs.filter(p => p.channelIDs?.length);
      let projectKeysWithChannelIDs = [];
      for (let i = 0; i < configuredProjects.length; i++) {
        projectKeysWithChannelIDs = projectKeysWithChannelIDs.concat(
          configuredProjects[i].channelIDs.map(c => ({ key: configuredProjects[i].key, channelID: c }))
        );
      }
      let res = await this.setProjectKeysWithChannels(projectKeysWithChannelIDs);
      if (res.data == "success") this.$notification.success({ message: "Saved!" });
      else this.$notification.error({ message: "Something went wrong!" });
    }
  },
  beforeDestroy() {
    this.setAvailableChannels([]);
    this.setSavedConfig([]);
  }
};
</script>

<style scoped>
img {
  vertical-align: sub;
  border-style: none;
}
</style>
