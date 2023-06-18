<template>
  <tr>
    <template v-for="column in columns">
      <td v-if="column.key == 'invoice_name'" :key="column.key" :span="column.span" :width="column.width">
        <InvoiceDetailPreview
          ref="invoice-detail-preview"
          :invoice="invoice"
          :userWorklogsWithCost="userWorklogsWithCost"
          :loading="loading"
          :status="mapInvoiceStatus(invoice)"
          :duration="durationFormat"
          @click="handleFetchInvoiceDetail"
          @refetch="$emit('refetch')"
        />
      </td>

      <td
        v-else-if="column.key == 'status'"
        :key="column.key"
        :span="column.span"
        :width="column.width"
        :style="getStyleStatus()"
      >
        <template>
          {{ mapInvoiceStatus(invoice) }}
        </template>
      </td>

      <td v-else-if="column.key == 'updatedAt'" :key="column.key" :span="column.span" :width="column.width">
        <template>
          {{ setUpdatedAt(invoice) }}
        </template>
      </td>

      <td v-else-if="column.key == 'dueDate'" :key="column.key" :span="column.span" :width="column.width">
        <template>
          {{ setDueDate(invoice) }}
        </template>
      </td>

      <td
        v-else-if="['start_date', 'end_date'].includes(column.key)"
        :key="column.key"
        :span="column.span"
        :width="column.width"
      >
        <template>
          {{ getFormattedDate(column.key, invoice) }}
        </template>
      </td>

      <td
        v-else-if="column.key == 'no'"
        :key="column.key"
        :span="column.span"
        :width="column.width"
        class="text-center"
      >
        {{ index + 1 }}
      </td>

      <td v-else-if="column.key == 'total_cost'" :key="column.key" :span="column.span" :width="column.width">
        <strong>{{ invoice[column.dataIndex] | numberFormatCurrency }}</strong>
      </td>

      <td v-else-if="column.key == 'detail'" :key="column.key" :span="column.span" :width="column.width">
        <a-tooltip :title="$t('detail')">
          <a-button icon="dollar" @click="showInvoiceDetail" type="primary" />
        </a-tooltip>

        <a-tooltip :title="'Export Report'">
          <a-button icon="file-excel" :loading="isExporting" @click="exportReport" type="primary" />
        </a-tooltip>

        <UpsertInvoice
          mode="update"
          ref="upsert-invoice"
          :record="invoice"
          @update="handleUpdateInvoice"
          :projectName="projectInfo.project_name"
        />

        <a-popconfirm
          placement="top"
          :title="$t('are_you_sure_to_delete')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="handleDeleteInvoice"
        >
          <a-tooltip :title="$t('delete')">
            <a-button type="danger" icon="delete" :loading="updating" />
          </a-tooltip>
        </a-popconfirm>
      </td>

      <td v-else :key="column.key" :span="column.span" :width="column.width">
        {{ invoice[column.dataIndex] }}
      </td>
    </template>
  </tr>
</template>

<script>
import { mapState, mapActions } from "vuex";
import UpsertInvoice from "@/components/InvoiceManagement/UpsertInvoice";
import InvoiceDetailPreview from "@/components/InvoiceManagement/InvoiceDetailPreview";
import * as CONST from "@/constants/index.js";
import { extractInvoiceInfo } from "@/pages/invoice-management/_id/const.js";
import moment from "moment";

const baseOption = {
  project: [],
  issuetype: [],
  status: [],
  sprint: [],
  assignee: []
};

