<template>
  <tr :key="record.id" class="ant-table-row ant-table-row-level-0">
    <td v-for="column in columns" :key="column.id" class="category-item">
      <div v-if="column.key == 'no'" class="text-center">{{ index }}</div>

      <span v-else-if="column.key == 'user'">
        <span v-if="!editting">
          {{ mapUser(record.user_id) }}
        </span>
        <a-select
          v-else
          show-search
          style="width: 200px"
          :defaultValue="record.user_id"
          :filterOption="filterOptionRole"
          @change="user_id => { newRecord.user_id = user_id; record.user_id = user_id }"
        >
          <a-select-option v-for="user in userListOnlyName" :key="user.id" :value="user.id">
            {{ user.full_name }}
          </a-select-option>
        </a-select>
      </span>

      <span v-else-if="column.key == 'jiraEmail'">
        <span
          :class="getJiraEmailByUserIdAndProjectId(record.user_id) == 'Unlinked' ? 'text-danger' : ''"
          v-if="projectData && projectData.jiraId && !editting"
        >
          {{ getJiraEmailByUserIdAndProjectId(record.user_id, record.project_id, record.role_project_id) }}
        </span>
        <span v-else-if="projectData && !projectData.jiraId" class="text-warning">
          Please link the project first!
        </span>
        <a-auto-complete
          v-else
          v-model="email"
          :data-source="results"
          style="width: 300px"
          @select="handleSelect"
          @search="handleSearch"
        />
      </span>
      
       <span v-else-if="column.key == 'isJiraEmail'">
        <span
          :class="getIsJiraEmail(record.user_id, record.project_id, record.role_project_id) == 'Unlinked' ? 'text-danger' : 'text-success'"
          v-if="projectData && projectData.jiraId && !editting"
        >
          {{ getIsJiraEmail(record.user_id, record.project_id, record.role_project_id) }}
        </span>
      </span>

      <span v-else-if="column.key == 'role'">
        <span v-if="!editting">
          {{ mapRoleProject(record[column.dataIndex]) }}
        </span>
        <a-select
          v-else
          show-search
          style="width: 200px"
          :defaultValue="record.role_project_id"
          :filterOption="filterOptionRole"
          @change="role_project_id => { newRecord.role_project_id = role_project_id; record.role_project_id = role_project_id }"
        >
          <a-select-option v-for="role in listRoleProjectActive" :key="role.id" :value="role.id">
            {{ role.name }}
          </a-select-option>
        </a-select>
      </span>

      <div v-else-if="column.key == 'detail'" style="text-align: end">
        <template v-if="!editting">
          <a-tooltip :title="$t('edit')">
            <a-button icon="edit" type="primary" :disabled="editingKey !== ''" @click="onClick(record.id)" />
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
    projectData: Object,
    mode: {
      type: String,
      validator: function(value) {
        // The value must match one of these strings
        return ["create", "update"].indexOf(value) !== -1;
      }
    },
  },
  data() {
    return {
      editting: this.mode == "create" ? true : false,
      newRecord: {},
      loading: false,
      email: this.record.jira_email,
      isJiraEmail: "",
      editingKey: "",
      results: [],
    };
  },
  watch: {
    projectList() {
      this.reupdateData();
    },
    listRoleProject() {
      this.reupdateData();
    },
    userProjectList() {
      this.getJiraEmailByUserIdAndProjectId();
    }
  },
  mounted() {
    this.reupdateData();
     document.addEventListener('click', this.handleClickOutside)
  },
  computed: {
    ...mapState({
      projectList: state => state.modules["user-management"].projectList,
      listRoleProject: state => state.modules["role-project"].listRoleProject,
      userListOnlyName: state => state.modules["user-management"].userListOnlyName,
      userList: state => state.modules["user-management"].userList,
      userProjectList: state => state.modules["user-management"].userProjectList,
      assigneeList: state => state.modules["summary-report-by-issue"].assigneeList,
      emailList: state => state.modules["summary-report-by-issue"].emailList,
    }),
    listRoleProjectActive() {
      return this.listRoleProject.filter(item => !item.delete_flag);
    },
    projectListActive() {
      return this.projectList.filter(item => !item.delete_flag);
    }
  },
  methods: {
    handleCancel() {
      this.editting = false;
      this.editingKey = "";
      this.$emit("cancel");
    },
    async handleSaveRecord() {
      this.reupdateData();
      if (!this.validateInputData({ ...this.newRecord })) return;

      if (this.mode == "create") {
        this.$emit("create", { ...this.newRecord });
        return;
      }
      this.editting = false;
      this.$emit("update", { ...this.newRecord });
      this.editingKey = "";
    },
    getRoleIdByName(roleName) {
      let role = this.listRoleProjectActive.find(item => item.name == roleName);
      return role ? role.id : null;
    },
    reupdateData() {
      let jira_email = this.email;
      let { id, project_id, role_project_id, user_id, jiraUrl, project_key } = this.record;
      this.newRecord = { id, project_id, role_project_id, user_id, jiraUrl, project_key, jira_email };
    },
    validateInputData(e) {
      if (!e.project_id || !e.role_project_id || !e.user_id) {
        this.$notification.error({
          message: this.$t("default_error_empty"),
          description: this.$t("empty_value_create_project_user_role"),
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
    },
    mapUser(user_id) {
      let user = this.userListOnlyName.find(item => item.id == user_id);
      return user ? user.full_name : "";
    },
    getJiraEmailByUserIdAndProjectId(user_id, project_id, role_project_id) {
      let jiraEmail = this.userProjectList.find(u => u.user_id == user_id && u.project_id == project_id && u.role_project_id == role_project_id)?.jira_email ?? "";
      return jiraEmail;
    },
    getIsJiraEmail(user_id, project_id, role_project_id) {
      let isJiraEmail = this.userProjectList.find(u => u.user_id == user_id && u.project_id == project_id && u.role_project_id == role_project_id)?.jira_email == null ? "Unlinked" : "Linked";
      return isJiraEmail;
    },
    mapRoleProject(role_id) {
      let projectRole = this.listRoleProjectActive.find(item => item.id == role_id);
      return projectRole ? projectRole.name : "";
    },
    onClick(id) {
      this.editting = true;
      this.editingKey = id;
    },
    handleSearch(value) {
      this.results = this.emailList.filter((item) => {
        return item.toLowerCase().indexOf(value.toLowerCase()) > -1;
      });
    },
    handleSelect(value) {
      this.email = value;
    }
  }
};
</script>

