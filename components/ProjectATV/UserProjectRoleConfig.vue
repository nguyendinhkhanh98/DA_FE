<template>
  <div>
    <a-row type="flex" align="middle" justify="space-between">
      <a-col>
        <span class="h1"> {{ $t("config_member_and_role_in_project") }}</span>
      </a-col>
      <a-col class="text-right">
        <a-button type="primary" @click="handleCreateProject"
          ><i class="fas fa-plus mr-2"></i> {{ $t("add_project_member") }}</a-button
        >
      </a-col>
    </a-row>
    <div class="ant-table mt-1 ant-table-small" :class="{ 'ant-table-empty': !listUserProjectRole.length }">
      <div class="ant-table-content">
        <div class="table-wrapper">
          <table class="table-bordered">
            <thead class="ant-table-thead">
              <tr>
                <th
                  class="wrapper-header"
                  v-for="column in columns"
                  :key="column.key"
                  :span="column.span"
                  :width="column.width"
                  :style="getStyleHeaderTable(column)"
                >
                  <div v-if="column.key == 'project'">
                    <span>{{ $t(column.slots.title) }}</span>
                  </div>

                  <div v-else-if="column.key == 'cost'">
                    <span>{{ $t(column.slots.title) }} ($)</span>
                  </div>

                  <div v-else-if="column.key == 'status'">
                    <span>{{ $t(column.slots.title) }}</span>
                    <br />
                    <a-select
                      v-model="dataFilter.filter.status"
                      mode="multiple"
                      allow-clear
                      style="width: 200px"
                      option-label-prop="label"
                    >
                      <a-select-option
                        v-for="(item, index) in listStatus"
                        :key="index"
                        :label="item.value"
                        :value="item.key"
                      >
                        {{ item.value }}
                      </a-select-option>
                    </a-select>
                  </div>

                  <span v-else>{{ $t(column.slots.title) }}</span>
                </th>
              </tr>
            </thead>

            <tbody class="ant-table-tbody">
              <UserProjectRoleItem
                ref="member-item"
                mode="create"
                v-if="isCreateProjectCost"
                :index="0"
                :record="{ id: 'add', project: projectData.name, project_id: projectData.id, jiraUrl: projectData.jiraUrl, project_key: projectData.key }"
                :columns="columns"
                @create="handleCreatedProject"
                @cancel="isCreateProjectCost = false"
              />

              <UserProjectRoleItem
                :ref="`member-item-${index}`"
                v-for="(projectCost, index) in listUserProjectRole"
                :key="index"
                :record="projectCost"
                :projectData="projectData"
                :columns="columns"
                :index="index + 1"
                @update="e => handleUpdateData(e, index)"
                @deprecate="e => handleDeleteData(e, index)"
              ></UserProjectRoleItem>
            </tbody>
          </table>
        </div>

        <div class="ant-table-placeholder" v-if="!listUserProjectRole.length">
          <a-empty>
            <span slot="description"> {{ $t("no_result_found") }} </span>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import UserProjectRoleItem from "@/components/ProjectATV/UserProjectRoleItem";

const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: "50px"
  },
  {
    slots: { title: "user" },
    dataIndex: "user_id",
    key: "user",
    scopedSlots: { customRender: "user" }
  },
  {
    slots: { title: "jira_email" },
    dataIndex: "jiraEmail",
    key: "jiraEmail",
    scopedSlots: { customRender: "jira_email" },
    width: 506
  },
  {
    slots: { title: "isJiraEmail" },
    dataIndex: "isJiraEmail",
    key: "isJiraEmail",
    scopedSlots: { customRender: "is_jira_email" },
    width: "12%"
  },
  {
    slots: { title: "role" },
    dataIndex: "role_project_id",
    key: "role",
    scopedSlots: { customRender: "role" },
    width: "25%"
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 100
  }
];

