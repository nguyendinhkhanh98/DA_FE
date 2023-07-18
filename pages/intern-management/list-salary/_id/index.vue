<template>
  <a-card class="shadow">
    <h1>{{ $t("salary_history") }}</h1>
    <a-row type="flex" align="bottom" justify="space-between" class="tool-bar">
      <a-col :xs="24" class="text-bold">
        <span>{{ $t("total_result") }}:{{ historySalary.length }}</span>
      </a-col>

      <a-col :xs="24" :md="24" :xl="24">
        <span style="float: right">
          <button
            class="button-responsive button-primary"
            :loading="loading"
            @click="[(visible = true), (salary = salaryLastUpdate)]"
          >
            <i class="fas fa-edit mr-1"></i>
            <span>{{ $t("update_salary") }}</span>
          </button>
        </span>
      </a-col>
    </a-row>
    <a-table
      bordered
      class="mt-1"
      :columns="columns"
      :dataSource="reverse(historySalary)"
      :rowKey="record => record.month"
      :loading="loading"
      :scroll="{ x: true }"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>
      <template slot="no" slot-scope="text, record, index">{{ index + 1 }}</template>
      <template slot="salaryaday" slot-scope="text">{{ convertNumberToCurrency(text) }} &nbsp; VND</template>
      <template slot="updateat" slot-scope="text">{{ convertTimeHaveHour(text) }}</template>
      <span slot="action" slot-scope="text">
        <a-button type="primary" @click="goToHistorySalary(text.internid)">{{ $t("detail") }}</a-button>
      </span>
    </a-table>
    <!-- <div class="chart mt-5">
      <h1>{{ $t("salary_chart") }}</h1>
      <line-chart v-if="historySalary.length" :data="historySalary"></line-chart>
    </div> -->
    <a-modal v-if="historySalary.length > 0" v-model="visible" :title="$t('update_salary')" @ok="onUpdateSalary">
      <div class="mt-3 mb-3">
        <a-input-number
          class="mt-3"
          prefix="$"
          v-model="salary"
          :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="value => value.replace(/\$\s?|(,*)/g, '')"
        />
      </div>
    </a-modal>
  </a-card>
</template>
<script>
import moment from "moment";
import { mapActions, mapState } from "vuex";
import LineChart from "@/components/Common/Chart/SalaryChart.vue";
import { columns } from "./const";

export default {
  name: "History-Salary",
  components: {
    LineChart
  },
  data() {
    return {
      year: "2020",
      name: this.$route.params.name,
      id: this.$route.params.id,
      columns,
      loading: false,
      visible: false,
      keyword: "",
      isLoading: false,
      showResult: "none",
      currentColumns: columns.filter(item => item.defaultChecked),
      selectedRowKeys: [],
      pagination: {
        pageSize: 40,
        total: 0,
        current: 1,
        showSizeChanger: true,
        pageSizeOptions: ["40", "50", "60"]
      },
      keySearchGlobal: "",
      searchForcus: null,
      internToAdd: "",
      salary: ""
    };
  },
  computed: {
    ...mapState({
      historySalary: state => state.modules["intern-management"].historySalary
    }),
    salaryLastUpdate() {
      let length = this.historySalary.length;
      return this.historySalary[length - 1].salaryaday;
    }
  },
  methods: {
    ...mapActions({
      getHistorySalary: "modules/intern-management/getHistorySalary",
      updateSalaryOfIntern: "modules/intern-management/updateSalaryOfIntern",
      setDefaultHistorySalary: "modules/intern-management/setDefaultHistorySalary"
    }),
    async onUpdateSalary() {
      if (this.salary == "") {
        this.$notification.error({
          message: this.$t("please_enter_salary"),
          description: this.$t("please_enter_salary"),
          duration: 2.5
        });
        return;
      } else if (Number.isNaN(this.salary) || this.salary <= 10000 || this.salary >= 1000000) {
        this.$notification.error({
          message: this.$t("salary_invalid"),
          description: this.$t("salary_invalid"),
          duration: 2.5
        });
        return;
      }
      let reponse = await this.updateSalaryOfIntern({ salary: this.salary, id: this.id });
      if (reponse.status === 200) {
        await this.getHistorySalary({ id: this.id });
        this.visible = false;
        this.keyword = "";
        this.$notification.success({
          message: this.$t("update_salary_success"),
          description: this.$t("update_salary_success"),
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: this.$t("update_salary_error"),
          description: this.$t("update_salary_error"),
          duration: 2.5
        });
      }
    },
    onChangeToggleColumn(cols) {
      this.currentColumns = cols;
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
    }
  },
  async created() {
    await this.getHistorySalary({ id: this.$route.params.id });
  },
  beforeDestroy() {
    this.setDefaultHistorySalary();
  }
};
</script>

<style lang="less" scoped>
button {
  margin: 2px;
  &.button-responsive {
    height: 32px;
    color: #0052cc;
    line-height: 1.499;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    user-select: none;
    touch-action: manipulation;
    background: transparent;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    @media (max-width: 767px) {
      & span {
        display: none;
      }

      & i {
        margin: 0px !important;
      }
    }
  }

  &.button-disabled {
    color: rgba(0, 0, 0, 0.25);
    background-color: #f5f5f5;
    border-color: #d9d9d9;
    text-shadow: none;
    box-shadow: none;
    cursor: not-allowed;
  }

  &.button-primary {
    color: white;
    background-color: #0052cc;
  }
}
</style>
