<template>
  <a-card class="shadow">
    <h1>{{ $t("role_config") }}</h1>
    <div style="text-align: end">
      <a-button type="primary" @click="handleCreateRoleProject"
        ><i class="fas fa-plus mr-2"></i> {{ $t("add_role") }}</a-button
      >
    </div>
    <div
      class="ant-table ant-table-default ant-table-bordered mt-1"
      :class="{ 'ant-table-empty': !listRoleProjectFilter.length }"
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
                >
                  <div v-if="column.key == 'project'">
                    <span>{{ $t(column.slots.title) }}</span>
                    <br />
                    <a-input-search
                      style="width: 200px"
                      allow-clear
                      :value="keySearch"
                      @change="e => (keySearch = e.target.value)"
                    />
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
              <RoleProjectRowItem
                ref="role-item"
                mode="create"
                v-if="newProjectName"
                :index="0"
                :record="{ id: 'add', name: newProjectName }"
                :columns="columns"
                @create="handleCreatedProject"
                @cancel="newProjectName = null"
              />
              <RoleProjectRowItem
                :ref="`role-item-${index}`"
                v-for="(project, index) in listRoleProjectFilter"
                :key="project.id"
                :record="project"
                :columns="columns"
                :index="index + 1"
                @update="e => handleAbstractActionAPI(updateRoleProject, e, index)"
                @deprecate="handleAbstractActionAPI(updateRoleProject, { ...project, delete_flag: true }, index)"
                @restore="handleAbstractActionAPI(updateRoleProject, { ...project, delete_flag: false }, index)"
              ></RoleProjectRowItem>
            </tbody>
          </table>
        </div>

        <div class="ant-table-placeholder" v-if="!listRoleProjectFilter.length">
          <a-empty>
            <span slot="description"> {{ $t("no_result_found") }} </span>
          </a-empty>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { columns, listStatus } from "./const";
import RoleProjectRowItem from "@/components/ProjectATV/RoleProjectRowItem";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: { RoleProjectRowItem },
  data() {
    return {
      columns,
      listStatus,
      keySearch: "",
      newProjectName: null,
      dataFilter: {
        filter: {
          status: ["active"]
        }
      }
    };
  },
  computed: {
    ...mapState({
      listRoleProject: state => state.modules["role-project"].listRoleProject
    }),
    listRoleProjectFilter() {
      let clone = [...this.listRoleProject];
      clone = this.filterProjectByKeySearch(clone);
      clone = this.filterDataByStatus(clone);
      return clone;
    }
  },
  created() {
    this.fetchListRoleProject();
  },
  methods: {
    ...mapActions({
      fetchListRoleProject: "modules/role-project/fetchListRoleProject",
      createRoleProject: "modules/role-project/createRoleProject",
      updateRoleProject: "modules/role-project/updateRoleProject"
    }),
    handleCreateRoleProject() {
      this.newProjectName = new String(this.keySearch).valueOf() || "new role";
      this.keySearch = "";
    },
    async handleCreatedProject(e) {
      this.newProjectName = null;
      this.handleAbstractActionAPI(this.createRoleProject, e);
    },
    async handleAbstractActionAPI(ApiAction, param, i) {
      if (i === parseInt(i, 10)) this.$refs[`role-item-${i}`][0].loading = true;
      let response = await ApiAction(param);
      this.handleNotifyAPI(response);
      if (this.$refs[`role-item-${i}`][0]) this.$refs[`role-item-${i}`][0].loading = false;
    },
    filterProjectByKeySearch(clone) {
      if (!this.keySearch) return clone;

      return clone.filter(item => {
        let vietnameseKey = removeVietnameseTones(this.keySearch).toLowerCase();
        let vietnameseTag = removeVietnameseTones(item.name).toLowerCase();

        return vietnameseTag.includes(vietnameseKey);
      });
    },
    filterDataByStatus(clone) {
      let keyStatus = this.dataFilter.filter.status;
      if (keyStatus && keyStatus.length) {
        let keyStatusDecoded = keyStatus.map(key => {
          let itemDecoded = this.listStatus.find(item => item.key == key);
          return itemDecoded.delete_flag;
        });

        return clone.filter(item => {
          return keyStatusDecoded.includes(item.delete_flag);
        });
      }
      return clone;
    }
  }
};
</script>