export default {
  components: {
    UserProjectRoleItem
  },
  props: {
    projectData: Object
  },
  data() {
    return {
      keySearch: "",
      dataFilter: {
        filter: {
          status: []
        }
      },
      listUserProjectRole: [],
      listStatus: [],
      columns,
      isCreateProjectCost: false,
    };
  },
  async created() {
    let responseListUserRole = await this.fetchListUserRoleProjectByProjectId(this.projectData.id);
    if (!responseListUserRole.error) {
      this.listUserProjectRole = responseListUserRole.data;
    }
    await Promise.all([this.fetchListRoleProject(), this.getListUserOnlyName(), this.getAllUserProject()]);
  },
  watch: {
    async "projectData.jiraId"(newVal) {
      if (newVal) {
        await this.getAllUsersAssignableToProjects({
          project: this.projectData.key,
          jiraUrl: this.projectData.jiraUrl
        });
      }
    }, 
    async listUserProjectRole() {
     await this.getAllUserProject()
    }
  },
  methods: {
    ...mapActions({
      fetchListUserRoleProjectByProjectId: "modules/role-project/fetchListUserRoleProjectByProjectId",
      createUserRoleProjectByProjectId: "modules/role-project/createUserRoleProjectByProjectId",
      createUserJiraProject: "modules/role-project/createUserJiraProject",
      updateUserRoleProject: "modules/role-project/updateUserRoleProject",
      deleteUserRoleProject: "modules/role-project/deleteUserRoleProject",
      fetchListRoleProject: "modules/role-project/fetchListRoleProject",
      getListUserOnlyName: "modules/user-management/getListUserOnlyName",
      getAllUsersAssignableToProjects: "modules/summary-report-by-issue/getAllUsersAssignableToProjects",
      getUsersAssignableInProject: "modules/summary-report-by-issue/getUsersAssignableInProject",
      getAllUserProject: "modules/user-management/getAllUserProject",
    }),
    getStyleHeaderTable(column) {
      if (!column.width) return {};
      return { width: column.width };
    },
    handleCreateProject() {
      this.isCreateProjectCost = true;
    },
    async handleCreatedProject(e) {
      this.$refs["member-item"].loading = true;
      this.isCreateProjectCost = false;
      let { jiraUrl, project_key, jira_email } = e;
      let assigneeList = await this.getUsersAssignableInProject({jiraUrl, project_key});
      assigneeList = assigneeList.data;
      let emailAssigneeList = assigneeList.map(item => item.emailAddress).filter(item => item !== "");
      jira_email = emailAssigneeList.includes(jira_email) ? jira_email : null
      let payload = { ...e, jira_email };
      let response = await this.createUserJiraProject(payload);
      if (!response.error) {
        this.listUserProjectRole = this.listUserProjectRole.concat(response.data);
      }
      this.handleNotifyAPI(response);
    },
    async handleAbstractActionAPI(ApiAction, param) {
      let response = await ApiAction(param);
      this.handleNotifyAPI(response);
    },
    async handleUpdateData(e, i) {
      this.$refs[`member-item-${i}`][0].loading = true;
      let { jira_email } = e;
      let assigneeList = await this.getUsersAssignableInProject({ project_key: this.projectData.key, jiraUrl: this.projectData.jiraUrl });
      assigneeList = assigneeList.data;
      let emailAssigneeList = assigneeList.map(item => item.emailAddress).filter(item => item !== "");
      jira_email = emailAssigneeList.includes(jira_email) ? jira_email : null
      let payload = { ...e, jira_email };
      let response = await this.updateUserRoleProject(payload);
      this.$refs[`member-item-${i}`][0].loading = false;
      let responseListUserRole = await this.fetchListUserRoleProjectByProjectId(this.projectData.id);
      if (!responseListUserRole.error) {
        this.listUserProjectRole = responseListUserRole.data;
      }
      this.handleNotifyAPI(response);
    },
    async handleDeleteData(e, i) {
      this.$refs[`member-item-${i}`][0].loading = true;
      let response = await this.deleteUserRoleProject(e);
      if (!response.error) {
        this.listUserProjectRole = this.listUserProjectRole.filter(item => item.id != e.id);
      }
      this.handleNotifyAPI(response);
    }
  }
};
</script>
