<template>
  <a-card class="shadow">
    <h1>{{ $t("jira_project_config") }}</h1>

    <div class="text-right">
      <a-button type="primary" icon="plus" @click="handleAddProject">
        {{ $t("add_jira_project") }}
      </a-button>

      <a-button type="primary" icon="save" @click="handleSaveLayout" v-if="edittingLayout">
        {{ $t("save_layout") }}
      </a-button>
    </div>

    <div class="table-wrapper ant-table ant-table-bordered mt-2">
      <table class="table-bordered">
        <thead class="ant-table-thead">
          <tr>
            <th style="width: 50px"></th>
            <th class="wrapper-header" v-for="column in columns" :key="column.key" :width="column.width">
              {{ $t(column.slots.title) }}
            </th>
          </tr>
        </thead>

        <draggable
          v-model="listOrder"
          v-bind="dragOptions"
          tag="tbody"
          class="ant-table-tbody"
          :disabled="!enableDragable"
        >
          <tr v-for="(record, index) in listOrder" :key="record.id">
            <td
              class="text-center"
              style="cursor: move"
              @mouseover="enableDragable = true"
              @mouseleave="enableDragable = false"
            >
              <a-icon type="drag" />
            </td>

            <td>
              <div>
                <template>
                  {{ index + 1 }}
                </template>
              </div>
            </td>

            <td>
              <div>
                <a-input
                  v-if="record.editting"
                  style="margin: -5px 0"
                  :value="record.name"
                  @change="e => handleChange(e.target.value, record, 'name')"
                />
                <template v-else>
                  {{ record.name }}
                </template>
              </div>
            </td>

            <td>
              <div>
                <a-input
                  v-if="record.editting"
                  style="margin: -5px 0"
                  :value="record.url"
                  @change="e => handleChange(e.target.value, record, 'url')"
                />
                <template v-else>
                  {{ record.url }}
                </template>
              </div>
            </td>

            <td>
              <div class="editting-row-operations">
                <span v-if="record.id == 'add'">
                  <a-tooltip :title="$t('create')">
                    <a-button type="primary" icon="check" :loading="loading" @click="() => handleCreate(record)" />
                  </a-tooltip>
                  <a-tooltip :title="$t('cancel')">
                    <a-button class="ml-1" icon="close" @click="() => handleCancel(record.id)" />
                  </a-tooltip>
                </span>
                <span v-else-if="record.editting">
                  <a-tooltip :title="$t('save')">
                    <a-button type="primary" icon="save" :loading="loading" @click="() => handleSave(record.id)" />
                  </a-tooltip>
                  <a-tooltip :title="$t('cancel')">
                    <a-button class="ml-1" icon="close" @click="() => handleCancel(record.id)" />
                  </a-tooltip>
                </span>
                <span v-else>
                  <a-tooltip :title="$t('edit')">
                    <a-button
                      type="primary"
                      icon="edit"
                      :disabled="editingKey !== ''"
                      @click="() => handleEdit(record.id)"
                    />
                  </a-tooltip>

                  <a-popconfirm :title="$t('are_you_sure_to_delete')" @confirm="handleDelete(record.id)">
                    <a-tooltip :title="$t('delete')">
                      <a-button
                        class="ml-1"
                        icon="delete"
                        type="danger"
                        :loading="loading"
                        :disabled="editingKey !== ''"
                      />
                    </a-tooltip>
                  </a-popconfirm>
                </span>
              </div>
            </td>
          </tr>
        </draggable>
      </table>
    </div>
  </a-card>
</template>

<script>
import { columns } from "./const";
import { mapState, mapMutations, mapActions } from "vuex";

