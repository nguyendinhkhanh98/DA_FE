<template>
  <a-card class="shadow">
    <h1>{{ $t("worklog_by_issue") }}</h1>
    <a-form @submit.prevent="handleSearch">
      <a-row>
        <!-- Project -->
        <a-col :xs="24" :sm="12">
          <a-form-item
            :label="$t('project')"
            :label-col="{ xs: { span: 24 }, sm: { span: 8 } }"
            :wrapper-col="{ xs: { span: 24 }, sm: { span: 16 } }"
            :colon="false"
          >
            <a-select mode="multiple" optionFilterProp="optionFilterProp" @change="onSelectProjectChange">
              <a-select-option
                v-for="project of allProject"
                :key="project.key"
                :value="project.key"
                :optionFilterProp="project.name"
              >
                <img
                  :src="project.avatarUrls['16x16']"
                  height="16"
                  width="16"
                  border="0"
                  align="absmiddle"
                  :alt="project.name"
                />
                {{ project.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <!-- Duration -->
        <a-col :xs="24" :sm="12">
          <a-row :gutter="8">
            <a-col :xs="24" :sm="16">
              <a-row type="flex" align="middle" justify="center">
                <a-col :xs="24" :sm="12" class="label-duration">
                  <label for="duration">
                    {{ $t("duration") }}
                  </label>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item :wrapper-col="{ span: 24 }">
                    <a-date-picker
                      class="start-duration"
                      v-model="filters.startDate"
                      :format="dateFormat"
                      :allowClear="false"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-item :wrapper-col="{ span: 24 }">
                <a-date-picker
                  style="width: 100%;"
                  v-model="filters.endDate"
                  :format="dateFormat"
                  :allowClear="false"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <a-row>
        <!-- Button search -->
        <a-col :xs="24" :sm="24">
          <a-form-item :wrapper-col="{ xs: { span: 20 }, sm: { span: 20, offset: 4 } }" :colon="false">
            <a-button type="primary" html-type="submit" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("search") }}
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="mt-1" v-if="dataSrc.length">
        <a-row type="flex" align="bottom" justify="space-between">
          {{ $t("total_result") }}: {{ pagination.total }}
          <span style="float: right;">
            <a-button class="mb-1" type="primary" ghost :loading="loadingExport" @click="handleExport">
              <i class="fas fa-file-excel mr-1 ml-1" style="color: green;"></i>
              {{ $t("export_all") }}
            </a-button>
            <a-button class="mb-1" type="primary" ghost :loading="loadingExport2" @click="handleExportParent">
              <i class="fas fa-file-excel mr-1 ml-1" style="color: green;"></i>
              {{ $t("export_by_parent_task") }}
            </a-button>
          </span>
        </a-row>
        <a-table
          id="time-sheet-task-table"
          bordered
          :columns="columns"
          :dataSource="dataSrc"
          :loading="loading"
          :rowKey="record => record.key"
          :pagination="pagination"
          :scroll="{ x: true }"
          @change="handleTableChange"
        >
          <template v-for="column of columns.filter(col => !col.customTitle)" :slot="column.slots.title">{{
            $t(column.slots.title)
          }}</template>
          <template slot="no" slot-scope="text, record, index">{{
            (pagination.current - 1) * pagination.pageSize + index + 1
          }}</template>
          <template slot="type" slot-scope="text">
            <img
              :src="text.iconUrl"
              height="16"
              width="16"
              border="0"
              align="absmiddle"
              :alt="text.name"
              :title="text.name + ' - ' + text.description"
            />
          </template>
          <template slot="summary" slot-scope="text">
            <a-tooltip
              placement="bottomLeft"
              :overlayStyle="{ 'max-width': 'fit-content' }"
              :title="text"
              :getPopupContainer="a => a.parentNode"
              >{{ text }}</a-tooltip
            >
          </template>
          <template slot="priority" slot-scope="text">
            <img
              :src="text.iconUrl"
              height="16"
              width="16"
              border="0"
              align="absmiddle"
              :alt="text.name"
              :title="text.name"
            />
          </template>
          <template slot="key" slot-scope="text">
            <a :href="`${userInfo.jiraUrl}/browse/${text}`" target="_blank">
              {{ text }}
            </a>
          </template>
          <template slot="total" slot-scope="text">
            {{ text ? (Math.round((text / 3600) * 100) / 100).toFixed(2) : "" }}
          </template>
        </a-table>
      </a-row>
    </a-form>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { columns } from "./const";

