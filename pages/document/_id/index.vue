<template>
  <a-card class="shadow" v-if="item && item.id">
    <div class="h1">{{ $t("update_document") }}</div>
    <a-spin :tip="`${$t('loading')}...`" :spinning="loading" class="w-100 h-100">
      <a-row class="mt-2" v-if="!loading">
        <a-col v-bind="wrapperContainerCol">
          <a-form-model ref="modal-upload-document" v-bind="formLayout" :model="formUpload" :rules="getRules">
            <a-form-model-item :colon="false">
              <label slot="label" style="display: none"> a </label>
              <a-radio-group v-model="formUpload.specId" @change="onSpecChange">
                <a-radio v-for="spec in listSpec" :key="spec.id" :value="spec.id"> {{ spec.name }} </a-radio>
              </a-radio-group>
            </a-form-model-item>

            <a-form-model-item :label="$t('title')" prop="title" :colon="false">
              <a-input :placeholder="$t('title')" v-model="formUpload.title" />
            </a-form-model-item>

            <!-- URL -->
            <a-form-model-item label="URL" prop="url" :colon="false" :class="formUpload.url ? 'read-only-field' : ''">
              <a-input placeholder="URL" ref="shareUrl" v-model="formUpload.url">
                <a-tooltip slot="suffix" title="Copy">
                  <a-icon type="copy" style="color: rgba(0, 0, 0, 0.45)" @click="copyUrl" />
                </a-tooltip>
              </a-input>
            </a-form-model-item>

            <a-form-model-item :label="$t('description')" prop="description" :colon="false">
              <a-textarea
                :placeholder="$t('description')"
                v-model="formUpload.description"
                :auto-size="{ minRows: 4 }"
              />
            </a-form-model-item>

            <!-- Project select -->
            <a-form-model-item :label="$t('project')" :colon="false" prop="projectId">
              <a-select
                style="width: 180px"
                :placeholder="$t('project')"
                v-model="formUpload.projectId"
                @change="onProjectChange"
              >
                <a-select-option v-for="item in listProjects" :key="item.id" :value="item.id">{{
                  item.name
                }}</a-select-option>
              </a-select>
            </a-form-model-item>

            <!-- Tag select -->
            <a-form-model-item :label="$t('tag')" :colon="false" prop="tag">
              <TagSelect v-model="formUpload.listTags" />
            </a-form-model-item>

            <!-- File url -->
            <a-form-model-item :label="$t('doc_related')" :colon="false">
              <div v-if="formUpload.specId != 2">
                <div class="text-bold">{{ $t("upper_file") }}</div>
                <FileUrl
                  v-for="(item, index) in formUpload.listUpperFiles"
                  :key="`${index}_upper`"
                  :fileUrl="item"
                  :projectId="formUpload.projectId"
                  :specId="formUpload.specId"
                  :listFiles="formUpload.listUpperFiles"
                  :mode="'upper'"
                  :currentFileId="formUpload.id"
                  @onAdd="handleFillData('listUpperFiles')"
                  @onDelete="onDeleteFile(item, 'listUpperFiles')"
                />
              </div>

              <div v-if="formUpload.specId != 3">
                <div class="text-bold">{{ $t("lower_file") }}</div>
                <FileUrl
                  v-for="(item, index) in formUpload.listLowerFiles"
                  :key="`${index}_lower`"
                  :fileUrl="item"
                  :projectId="formUpload.projectId"
                  :specId="formUpload.specId"
                  :listFiles="formUpload.listLowerFiles"
                  :mode="'lower'"
                  :currentFileId="formUpload.id"
                  @onAdd="handleFillData('listLowerFiles')"
                  @onDelete="onDeleteFile(item, 'listLowerFiles')"
                />
              </div>

              <div class="text-bold">{{ $t("reference_file") }}</div>
              <FileUrl
                v-for="(item, index) in formUpload.listReferFiles"
                :key="`${index}_refer`"
                :fileUrl="item"
                :projectId="formUpload.projectId"
                :specId="formUpload.specId"
                :listFiles="formUpload.listReferFiles"
                :mode="'refer'"
                :currentFileId="formUpload.id"
                @onAdd="handleFillData('listReferFiles')"
                @onDelete="onDeleteFile(item, 'listReferFiles')"
              />
            </a-form-model-item>

            <!-- Document number -->
            <a-form-model-item :label="$t('doc_number')" :colon="false">
              <a-input readOnly :value="documentNumber" :placeholder="$t('doc_number')" />
            </a-form-model-item>

            <a-form-model-item :colon="false">
              <label slot="label" style="display: none"> a </label>
              <a-button type="primary" class="mr-2" icon="save" :loading="updating" @click="onUpload">{{
                $t("save")
              }}</a-button>
              <a-popconfirm title="Sure to delete?" @confirm="onDelete">
                <a-button type="danger" icon="delete" :loading="updating">{{ $t("delete") }}</a-button>
              </a-popconfirm>
            </a-form-model-item>
          </a-form-model>
        </a-col>
      </a-row>
    </a-spin>
  </a-card>
