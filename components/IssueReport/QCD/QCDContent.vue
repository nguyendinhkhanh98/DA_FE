<template>
  <section class="qcd-modal-container pdf-content">
    <div class="align-right">
      <slot></slot>
    </div>

    <section class="ant-row qcd-modal-block shadow">
      <span class="text-bold title">Thống kê</span>
      <a-tooltip placement="right" overlayClassName="qcd-report-description">
        <template slot="title">
          <a-table
            :columns="fieldsTableDescription"
            :data-source="qualityDescription"
            :pagination="false"
            :rowClassName="getCellDescription"
          >
          </a-table>
        </template>
        <a-icon type="question-circle" />
      </a-tooltip>
      <div class="ant-row qcd-modal-content">
        <p class="description">Tỉ lệ bug</p>

        <div class="ant-row qcd-modal-value pl-3 mt-3">
          <div class="ant-row">
            <span class="ant-col-7 color-violet">Tỉ lệ bug theo số lượng</span>
            <span class="ant-col-6 color-violet" :style="textEnd">Số lượng bug &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Số lượng issue</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForBugRatioByNumber(bugRatioByNumber)">
            <span class="ant-col-7">&nbsp;</span>
            <span class="ant-col-6" :style="textEnd">{{ qcd.quality.bugRatioByNumber.count }} &nbsp;</span>
            <span class="ant-col-8">/ {{ qcd.quality.bugRatioByNumber.total }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ bugRatioByNumber }}</label>
              <a-tooltip placement="top">
                <template slot="title">
                  <span>Show detail</span>
                </template>
                <div class="float-right">
                  <i class="fas fa-search cursor text-base" @click="viewBugDetail"></i>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>

        <div class="ant-row qcd-modal-value pl-3">
          <div class="ant-row">
            <span class="ant-col-7 color-violet">Tỉ lệ bug theo thời gian</span>
            <span class="ant-col-6 color-violet" :style="textEnd">Tổng thời gian fix bug &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Tổng thời gian issue</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForBugRatioByNumber(bugRatioByHour)">
            <span class="ant-col-7">&nbsp;</span>
            <span class="ant-col-6" :style="textEnd"
              >{{ qcd.quality.bugRatioByHour.bugHour | formatNumber }} &nbsp;</span
            >
            <span class="ant-col-8">/ {{ qcd.quality.bugRatioByHour.issueHour | formatNumber }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ bugRatioByHour }}</label>
            </div>
          </div>
        </div>

        <!-- <div class="ant-row qcd-modal-value pl-3 mt-3">
          <div class="ant-row">
            <span class="ant-col-7 color-violet">Degradation Ratio By Number</span>
            <span class="ant-col-6 color-violet" :style="textEnd">Number of degradation &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Number of issue</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForBugRatioByNumber(degrate)">
            <span class="ant-col-7">&nbsp;</span>
            <span class="ant-col-6" :style="textEnd">{{ qcd.quality.degrate.count }} &nbsp;</span>
            <span class="ant-col-8">/ {{ qcd.quality.degrate.total }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ degrate }}</label>
              <a-tooltip placement="top">
                <template slot="title">
                  <span>Show detail</span>
                </template>
                <div class="float-right">
                  <i class="fas fa-search cursor text-base" @click="viewTaskDegrate"></i>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div> -->

        <!-- <div class="ant-row qcd-modal-value pl-3">
          <div class="ant-row">
            <span class="ant-col-7 color-violet">Degradation Ratio By Hour</span>
            <span class="ant-col-6 color-violet" :style="textEnd">Total hour of degradation &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Total hour of issue</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForBugRatioByNumber(degrationRatioByHour)">
            <span class="ant-col-7">&nbsp;</span>
            <span class="ant-col-6" :style="textEnd"
              >{{ qcd.quality.degradationByHour.degradationHour | formatNumber }} &nbsp;</span
            >
            <span class="ant-col-8">/ {{ qcd.quality.degradationByHour.issueHour | formatNumber }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ degrationRatioByHour }}</label>
            </div>
          </div>
        </div> -->
      </div>
    </section>

    <!-- <section class="ant-row qcd-modal-block shadow">
      <span class="text-bold title" v-if="switchCostV2">"C"ost V2</span>
      <span class="text-bold title" v-else>"C"ost</span>

      <a-tooltip placement="right" overlayClassName="qcd-report-description">
        <template slot="title">
          <a-table
            :columns="fieldsTableDescription"
            :data-source="costDescription"
            :pagination="false"
            :rowClassName="getCellDescription"
          >
          </a-table>
        </template>
        <a-icon type="question-circle" />
      </a-tooltip>

      <div id="switch-cost-v2" class="cursor">
        <a-tag color="#0052cc" @click="switchCost">
          <a-icon type="left" v-if="switchCostV2" />
          <a-icon type="right" v-else />
        </a-tag>
      </div>

      <div class="ant-row qcd-modal-content" v-if="!switchCostV2">
        <p class="description">Cost compliance rate: Ratio of between Actual Man hour and Estimated Man hour</p>

        <div class="qcd-modal-value pl-3 mt-3">
          <div class="ant-row">
            <span class="ant-col-13 color-violet" :style="textEnd">(Actual Manhours - Estimated Manhours) &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Estimated Manhours</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForOverEstimate(cost)">
            <span class="ant-col-13" :style="textEnd"
              >({{ qcd.cost.actualManhour | formatNumber }} - {{ qcd.cost.estimateManhour | formatNumber }})
              &nbsp;</span
            >
            <span class="ant-col-8">/ {{ qcd.cost.estimateManhour | formatNumber }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ cost }}</label>
              <a-tooltip placement="top">
                <template slot="title">
                  <span>Show detail</span>
                </template>
                <div class="float-right">
                  <i class="fas fa-search cursor text-base" @click="viewTaskOverEstimate"></i>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-row qcd-modal-content" v-else>
        <p class="description">Cost version 2: Ratio of between Actual Man hour and Estimated Man hour</p>
        <p class="description">Actual Manhours: Total time loged of {{ qcd.delivery.totalIssue }} issue</p>
        <div>
          <p class="description">Estimated Manhours: Total work time(wt) of {{ qcd.delivery.totalIssue }} issue</p>

          <ul>
            <li>If timeSpent &lt; estimate</li>
            <ul>
              <li>
                Case 1: <span class="description">Status</span> is <span class="green">Resolved</span>
                <span class="green">UAT in progress</span> or <span class="green">Waiting UAT</span> =>
                <span class="description">wt = estimate</span>
              </li>
              <li>Case 2: Other => <span class="description">wt = durationTimeSpent</span></li>
            </ul>
            <li>Else <span class="description">wt = (durationTimeSpent / timeSpent) * estimate</span></li>
          </ul>
          <p class="description">Explain</p>
          <dl>
            <dt>- durationTimeSpent: Total time spent of issue in duration</dt>
            <dt>- timeSpent: Total time spent of issue</dt>
            <dt>- estimate: Time origin estimated</dt>
          </dl>
        </div>

        <div class="qcd-modal-value pl-3 mt-3">
          <div class="ant-row">
            <span class="ant-col-13 color-violet" :style="textEnd">(Actual Manhours - Estimated Manhours) &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Estimated Manhours</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForOverEstimate(costTabHour)">
            <span class="ant-col-13" :style="textEnd"
              >({{ qcd.costTabHour.actualManhour }} - {{ qcd.costTabHour.estimateManhour }}) &nbsp;</span
            >
            <span class="ant-col-8">/ {{ qcd.costTabHour.estimateManhour }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ costTabHour }}</label>
              <a-tooltip placement="top">
                <template slot="title">
                  <span>Show detail</span>
                </template>
                <div class="float-right">
                  <i class="fas fa-search cursor text-base" @click="viewTaskOverEstimate"></i>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ant-row qcd-modal-block shadow">
      <span class="text-bold title">"D"elivery</span>
      <a-tooltip placement="right" overlayClassName="qcd-report-description">
        <template slot="title">
          <a-table
            :columns="fieldsTableDescription"
            :data-source="deliveryDescription"
            :pagination="false"
            :rowClassName="getCellDescription"
          >
          </a-table>
        </template>
        <a-icon type="question-circle" />
      </a-tooltip>
      <div class="ant-row qcd-modal-content">
        <p class="description">Delivery date compliance rate: Ratio of meeting the Answer due date</p>

        <div class="qcd-modal-value pl-3 mt-3">
          <div class="ant-row">
            <span class="ant-col-13 color-violet" :style="textEnd">Number of meeting the Answer due date &nbsp;</span>
            <span class="ant-col-9 color-violet"> / Number of issue</span>
            <span class="ant-col-2">Result</span>
          </div>

          <div class="ant-row" :class="getClassForOverDueDate(delivery)">
            <span class="ant-col-13" :style="textEnd">{{ qcd.delivery.issueBeforeDuedate }} &nbsp;</span>
            <span class="ant-col-8">/ {{ qcd.delivery.totalIssue }}</span>
            <span class="ant-col-1">=</span>
            <div class="ant-col-2">
              <label>{{ delivery }}</label>
              <a-tooltip placement="top">
                <template slot="title">
                  <span>Show detail</span>
                </template>
                <div class="float-right">
                  <i class="fas fa-search cursor text-base" @click="viewTaskOverDueDate"></i>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <QCDViewIssueInfo
      ref="qcd-view-bug-detail"
      title="QCD view bug issue"
      viewType="quality"
      :data-source="issueBugDetail"
    />
    <QCDViewIssueInfo
      ref="qcd-view-over-estimate"
      title="QCD view task over estimate"
      viewType="costEstimate"
      :data-source="issueOverEstimate"
    />
    <QCDViewIssueInfo
      ref="qcd-view-over-duedate"
      title="QCD view task over due date"
      viewType="deliveryOverDueDate"
      :data-source="issueOverDueDate"
    />
    <QCDViewIssueInfo
      ref="qcd-view-degrate"
      title="QCD view task degrate"
      viewType="degrate"
      :data-source="issueDegrate"
    />
  </section>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { fieldsTableDescription, qualityDescription, costDescription, deliveryDescription } from "./const.js";
