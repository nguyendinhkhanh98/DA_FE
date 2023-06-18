<template>
  <a-card class="shadow">
    <h1>{{ $t("invoice_management") }}</h1>

    <a-button class="mb-2" type="primary" :icon="'plus'" @click="handleOpenProjectSelectionModal">Create</a-button>

    <a-table :columns="columns" :rowKey="(record, index) => index" :data-source="listProjectFilter" bordered>
      <span
        v-for="(column, index) of columns.filter(el => el.key != 'project' && el.key != 'status_name')"
        :key="index"
        :slot="column.slots.title"
        >{{ $t(column.slots.title) }}</span
      >

      <span slot="no" slot-scope="text, record, index">
        <span>{{ index + 1 }}</span>
      </span>

      <span slot="project">
        <span>{{ $t("project") }}</span>
        <br />
        <a-input-search
          style="width: 200px"
          allow-clear
          :value="keySearch"
          @change="e => (keySearch = e.target.value)"
        />
      </span>

      <span slot="last_invoice_status">
        <span>Invoice status</span>
        <br />
        <a-select
          v-model="dataFilter.filter.last_invoice_status"
          mode="multiple"
          allow-clear
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option
            v-for="(item, index) in listInvoiceStatus"
            :key="index"
            :label="item.name"
            :value="item.name"
          >
            {{ item.name }}
          </a-select-option>
          <a-select-option value="All" label="All Status">All Status</a-select-option>
        </a-select>
      </span>

      <span slot="lastInvoiceStatus" slot-scope="text">
        <span :style="getStyleStatus(text)">
          {{ text }}
        </span>
      </span>

      <nuxt-link slot="projectName" slot-scope="text, record" :to="`/management-task/${record.id}`">
        {{ text }}
        <i class="fas fa-external-link-alt ml-1" />
      </nuxt-link>

      <span slot="date" slot-scope="text">
        {{ text ? $moment(text).format(CONST.DATE_FORMAT) : "" }}
      </span>

      <strong slot="lastInvoiceCost" slot-scope="text">
        {{ text | numberFormatCurrency }}
      </strong>

      <span slot="detail" slot-scope="text, record">
        <a-tooltip :title="$t('invoice_infomation')">
          <a-button type="primary" @click="$router.push(`/invoice-management/${record.id}`)" icon="file-search" />
        </a-tooltip>
      </span>
    </a-table>

    <a-modal
      @ok="openInvoiceManagementPage"
      :okButtonProps="{ props: { disabled: !this.selectedProjectId } }"
      centered
      v-model="shouldRenderProjectSelectionModal"
      :title="'Project selection'"
    >
      <a-form-model ref="modal-upload-document">
        <a-form-model-item :label="$t('project')" :colon="false" prop="projectId">
          <a-select style="width: 180px" :placeholder="$t('project')" v-model="selectedProjectId">
            <a-select-option v-for="item in listProjects" :key="item.id" :value="item.id">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import UpsertInvoice from "@/components/InvoiceManagement/UpsertInvoice";
import { columns } from "./const";
import * as CONST from "@/constants/index.js";

export default {
  name: "InvoiceManagement",
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: {
    UpsertInvoice
  },
  filters: {
    numberFormatCurrency(dollar) {
      if (dollar) return "$ " + new Intl.NumberFormat().format(parseInt(dollar.toFixed()));
      return "$ 0";
    }
  },
  data() {
    return {
      columns,
      newProjectName: null,
      keySearch: "",
      dataFilter: {
        filter: {
          last_invoice_status: ["Processing"]
        }
      },
      currentProjectId: null,
      showModalCost: false,
      CONST,
      shouldRenderProjectSelectionModal: false,
      selectedProjectId: null
    };
  },
  computed: {
    ...mapState({
      listProjectInvoice: state => state.modules["invoice-management"].listProjectInvoice,
      listInvoiceStatus: state => state.modules["invoice-management"].listInvoiceStatus,
      listProjects: state => state.modules["management-task"].listTask
    }),
    listProjectFilter() {
      let clone = [...this.listProjectInvoice];
      clone = this.filterProjectByKeySearch(clone);
      clone = this.filterDataByDeleteFlag(clone);
      clone = this.filterDataByStatus(clone);
      return clone;
    },
  },
  created() {
    this.fetchListProject();
    this.fetchListInvoiceStatus();
    this.dataFilter.filter.last_invoice_status = "Processing";
  },
  methods: {
    ...mapActions({
      fetchListProject: "modules/invoice-management/fetchListProject",
      fetchListInvoiceStatus: "modules/invoice-management/fetchListInvoiceStatus",
      fetchListTask: "modules/management-task/fetchListTask"
    }),
    filterProjectByKeySearch(clone) {
      if (!this.keySearch) return clone;

      return clone.filter(item => {
        let vietnameseKey = removeVietnameseTones(this.keySearch).toLowerCase();
        let vietnameseTag = removeVietnameseTones(item.name).toLowerCase();

        return vietnameseTag.includes(vietnameseKey);
      });
    },
    filterDataByDeleteFlag(clone) {
      return clone.filter(item => !item.delete_flag);
    },
    filterDataByStatus(clone) {
      let keyStatus = this.dataFilter.filter.last_invoice_status;
      if (keyStatus && keyStatus.length) {
        return clone.filter(item => {
          if (!item.status_name) return false;
          if(keyStatus.includes("All")) return clone;
          return keyStatus.includes(item.status_name);
        });
      }
      if(!keyStatus || !keyStatus.length) {
        return clone;
      }
    },
    goToInvoiceDetail(id) {
      this.$router.push(`/invoice-management/${id}`);
    },
    getStyleStatus(text) {
      const steps = [
        { name: "Processing", fillColor: "#008FFB" },
        { name: "Plan To Issue", fillColor: "#857BFF" },
        { name: "Issued INVOICE", fillColor: "#FEB019" },
        { name: "Payment Done", fillColor: "#00E396" }
      ];
      let status = text;
      let step = steps.find(item => item.name == status);
      let style = {};
      if (step) {
        style.color = step.fillColor;
      }

      return style;
    },
    async handleOpenProjectSelectionModal() {
      this.shouldRenderProjectSelectionModal = true;
      if (!this.listProjects.length) await this.fetchListTask();
    },
    openInvoiceManagementPage() {
      this.$router.push(`/invoice-management/${this.selectedProjectId}`);
    }
  }
};
</script>

<style lang="less" scoped>
.table-wrapper {
  // overflow-x: scroll;

  .table-bordered {
    border-collapse: collapse;
    width: 1200px;
    min-width: 100%;
    border-radius: 4px 4px 0 0;

    .wrapper-header {
      font-size: 1rem;
      color: #001529;
      font-weight: 500;
    }
  }
}
</style>
