<template>
  <a-card class="shadow">
    <div>
      <div class="h1">
        {{ $t("fit_gap_task") }}
      </div>

      <h2>
        <span>{{ $t("task") }}</span
        >:
        <span>{{ taskInfo.name }}</span>
      </h2>
    </div>

    <a-row>
      <span class="user-fit-skill"></span>&nbsp;:
      <small>{{ $t("fit_skill_required") }}</small>
      <br />

      <span class="user-gap-skill"></span>&nbsp;:
      <small>{{ $t("gap_skill_required") }}</small>
    </a-row>

    <div style="min-height: 200px">
      <a-spin :tip="`${$t('loading')}...`" :spinning="loading" class="w-100 h-100">
        <template v-if="!loading">
          <a-row>
            <span class="ml-2" style="float: right">
              {{ $t("view_type") }}
              <a-button class="mb-1" type="primary" :disabled="!isShowChart" @click="isShowChart = !isShowChart">
                <i class="fas fa-table"></i>
              </a-button>
              <a-button class="mb-1" type="primary" :disabled="isShowChart" @click="isShowChart = !isShowChart">
                <i class="fas fa-chart-line"></i>
              </a-button>
            </span>
          </a-row>

          <a-row v-if="isShowChart">
            <a-col>
              <PreviewSkillChart
                class="dock-sticky"
                v-bind="definitionData"
                mode="define"
                style="border: 1px solid black"
              />

              <div>
                <PreviewSkillChart
                  v-for="userSkill in listFitSkill"
                  v-bind="buildUserSkillData(userSkill)"
                  mode="fit"
                  :key="userSkill.full_name"
                />

                <PreviewSkillChart
                  v-for="userSkill in listGapSkill"
                  v-bind="buildUserSkillData(userSkill)"
                  mode="gap"
                  :key="userSkill.full_name"
                />
              </div>
            </a-col>
          </a-row>
          <a-row v-else>
            <TableView :columns="columns" :data-source="dataSource" />
          </a-row>
        </template>
      </a-spin>
    </div>
  </a-card>
</template>

<script>
import TableView from "@/components/ManagementTask/TableView.vue";
import PreviewSkillChart from "@/components/ManagementTask/PreviewSkillChart.vue";
import { mapState, mapActions } from "vuex";
import { filterUserGapAndNotFit, columns, mergeUserSkillTask } from "./const";
import { getListFitSkillTask } from "./const";
import { getListGapSkillTask } from "./const";
const SK = "sk";
const BSK = "bsk";

