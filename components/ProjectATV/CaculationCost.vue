<template>
  <div class="ant-table ant-table-default ant-table-bordered" :class="{ 'ant-table-empty': !dataSource.length }">
    <div class="ant-table-content">
      <div class="table-wrapper">
        <table class="w-100 table-bordered">
          <thead class="ant-table-thead">
            <tr>
              <th class="wrapper-header" v-for="column in columns" :key="column.key" :span="column.span">
                <div v-if="column.key == 'timeWorklogHour'">
                  <span>{{ $t(column.slots.title) }} (h)</span>
                </div>

                <div v-else-if="column.key == 'timeWorklogMonth'">
                  <span>{{ $t(column.slots.title) }} (month)</span>
                  <a-popover>
                    <template slot="content">
                      <span class="text-bold">
                        <span>{{ $t(column.slots.title) }} (month)</span> =
                        <span>{{ $t(column.slots.title) }} (h)</span> / (8 * 20)
                      </span>
                    </template>
                    <a-icon type="question-circle" :style="{ fontSize: '12px' }" class="ml-1 pointer" />
                  </a-popover>
                </div>

                <div v-else-if="column.key == 'cost_per_hour'">
                  <span>{{ $t(column.slots.title) }} ($)</span>
                </div>

                <div v-else-if="column.key == 'total_cost'">
                  <span>{{ $t("total") }} {{ $t(column.slots.title) }} ($)</span>

                  <a-popover placement="left">
                    <template slot="content">
                      <span class="text-bold">
                        <span>{{ $t("total") }} {{ $t(column.slots.title) }} ($)</span> =
                        <span>{{ $t("time_work_logged") }} (month)</span> * <span>{{ $t("cost_per_hour") }} ($)</span>
                      </span>
                    </template>
                    <a-icon type="question-circle" :style="{ fontSize: '12px' }" class="ml-1 pointer" />
                  </a-popover>
                </div>

                <span v-else>{{ $t(column.slots.title) }}</span>
              </th>
            </tr>
          </thead>

          <tbody class="ant-table-tbody">
            <tr v-for="(record, index) in dataSource" :key="index">
              <template v-for="column in columns">
                <td :key="column.key" v-if="column.key == 'no'" class="text-center">
                  {{ index + 1 }}
                </td>

                <td :key="column.key" v-else-if="column.key == 'total_cost'">
                  {{ getTotalCost(record) | numberFormatCurrency }}
                </td>

                <td :key="column.key" v-else-if="column.key == 'cost_per_hour'">
                  {{ record[column.dataIndex] | numberFormatCurrency }}
                </td>

                <td :key="column.key" v-else-if="column.key == 'timeWorklogMonth'">
                  {{ record.timeWorklog | formatTotalCostByMonth }}
                </td>

                <td v-else :key="column.key">
                  {{ record[column.dataIndex] }}
                </td>
              </template>
            </tr>
            <tr class="text-bold">
              <template v-for="(column, index) in columns">
                <td :key="column.key" v-if="index == 0" class="text-center">{{ dataSource.length + 1 }}</td>
                <td :key="column.key" v-else-if="index == 1">{{ $t("total") }}</td>
                <td :key="column.key" v-else-if="index == columns.length - 1">
                  {{ getTotalManMonthAllUser() | numberFormatCurrency }}
                </td>
                <td :key="column.key" v-else></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ant-table-placeholder" v-if="!dataSource.length">
        <a-empty>
          <span slot="description"> {{ $t("no_result_found") }} </span>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<script>
let totalTimeInMonth = 8 * 5 * 4;
import { mapActions } from "vuex";
export default {
  props: {
    dataSource: Array,
    columns: Array,
    invoiceId: Number
  },
  filters: {
    numberFormatCurrency(dollar) {
      if (dollar) return "$ " + new Intl.NumberFormat().format(parseInt(dollar.toFixed()));
      return "$ 0";
    },
    formatTotalCostByMonth(timeByHour) {
      return +(timeByHour / totalTimeInMonth).toFixed(4);
    }
  },
  methods: {
    ...mapActions({
      updateLastestCostById: "modules/project-cost/updateLastestCostById"
    }),
    getTotalCost(record) {
      let total = (record.timeWorklog * record.cost) / totalTimeInMonth;
      return +total.toFixed(2);
    },
    getTotalManMonthAllUser() {
      let originTotalManMonthAllUser = this.dataSource.reduce((sum, item) => (sum += this.getTotalCost(item)), 0);
      if (+originTotalManMonthAllUser.toFixed(2))
        this.updateLastestCostById({ id: this.invoiceId, cost: +originTotalManMonthAllUser.toFixed(2) });
      return +originTotalManMonthAllUser.toFixed(2);
    }
  }
};
</script>