</template>
<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapActions } from "vuex";
import TagSelect from "@/components/Document/TagSelect";
import FileUrl from "@/components/Document/FileUrl";
export default {
  components: {
    TagSelect,
    FileUrl
  },
  data() {
    return {
      formLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      wrapperContainerCol: {
        xs: { span: 24 },
        md: { span: 24 },
        lg: { span: 16, offset: 4 },
        xl: { span: 14, offset: 4 }
      },
      serialNumber: "0001",
      formUpload: {
        specId: 1,
        listTags: [],
        listUpperFiles: [],
        listLowerFiles: [],
        listReferFiles: []
      },
      listSpec: [],
      loading: false,
      updating: false
    };
  },
  computed: {
    ...mapState({
      listProjects: state => state.modules["management-task"].listTask,
      item: state => state.modules["document"].item
    }),
    getRules() {
      const DEFAULT_REQUIRED = this.$t("default_error_empty");
      const validateNonValue = (rule, value, callback) => {
        if (value) return callback();
        else return callback(new Error(DEFAULT_REQUIRED));
      };

      return {
        title: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
        url: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
        projectId: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }]
      };
    },
    documentNumber() {
      return this.formUpload.docNumber
        ? this.formUpload.docNumber
        : this.formUpload.specId
        ? `${
            this.formUpload.specId == 1 ? "S" : this.formUpload.specId == 2 ? "R" : "D"
          }${this.$moment().year()}N${this.setSerialNumber(this.serialNumber)}`
        : "";
    }
  },
  methods: {
    ...mapActions({
      fetchListTask: "modules/management-task/fetchListTask",
      getListTags: "modules/document/getListTags",
      getDocumentById: "modules/document/getDocumentById",
      getAllSpec: "modules/document/getAllSpec",
      getLastDocNum: "modules/document/getLastDocNum",
      deleteDocument: "modules/document/deleteDocument",
      searchDocument: "modules/document/searchDocument",
      updateOrCreateDocument: "modules/document/updateOrCreateDocument"
    }),
    copyUrl() {
      let textToCopy = this.$refs.shareUrl.$el.querySelector("input");
      textToCopy.select();
      document.execCommand("copy");
    },
    onDeleteFile(item, type) {
      const index = this.formUpload[type].findIndex(el => el.id == item.id);
      this.formUpload[type].splice(index, 1);
    },
    handleFillData(type) {
      let creatingElement = this.formUpload[type].find(item => item.mark);
      if (creatingElement) return;
      let item = { mark: true };
      this.formUpload[type].push(item);
    },
    async onUpload() {
      const formData = await this.$refs["modal-upload-document"].validate();
      if (!formData) return;
      let formUpload = _.cloneDeep(this.formUpload);
      formUpload.docNumber = this.documentNumber;
      formUpload.listUpperFiles = formUpload.listUpperFiles.filter(item => !item.mark);
      formUpload.listLowerFiles = formUpload.listLowerFiles.filter(item => !item.mark);
      formUpload.listReferFiles = formUpload.listReferFiles.filter(item => !item.mark);
      this.updating = true;
      await this.updateOrCreateDocument(formUpload);
      this.$notification.success({
        message: "Update document successfully!"
      });
      await this.$refs["modal-upload-document"].resetFields();
      this.$router.push("/document");
    },
    async onSpecChange(e) {
      if (this.formUpload.specId == this.item.spec_id) {
        this.formUpload.listUpperFiles = this.item.listDocsRelated.filter(item => item.type == "UP");
        this.formUpload.listLowerFiles = this.item.listDocsRelated.filter(item => item.type == "LW");
        this.formUpload.listReferFiles = this.item.listDocsRelated.filter(item => item.type == "RF");
        this.fillDataEachFileType();
        this.formUpload.docNumber = this.item.doc_number;
      } else {
        this.formUpload.docNumber = null;
        this.resetFormFileSelect();
        this.serialNumber = await this.getLastDocNum(this.formUpload.specId);
      }
    },
    setSerialNumber(value) {
      if (value == "init") return "0001";
      const stringVal = (value + 1).toString();
      return stringVal.length == 4
        ? stringVal
        : stringVal.length == 3
        ? `0${stringVal}`
        : value.length == 2
        ? `00${stringVal}`
        : `000${stringVal}`;
    },
    onProjectChange(val) {
      this.searchDocument({ filterName: "", listTags: [], projectId: val });
    },
    resetFormFileSelect() {
      this.formUpload.listUpperFiles = [];
      this.formUpload.listLowerFiles = [];
      this.formUpload.listReferFiles = [];
      this.fillDataEachFileType();
    },
    fillDataEachFileType() {
      this.handleFillData("listUpperFiles");
      this.handleFillData("listLowerFiles");
      this.handleFillData("listReferFiles");
    },
    async onDelete() {
      this.updating = true;
      await this.deleteDocument(this.$route.params.id);
      this.$router.push("/document");
    }
  },
  async created() {
    this.loading = true;
    try {
      await this.getDocumentById(this.$route.params.id);
      this.fetchListTask();
      this.listSpec = await this.getAllSpec();
      await this.getListTags();
      this.formUpload = {
        id: this.$route.params.id,
        specId: this.item.spec_id,
        title: this.item.title,
        description: this.item.description,
        url: this.item.url,
        listTags: this.item.listTags.map(item => item.id),
        docNumber: this.item.doc_number,
        projectId: this.item.project_id,
        listUpperFiles: this.item.listDocsRelated.filter(item => item.type == "UP"),
        listLowerFiles: this.item.listDocsRelated.filter(item => item.type == "LW"),
        listReferFiles: this.item.listDocsRelated.filter(item => item.type == "RF")
      };
      this.searchDocument({ filterName: "", listTags: [], projectId: this.item.project_id });
      this.fillDataEachFileType();
    } catch (error) {
      this.$router.push("/document");
      this.$notification.error({
        message: "Error",
        description: "This document does not exist",
        duration: 2.5
      });
    }

    this.loading = false;
  }
};
</script>
<style lang="less">
.read-only-field {
  input {
    background: #e1f2e7;
    color: #03843b;
    :hover {
      outline: none;
    }
  }
}
</style>
