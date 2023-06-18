<template>
  <a-row>
    <a-table
      bordered
      :columns="columns"
      :data-source="dataTablePreview"
      :rowKey="record => record.name"
      :pagination="false"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        <span :key="column.key">{{ $t(column.slots.title) }} {{ column.postfix }}</span>
      </template>

      <template slot="no" slot-scope="text, record, index">
        {{ index + 1 }}
      </template>
    </a-table>
  </a-row>
</template>

<script>
import { columns } from "./const";

export default {
  name: "TablePreviewSummaryQCD",
  data() {
    return {
      columns
    };
  },
  props: {
    dataTablePreview: Array
  }
};
</script>