export default {
  props: {
    columns: Array,
    invoice: Object,
    index: Number,
    projectInfo: Object
  },
  components: {
    UpsertInvoice,
    InvoiceDetailPreview
  },
  filters: {
    numberFormatCurrency(dollar) {
      if (dollar) return "$ " + new Intl.NumberFormat().format(parseInt(dollar.toFixed(0)));
      return "$ 0";
    }
  },
  data() {
    return {
      userWorklogsWithCost: [],
      loading: false,
      filters: {
        project: [],
        issuetype: [],
        status: [],
        sprint: [],
        assignee: []
      },
      updating: false,
      isExporting: false
    };
  },
  computed: {
    ...mapState({
      listInvoiceStatus: state => state.modules["invoice-management"].listInvoiceStatus,
      listAllProjectInJira: state => state.modules["summary-qcd-kpi"].listAllProjectInJira
    }),
    durationFormat() {
      let duration = [];
      if (!this.invoice) return null;
      duration[0] = this.$moment(this.invoice.start_date, CONST.DATE_FORMAT_AND_TIME).format(CONST.DATE_FORMAT);
      duration[1] = this.$moment(this.invoice.end_date, CONST.DATE_FORMAT_AND_TIME).format(CONST.DATE_FORMAT);
      return duration;
    }
  },
  methods: {
    ...mapActions({
      updateInvoiceProject: "modules/invoice-management/updateInvoiceProject",
      getUserWorklog: "modules/dashboard/getUserWorklog",
      expandProjectCostWithATVData: "modules/project-cost/expandProjectCostWithATVData",
      deleteInvoiceProject: "modules/invoice-management/deleteInvoiceProject",
      fetchListUserRoleProjectByProjectId: "modules/role-project/fetchListUserRoleProjectByProjectId",
      fetchProjectCostByProjectId: "modules/project-cost/fetchProjectCostByProjectId",
      getInvoiceReport: "modules/export-report-by-invoice/getInvoiceReport"
    }),
    mapInvoiceStatus(invoice) {
      if (!invoice.history.length) return "";
      const lastHistory = invoice.history.reduce((a, b) => {
        return this.$moment(a.updated_at).isAfter(b.updated_at) ? a : b;
      });
      return lastHistory.name;
    },
    setUpdatedAt(invoice) {
      if (!invoice.history.length) return "";
      const lastHistory = invoice.history.reduce((a, b) => {
        return this.$moment(a.updated_at).isAfter(b.updated_at) ? a : b;
      });
      return this.$moment(lastHistory.updated_at).format(CONST.DATE_FORMAT);
    },
    setDueDate(invoice) {
      if (!invoice.history.length) return "";
      return invoice.due_date ? this.$moment(invoice.due_date).format(CONST.DATE_FORMAT) : "";
    },
    getFormattedDate(columnKey, invoice) {
      return invoice[columnKey] ? this.$moment(invoice[columnKey]).format(CONST.DATE_FORMAT) : "";
    },
    async handleUpdateInvoice(payload) {
      this.$refs["upsert-invoice"].loading = true;
      payload.project_id = +this.projectInfo.id;
      let extractedInvoice = extractInvoiceInfo(payload);
      extractedInvoice.id = +payload.id;

      let response = await this.updateInvoiceProject(extractedInvoice);
      this.handleNotifyAPI(response);
      this.$refs["upsert-invoice"].loading = false;
      if (!response.error) this.$emit("refetch");
    },
    async handleFetchInvoiceDetail() {
      let jiraProject = this.listAllProjectInJira.find(
        item => item.name == this.projectInfo.project_name || item.key == this.projectInfo.project_key
      );
      if (!jiraProject) {
        this.$notification.error({
          message: this.$t("project_not_exist_in_jira_system"),
          description: this.$t("project_not_exist_in_jira_system"),
          duration: 2.5
        });
        return;
      }
      let userRoleList = await this.fetchListUserRoleProjectByProjectId(this.projectInfo.id);
      if (!userRoleList.data.length) {
        this.$notification.error({
          message: "Members of this project have not been configured in the Task Management page!",
          duration: 2.5
        });
        return;
      }
      let costByRoleList = await this.fetchProjectCostByProjectId(this.projectInfo.id);
      if (!costByRoleList.data.length) {
        this.$notification.error({
          message: "Cost of each role in this project has not been configured in the Task Management page!",
          duration: 2.5
        });
        return;
      }
      let projectOptions = {
        name: jiraProject.name,
        jiraUrl: jiraProject.jiraUrl,
        duration: this.durationFormat,
        filters: { ...baseOption, project: [jiraProject.key] }
      };
      if (!this.userWorklogsWithCost.length) this.fetchInvoiceDetail([projectOptions]);
    },
    async fetchInvoiceDetail(listOptions) {
      this.loading = true;

      let userWorklogs = await this.getUserWorklogJiraSystem(listOptions);
      userWorklogs = userWorklogs.filter(item => item.jiraEmail);
      let response = await this.expandProjectCostWithATVData(userWorklogs);
      if (!response.error) this.userWorklogsWithCost = response.data;
      else
        this.$notification.error({
          message: response.message,
          duration: 2.5
        });

      this.loading = false;
    },
    async getUserWorklogJiraSystem(listOptions) {
      let userWorklogs = [];
      for (let index = 0; index < listOptions.length; index++) {
        const element = listOptions[index];
        const data = await this.getUserWorklog(element);
        let userWorklogDetail = this.extractUserWorklog(data.data, element);
        userWorklogs = userWorklogs.concat(userWorklogDetail);
      }
      return userWorklogs;
    },
    extractUserWorklog(userWorklog, filterProjectOption) {
      let listUserInProject = userWorklog
        .map(issue => {
          if (issue.fields.worklog.worklogs.length) {
            return issue.fields.worklog.worklogs[0].author;
          }
        })
        .filter(item => item);
      let listUserInProjectUniq = _.uniqBy(listUserInProject, item => item.displayName).filter(item => item);
      let series = listUserInProjectUniq.map(item => 0);
      listUserInProjectUniq.forEach((author, index) => {
        userWorklog.forEach(issue => {
          if (issue.fields.worklog.worklogs.length) {
            issue.fields.worklog.worklogs.forEach(worklog => {
              if (author.displayName === worklog.author.displayName) {
                series[index] += worklog.timeSpentSeconds;
              }
            });
          }
        });

        series[index] = series[index] / 3600;
      });
      series = series.map(item => +item.toFixed(2));

      return listUserInProjectUniq.map((author, index) => {
        return {
          jiraEmail: author.emailAddress,
          displayName: author.displayName,
          timeWorklog: series[index],
          project: filterProjectOption.name,
          project_key: filterProjectOption.filters.project[0],
          projectJiraUrl: filterProjectOption.jiraUrl
        };
      });
    },
    getStyleStatus() {
      const steps = [
        { name: "Processing", fillColor: "#008FFB" },
        { name: "Plan To Issue", fillColor: "#857BFF" },
        { name: "Issued INVOICE", fillColor: "#FEB019" },
        { name: "Payment Done", fillColor: "#00E396" }
      ];
      let status = this.mapInvoiceStatus(this.invoice);
      let step = steps.find(item => item.name == status);
      let style = {};
      if (step) {
        style.color = step.fillColor;
      }

      return style;
    },
    showInvoiceDetail() {
      let invoiceDetailPreview = this.$refs["invoice-detail-preview"];
      invoiceDetailPreview = Array.isArray(invoiceDetailPreview) ? invoiceDetailPreview[0] : invoiceDetailPreview;
      invoiceDetailPreview.handleToggleVisible();
    },
    async handleDeleteInvoice() {
      this.updating = true;
      const response = await this.deleteInvoiceProject(this.invoice.invoice_id);
      this.handleNotifyAPI(response);
      this.updating = false;
      if (!response.error) this.$emit("refetch");
    },
    async exportReport() {
      this.isExporting = true;
      if (!this.projectInfo.project_key || !this.projectInfo.jira_url) {
        this.$notification.error({
          message: `Please link ${this.projectInfo.project_name} to a real JIRA project in the Task management interface first!`
        });
        this.isExporting = false;
        return;
      }

      let payload = {
        progress: "",
        filters: { project: [this.projectInfo.project_key], issuetype: [], status: [], sprint: [], assignee: [] },
        duration: [
          moment(this.invoice.start_date).format("YYYY/MM/DD"),
          moment(this.invoice.end_date).format("YYYY/MM/DD")
        ],
        jiraUrl: this.projectInfo.jira_url,
        invoice: {
          ...this.invoice,
          invoice_name: this.invoice.name,
          name: this.projectInfo.project_name,
          status_name: this.mapInvoiceStatus(this.invoice)
        }
      };

      this.getInvoiceReport(payload)
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
          this.isExporting = false;
        })
        .catch(error => {
          console.log(error);
          this.isExporting = false;
        });
    }
  }
};
</script>
