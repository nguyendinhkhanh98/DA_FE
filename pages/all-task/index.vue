<template>
  <a-card>
    <a-row type="flex" align="middle" justify="space-between">
      <a-col>
        <span class="h1">{{ $t("task_history") }}</span>
      </a-col>
      <!-- <a-col class="text-right">
        <a-button type="primary" @click="onAddNew"><i class="fas fa-plus mr-1" />{{ $t("add_history") }}</a-button>
      </a-col> -->
    </a-row>
    <a-table
      size="small"
      :rowKey="record => record.id"
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      class="mt-2"
    >
      <template>
        <span v-for="(column, index) of columns" :key="index" :slot="column.slots.title">{{
          $t(column.slots.title)
        }}</span>
      </template>
      <template slot="no" slot-scope="text, record, index">{{ index + 1 }} </template>
      <template slot="projectName" slot-scope="text, record">
        {{ record.projectName }}
      </template>
      <template slot="startDate" slot-scope="text">
        <template>
          {{ text ? $moment(text).format("YYYY/MM/DD") : null }}
        </template>
      </template>
      <template slot="endDate" slot-scope="text">
        <template>
          {{ text ? $moment(text).format("YYYY/MM/DD") : null }}
        </template>
      </template>
      <template slot="commentCol" slot-scope="text">
        <template>
          {{ text }}
        </template>
      </template>
      <template slot="attackCol" slot-scope="listFiles">
        <div v-if="listFiles && listFiles.length">
          <div v-for="(item, index) in listFiles" :key="index">
            <span class="text-link pointer" @click="downloadFile(item.secure_url, item.original_filename)">
              <a-icon type="link" class="mr-1" />{{ item.original_filename }}</span
            >
          </div>
        </div>
        <div v-else></div>
      </template>
      <template slot="actionCol" slot-scope="text, record">
        <a-button @click="edit(record)" type="primary" icon="edit" size="small" />
        <!-- <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.id)">
          <a-button type="danger" icon="delete" :loading="updating" size="small" />
        </a-popconfirm> -->
      </template>
      <template slot="fileReport" slot-scope="listFilesReport">
        <div v-if="listFilesReport && listFilesReport.length">
          <div v-for="(item, index) in listFilesReport" :key="index">
            <span class="text-link pointer" @click="downloadFile(item.secure_url, item.original_filename)">
              <a-icon type="link" class="mr-1" />{{ item.original_filename }}</span
            >
          </div>
        </div>
        <div v-else></div>
      </template>
      <template slot="taskHistoryStatus" slot-scope="text, record">
        <a-tag :color="mapColorTag(record.status)"> {{ record.status }} </a-tag>
      </template>

      <template slot="evaluateScore" slot-scope="text, record">
        <a-tag
          :color="
            mapColorScoreTag(record.score < 5 ? 'bad' : record.score >= 5 && record.score < 8 ? 'medium' : 'good')
          "
          >{{ record.score || 0 }} / 10</a-tag
        >
      </template>

      <!-- filter option status -->
      <div slot="filterDropdown" slot-scope="{ column }" class="p-2">
        <!-- role column -->
        <a-select
          v-if="column.key == 'task_history_status'"
          v-ant-ref="c => (searchForcus = c)"
          v-model="filterStatus"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          :filterOption="filterDataByStatus"
        >
          <a-select-option
            v-for="(item, index) in listStatusTask"
            :key="index"
            :label="item.label | Snakeformat"
            :value="item.value"
          >
            {{ item.label | Snakeformat }}
          </a-select-option>
        </a-select>
      </div>
      <a-icon slot="filterIcon" type="search" />
    </a-table>

    <!-- Modal create -->
    <a-modal
      :visible="openModalAddOrUpdate"
      v-if="openModalAddOrUpdate"
      :title="currentId ? $t('update_history') : $t('add_history')"
      :okButtonProps="{ props: { loading: updating } }"
      @ok="handleOk"
      @cancel="
        openModalAddOrUpdate = false;
        currentId = null;
        filePath = [];
      "
    >
      <a-form :form="form" :layout="'vertical'">
        <a-form-item :label="$t('user')">
          <a-select
            style="width: 100%"
            @change="onSelectChange"
            v-decorator="['user_id', { rules: [{ required: true, message: 'This field is required' }] }]"
            :disabled="!role.includes('admin')"
          >
            <a-select-option v-for="(item, index) in userList" :key="index" :value="item.id">
              {{ item.fullName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="$t('start_date')">
          <a-date-picker
            v-decorator="['start_date', { rules: [{ required: true, message: 'This field is required' }] }]"
            :format="'YYYY/MM/DD'"
            :allowClear="false"
            :disabled="!role.includes('admin')"
          />
        </a-form-item>

        <a-form-item :label="$t('end_date')">
          <a-date-picker v-decorator="['end_date']" :format="'YYYY/MM/DD'" :disabled="!role.includes('admin')" />
        </a-form-item>

        <a-form-item :label="$t('comment')">
          <a-textarea v-decorator="['comment']" :auto-size="{ minRows: 4 }" :disabled="!role.includes('admin')" />
        </a-form-item>

        <a-form-item :label="$t('attachment')">
          <div v-if="filePath.length">
            <div v-for="(item, index) in filePath" :key="index">
              <span class="text-link pointer" @click="downloadFile(item.secure_url, item.original_filename)">
                <a-icon type="link" class="mr-1" />{{ item.original_filename }}</span
              >
              <a-icon
                class="ml-2"
                type="delete"
                :style="{ color: 'red', cursor: 'pointer' }"
                @click="removeFile(item)"
              />
            </div>
          </div>
          <a-upload
            v-else
            name="file"
            accept="image/*, .pdf, .doc, .txt, .pptx, .docx"
            @change="handleUpload"
            :customRequest="customRequest"
            :multiple="true"
          >
            <a-button :disabled="!role.includes('admin')"> <a-icon type="upload" /> {{ $t("upload_file") }} </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item :label="$t('file_report')">
          <div v-if="filePathReport.length">
            <div v-for="(item, index) in filePathReport" :key="index">
              <span class="text-link pointer" @click="downloadFile(item.secure_url, item.original_filename)">
                <a-icon type="link" class="mr-1" />{{ item.original_filename }}</span
              >
              <a-icon
                class="ml-2"
                type="delete"
                :style="{ color: 'red', cursor: 'pointer' }"
                @click="removeFileReport(item)"
              />
            </div>
          </div>
          <a-upload
            v-else
            name="file"
            accept="image/*, .pdf, .doc, .txt, .pptx, .docx"
            @change="handleUploadFileReport"
            :customRequest="customRequest"
            :multiple="true"
          >
            <a-button> <a-icon type="upload" /> {{ $t("upload_file") }} </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item :label="$t('task_history_status')">
          <a-select
            style="width: 120px"
            @change="onSelectChange"
            v-decorator="['status', { rules: [{ required: true, message: 'This field is required' }] }]"
            :placeholder="$t('status')"
          >
            <a-select-option v-for="(item, index) in listStatusTask" :key="index" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('evaluate_score')" v-if="isDisplayEvaluateScore">
          <a-input
            v-decorator="['evaluate_score', { rules: [{ required: true, message: $t('default_error_empty') }] }]"
            :placeholder="'Điểm'"
            type="number"
            style="width: 100px"
            max="10"
            min="0"
            :disabled="!role.includes('admin')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import { mapColorTag, mapColorScoreTag } from "../../components/BusinessSkillSet/const";
import * as FileSaver from "file-saver";
export default {
  data() {
    return {
      columns: [
        {
          key: "no",
          slots: { title: "no_" },
          scopedSlots: { customRender: "no" }
        },
        {
          dataIndex: "project_name",
          key: "project_name",
          slots: { title: "project_name" },
          scopedSlots: { customRender: "projectName" }
        },
        {
          slots: { title: "comment" },
          dataIndex: "comment",
          key: "comment",
          scopedSlots: { customRender: "commentCol" },
          width: "250px"
        },
        {
          slots: { title: "start_date" },
          defaultSortOrder: "descend",
          sorter: (a, b) => a.start_date?.localeCompare(b.start_date),
          dataIndex: "start_date",
          key: "start_date",
          scopedSlots: { customRender: "startDate" }
        },
        {
          slots: { title: "end_date" },
          dataIndex: "end_date",
          key: "end_date",
          scopedSlots: { customRender: "endDate" }
        },
        {
          slots: { title: "attachment" },
          dataIndex: "attachment",
          key: "attachment",
          scopedSlots: { customRender: "attackCol" }
        },
        {
          slots: { title: "file_report" },
          dataIndex: "fileReport",
          key: "file_report",
          scopedSlots: { customRender: "fileReport" }
        },
        {
          slots: { title: "task_history_status" },
          dataIndex: "task_history_status",
          key: "task_history_status",
          scopedSlots: { customRender: "taskHistoryStatus", filterDropdown: "filterDropdown", filterIcon: "filterIcon" }
        },
        {
          slots: { title: "evaluate_score" },
          dataIndex: "evaluate_score",
          key: "evaluate_score",
          scopedSlots: { customRender: "evaluateScore" }
        },
        {
          slots: { title: "action" },
          key: "action",
          scopedSlots: { customRender: "actionCol" }
        }
      ],
      openModalAddOrUpdate: false,
      form: this.$form.createForm(this, { name: "coordinated" }),
      selectedItems: null,
      fileData: [],
      filePath: [],
      filePathReport: [],
      fileDataReport: [],
      currentId: null,
      updating: false,
      mapColorTag,
      mapColorScoreTag,
      listStatusTask: [
        {
          label: "new",
          value: "new"
        },
        {
          label: "working",
          value: "working"
        },
        {
          label: "done",
          value: "done"
        }
      ],
      filterStatus: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      },
      isDisplayEvaluateScore: false,
      items: [],
      currentProjectId: null,
      currentScoreProject: 0
    };
  },
  computed: {
    ...mapState({
      userList: state => state.modules["user-management"].userList,
      isChangeTask: state => state.modules["management-task"].isChangeTask
    }),
    dataSource() {
      let clone = _.cloneDeep(this.items);
      clone = this.filterDataByStatus(clone);
      this.pagination.total = clone.length;
      return clone;
    },
    ...mapGetters({
      role: "role"
    })
  },
  methods: {
    ...mapActions({
      getAllUser: "modules/user-management/getAllUser",
      getAllHistoryByTaskId: "modules/management-task/getAllHistoryByTaskId",
      removeHistory: "modules/management-task/removeHistory",
      addOrUpdateHistory: "modules/management-task/addOrUpdateHistory",
      uploadFile: "modules/management-task/uploadFile",
      deleteFile: "modules/management-task/deleteFile",
      getFile: "modules/management-task/getFile"
    }),
    ...mapMutations({
      setIsChangeTask: "modules/management-task/setIsChangeTask"
    }),
    handleChange(value, key, column) {
      const target = this.items.find(item => item.id == key);
      const index = this.items.findIndex(item => item.id == key);
      if (target) {
        target[column] = value;
        this.$set(this.items, index, target);
      }
    },
    edit(record) {
      this.isDisplayEvaluateScore = record?.status == "done";
      this.form = this.$form.createForm(this, {
        mapPropsToFields: () => {
          return {
            user_id: this.$form.createFormField({
              value: record.user_id
            }),
            start_date: this.$form.createFormField({
              value: record.start_date
            }),
            end_date: this.$form.createFormField({
              value: record.end_date
            }),
            comment: this.$form.createFormField({
              value: record.comment
            }),
            attachment: this.$form.createFormField({
              value: record.attachment
            }),
            status: this.$form.createFormField({
              value: record.status
            }),
            file_report: this.$form.createFormField({
              value: record.fileReport
            }),
            evaluate_score: this.$form.createFormField({
              value: record?.score || 0
            })
          };
        }
      });
      this.currentScoreProject = record?.score || 0;
      this.currentProjectId = record.projectId;
      this.currentId = record.id;
      this.originFile = record.attachment;
      this.originFileReport = record.fileReport;
      this.filePath = _.cloneDeep(record.attachment ? record.attachment : []);
      this.filePathReport = _.cloneDeep(record.fileReport ? record.fileReport : []);
      this.openModalAddOrUpdate = true;
      this.fileData = [];
      this.fileDataReport = [];
    },
    handleOk() {
      this.form.validateFields(async (err, values) => {
        if (err) return;
        this.updating = true;

        // file description
        let listFiles = [];
        this.fileData = _.uniq(this.fileData);
        if (this.fileData.length) {
          for (let i = 0; i < this.fileData.length; i++) {
            const element = this.fileData[i];
            const formData = new FormData();
            formData.append("file", element);
            const response = await this.uploadFile(formData);
            listFiles.push(response.data.data);
          }
        }

        // file report
        let listFilesReport = [];
        this.fileDataReport = _.uniq(this.fileDataReport);
        if (this.fileDataReport.length) {
          for (let i = 0; i < this.fileDataReport.length; i++) {
            const element = this.fileDataReport[i];
            const formData = new FormData();
            formData.append("file", element);
            const response = await this.uploadFile(formData);
            listFilesReport.push(response.data.data);
          }
        }

        let payload = {
          id: this.currentId,
          user_id: values.user_id,
          start_date: this.$moment(values.start_date).format(),
          end_date: values.end_date ? this.$moment(values.end_date).format() : null,
          task_id: this.currentProjectId,
          comment: values.comment,
          attachment: this.filePath.length ? this.filePath : this.fileData.length ? listFiles : [],
          fileReport: this.filePathReport.length
            ? this.filePathReport
            : this.fileDataReport.length
            ? listFilesReport
            : [],
          status: values.status,
          score: values?.evaluate_score || this.currentScoreProject || 0
        };
        payload.attachment = JSON.stringify(payload.attachment);
        payload.fileReport = JSON.stringify(payload.fileReport);
        try {
          await this.addOrUpdateHistory(payload);
          const deleteFiles = _.differenceWith(this.originFile, this.filePath, _.isEqual);
          if (deleteFiles.length) {
            for (let i = 0; i < deleteFiles.length; i++) {
              const element = deleteFiles[i];
              await this.deleteFile(element);
            }
          }
          const deleteFilesReport = _.differenceWith(this.originFileReport, this.filePathReport, _.isEqual);
          if (deleteFilesReport.length) {
            for (let i = 0; i < deleteFilesReport.length; i++) {
              const element = deleteFilesReport[i];
              await this.deleteFile(element);
            }
          }
          const data = await this.$request.get("/api/v2/business-skill-set/task-history-user");
          this.items = data?.data?.data || [];
          this.$notification.success({
            message: "Success",
            description: `${this.currentId ? "Update" : "Add new"} history successfully`
          });
          this.form.resetFields();
          this.openModalAddOrUpdate = false;
          this.currentId = null;
          this.fileData = [];
          this.filePath = [];
          this.fileDataReport = [];
          this.filePathReport = [];
          this.updating = false;
        } catch (error) {
          this.updating = false;
          this.$notification.error({
            message: "Error",
            description: "Something went wrong! Please try again"
          });
        }
      });
      this.setIsChangeTask(true);
    },
    onSelectChange(data) {
      console.log(data);
    },
    handleUpload(data) {
      if (data.fileList.length) {
        for (let i = 0; i < data.fileList.length; i++) {
          const element = data.fileList[i];
          this.fileData.push(element.originFileObj);
        }
      }
    },
    handleUploadFileReport(data) {
      if (data.fileList.length) {
        for (let i = 0; i < data.fileList.length; i++) {
          const element = data.fileList[i];
          this.fileDataReport.push(element.originFileObj);
        }
      }
    },
    async downloadFile(path, name) {
      fetch(path, {
        method: "GET"
      }).then(async data => {
        const blob = await data.blob();
        FileSaver.saveAs(blob, name);
      });
    },
    async removeFile(path) {
      const index = this.filePath.findIndex(item => item == path);
      this.filePath.splice(index, 1);
    },
    async removeFileReport(path) {
      const index = this.filePathReport.findIndex(item => item == path);
      this.filePathReport.splice(index, 1);
    },
    customRequest({ onSuccess, onError, file }) {
      setTimeout(() => {
        onSuccess("Ok");
        this.$notification.success({ message: "Upload file successfully!" });
      }, 0);
    },
    filterDataByStatus(clone) {
      if (this.filterStatus?.length) {
        return clone.filter(item => {
          return this.filterStatus.includes(item?.status);
        });
      }
      return clone;
    }
  },
  async mounted() {
    this.getAllUser();
  },
  async created() {
    const data = await this.$request.get("/api/v2/business-skill-set/task-history-user");
    this.items = data?.data?.data || [];
  }
};
</script>
<style lang="less">
.modal-history {
  .ant-modal {
    top: 50px;
    width: 600px !important;
    .ant-modal-body {
      padding: 10px !important;
    }
  }
}
</style>
