<template>
  <a-row class="header-take-leave-container w-100">
    <a-row class="header-take-leave-toolbar">
      <!-- <a-col class="header-take-leave-toolbar-item">
        <a-radio-group size="small" :value="type" @change="e => onTypeChange(e.target.value)">
          <a-radio-button value="month">Month</a-radio-button>
          <a-radio-button value="year">Year</a-radio-button>
        </a-radio-group>
      </a-col> -->

      <a-col class="header-take-leave-toolbar-item ml-1">
        <a-select
          size="small"
          class="my-year-select"
          :dropdownMatchSelectWidth="false"
          :value="year"
          @change="onChangeYear"
        >
          <template v-for="year in rangeYearSelect">
            <a-select-option :key="year" :value="year" class="year-item">
              {{ year }}
            </a-select-option>
          </template>
        </a-select>

        <a-select size="small" :dropdownMatchSelectWidth="false" :value="month" @change="onChangeMonth">
          <template v-for="n in arrayMonthKey">
            <a-select-option class="month-item" :key="n">
              {{ rangeMonthSelect[n] }}
            </a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row>

    <a-row class="goto-history">
      <a-button class="hide-text-in-small" type="primary" icon="history" @click="gotoHistory"
        ><span class="hide-in-small">{{ $t("view_history_offwork") }}</span></a-button
      >
    </a-row>
  </a-row>
</template>

<script>
export default {
  name: "Header_Take_Leave",
  props: ["value", "type", "onChange", "onTypeChange"],
  data() {
    return {
      arrayMonthKey: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };
  },
  computed: {
    year() {
      return this.value.year();
    },
    month() {
      return this.value.month();
    },
    rangeYearSelect() {
      let arrayYear = Array.from(Array(this.year + 10).keys());
      let cloneYear = arrayYear.slice(this.year - 10);
      return cloneYear;
    },
    rangeMonthSelect() {
      const current = this.value.clone();
      const localeData = this.value.localeData();
      const months = [];
      for (let i = 0; i < 12; i++) {
        current.month(i);
        months.push(localeData.monthsShort(current));
      }
      return months;
    }
  },
  methods: {
    onChangeYear(newYear) {
      const now = this.value.clone().year(newYear);
      this.onChange(now);
      this.$emit("re-render", now);
    },
    onChangeMonth(selectedMonth) {
      const newMonthValue = this.value.clone();
      newMonthValue.month(parseInt(selectedMonth, 10));
      this.onChange(newMonthValue);
      this.$emit("re-render", newMonthValue);
    },
    gotoHistory() {
      this.$router.push("/history-off-work");
    }
  }
};
</script>

<style lang="less" scoped>
.header-take-leave-container {
  padding: 12px;

  .header-take-leave-toolbar {
    display: inline-block;
    width: fit-content;

    &-item {
      display: inline-block;
    }
  }

  .goto-history {
    display: inline;
    width: fit-content;
    float: right;
  }

  .hide-in-small {
    @media (max-width: 767px) {
      display: none;
    }
  }
}
</style>