export default {
  data() {
    return {
      columns,
      filters: {
        project: [],
        startDate: this.$moment().startOf("month"),
        endDate: this.$moment()
      },
      dateFormat: "YYYY/MM/DD",
      dataSrc: [],
      pagination: {
        pageSize: 20,
        total: 0,
        current: 1
      },
      loading: false,
      loadingExport: false,
      loadingExport2: false
    };
  },
  computed: {
    ...mapState({
      allProject: state => state.modules["worklog-by-issue"].allProject,
      userInfo: state => state.userInfo
    })
  },
  mounted() {
    this.getProjectListAPI();
  },
  methods: {
    ...mapActions({
      getProjectList: "modules/worklog-by-issue/getProjectList",
      getTimeSheetByTask: "modules/worklog-by-issue/getTimeSheetByTask",
      exportTimeSheetByTask: "modules/worklog-by-issue/exportTimeSheetByTask",
      exportTimeSheetByTaskParent: "modules/worklog-by-issue/exportTimeSheetByTaskParent"
    }),
    handleSearch() {
      this.pagination.current = 1;
      this.getTimeSheetByTaskAPI();
    },
    handleExportParent() {
      this.loadingExport2 = true;
      let payload = {
        filters: _.cloneDeep(this.filters)
      };
      payload.filters.startDate = payload.filters.startDate.format("YYYY-MM-DD");
      payload.filters.endDate = payload.filters.endDate.format("YYYY-MM-DD");
      this.exportTimeSheetByTaskParent(payload)
        .then(response => {
          const fileName = response.headers["content-disposition"].split("=")[1];
          const url = URL.createObjectURL(
            new Blob([response.data], {
              type: "application/vnd.ms-excel"
            })
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          this.loadingExport2 = false;
        })
        .catch(error => {
          console.log(error);
          this.loadingExport2 = false;
        });
    },
    handleExport() {
      this.loadingExport = true;
      let payload = {
        filters: _.cloneDeep(this.filters)
      };
      payload.filters.startDate = payload.filters.startDate.format("YYYY-MM-DD");
      payload.filters.endDate = payload.filters.endDate.format("YYYY-MM-DD");
      this.exportTimeSheetByTask(payload)
        .then(response => {
          const fileName = response.headers["content-disposition"].split("=")[1];
          const url = URL.createObjectURL(
            new Blob([response.data], {
              type: "application/vnd.ms-excel"
            })
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          this.loadingExport = false;
        })
        .catch(error => {
          console.log(error);
          this.loadingExport = false;
        });
    },
    onSelectProjectChange(value) {
      if (value.length) {
        this.filters.project = value;
      } else {
        this.filters.project = [];
        for (const project of this.allProject) {
          this.filters.project.push(project.key);
        }
      }
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current;
      this.getTimeSheetByTaskAPI();
    },

    // handle API
    async getTimeSheetByTaskAPI() {
      this.loading = true;
      let payload = {
        filters: _.cloneDeep(this.filters),
        page: this.pagination.current,
        limit: this.pagination.pageSize
      };
      payload.filters.startDate = payload.filters.startDate.format("YYYY-MM-DD");
      payload.filters.endDate = payload.filters.endDate.format("YYYY-MM-DD");
      const data = await this.getTimeSheetByTask(payload);
      this.dataSrc = data.issues;
      this.pagination.total = data.total;
      this.loading = false;
    },
    async getProjectListAPI() {
      const { data } = await this.getProjectList();
      this.filters.project = [];
      for (const project of data) {
        this.filters.project.push(project.key);
      }
    }
  }
};
</script>

<style scoped>
@import url("./style.css");
</style>
