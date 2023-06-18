<template>
  <tr :key="record.id" class="ant-table-row ant-table-row-level-0">
    <td v-for="column in columns" :key="column.id" class="category-item">
      <div v-if="column.key == 'no'" class="text-center">{{ index }}</div>

      <span v-else-if="column.key == 'role'">
        <span v-if="!editting">
          {{ record[column.dataIndex] }}
        </span>
        <a-select
          v-else
          show-search
          style="width: 200px"
          :defaultValue="record.role_id"
          :filterOption="filterOptionRole"
          @change="e => (newProject.role_id = e)"
        >
          <a-select-option v-for="role in listRoleProjectActive" :key="role.id" :value="role.id">
            {{ role.name }}
          </a-select-option>
        </a-select>
      </span>

      <span v-else-if="column.key == 'cost'">
        <span v-if="!editting">
          {{ record[column.dataIndex] | numberFormatCurrency }}
        </span>
        <a-input-number v-else :defaultValue="record.cost" @change="e => (newProject.cost = e)" :min="0" />
      </span>

      <div v-else-if="column.key == 'detail'" style="text-align: end">
        <template v-if="!editting">
          <a-tooltip :title="$t('edit')">
            <a-button icon="edit" type="primary" @click="editting = true" />
          </a-tooltip>
          <a-popconfirm :ok-text="$t('yes')" :cancel-text="$t('no')" @confirm="$emit('deprecate', record)">
            <template slot="title">
              <span>{{ $t("are_you_sure") }}</span>
              <br />
              <span>{{ $t("after_confirm_you_cannot_reupdate") }}</span>
            </template>
            <a-tooltip :title="$t('delete')">
              <a-button icon="delete" type="danger" :loading="loading" />
            </a-tooltip>
          </a-popconfirm>
        </template>
        <template v-else>
          <a-tooltip :title="$t('save')">
            <a-button icon="save" type="primary" :loading="loading" @click="handleSaveRecord" />
          </a-tooltip>
          <a-tooltip :title="$t('cancel')">
            <a-button icon="close" type="danger" @click="handleCancel" />
          </a-tooltip>
        </template>
      </div>
    </td>
  </tr>
</template>

<script>
import { mapState } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  props: {
    index: Number,
    columns: Array,
    record: Object,
    mode: {
      type: String,
      validator: function(value) {
        // The value must match one of these strings
        return ["create", "update"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      editting: this.mode == "create" ? true : false,
      newProject: {},
      loading: false
    };
  },
  watch: {
    projectList() {
      this.reupdateData();
    },
    listRoleProject() {
      this.reupdateData();
    }
  },
  mounted() {
    this.reupdateData();
  },
  computed: {
    ...mapState({
      listProjectCostByRole: state => state.modules["project-cost"].listProjectCostByRole,
      projectList: state => state.modules["user-management"].projectList,
      listRoleProject: state => state.modules["role-project"].listRoleProject
    }),
    listRoleProjectActive() {
      return this.listRoleProject.filter(item => !item.delete_flag);
    }
  },
  filters: {
    numberFormatCurrency(dollar) {
      if (dollar) return "$ " + new Intl.NumberFormat().format(parseInt(dollar.toFixed()));
      return "$ 0";
    }
  },
  methods: {
    handleCancel() {
      this.editting = false;
      this.$emit("cancel");
    },
    async handleSaveRecord() {
      if (!this.validateInputData({ ...this.newProject })) return;

      if (this.mode == "create") {
        this.$emit("create", { ...this.newProject });
        return;
      }
      this.editting = false;
      this.$emit("update", { ...this.newProject });
    },
    getProjectIdByName(projectName) {
      let project = this.projectList.find(item => item.name == projectName);
      return project ? project.id : null;
    },
    getRoleIdByName(roleName) {
      let role = this.listRoleProjectActive.find(item => item.name == roleName);
      return role ? role.id : null;
    },
    reupdateData() {
      let project_id = this.record.project_id;
      let role_id = this.getRoleIdByName(this.record.role);

      let originProject = this.projectList.find(item => item.name == this.record.project);
      let originRole = this.listRoleProjectActive.find(item => item.name == this.record.role);

      let cost = this.record.cost;
      let id = this.record.id;
      let payload = { project_id, role_id, cost, id };
      if (originProject) payload.project = originProject.name;
      if (originRole) payload.role = originRole.name;
      this.newProject = { ...payload };
    },
    validateInputData(e) {
      if (!e.role_id || !e.cost) {
        this.$notification.error({
          message: this.$t("default_error_empty"),
          description: this.$t("empty_value_create_project_cost"),
          duration: 2.5
        });
        return false;
      }
      return true;
    },
    filterOptionRole(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    }
  }
};
</script>