export default {
  components: {
    TableView,
    PreviewSkillChart
  },
  data() {
    return {
      columns,
      dataSource: [],
      taskInfo: {},
      loading: true,
      listFitSkill: [],
      listGapSkill: [],
      isShowChart: false,
      definitionData: {}
    };
  },
  computed: {
    ...mapState({
      latestAssessmentApproved: state => state.modules["management-task"].latestAssessmentApproved,
      latestBusinessAssessmentApproved: state => state.modules["management-task"].latestBusinessAssessmentApproved
    })
  },
  async created() {
    let taskId = this.$route.query.task_id;
    if (!taskId) {
      this.loading = false;
      return;
    }
    await this.getTaskInfoByIdAPI(taskId);
    await this.getLatestAssessmentApproved();
    await this.getLatestBusinessAssessmentApproved();
    await this.GetLevels();
    await this.getLevels();
    this.mergeSkill();
    this.expandColumn();
    this.fillDataSource(this.listFitSkill, this.listGapSkill);
    this.buildDefinitionData();

    this.loading = false;
  },
  methods: {
    ...mapActions({
      getTaskByID: "modules/management-task/getTaskByID",
      getLatestAssessmentApproved: "modules/management-task/getLatestAssessmentApproved",
      getLatestBusinessAssessmentApproved: "modules/management-task/getLatestBusinessAssessmentApproved",
      GetLevels: "modules/skill-set/GetLevels",
      getLevels: "modules/business-skill/getLevels"
    }),
    async getTaskInfoByIdAPI(taskId) {
      let res = await this.getTaskByID(taskId);
      this.taskInfo = res.data;
    },
    mergeSkill() {
      let eSkill = this.taskInfo.skills.map(item => {
        return {
          ...item,
          isBusSkill: false
        };
      });
      let bSkill = this.taskInfo.business_skills.map(item => {
        return {
          ...item,
          isBusSkill: true
        };
      });
      let skillRequired = eSkill.concat(bSkill);
      let latestAssessmentApproved = mergeUserSkillTask(
        this.latestAssessmentApproved,
        this.latestBusinessAssessmentApproved
      );
      this.listFitSkill = getListFitSkillTask(latestAssessmentApproved, skillRequired);
      this.listGapSkill = filterUserGapAndNotFit(
        getListGapSkillTask(latestAssessmentApproved, skillRequired),
        this.listFitSkill
      );
    },
    expandColumn() {
      let listSkillColumn = this.taskInfo.skills.map(item => {
        return {
          title: item.name,
          dataIndex: item.name,
          key: item.name,
          type: SK
        };
      });

      let listBusinessSkillColumn = this.taskInfo.business_skills.map(item => {
        return {
          title: item.name,
          dataIndex: item.name,
          key: item.name,
          type: BSK
        };
      });

      let columns = listSkillColumn.concat(listBusinessSkillColumn);
      this.columns = this.columns.concat(columns);
    },
    fillDataSource(listFitSkill, listGapSkill) {
      let dataSource = [];
      // Fill by defination row
      const definitionRow = {
        user: this.$t("skill_required"),
        type: "define"
      };
      this.taskInfo.skills.forEach(element => (definitionRow[element.name] = element.level));
      this.taskInfo.business_skills.forEach(element => (definitionRow[element.name] = element.level));
      dataSource.push(definitionRow);

      const fitRows = this.getRowsFitSkill(listFitSkill);
      dataSource = dataSource.concat(fitRows);

      const gapRows = this.getRowsGapSkill(listGapSkill);
      dataSource = dataSource.concat(gapRows);

      this.dataSource = dataSource;
    },
    getRowsFitSkill(listFitSkill) {
      return listFitSkill.map(user => {
        const row = {};
        row.user = user.full_name;
        row.type = "fit";

        this.taskInfo.skills.forEach(skill => {
          let skillInUser = user.skills.find(item => item.skill_id == skill.id);
          skillInUser && (row[skillInUser.skill_name] = skillInUser.level);
        });

        this.taskInfo.business_skills.forEach(skill => {
          let skillInUser = user.skills.find(item => item.skill_id == skill.id);
          skillInUser && (row[skillInUser.skill_name] = skillInUser.level);
        });
        return row;
      });
    },
    getRowsGapSkill(listGapSkill) {
      return listGapSkill.map(user => {
        const row = {};
        row.user = user.full_name;
        row.type = "gap";

        this.taskInfo.skills.forEach(skill => {
          let skillInUser = user.skills.find(item => item.skill_id == skill.id);
          skillInUser && (row[skillInUser.skill_name] = skillInUser.level);
        });

        this.taskInfo.business_skills.forEach(skill => {
          let skillInUser = user.skills.find(item => item.skill_id == skill.id);
          skillInUser && (row[skillInUser.skill_name] = skillInUser.level);
        });
        return row;
      });
    },
    buildDefinitionData() {
      let skillSeries = this.taskInfo.skills.map(item => ({ y: item.level, x: SK }));
      let bSkillSeries = this.taskInfo.business_skills.map(item => ({ y: item.level, x: BSK }));

      let skillLabels = this.taskInfo.skills.map(item => ({ name: item.name, type: SK }));
      let bSkillLabels = this.taskInfo.business_skills.map(item => ({ name: item.name, type: BSK }));

      let series = skillSeries.concat(bSkillSeries);
      let labels = skillLabels.concat(bSkillLabels);
      this.definitionData = {
        title: this.$t("skill_required"),
        series,
        labels
      };
    },
    buildUserSkillData(userSkill) {
      let skillLabels = this.taskInfo.skills.map(item => ({ name: item.name, type: SK }));
      let bSkillLabels = this.taskInfo.business_skills.map(item => ({ name: item.name, type: BSK }));

      let labels = skillLabels.concat(bSkillLabels);
      let series = labels.map(skill => {
        let skillInUser = userSkill.skills.find(item => item.skill_name == skill.name);
        return skillInUser ? { x: skillInUser.type, y: skillInUser.level } : { x: "", y: 0 };
      });

      return {
        title: userSkill.full_name,
        series,
        labels
      };
    }
  }
};
</script>

<style lang="less" scoped>
.user-fit-skill {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: #28a745;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin: 0px 0px 2px 20px;
}

.user-gap-skill {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: #ffc107;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin: 0px 0px 2px 20px;
}
</style>
