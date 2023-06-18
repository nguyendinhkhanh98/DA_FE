<template>
  <a-card class="shadow">
    <h1>{{ $t("export_report_by_invoice") }}</h1>
    <a-form v-bind="formItemLayout">
      <a-form-item :label="$t('invoice_name')" :colon="false">
        <a-select v-model="selectedInvoiceID" optionFilterProp="optionFilterProp">
          <a-select-option
            v-for="invoice of listProjectInvoice"
            :key="invoice.invoice_name"
            :value="invoice.invoice_name"
            :optionFilterProp="invoice.invoice_name"
          >
            {{ invoice.invoice_name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :colon="false">
        <span slot="label" style="display: none">None</span>
        <a-button type="primary" @click="exportReport" :loading="isExporting" :disabled="!selectedInvoiceID">
          <i class="far fa-file-excel mr-2"></i>Export</a-button
        >
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
import moment from "moment";
export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  data() {
    return {
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: { xs: { span: 24 }, sm: { span: 8 } }
      },
      selectedInvoiceID: null,
      isExporting: false,
      columns: []
    };
  },
  computed: {
    ...mapState({
      listProjectInvoice: state => state.modules["invoice-management"].listProjectInvoice,
      dataSource: state => state.modules["worklog-summary-by-user"].dataSource
    })
  },
  async created() {
    await this.fetchListProject();
  },
  methods: {
    ...mapMutations({
      setDataSource: "modules/worklog-summary-by-user/setDataSource"
    }),
    ...mapActions({
      fetchListProject: "modules/invoice-management/fetchListProject",
      getInvoiceReport: "modules/export-report-by-invoice/getInvoiceReport",
      getWorklog: "modules/worklog-summary-by-user/getWorklog"
    }),
    async exportReport() {
      this.isExporting = true;
      let selectedInvoice = this.listProjectInvoice.find(i => i.invoice_name == this.selectedInvoiceID);
      if (!selectedInvoice.key || !selectedInvoice.jira_url) {
        this.$notification.error({
          message: `Please link ${selectedInvoice.name} to a real JIRA project in the Task management interface first!`
        });
        this.isExporting = false;
        return;
      }

      let payload = {
        progress: "",
        filters: { project: [selectedInvoice.key], issuetype: [], status: [], sprint: [], assignee: [] },
        duration: [
          moment(selectedInvoice.start_date).format("YYYY/MM/DD"),
          moment(selectedInvoice.end_date).format("YYYY/MM/DD")
        ],
        jiraUrl: selectedInvoice.jira_url,
        invoice: selectedInvoice
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
