<template>
  <div v-if="!loading">
    <template v-if="canRenderSkillSetTable">
      <div class="table-wrapper" v-if="dataSource.length">
        <table class="w-100 table-bordered">
          <thead class="ant-table-thead">
            <tr>
              <th style="width: 50px"></th>
              <th class="wrapper-header" v-for="column in columns" :key="column.key" :span="column.span">
                {{ $t(column.title) }}
              </th>
            </tr>
          </thead>
          <tbody class="ant-table-tbody">
            <template v-for="data in dataSource">
              <tr v-if="data.business_skills.length" :key="data.id" :id="data.id">
                <td class="ant-table-row-expand-icon-cell">
                  <div
                    role="button"
                    tabindex="0"
                    aria-label="Expand row"
                    class="ant-table-row-expand-icon ant-table-row-expanded"
                    @click="expandRow(data.id)"
                  ></div>
                </td>

                <td v-for="column in columns" :key="column.id" class="category-item">
                  {{ data[column.key] }}
                </td>
              </tr>

              <tr
                v-if="data.business_skills.length"
                class="ant-table-expanded-row"
                :key="`${data.id}_extra`"
                :id="`${data.id}_extra`"
              >
                <td></td>
                <td colspan="2">
                  <GroupCategory ref="group-category" v-bind="{ record: data }" @change-skill="handleFormChange" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <a-row v-if="renderFooter" class="mt-2 right-direction dock-action">
      <a-popconfirm
        placement="topRight"
        :ok-text="$t('yes')"
        :cancel-text="$t('no')"
        @confirm="commitData(getTypeCommitData)"
      >
        <template slot="title">
          <p>{{ isReviewStatus ? $t("submit_assessment_confirm") : $t("create_assessment_confirm") }}</p>
          <p>{{ $t("warning_after_submit") }}</p>
        </template>

        <a-button
          v-if="routeID == 'add' || (isLeader && isReviewStatus) || isDraftOrRejectStatus"
          :loading="spinning"
          type="primary"
        >
          <span v-if="isReviewStatus">{{ $t("approve") }}</span>
          <span v-else>
            {{ $t("submit") }}
          </span>
        </a-button>
      </a-popconfirm>

      <a-button
        v-if="routeID == 'add' || isDraftOrRejectStatus"
        class="ant-btn"
        :loading="spinning"
        @click="routeID == 'add' ? commitData('draft') : commitData('update_draft')"
      >
        {{ $t("save_draft") }}
      </a-button>

      <a-popconfirm
        v-if="isLeader && isReviewStatus"
        placement="topRight"
        :ok-text="$t('yes')"
        :cancel-text="$t('no')"
        @confirm="commitData('reject')"
      >
        <template slot="title">
          <p>{{ $t("reject_assessment_confirm") }}</p>
        </template>
        <a-icon slot="icon" type="question-circle-o" style="color: red" />
        <a-button class="ant-btn" :loading="spinning"> {{ $t("reject") }} </a-button>
      </a-popconfirm>
    </a-row>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import { columns, listReviewStatus } from "./const.js";
import GroupCategory from "@/components/BusinessSkillSet/GroupCategory";

