<template>
  <a-card class="shadow">
    <h1>{{ dataFilter.filter.isActive ? $t("employee_management") : $t("trash") }}</h1>

    <!-- <a-row type="flex" align="bottom" justify="space-between">
      <span class="text-bold"> {{ $t("total_result") }}: {{ dataSource.length }} </span>
      <span style="float: right">
        <a-button
          type="primary"
          ghost
          :icon="dataFilter.filter.isActive ? 'delete' : 'appstore'"
          @click="dataFilter.filter.isActive = !dataFilter.filter.isActive"
          >{{ dataFilter.filter.isActive ? $t("trash") : $t("cancel") }}</a-button
        >

        <span>
          <a-button type="primary" @click="handleRegister">{{ $t("register_now") }}</a-button>
        </span>
      </span>
    </a-row> -->

    <a-table
      class="mt-1"
      bordered
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      :pagination="pagination"
      :rowKey="record => record.username"
      :scroll="{ x: true }"
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="no" slot-scope="record, text, index">{{
        (pagination.current - 1) * pagination.pageSize + index + 1
      }}</template>

      <div slot="filterDropdown" slot-scope="{ column }" class="p-2">
        <!-- full_name column -->
        <a-select
          v-if="column.key == 'full_name'"
          v-ant-ref="c => (searchForcus = c)"
          v-model="dataFilter.filter.user"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          :filterOption="filterOptionForUser"
        >
          <a-select-option
            v-for="(item, index) in listUserFilter"
            :key="index"
            :label="item.fullName"
            :value="item.username"
          >
            {{ item.fullName }}
          </a-select-option>
        </a-select>

        <!-- role column -->
        <a-select
          v-if="column.key == 'role'"
          v-ant-ref="c => (searchForcus = c)"
          v-model="dataFilter.filter.role"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option
            v-for="(item, index) in roleList"
            :key="index"
            :label="item.name | Snakeformat"
            :value="item.name"
          >
            {{ item.name | Snakeformat }}
          </a-select-option>
        </a-select>

        <!-- project column -->
        <a-select
          v-if="column.key == 'project'"
          v-ant-ref="c => (searchForcus = c)"
          v-model="dataFilter.filter.project"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option v-for="(item, index) in projectList" :key="index" :label="item.name" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>

      <a-icon slot="filterIcon" type="search" />

      <template slot="role" slot-scope="text">
        <a-tag v-for="item in text" :key="item.role_id" :color="mapToRoleColor(item.role)">
          {{ item.role | Snakeformat }}
        </a-tag>
      </template>

      <template slot="project" slot-scope="text">
        <template v-if="text.length">
          <a-tag v-for="item in text" :key="item.project_id" color="#108ee9">
            {{ item.project }}
          </a-tag>
        </template>
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="primary" @click="goToUserDetail(text)">{{ $t("detail") }}</a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { columns, mapColorTagRole } from "./const";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager"]
  },
  data() {
    return {
      loading: false,
      searchForcus: null,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      }
    };
  },
  async created() {
    this.loading = true;
    await Promise.all([this.getAllUser(), this.getRoleList(), this.getProjectList()]);
    this.loading = false;
    this.checkRouter();
  },
  filters: {
    Snakeformat(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  computed: {
    ...mapState({
      userList: state => state.modules["user-management"].userList,
      dataFilter: state => state.modules["user-management"].dataFilter,
      roleList: state => state.modules["user-management"].roleList,
      projectList: state => state.modules["user-management"].projectList
    }),
    columns() {
      let self = this;
      return columns.filter(item => {
        switch (item.key) {
          case "full_name": {
            item.defaultSortOrder = self.dataFilter.sorter.fullName;
            item.sorter = (a, b) => a.fullName?.localeCompare(b.fullName);
            item.filtered = self.dataFilter.filter.user.length;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          }

          case "role": {
            item.filtered = self.dataFilter.filter.role.length;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          }

          case "project": {
            item.filtered = self.dataFilter.filter.project.length;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          }
        }
        return true;
      });
    },
    dataSource() {
      let clone = _.cloneDeep(this.userList);
      clone = this.filterDataByName(clone);
      clone = this.filterDataByRole(clone);
      clone = this.filterDataByProject(clone);
      clone = this.filterUserActive(clone);
      this.pagination.total = clone.length;
      return clone;
    },
    listUserFilter() {
      return this.userList.filter(user => user.delete_flag != this.dataFilter.filter.isActive);
    }
  },
  methods: {
    ...mapActions({
      getUserList: "modules/user-management/getUserList",
      getRoleList: "modules/user-management/getRoleList",
      getProjectList: "modules/user-management/getProjectList",
      restoreUser: "modules/user-management/restoreUser",
      getAllUser: "modules/user-management/getAllUser"
    }),
    checkRouter() {
      if (this.$route.params) {
        const { message } = this.$route.params;
        if (message) {
          this.$notification.success({
            message: message,
            description: message,
            duration: 2.5
          });
        }
      }
    },
    handleRegister() {
      this.$router.push("/user-management/register");
    },
    goToUserDetail(userId) {
      this.$router.push(`/employee-management/${userId}`);
    },
    filterDataByName(clone) {
      if (this.dataFilter.filter.user && this.dataFilter.filter.user.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.user.includes(item.username);
        });
      }
      return clone;
    },
    filterDataByRole(clone) {
      if (this.dataFilter.filter.role && this.dataFilter.filter.role.length) {
        return clone.filter(item => {
          let intersection = _.intersection(
            this.dataFilter.filter.role,
            item.role.map(e => e.role)
          );

          return intersection ? intersection.length : false;
        });
      }
      return clone;
    },
    filterDataByProject(clone) {
      if (this.dataFilter.filter.project && this.dataFilter.filter.project.length) {
        return clone.filter(item => {
          let intersection = _.intersection(
            this.dataFilter.filter.project,
            item.project.map(e => e.project)
          );

          return intersection ? intersection.length : false;
        });
      }
      return clone;
    },
    filterUserActive(clone) {
      return clone.filter(item => item.delete_flag != this.dataFilter.filter.isActive);
    },
    mapToRoleColor(text) {
      let find = mapColorTagRole.find(item => item.role == text);
      return find ? find.color : "#0052cc";
    },
    handleTableChange(pagination, filters, sorter, { currentDataSource }) {
      const pager = { ...this.pagination };
      this.dataFilter.sorter[sorter.field] = sorter.order;
      pager.current = pagination.current;
      this.pagination = pager;
    },
    filterOptionForUser(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    }
  }
};
</script>

<style></style>