import Draggable from "vuedraggable";
const dragOptions = {
  sort: true,
  scroll: true,
  scrollSpeed: 2,
  animation: 150,
  ghostClass: "dragable-ghost",
  chosenClass: "dragable-chose",
  dragClass: "dragable-drag",
  group: "task"
};

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager"]
  },
  components: {
    Draggable
  },
  data() {
    return {
      columns,
      dragOptions,
      editingKey: "",
      cacheData: [],
      edittingLayout: false,
      enableDragable: false,
      loading: false
    };
  },
  mounted() {
    this.updateCacheData();
  },
  computed: {
    ...mapState({
      listJiraProject: state => state.modules["jira-project"].listJiraProject
    }),
    listOrder: {
      get() {
        return this.listJiraProject;
      },
      set(value) {
        this.edittingLayout = true;
        this.setJiraProject(value);
      }
    }
  },
  methods: {
    ...mapMutations({
      setJiraProject: "modules/jira-project/setJiraProject"
    }),
    ...mapActions({
      deleteJiraProject: "modules/jira-project/deleteJiraProject",
      updateJiraProject: "modules/jira-project/updateJiraProject",
      createJiraProject: "modules/jira-project/createJiraProject",
      updateSortOrderJiraProject: "modules/jira-project/updateSortOrderJiraProject"
    }),
    handleChange(value, record, column) {
      const newData = [...this.listJiraProject];
      const target = newData.find(item => item.id == record.id);
      if (target) {
        target[column] = value;
        this.setJiraProject(newData);
      }
    },
    handleEdit(project_id) {
      this.updateCacheData();
      const newData = [...this.listJiraProject];
      const target = newData.find(item => project_id === item.id);
      this.editingKey = project_id;

      if (target) {
        target.editting = true;
        this.setJiraProject(newData);
      }
    },
    handleSave(project_id) {
      const newData = [...this.listJiraProject];
      const target = newData.find(item => item.id == project_id);
      if (target) {
        delete target.editting;
        this.setJiraProject(newData);
        this.updateJiraProjectAPI(target);
      }
      this.editingKey = "";
    },
    handleCancel(key) {
      const newData = [...this.listJiraProject];
      const target = newData.find(item => key === item.id);
      this.editingKey = "";
      if (target) {
        Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
        delete target.editting;
        this.setJiraProject(this.cacheData);
      }
    },
    handleCreate(project) {
      if (!project || !project.name || !project.url) {
        const messagePayload = {
          message: "Name or url empty",
          description: "Name or url empty",
          duration: 2.5
        };
        this.$notification.error(messagePayload);
        return;
      }

      this.createJiraProjectAPI(project);
      this.handleCancel(project.id);
    },
    async handleDelete(project_id) {
      this.loading = true;
      let response = await this.deleteJiraProject(project_id);
      this.loading = false;

      this.handleResponse(response);
    },
    async updateJiraProjectAPI(project) {
      this.loading = true;
      let response = await this.updateJiraProject(project);
      this.loading = false;
      if (response.error) {
        this.handleCancel(project.id);
      }
      this.handleResponse(response);
    },
    updateCacheData() {
      this.cacheData = this.listJiraProject.map(item => ({ ...item }));
    },
    handleAddProject() {
      let self = this;
      let newProject = { id: "add", name: "", url: "", editting: true };
      let foundProject = this.listJiraProject.find(item => item.id == newProject.id);

      let foundEditting = this.listJiraProject.find(item => item.editting);
      if (foundEditting) {
        this.$confirm({
          title: self.$t("warning_abort_editting_record"),
          okText: self.$t("yes"),
          cancelText: self.$t("no"),
          zIndex: 10000,
          centered: true,
          onOk() {
            self.handleCancel(foundEditting.id);
            self.updateCacheData();
            self.editingKey = newProject.id;
            const newData = [...self.listJiraProject];
            newData.push(newProject);
            self.setJiraProject(newData);
          },
          onCancel() {
            console.log("Continue editting");
          }
        });
      } else if (!foundProject) {
        this.updateCacheData();
        this.editingKey = newProject.id;
        const newData = [...this.listJiraProject];
        newData.push(newProject);
        this.setJiraProject(newData);
      }
    },
    async createJiraProjectAPI(newProject) {
      this.loading = true;
      let response = await this.createJiraProject(newProject);
      this.loading = false;
      this.handleResponse(response);
    },
    async handleSaveLayout() {
      let projects = this.listOrder;
      let response = await this.updateSortOrderJiraProject({ projects });
      this.handleResponse(response);
      this.edittingLayout = false;
    },
    handleResponse(response) {
      const messagePayload = {
        message: this.$t(response.message),
        description: this.$t(response.message),
        duration: 2.5
      };
      if (response.error) {
        this.$notification.error(messagePayload);
      } else {
        this.$notification.success(messagePayload);
      }
    }
  }
};
</script>
<style scoped>
.editting-row-operations a {
  margin-right: 8px;
}
</style>

<style lang="less" scoped>
.table-wrapper {
  overflow-x: auto;

  .table-bordered {
    border-collapse: collapse;
    width: 1200px;
    min-width: 100%;
    border-radius: 4px 4px 0 0;

    & table,
    th,
    td {
      border: 1px solid #e8e8e8;
    }
  }
}
</style>

<style lang="less">
.dragable-ghost {
  border: 1px dashed chocolate;
  opacity: 1;
}
.dragable-chose {
  border: 1px dashed blue;
  opacity: 0.8;
}
.dragable-drag {
  border: 1px dashed red;
  opacity: 1;
}
</style>
