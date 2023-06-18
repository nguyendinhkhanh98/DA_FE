<template>
  <a-card class="shadow">
    <div class="h1">{{ $t("search_document") }}</div>
    <a-row class="mt-2">
      <a-col v-bind="wrapperContainerCol">
        <a-form-model ref="modal-upload-document" v-bind="formLayout" :model="formSearch">
          <a-form-model-item :colon="false">
            <label slot="label" style="display: none"> a </label>
            <a-radio-group v-model="formSearch.specId">
              <a-radio v-for="spec in listSpec" :key="spec.id" :value="spec.id"> {{ spec.name }} </a-radio>
            </a-radio-group>
          </a-form-model-item>

          <!-- Project select -->
          <a-form-model-item :label="$t('project')" :colon="false" prop="projectId">
            <a-select style="width: 180px" :placeholder="$t('project')" v-model="formSearch.projectId">
              <a-select-option
                v-for="item in [{ id: -1, name: $t('all') }, ...listProjects]"
                :key="item.id"
                :value="item.id"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </a-form-model-item>

          <!-- Tag select -->
          <a-form-model-item :label="$t('tag')" :colon="false" prop="tag">
            <TagSelect v-model="formSearch.listTags" />
          </a-form-model-item>

          <!-- Document number -->
          <a-form-model-item :colon="false">
            <label slot="label" style="display: none"> a </label>
            <a-input v-model="formSearch.filterName" placeholder="document number, title,..." />
          </a-form-model-item>

          <a-form-model-item :colon="false">
            <label slot="label" style="display: none"> a </label>
            <a-button class="mt-2" type="primary" icon="search" @click="onSearch">{{ $t("search") }}</a-button>
          </a-form-model-item>
        </a-form-model>
      </a-col>
    </a-row>

    <a-table
      bordered
      :rowKey="record => record.id"
      :columns="columns"
      :data-source="items"
      class="mt-2"
      v-if="isShowTableSearch"
      :loading="loading"
      :scroll="{ x: true }"
    >
      <template>
        <span v-for="(column, index) of columns" :key="index" :slot="column.slots.title">{{
          $t(column.slots.title)
        }}</span>
      </template>
      <template slot="no" slot-scope="text, record">{{ items.indexOf(record) + 1 }} </template>
      <template slot="tag" slot-scope="text">
        <tag-tooltip
          :listTags="
            text.map((item, index) => {
              return { id: index, name: item };
            })
          "
        />
      </template>
      <template slot="linkedTitle" slot-scope="text, record"
        ><a @click="openDocInNewWindow(record.url)">{{ text }}</a></template
      >
      <template slot="createdAt" slot-scope="text">{{ moment(text).format("YYYY/MM/DD") }}</template>
      <template :slot="docType" v-for="docType in ['refDocs', 'upperDocs', 'lowerDocs']" slot-scope="text"
        ><div :key="docType">
          <div v-for="doc in text" :key="doc.id">
            <a @click="openDocInNewWindow(doc.url)" :key="docType">{{ doc.title }}</a>
          </div>
        </div></template
      >

      <template slot="actionCol" slot-scope="text, record">
        <a-button @click="onViewDoc(record.id)" type="primary">{{ $t("select") }}</a-button>
      </template>
    </a-table>
  </a-card>
</template>
<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapActions } from "vuex";
import TagSelect from "@/components/Document/TagSelect";
import TagTooltip from "@/components/TagTooltip";
import moment from "moment";
export default {
  components: {
    TagSelect,
    TagTooltip
  },
  data() {
    return {
      moment,
      formLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      wrapperContainerCol: {
        xs: { span: 24 },
        md: { span: 24 },
        lg: { span: 16, offset: 4 },
        xl: { span: 12, offset: 5 }
      },
      formSearch: {
        specId: 1,
        listTags: [],
        filterName: "",
        projectId: -1
      },
      listSpec: [],
      loading: false,
      isShowTableSearch: false,
      loading: false,
      columns: [
        {
          key: "no",
          slots: { title: "no_" },
          scopedSlots: { customRender: "no" },
          width: "50px"
        },
        {
          dataIndex: "docNumber",
          key: "doc_number",
          slots: { title: "doc_number" },
          width: "120px"
        },
        {
          dataIndex: "title",
          key: "title",
          width: "250px",
          slots: { title: "name" },
          scopedSlots: { customRender: "linkedTitle" }
        },
        {
          dataIndex: "listTags",
          key: "tag",
          width: "250px",
          slots: { title: "tag" },
          scopedSlots: { customRender: "tag" }
        },
        {
          dataIndex: "projectName",
          key: "project",
          width: "120px",
          slots: { title: "project" }
        },
        {
          dataIndex: "creator",
          key: "full_name",
          width: "120px",
          slots: { title: "creator" }
        },
        {
          dataIndex: "createdAt",
          key: "createdAt",
          width: "120px",
          slots: { title: "created_at" },
          scopedSlots: { customRender: "createdAt" }
        },
        {
          dataIndex: "upperDocs",
          key: "upperDocs",
          width: "120px",
          slots: { title: "upper_file" },
          scopedSlots: { customRender: "upperDocs" }
        },
        {
          dataIndex: "lowerDocs",
          key: "lowerDocs",
          width: "120px",
          slots: { title: "lower_file" },
          scopedSlots: { customRender: "lowerDocs" }
        },
        {
          dataIndex: "refDocs",
          key: "refDocs",
          width: "120px",
          slots: { title: "reference_file" },
          scopedSlots: { customRender: "refDocs" }
        },
        {
          slots: { title: "" },
          key: "action",
          width: "80px",
          scopedSlots: { customRender: "actionCol" }
        }
      ]
    };
  },
  computed: {
    ...mapState({
      listCategories: state => state.modules["document"].listCategories,
      items: state => state.modules["document"].items,
      listProjects: state => state.modules["management-task"].listTask
    })
  },
  methods: {
    ...mapActions({
      getListCategories: "modules/document/getListCategories",
      fetchListTask: "modules/management-task/fetchListTask",
      getListTags: "modules/document/getListTags",
      searchDocument: "modules/document/searchDocument",
      getAllSpec: "modules/document/getAllSpec"
    }),
    async onSearch() {
      this.loading = true;
      await this.searchDocument(this.formSearch);
      this.isShowTableSearch = true;
      this.loading = false;
    },
    onViewDoc(id) {
      this.$router.push(`/document/${id}`);
    },
    openDocInNewWindow(url) {
      window.open(url, "_blank", "location=yes,height=870,width=920,scrollbars=yes,status=yes");
    }
  },
  async created() {
    this.getListCategories();
    this.fetchListTask();
    this.getListTags();
    this.listSpec = await this.getAllSpec();
    this.listSpec.unshift({ id: null, name: "All" });
  }
};
</script>
<style lang="scss" scoped></style>
