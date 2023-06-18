<template>
  <div>
    <div style="text-align: end"></div>
    <a-row type="flex" align="middle" justify="space-between">
      <a-col>
        <span class="h1"> {{ $t($t("constitute_project_cost")) }}</span>
      </a-col>
      <a-col class="text-right">
        <a-button type="primary" @click="syncCost"><i class="fas fa-sync mr-2" />Sync cost</a-button>
        <a-button type="primary" @click="handleCreateProject"
          ><i class="fas fa-plus mr-2" /> {{ $t("add_project_cost_by_role") }}</a-button
        >
      </a-col>
    </a-row>
    <div
      class="ant-table ant-table-default ant-table-bordered mt-1"
      :class="{ 'ant-table-empty': !listProjectCostByRole.length }"
      v-if="!projectData.delete_flag"
    >
      <div class="ant-table-content">
        <div class="table-wrapper">
          <table class="w-100 table-bordered">
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
              <ProjectCostByRoleItem
                ref="role-cost"
                mode="create"
                v-if="isCreateProjectCost"
                :index="0"
                :record="{ id: 'add', project: projectData.name, project_id: projectId }"
                :columns="columns"
                @create="handleCreatedProject"
                @cancel="isCreateProjectCost = false"
              />

              <ProjectCostByRoleItem
                :ref="`role-cost-${index}`"
                v-for="(projectCost, index) in listProjectCostByRole"
                :key="index"
                :record="projectCost"
                :columns="columns"
                :index="index + 1"
                @update="e => handleAbstractActionAPI(updateProjectCost, e, index)"
                @deprecate="e => handleAbstractActionAPI(deleteProjectCost, e, index)"
              />
            </tbody>
          </table>
        </div>

        <div class="ant-table-placeholder" v-if="!listProjectCostByRole.length">
          <a-empty>
            <span slot="description"> {{ $t("no_result_found") }} </span>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapActions } from "vuex";
import ProjectCostByRoleItem from "@/components/ProjectATV/ProjectCostByRoleItem";

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: {
    ProjectCostByRoleItem
  },
  props: ["projectId"],
  data() {
    return {
      columns: [
        {
          slots: { title: "no_" },
          key: "no",
          scopedSlots: { customRender: "no" },
          align: "center",
          width: "50px"
        },
        {
          slots: { title: "role" },
          dataIndex: "role",
          key: "role",
          scopedSlots: { customRender: "role" },
          width: "25%"
        },
        {
          slots: { title: "cost_per_hour" },
          dataIndex: "cost",
          key: "cost",
          scopedSlots: { customRender: "cost" }
        },
        {
          slots: { title: "" },
          key: "detail",
          scopedSlots: { customRender: "detail" },
          width: 80
        }
      ],
      keySearch: "",
      dataFilter: {
        filter: {
          status: []
        }
      },
      listStatus: [],
      isCreateProjectCost: false,
      isCreate: true,
      projectName: null,
      projectData: {},
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      rules: {
        name: [{ validator: this.validateNameProject, trigger: "change" }]
      },
      loading: false
    };
  },
  computed: {
    ...mapState({
      listProjectCostByRole: state => state.modules["project-cost"].listProjectCostByRole,
      projectList: state => state.modules["user-management"].projectList,
      roleList: state => state.modules["user-management"].roleList,
      usersInProject: state => state.modules["role-project"].usersInProject,
      listRoleProject: state => state.modules["role-project"].listRoleProject
    })
  },
  async mounted() {
    await this.$nextTick();
    this.fetchAPI();
  },
  methods: {
    ...mapActions({
      fetchATVProject: "modules/user-management/fetchATVProject",
      getRoleList: "modules/user-management/getRoleList",
      updateProjectCost: "modules/project-cost/updateProjectCost",
      deleteProjectCost: "modules/project-cost/deleteProjectCost",
      createProjectCost: "modules/project-cost/createProjectCost",
      fetchProjectCostByProjectId: "modules/project-cost/fetchProjectCostByProjectId",
      fetchProjectByProjectId: "modules/project-cost/fetchProjectByProjectId",
      fetchListRoleProject: "modules/role-project/fetchListRoleProject",
      getListUserOnlyName: "modules/user-management/getListUserOnlyName"
    }),
    handleCreateProject() {
      this.isCreateProjectCost = true;
    },
    fetchAPI() {
      this.fetchATVProject();
      this.getRoleList();
      this.fetchListRoleProject();
      this.getListUserOnlyName();
      this.fetchProjectDataAPI(this.projectId);
    },
    getStyleHeaderTable(column) {
      if (!column.width) return {};
      return { width: column.width };
    },
    async handleCreatedProject(e) {
      this.$refs["role-cost"].loading = true;
      this.isCreateProjectCost = false;
      let response = await this.createProjectCost(e);
      this.handleNotifyAPI(response);
    },
    async handleAbstractActionAPI(ApiAction, param, i) {
      this.$refs[`role-cost-${i}`][0].loading = true;
      let response = await ApiAction(param);
      this.handleNotifyAPI(response);
      if (this.$refs[`role-cost-${i}`][0]) this.$refs[`role-cost-${i}`][0].loading = false;
    },
    async fetchProjectDataAPI(projectId) {
      await this.fetchProjectCostByProjectId(projectId);

      let project = await this.fetchProjectByProjectId(projectId);
      if (!project.error) {
        this.projectData = project.data.length ? project.data[0] : {};
        this.projectName = this.projectData.name;
      }
    },
    validateNameProject(rule, value, callback) {
      if (value == "") return callback(new Error(`${this.$t("project")} ${this.$t("default_error_empty")}`));
      callback();
    },
    async syncCost() {
      let uniqueRoles = [...new Set(this.usersInProject.map(u => u.role_project_id))];
      let currentRoles = this.listProjectCostByRole.map(c => c.role_id);
      let missingRoles = _.differenceWith(uniqueRoles, currentRoles, _.isEqual);

      let requests = [];
      for (let i = 0; i < missingRoles.length; i++) {
        let payload = {
          id: "add",
          role_id: missingRoles[i],
          project_id: this.projectId,
          cost: this.listRoleProject.find(r => r.id === missingRoles[i])?.monthly_salary ?? 0
        };
        requests.push(this.createProjectCost(payload));
      }

      if (requests.length) {
        await Promise.all(requests);
        this.$notification.success({ message: `Added default cost for ${requests.length} role(s)!` });
      } else
        this.$notification.info({
          message: "Cost has been defined for all member roles in the project. No changes are required!"
        });
    }
  }
};
</script>

<style lang="less" scoped>
.table-wrapper {
  overflow-x: auto;
}
</style>
