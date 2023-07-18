<template>
  <div>
    <a-card class="shadow">
      <a-row class="category-header">
        <a-col :span="12">
          <span class="h1" style="display: inline-block">
            <template v-if="routeId == 'add'">
              {{ $t("create_task") }}
            </template>
            <template v-else> {{ $t("detail_task") }} : {{ taskInfo.name }} </template>
          </span>
        </a-col>
      </a-row>

      <div class="mt-3">
        <a-spin :tip="`${$t('loading')}...`" :spinning="loading" class="w-100 h-100">
          <a-row>
            <a-col v-bind="wrapperContainerCol">
              <a-form v-bind="formLayout" :form="form" v-if="!loading">
                <a-form-item :label="$t('name')">
                  <a-input
                    v-decorator="[
                      'name',
                      {
                        rules: [{ required: true, message: 'Please input name for task' }],
                        initialValue: taskInfo.name
                      }
                    ]"
                  />
                </a-form-item>

                <a-form-item :label="$t('key')">
                  <a-input
                    style="width: 125px"
                    v-decorator="['key', { rules: [{ required: true }], initialValue: taskInfo.key }]"
                  />
                </a-form-item>

                <a-form-item :label="$t('url')">
                  <a-select
                    style="width: 290px"
                    v-decorator="['jira_url', { rules: [{ required: true }], initialValue: taskInfo.jira_url }]"
                    :placeholder="$t('url')"
                  >
                    <a-select-option v-for="project in listJiraProject" :key="project.id" :value="project.url">
                      {{ project.url }}
                    </a-select-option>
                  </a-select>
                  <a-tag v-if="routeId != 'add'" class="ant-tag-large ml-3" :color="taskInfo.jira_id ? 'blue' : 'red'"
                    >{{ taskInfo.jira_id ? "Linked" : "Unlinked"
                    }}<i :class="'fas ml-2 fa-' + (taskInfo.jira_id ? 'link' : 'unlink')"></i
                  ></a-tag>
                  <a-button
                    v-if="routeId != 'add'"
                    :loading="updating"
                    @click="syncTask"
                    type="primary"
                    class="ml-2"
                    style="bottom: 1px"
                    >{{ $t("sync") }}</a-button
                  >
                </a-form-item>

                <a-form-item :label="$t('description')">
                  <a-textarea
                    v-decorator="['description', { rules: [{ required: false }], initialValue: taskInfo.description }]"
                    :auto-size="{ minRows: 2, maxRows: 6 }"
                  />
                </a-form-item>

                <a-form-item :label="$t('start_date')">
                  <a-date-picker
                    style="width: 125px"
                    v-decorator="[
                      'started_at',
                      {
                        initialValue: $moment(taskInfo.started_at)
                      }
                    ]"
                    :format="dateFormat"
                    :placeholder="$t('start_date')"
                    :allowClear="false"
                  />
                </a-form-item>

                <a-form-item :label="$t('status')">
                  <a-select
                    style="width: 125px"
                    v-decorator="['status_id', { initialValue: taskStatusId }]"
                    :placeholder="$t('status')"
                    :filterOption="filterOptionForManager"
                  >
                    <a-select-option v-for="status in listStatus" :key="status.id">
                      {{ status.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item :label="$t('engineer_skill')">
                  <SkillSelectOption
                    v-for="(skill, index) in filterSkill"
                    ref="skill-selection"
                    mode="skill"
                    :key="index"
                    :skill="skill"
                    :task-skills="taskInfo.skills"
                    @filled="handleFilledSkill"
                    @onDelete="onDelete(skill, false)"
                  />
                </a-form-item>

                <a-form-item :label="$t('business_skill')">
                  <SkillSelectOption
                    v-for="(skill, index) in filterBusinessSkill"
                    ref="skill-selection"
                    mode="bskill"
                    :key="index"
                    :skill="skill"
                    :task-skills="taskInfo.business_skills"
                    @filled="handleFilledBusinessSkill"
                    @onDelete="onDelete(skill, true)"
                  />
                </a-form-item>

                <a-form-item :wrapper-col="actionCol">
                  <template>
                    <a-button
                      v-if="routeId != 'add'"
                      type="primary"
                      icon="save"
                      :loading="updating"
                      @click="handleSubmit"
                    >
                      {{ $t("save") }}
                    </a-button>
                    <a-button v-else type="primary" icon="save" :loading="updating" @click="handleSubmit">
                      {{ $t("create") }}
                    </a-button>
                  </template>
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>
        </a-spin>
      </div>
    </a-card>
    <div v-if="routeId != 'add'" class="mt-3">
      <a-card class="shadow">
        <TaskHistory />
      </a-card>
      <a-card class="shadow mt-3">
        <UserProjectRoleConfig
          :project-data="{
            id: routeId,
            name: taskInfo.name,
            jiraId: this.taskInfo.jira_id,
            key: this.taskInfo.key,
            jiraUrl: this.taskInfo.jira_url
          }"
        />
      </a-card>
      <!-- <a-card class="shadow mt-3">
        <CostSetting :projectId="routeId" />
      </a-card> -->
      <a-card class="shadow mt-3 chat-task">
        <TaskHistoryChat />
      </a-card>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as CONST from "@/constants/index.js";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import { filterSkillNotNull } from "../const";
import SkillSelectOption from "@/components/ManagementTask/SkillSelectOption.vue";
import TaskHistory from "@/components/BusinessSkillSet/TaskHistory.vue";
import UserProjectRoleConfig from "@/components/ProjectATV/UserProjectRoleConfig";
import CostSetting from "@/components/InvoiceManagement/CostSetting";
import TaskHistoryChat from "../../../components/Common/Chart/TaskHistoryChat.vue";

export default {
  name: "DetailTask",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester"]
  },
  components: {
    SkillSelectOption,
    TaskHistory,
    UserProjectRoleConfig,
    CostSetting,
    TaskHistoryChat
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: `Task` }),
      formLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      dateFormat: CONST.DATE_FORMAT,
      wrapperContainerCol: {
        xs: { span: 24 },
        md: { span: 24 },
        lg: { span: 16, offset: 4 },
        xl: { span: 14, offset: 4 },
        xxl: { span: 10, offset: 7 }
      },
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      routeId: null,
      taskInfo: {},
      loading: true,
      updating: false
    };
  },
  computed: {
    ...mapState({
      listSkill: state => state.modules["management-task"].listSkill,
      listBusinessSkill: state => state.modules["business-skill"].listSkill,
      listStatus: state => state.modules["management-task"].listStatus,
      listJiraProject: state => state.modules["jira-project"].listJiraProject
    }),
    filterSkill() {
      return this.taskInfo && this.taskInfo.skills;
    },
    filterBusinessSkill() {
      return this.taskInfo && this.taskInfo.business_skills;
    },
    taskStatusId() {
      if (this.routeId != "add") {
        return this.taskInfo.status.id;
      }

      if (this.listStatus.length) {
        return this.listStatus[0] ? this.listStatus[0].id : null;
      }
    }
  },
  async created() {
    this.loading = true;
    this.routeId = this.$route.params.id;
    this.setAssigneeList([]);
    await this.GetLevels();
    await this.fetchListBusinessLevel();

    if (this.routeId == "add") await this.fetchDataCreate();
    else await this.fetchDataUpdate();
    this.handleFilledSkill();
    this.handleFilledBusinessSkill();
    this.loading = false;
  },
  methods: {
    ...mapMutations({
      setListSkill: "modules/business-skill/setListSkill",
      setAssigneeList: "modules/summary-report-by-issue/setAssigneeList"
    }),
    ...mapActions({
      getTaskByID: "modules/management-task/getTaskByID",
      fetchListBusinessSkill: "modules/business-skill/fetchListBusinessSkill",
      fetchListSkill: "modules/management-task/fetchListSkill",
      fetchListStatus: "modules/management-task/fetchListStatus",
      updateTask: "modules/management-task/updateTask",
      createTask: "modules/management-task/createTask",
      GetLevels: "modules/skill-set/GetLevels",
      fetchListBusinessLevel: "modules/management-task/fetchListBusinessLevel",
      syncTaskWithJiraProject: "modules/management-task/syncTaskWithJiraProject",
      getUsersAssignableInProject: "modules/summary-report-by-issue/getUsersAssignableInProject"
    }),
    async handleSubmit() {
      const formData = await this.validateForm();
      if (!formData) return;

      formData.id = this.routeId;
      formData.skills = this.taskInfo.skills.map(item => ({ skill_id: item.id, level_required: item.level }));
      formData.business_skill = this.taskInfo.business_skills.map(item => ({
        business_skill_id: item.id,
        level_required: item.level
      }));

      if (this.routeId == "add") this.handleCreateTaskAPI(formData);
      else this.handleUpdateTaskAPI(formData);
      this.syncTask(false);
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        const listSelectionForm = this.$refs["skill-selection"];
        const validateResult = listSelectionForm.map(item => item.validate());
        const isValid = !validateResult.includes(false);
        if (isValid) {
          this.form.validateFields(async (err, values) => {
            if (err) return resolve(null);
            resolve(values);
          });
        } else resolve(null);
      });
    },
    filterOptionForManager(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    async handleCreateTaskAPI(e) {
      this.updating = true;
      let response = await this.createTask(e);
      this.handleNotifyAPI(response);
      this.updating = false;
      if (!response.error) {
        let newTaskId = response.data[0].id;
        this.$router.push(`/management-task/${newTaskId}`);
      }
    },
    async handleUpdateTaskAPI(e) {
      this.updating = true;
      let response = await this.updateTask(e);
      this.handleNotifyAPI(response);
      this.updating = false;
      if (response.error) return;
      this.$router.push(`/management-task`);
    },
    async fetchDataCreate() {
      await this.fetchAndExtractSkill();
      await this.fetchListSkill();
      await this.fetchListStatus();

      this.$set(this.taskInfo, "skills", []);
      this.$set(this.taskInfo, "business_skills", []);
    },
    async fetchDataUpdate() {
      let response = await this.fetchListBusinessSkill();
      let newBusinessSkill = _.cloneDeep(response.data).filter(skill => !skill.skill_delete_flag && skill.skill_id);
      this.setListSkill(newBusinessSkill);
      await this.fetchListSkill();
      await this.fetchListStatus();
      let r = await this.getTaskByID(this.routeId);
      this.taskInfo = r.data;
      await this.getUsersAssignableInProject({ jiraUrl: this.taskInfo.jira_url, project_key: this.taskInfo.key });
    },
    async fetchAndExtractSkill() {
      let response = await this.fetchListBusinessSkill();
      if (response.error) {
        this.handleNotifyAPI(response);
        return;
      }

      let newBusinessSkill = filterSkillNotNull(_.cloneDeep(response.data));
      newBusinessSkill = newBusinessSkill.filter(skill => !skill.skill_delete_flag);
      this.setListSkill(newBusinessSkill);
    },
    handleFilledSkill() {
      let creatingElement = this.taskInfo.skills.find(item => item.mark);
      if (creatingElement) return;
      let newSkill = { mark: true };
      this.taskInfo.skills.push(newSkill);
    },
    handleFilledBusinessSkill() {
      let creatingElement = this.taskInfo.business_skills.find(item => item.mark);
      if (creatingElement) return;
      let newSkill = { mark: true };
      this.taskInfo.business_skills.push(newSkill);
    },
    onDelete(item, isBusSkill) {
      if (isBusSkill) {
        const index = this.taskInfo.business_skills.findIndex(el => el.id == item.id);
        this.taskInfo.business_skills.splice(index, 1);
      } else {
        const index = this.taskInfo.skills.findIndex(el => el.id == item.id);
        this.taskInfo.skills.splice(index, 1);
      }
    },
    async syncTask(shouldNotify) {
      const formData = await this.validateForm();
      if (!formData) return;

      let payload = {
        id: this.routeId,
        key: formData.key,
        jira_url: formData.jira_url
      };
      this.updating = true;
      let res = await this.syncTaskWithJiraProject(payload);
      if (res.data.error) {
        if (shouldNotify)
          this.$notification.error({
            message: res.data.message
          });
        this.$set(this.taskInfo, "jira_id", null);
      } else {
        if (shouldNotify)
          this.$notification.success({
            message: res.data.message
          });
        this.$set(this.taskInfo, "jira_id", res.data.data);
        this.$set(this.taskInfo, "key", formData.key);
        this.$set(this.taskInfo, "jira_url", formData.jira_url);
      }
      this.updating = false;
    }
  }
};
</script>

<style>
.ant-tag-large {
  line-height: 30px;
}
.chat-task {
  width: 100%;
}
</style>