import QCDViewIssueInfo from "@/components/IssueReport/QCD/QCDViewIssueInfo";

export default {
  name: "ContentQCD",
  props: {
    qcd: Object,
    form: Array
  },
  components: {
    QCDViewIssueInfo
  },
  data() {
    return {
      fieldsTableDescription,
      qualityDescription,
      costDescription,
      deliveryDescription,
      textEnd: {
        textAlign: "end"
      },
      switchCostV2: false
    };
  },
  filters: {
    formatNumber(val) {
      return !Number.isInteger(val) ? val.toFixed(2) : val;
    }
  },
  computed: {
    ...mapState({
      issueBugDetail: state => state.modules["summary-report-by-issue"].issueBugDetail,
      issueOverEstimate: state => state.modules["summary-report-by-issue"].issueOverEstimate,
      issueOverDueDate: state => state.modules["summary-report-by-issue"].issueOverDueDate,
      issueDegrate: state => state.modules["summary-report-by-issue"].issueDegrate
    }),
    formFilterBugIssue() {
      let data = _.cloneDeep(this.form);
      data.filters.issuetype = ["Bug"];
      return data;
    },
    cost() {
      let diffrentHour = this.qcd.cost.actualManhour - this.qcd.cost.estimateManhour;
      let data = _.round((diffrentHour / this.qcd.cost.estimateManhour) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    costTabHour() {
      let diffrentHour = this.qcd.costTabHour.actualManhour - this.qcd.costTabHour.estimateManhour;
      let data = _.round((diffrentHour / this.qcd.costTabHour.estimateManhour) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    delivery() {
      let data = _.round((this.qcd.delivery.issueBeforeDuedate / this.qcd.delivery.totalIssue) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    bugRatioByHour() {
      let data = _.round(
        (this.qcd.quality.bugRatioByHour.bugHour / this.qcd.quality.bugRatioByHour.issueHour) * 100,
        1
      );
      return isNaN(data) ? 0 : data;
    },
    bugRatioByNumber() {
      let data = _.round((this.qcd.quality.bugRatioByNumber.count / this.qcd.quality.bugRatioByNumber.total) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    degrate() {
      let data = _.round((this.qcd.quality.degrate.count / this.qcd.quality.degrate.total) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    degrationRatioByHour() {
      let data = _.round(
        (this.qcd.quality.degradationByHour.degradationHour / this.qcd.quality.degradationByHour.issueHour) * 100,
        1
      );
      return isNaN(data) ? 0 : data;
    }
  },
  methods: {
    ...mapMutations({
      setIssueOverEstimate: "modules/summary-report-by-issue/setIssueOverEstimate",
      setIssueBugDetail: "modules/summary-report-by-issue/setIssueBugDetail",
      setIssueOverDueDate: "modules/summary-report-by-issue/setIssueOverDueDate",
      setIssueDegrate: "modules/summary-report-by-issue/setIssueDegrate"
    }),
    ...mapActions({
      getIssueBugDetail: "modules/summary-report-by-issue/getIssueBugDetail",
      getIssueOverEstimate: "modules/summary-report-by-issue/getIssueOverEstimate",
      getIssueOverDueDate: "modules/summary-report-by-issue/getIssueOverDueDate",
      getIssueDegrate: "modules/summary-report-by-issue/getIssueDegrate"
    }),
    getClassForBugRatioByNumber(value) {
      if (value < 3.0) return "qcd-gold";
      else if (value < 6.0) return "qcd-sliver";
      else if (value < 11.0) return "qcd-bronze";
      else return "text-danger";
    },
    getClassForOverEstimate(value) {
      if (value < 6.0) return "qcd-gold";
      else if (value < 11.0) return "qcd-sliver";
      else if (value < 16.0) return "qcd-bronze";
      else return "text-danger";
    },
    getClassForOverDueDate(value) {
      if (value >= 90.0) return "qcd-gold";
      else if (value >= 80.0) return "qcd-sliver";
      else if (value >= 70.0) return "qcd-bronze";
      else return "text-danger";
    },
    getCellDescription(record, index) {
      let className = [];
      className.push("cell-description");
      if (record.class == "Gold") className.push("qcd-gold");
      else if (record.class == "Sliver") className.push("qcd-sliver");
      else if (record.class == "Bronze") className.push("qcd-bronze");
      else className.push("text-danger");
      return className.join(" ");
    },
    async viewBugDetail() {
      this.$refs["qcd-view-bug-detail"].showModal();
      if (!this.issueBugDetail || !this.issueBugDetail.length) {
        let issues = [];
        for (let i = 0; i < this.form.length; i++) {
          let formFilterBugIssue = _.cloneDeep(this.form[i]);
          formFilterBugIssue.filters.issuetype = ["Bug"];
          let res = await this.getIssueBugDetail(formFilterBugIssue);
          issues = issues.concat(res);
        }
        this.setIssueBugDetail(issues);
      }
      this.$refs["qcd-view-bug-detail"].loadedData();
    },
    async viewTaskOverEstimate() {
      this.$refs["qcd-view-over-estimate"].showModal();
      if (!this.issueOverEstimate || !this.issueOverEstimate.length) {
        let issues = [];
        for (let i = 0; i < this.form.length; i++) {
          let res = await this.getIssueOverEstimate(this.form[i]);
          issues = issues.concat(res);
        }
        this.setIssueOverEstimate(issues);
      }
      this.$refs["qcd-view-over-estimate"].loadedData();
    },
    async viewTaskOverDueDate() {
      this.$refs["qcd-view-over-duedate"].showModal();
      if (!this.issueOverDueDate || !this.issueOverDueDate.length) {
        let issues = [];
        for (let i = 0; i < this.form.length; i++) {
          let res = await this.getIssueOverDueDate(this.form[i]);
          issues = issues.concat(res);
        }
        this.setIssueOverDueDate(issues);
      }
      this.$refs["qcd-view-over-duedate"].loadedData();
    },
    async viewTaskDegrate() {
      this.$refs["qcd-view-degrate"].showModal();
      if (!this.issueDegrate || !this.issueDegrate.length) {
        let issues = [];
        for (let i = 0; i < this.form.length; i++) {
          let res = await this.getIssueDegrate(this.form[i]);
          issues = issues.concat(res);
        }
        this.setIssueDegrate(issues);
      }
      this.$refs["qcd-view-degrate"].loadedData();
    },
    switchCost() {
      this.switchCostV2 = !this.switchCostV2;
    }
  }
};
</script>

<style lang="less" scoped>
.qcd-modal-container {
  .qcd-modal-value {
    .ant-col-16 {
      padding-left: 4px;
    }

    label {
      font-weight: bold;
      &::after {
        content: " %";
      }
    }
  }

  & > .qcd-modal-block {
    border-radius: 8px;
    padding: 8px;

    &:not(:first-child) {
      margin-top: 16px;
    }

    & > .qcd-modal-content {
      padding: 0.5rem;

      .description {
        font-weight: bold;
      }

      .qcd-modal-value {
        .color-violet {
          color: #646060;
          // font-weight: bold;
          font-family: "Trebuchet MS", Helvetica, sans-serif;
        }
      }
    }

    .title {
      color: black;
      font-size: 20px;
    }
  }

  .modal-footer {
    .action-footer {
      float: right;
    }
  }
}

.cursor {
  cursor: pointer;

  & * {
    cursor: pointer;
  }
}

.align-right {
  text-align: right;
}

.float-right {
  float: right;
}

#switch-cost-v2 {
  display: inline;
  float: right;
}
</style>

<style lang="less">
.qcd-gold {
  color: green !important;
}

.qcd-sliver {
  color: #84c02a !important;
}

.qcd-bronze {
  color: #cd7f32 !important;
}
.cell-description {
  background-color: white;
}

.qcd-report-description {
  .ant-tooltip-content {
    .ant-tooltip-inner {
      background-color: rgb(0, 21, 41);
      padding: 0px;
      box-shadow: 2px 2px 5px rgb(0, 21, 41);
    }
  }
}
</style>

<style scoped>
.blue-gray {
  font-size: 13px;
  font-weight: 600;
  background-color: #ebecf0;
  border-color: #ebecf0;
  border-top-color: rgb(235, 236, 240);
  border-right-color: rgb(235, 236, 240);
  border-bottom-color: rgb(235, 236, 240);
  border-left-color: rgb(235, 236, 240);
  color: #42526e;
  border-radius: 4px;
  padding: 4px;
}
.green {
  font-size: 13px;
  font-weight: 600;
  background-color: #e3fcef;
  border-color: #e3fcef;
  border-top-color: rgb(227, 252, 239);
  border-right-color: rgb(227, 252, 239);
  border-bottom-color: rgb(227, 252, 239);
  border-left-color: rgb(227, 252, 239);
  color: #064;
  border-radius: 4px;
  padding: 4px;
}
.yellow {
  font-size: 13px;
  font-weight: 600;
  background-color: #deebff;
  border-color: #deebff;
  border-top-color: rgb(222, 235, 255);
  border-right-color: rgb(222, 235, 255);
  border-bottom-color: rgb(222, 235, 255);
  border-left-color: rgb(222, 235, 255);
  color: #0049b0;
  border-radius: 4px;
  padding: 4px;
}
.issue-warning-note {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: #fbfbbe;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin: 0px 0px 2px 20px;
}

@media (min-width: 576px) {
  .label-duration {
    text-align: right;
    padding-right: 9px;
  }
  .start-duration {
    padding-left: 1px;
  }
}

.start-duration {
  width: 100%;
}
</style>
