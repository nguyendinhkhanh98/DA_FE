<template>
  <div>
    <span class="text-link pointer" @click="handleToggleVisible">{{ invoice.name }}</span>

    <a-modal
      v-model="visible"
      :title="$t('invoice_detail_preview')"
      class="invoice-detail-preview"
      :footer="null"
      @cancel="$emit('refetch')"
    >
      <table class="table-info">
        <tr>
          <th class="pr-2">{{ $t("invoice_name") }}</th>
          <td>: {{ invoice.name }}</td>
        </tr>

        <tr>
          <th class="pr-2">{{ $t("status") }}</th>
          <td>: {{ status }}</td>
        </tr>

        <tr>
          <th class="pr-2">{{ $t("duration") }}</th>
          <td>: {{ mapDuration() }}</td>
        </tr>
      </table>

      <a-row class="mt-3 invoice-detail-content">
        <a-spin :tip="`${$t('loading')}...`" :spinning="loading" class="w-100 h-100">
          <CaculationCost :data-source="userWorklogsWithCost" :columns="columns" :invoiceId="invoice.invoice_id" />
        </a-spin>
      </a-row>
    </a-modal>
  </div>
</template>

<script>
const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    align: "center",
    width: "50px"
  },
  {
    slots: { title: "project" },
    dataIndex: "project",
    key: "project",
    width: "25%"
  },
  {
    slots: { title: "name" },
    dataIndex: "displayName",
    key: "name",
    width: "25%"
  },
  {
    slots: { title: "role" },
    dataIndex: "role",
    key: "role"
  },
  {
    slots: { title: "cost_per_hour" },
    dataIndex: "cost",
    key: "cost_per_hour",
    width: "200px"
  },
  {
    slots: { title: "time_work_logged" },
    dataIndex: "timeWorklog",
    key: "timeWorklogHour",
    width: "200px"
  },
  {
    slots: { title: "time_work_logged" },
    dataIndex: "timeWorklog",
    key: "timeWorklogMonth",
    width: "200px"
  },
  {
    slots: { title: "cost" },
    dataIndex: "total_cost",
    key: "total_cost",
    width: "200px"
  }
];

import CaculationCost from "@/components/ProjectATV/CaculationCost";

export default {
  components: {
    CaculationCost
  },
  props: {
    invoice: Object,
    userWorklogsWithCost: Array,
    loading: Boolean,
    status: String,
    duration: Array
  },
  data() {
    return {
      visible: false,
      columns
    };
  },
  methods: {
    handleToggleVisible() {
      this.visible = !this.visible;
      this.$emit("click");
    },
    mapDuration() {
      if (!this.duration) return "";
      return this.duration[0] + ` ~ ` + this.duration[1];
    }
  }
};
</script>

<style lang="less">
.invoice-detail-preview {
  .ant-modal {
    top: 50px;
    width: 1500px !important;
    max-width: 100% !important;
  }

  .invoice-detail-content {
    overflow-x: auto;
    min-width: 100px;
  }
}
</style>