export default {
  name: "SkillSetContent",
  props: {
    period: {
      type: Object,
      default: {
        id: null,
        period_id: null,
        leader_id: null
      }
    }
  },
  components: {
    GroupCategory
  },
  data() {
    return {
      columns,
      fillDataCreate: false,
      dataChanged: [],
      loading: false,
      spinning: false
    };
  },
  watch: {
    dataSource: {
      deep: true,
      handler(newValue) {
        let source = [];
        newValue.map(category => {
          category.business_skills.map(item => {
            let isNaNLevel = isNaN(parseInt(item.level));
            let isNaNLevelReview = isNaN(parseInt(item.level_review));
            let isNaNExperienceTime = isNaN(parseInt(item.experience_time));

            if (this.routeID == "add" || this.isDraftOrRejectStatus) {
              if (!isNaNLevel && !isNaNExperienceTime) source.push(item);
            } else if (!isNaNLevel && !isNaNLevelReview) source.push(item);
          });
        });

        this.dataChanged = source;
      }
    },
    dataChanged: {
      deep: true,
      handler() {
        this.$emit("data-change", this.dataChanged);
      }
    }
  },

  computed: {
    ...mapState({
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName,
      routeID: state => state.modules["business-skill"].routeID,
      routeInfo: state => state.modules["business-skill"].routeInfo,
      levels: state => state.modules["business-skill"].levels,
      userInfo: state => state.userInfo,
      listCategory: state => state.modules["business-skill"].listCategory
    }),
    ...mapGetters({
      isDraft: "modules/business-skill/isDraft",
      isReject: "modules/business-skill/isReject",
      isLeader: "modules/skill-set/isLeader",
      isManager: "modules/skill-set/isManager"
    }),
    getTypeCommitData() {
      if (this.routeID == "add") return "create";
      if (this.isDraftOrRejectStatus) return "draft_to_waiting";
      return "approve";
    },
    dataSource() {
      return this.listCategory.map(item => {
        return {
          id: item.category_name,
          category: item.category_name,
          description: item.category_description,
          type: "category",
          business_skills: this.getChildrenFromListSkill(item.business_skills)
        };
      });
    },
    renderFooter() {
      return this.routeID != "add" ? !this.isRecordWaitingReviewOfLeader : this.canRenderSkillSetTable;
    },
    isRecordWaitingReviewOfLeader() {
      if (this.isReviewStatus) {
        if (this.isLeader) {
          if (this.routeInfo && this.userInfo && this.routeInfo.user_id == this.userInfo.id) return true;
          else return false;
        } else return false;
      } else return false;
    },
    canRenderSkillSetTable() {
      let haveSelected = this.period.period_id && this.period.leader_id;
      return this.routeID != "add" || haveSelected ? true : false;
    },
    isReviewStatus() {
      return this.routeInfo ? listReviewStatus.includes(this.routeInfo ? this.routeInfo.status : null) : false;
    },
    isDraftOrRejectStatus() {
      return this.isDraft || this.isReject;
    }
  },
  created() {
    this.loading = true;
    let source = [];
    const waittingStatus = ["Waiting for review", "Wait for Review"];
    this.listCategory.map(category => {
      category.business_skills.map(item => {
        let isNaNLevel = isNaN(parseInt(item.level));
        let isNaNLevelReview = isNaN(parseInt(item.level_review));
        let isNaNExperienceTime = isNaN(parseInt(item.experience_time));

        if (this.routeID == "add" || this.isDraftOrRejectStatus) {
          if (!isNaNLevel && !isNaNExperienceTime) source.push(item);
        } else if (!isNaNLevel && !isNaNLevelReview) {
          source.push(item);
        } else if (waittingStatus.includes(this.routeInfo.status)) {
          source.push(item);
        }
      });
    });

    this.dataChanged = source;
    this.loading = false;
  },
  methods: {
    ...mapActions({
      fetchListBusinessSkill: "modules/business-skill/fetchListBusinessSkill"
    }),
    ...mapMutations({
      setListCategory: "modules/business-skill/setListCategory"
    }),
    handleFormChange(skill, key, value) {
      skill[key] = value;
      let foundSkill = _.find(this.dataChanged, item => item.skill_id == skill.skill_id);
      if (foundSkill) foundSkill[key] = value;
      else this.dataChanged.push(skill);
      this.$emit("data-change", this.dataChanged);
    },

    commitData(type) {
      if (type == "reject") {
        this.$emit("commit", { ...[], period: this.period }, type, this.routeID);
      } else {
        this.validateSource().then(validate => {
          if (validate.success) {
            this.$emit("commit", { ...this.dataChanged, period: this.period }, type, this.routeID);
          }
        });
      }
    },
    validateSource() {
      let groupCategory = this.$refs["group-category"];

      return new Promise((resolve, reject) => {
        let message = {
          success: true,
          message: null,
          description: null
        };
        if (this.routeID == "add" || this.isDraftOrRejectStatus) {
          let listState = groupCategory.map(item => item.validateFormCreate());
          message.success = listState.includes(false) ? false : true;
          if (!message.success) return resolve(message);
        }

        if (this.routeID != "add" && listReviewStatus.includes(this.routeInfo.status)) {
          let listState = groupCategory.map(item => item.validateFormReview());
          message.success = listState.includes(false) ? false : true;
          if (!message.success) return resolve(message);
        }

        let listStateZeroExperienceTime = groupCategory.map(item => item.validateFormZeroExperienceTime());
        message.success = listStateZeroExperienceTime.includes(false) ? false : true;
        resolve(message);
      });
    },

    getChildrenFromListSkill(skills) {
      return skills.map(s => ({ ...s, skill: s.skill_name }));
    },
    expandOneRow(rowExpand, rowSelected) {
      rowExpand && rowExpand.classList.remove("hiden");
      rowSelected && rowSelected.classList.remove("ant-table-row-collapsed");
      rowSelected && rowSelected.classList.add("ant-table-row-expanded");
    },
    colapseOneRow(rowExpand, rowSelected) {
      rowExpand && rowExpand.classList.add("hiden");
      rowSelected && rowSelected.classList.add("ant-table-row-collapsed");
      rowSelected && rowSelected.classList.remove("ant-table-row-expanded");
    },
    expandRow(key, isExpand) {
      let rowSelected = document.querySelector(`tr[id='${key}'] td div`);
      let rowExpand = document.querySelector(`tr[id='${key}_extra']`);

      if (isExpand) this.expandOneRow(rowExpand, rowSelected);
      else if (rowExpand.classList.contains("hiden")) this.expandOneRow(rowExpand, rowSelected);
      else this.colapseOneRow(rowExpand, rowSelected);
    },
    expandAll(isToggleAll) {
      // Call from _id skill set
      let rowSelected = document.querySelectorAll(`tr td div[role='button']`);
      let row = document.querySelectorAll(`tr[id$='extra']`);

      row.forEach(item => (isToggleAll ? this.expandOneRow(item, null) : this.colapseOneRow(item, null)));
      rowSelected.forEach(item => (isToggleAll ? this.expandOneRow(null, item) : this.colapseOneRow(null, item)));
    }
  }
};
</script>

<style lang="less" scoped>
.wapper-label {
  display: inline-block;
  .label-skill {
    vertical-align: middle;
    vertical-align: -webkit-baseline-middle;
  }
  label {
    .label-skill();
  }
}

.select-level {
  min-width: 80px;
}

.right-direction {
  direction: rtl;
}

.table-bordered {
  border-collapse: collapse;
  width: 1200px;
  min-width: 100%;
  border-radius: 4px 4px 0 0;

  & table,
  th,
  td {
    border: 1px solid #e8e8e8;
  }
}

.table-wrapper {
  overflow-x: scroll;
}

.hiden {
  display: none;
}
</style>

<style>
.wrapper-header {
  font-size: 1rem;
  color: #001529;
  font-weight: 500;
}

.category-item {
  font-size: 1rem;
}

.dock-action {
  position: fixed;
  right: 40px;
  bottom: 10px;
}
</style>
