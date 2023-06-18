<template>
  <a-card class="shadow">
    <span>
      <span class="h1"> {{ $t("invoice_history_project") }} : {{ projectName }} </span>
      <span style="float: right">
        <UpsertInvoice
          v-if="renderTablePreview"
          ref="modal-upsert-invoice"
          mode="create"
          :projectName="projectName"
          @create="handleCreateInvoice"
        />
      </span>
    </span>

    <a-spin :tip="`${$t('loading')}...`" :spinning="!renderTablePreview" class="w-100 h-100 mt-3">
      <div
        class="ant-table ant-table-default ant-table-bordered"
        :class="{ 'ant-table-empty': !projectInvoices.length }"
      >
        <div class="ant-table-content">
          <div class="table-wrapper ant-table-body" v-if="renderTablePreview" style="overflow-x: auto">
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
                    <span>{{ $t(column.slots.title) }}</span>
                  </th>
                </tr>
              </thead>

              <tbody class="ant-table-tbody">
                <InvoiceItem
                  v-for="(invoice, index) in projectInvoices"
                  :ref="`invoice_${invoice.name}`"
                  :key="index"
                  :columns="columns"
                  :index="index"
                  :invoice="invoice"
                  :project-info="projectInfo"
                  @refetch="fetchDataByAPI"
                />
              </tbody>
            </table>
          </div>

          <div class="ant-table-placeholder" v-if="!projectInvoices.length || !renderTablePreview">
            <a-empty>
              <span slot="description"> {{ $t("no_result_found") }} </span>
            </a-empty>
          </div>

          <InvoiceHistoryPreview
            v-if="renderTablePreview && projectInvoices.length"
            class="mt-3"
            :project-info="projectInfo"
            @show-detail="handleShowInvoice"
          />
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { columns, extractInvoiceInfo } from "./const";
import InvoiceItem from "@/components/InvoiceManagement/InvoiceItem";
import UpsertInvoice from "@/components/InvoiceManagement/UpsertInvoice";
import InvoiceHistoryPreview from "@/components/InvoiceManagement/InvoiceHistoryPreview";

export default {
  name: "InvoiceManagementItem",
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: {
    InvoiceItem,
    UpsertInvoice,
    InvoiceHistoryPreview
  },
  data() {
    return {
      columns,
      projectInfo: {},
      projectInvoices: [],
      renderTablePreview: false,
      projectId: null
    };
  },
  computed: {
    ...mapState({
      listInvoiceStatus: state => state.modules["invoice-management"].listInvoiceStatus,
      listJiraProject: state => state.modules["jira-project"].listJiraProject,
      projectList: state => state.modules["user-management"].projectList
    }),
    projectName() {
      let project = this.projectList.find(item => item.id == +this.projectId);
      return project ? project.name : "";
    }
  },
  watch: {
    listJiraProject() {
      this.getAllJiraProject();
    }
  },
  async created() {
    this.projectId = this.$route.params.id;
    this.fetchDataByAPI();
    this.fetchATVProject();
    if (this.listJiraProject.length) {
      this.getAllJiraProject();
    }
  },
  methods: {
    ...mapMutations({
      setListAllProjectInJira: "modules/summary-qcd-kpi/setListAllProjectInJira"
    }),
    ...mapActions({
      getProjectList: "modules/summary-report-by-issue/getProjectList",
      fetchListInvoiceInProject: "modules/invoice-management/fetchListInvoiceInProject",
      fetchListInvoiceStatus: "modules/invoice-management/fetchListInvoiceStatus",
      createInvoiceProject: "modules/invoice-management/createInvoiceProject",
      fetchATVProject: "modules/user-management/fetchATVProject"
    }),
    async fetchDataByAPI() {
      this.renderTablePreview = false;

      await this.fetchListInvoiceStatus();
      const { data } = await this.fetchListInvoiceInProject(this.projectId);
      this.projectInfo = data ? data : {};
      this.projectInvoices = data ? data.invoices : [];

      this.renderTablePreview = true;
    },
    async handleCreateInvoice(rawInvoiceData) {
      this.$refs["modal-upsert-invoice"].loading = true;
      rawInvoiceData.project_id = +this.projectId;
      let extractedInvoice = extractInvoiceInfo(rawInvoiceData);
      let response = await this.createInvoiceProject(extractedInvoice);
      this.handleNotifyAPI(response);
      this.$refs["modal-upsert-invoice"].loading = false;
      if (!response.error) this.handleCreatedInvoice();
    },
    handleCreatedInvoice() {
      this.fetchDataByAPI();
      this.$refs["modal-upsert-invoice"].handleResetForm();
      this.$refs["modal-upsert-invoice"].visible = false;
    },
    async getAllJiraProject() {
      let listDraftProject = await Promise.all(
        this.listJiraProject.map(project => {
          return this.getProjectList({ jiraUrl: project.url });
        })
      );

      // Add jiraUrl to each project
      for (let index = 0; index < this.listJiraProject.length; index++) {
        const project = this.listJiraProject[index];
        listDraftProject[index].data.forEach(item => (item.jiraUrl = project.url));
      }

      // Rebuild list project with jiraUrl attached
      listDraftProject = listDraftProject.map(item => item.data);
      let listProject = [];
      listDraftProject.forEach(project => (listProject = listProject.concat(project)));

      this.setListAllProjectInJira(listProject);
    },
    handleShowInvoice(invoiceName) {
      let invoiceNode = this.$refs[`invoice_${invoiceName}`];
      invoiceNode = Array.isArray(invoiceNode) ? invoiceNode[0] : invoiceNode;
      invoiceNode?.showInvoiceDetail();
    }
  }
};
</script>
