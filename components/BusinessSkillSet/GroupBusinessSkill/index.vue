<template>
  <tr class="group-skill">
    <td>{{ skill.skill }}</td>
    <td>
      <a-input-number
        ref="experience_time"
        :default-value="skill.experience_time"
        :disabled="disabledExpAndLevel"
        :min="1"
        allowClear
        @change="value => handleFormChange(skill, 'experience_time', value)"
      />
      <label class="wapper-label text-warning w-50" v-if="skill.last_experience_time">{{
        `(${$t("last")}: ${skill.last_experience_time})`
      }}</label>
    </td>

    <td>
      <a-select
        ref="level"
        :default-value="skill.level"
        :disabled="disabledExpAndLevel"
        allowClear
        @change="val => handleFormChange(skill, 'level', val)"
        class="select-level w-50"
      >
        <template>
          <a-select-option v-for="item in levels" :key="item.id" :value="item.level">
            <span :key="item.id">{{ item.name }}</span>
          </a-select-option>
        </template>
      </a-select>
      <label class="wapper-label text-warning w-50" v-if="skill.last_level">{{
        `(${$t("last")}: ${getNameLevelByID(skill.last_level)})`
      }}</label>
    </td>

    <template v-if="!isCreateNewSkillSet && !isReject">
      <td>
        <a-select
          ref="level_review"
          :default-value="skill.level_review ? skill.level_review : skill.level"
          :disabled="disableReview"
          class="select-level w-50"
          allowClear
          @change="val => handleFormChange(skill, 'level_review', val)"
        >
          <a-select-option v-for="item in levels" :key="item.id" :value="item.level">
            <span :key="item.level">{{ item.name }}</span>
          </a-select-option>
        </a-select>
        <label v-if="skill.last_level" class="wapper-label text-warning w-50">{{
          `(${$t("last")}: ${getNameLevelByID(skill.last_level)})`
        }}</label>
      </td>

      <td>
        <a-textarea
          ref="note"
          :default-value="skill.note"
          :disabled="disableReview"
          :auto-size="{ minRows: 1, maxRows: 3 }"
          class="w-100"
          allowClear
          @change="e => handleFormChange(skill, 'note', e.target.value)"
        />
      </td>
    </template>
  </tr>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { listReviewStatus } from "../BusinessSkillContent/const.js";

export default {
  name: "GroupSkill",
  props: {
    skill: {
      type: Object,
      default: {}
    }
  },
  computed: {
    ...mapState({
      routeID: state => state.modules["business-skill"].routeID,
      routeInfo: state => state.modules["business-skill"].routeInfo,
      userInfo: state => state.userInfo,
      levels: state => state.modules["business-skill"].levels
    }),
    ...mapGetters({
      isDraft: "modules/business-skill/isDraft",
      isReject: "modules/business-skill/isReject",
      isLeader: "modules/skill-set/isLeader",
      isManager: "modules/skill-set/isManager"
    }),
    isCreateNewSkillSet() {
      return this.isDraft || this.routeID == "add";
    },
    canRenderLastLevel() {
      let isNullLastLevel = _.isNull(this.skill.last_level);
      let isUndefinedLastLevel = _.isUndefined(this.skill.last_level);
      return isNullLastLevel || isUndefinedLastLevel ? false : true;
    },
    canRenderLastExperience() {
      let isNullLastEx = _.isNull(this.skill.last_experience_time);
      let isUndefinedLastEx = _.isUndefined(this.last_experience_time);
      return isNullLastEx || isUndefinedLastEx ? false : true;
    },
    disableReview() {
      let isApproved = this.routeID != "add" && this.routeInfo && this.routeInfo.status == "Approved";
      let isUserViewReview = !this.isLeader && this.routeInfo && listReviewStatus.includes(this.routeInfo.status);

      return isApproved || isUserViewReview || this.isRecordWaitingReviewOfLeader;
    },
    disabledExpAndLevel() {
      let isAdd = this.routeID == "add";
      let isDraftOrReject = this.isDraft || this.isReject;
      let cannotModifyData = !isAdd && !isDraftOrReject;
      return cannotModifyData;
    },
    isRecordWaitingReviewOfLeader() {
      if (this.isReviewStatus) {
        if (this.isLeader) {
          if (this.routeInfo && this.userInfo && this.routeInfo.user_id == this.userInfo.id) return true;
          else return false;
        } else return false;
      } else return false;
    },
    isReviewStatus() {
      return this.routeInfo ? listReviewStatus.includes(this.routeInfo ? this.routeInfo.status : null) : false;
    },
    isForeignLanguages() {
      return this.skill.category == "Foreign Languages";
    }
  },
  methods: {
    handleFormChange(skill, key, value) {
      this.$emit("skill-change", skill, key, value);
    },
    validateFormCreate() {
      // Call from Group Category
      let self = this;

      let isCorrectExperienceTime = !isNaN(parseInt(this.skill.experience_time));
      let isCorrectLevel = !isNaN(parseInt(this.skill.level));

      let experienceTimeInput = this.$refs["experience_time"];
      let levelInput = this.$refs["level"];

      let errorMessage = null;
      if (!isCorrectExperienceTime && isCorrectLevel) {
        experienceTimeInput.$el.classList.add("input-invalid");
        levelInput.$el.classList.remove("input-invalid");

        errorMessage = {
          message: `Validate category ${self.skill.category}`,
          description: `Field experience time of ${self.skill.skill_name} is empty`,
          duration: 2
        };
      } else if (isCorrectExperienceTime && !isCorrectLevel) {
        levelInput.$el.classList.add("input-invalid");
        experienceTimeInput.$el.classList.remove("input-invalid");

        errorMessage = {
          message: `Validate category ${self.skill.category}`,
          description: `Field level of ${self.skill.skill_name} is empty`,
          duration: 2
        };
      }

      if (errorMessage) {
        this.$notification.error(errorMessage);
        return false;
      } else return true;
    },
    validateFormReview() {
      // Call from Group Category
      let self = this;
      let isCorrectLevelReview = !isNaN(parseInt(this.skill.level_review));
      let levelReviewInput = this.$refs["level_review"];

      let errorMessage = null;
      if (!isCorrectLevelReview) {
        levelReviewInput.$el.classList.add("input-invalid");

        errorMessage = {
          message: `Validate category ${self.skill.category}`,
          description: `Field level review of ${self.skill.skill_name} is empty`,
          duration: 2
        };
      }
      if (errorMessage) {
        this.$notification.error(errorMessage);
        return false;
      } else return true;
    },
    validateFormZeroExperienceTime() {
      // Call from Group Category
      let self = this;
      let isCorrectExperienceTime = !isNaN(parseInt(this.skill.experience_time));
      let isCorrectLevel = !isNaN(parseInt(this.skill.level));

      let experienceTimeInput = this.$refs["experience_time"];
      let levelInput = this.$refs["level"];

      let errorMessage = null;
      if (isCorrectLevel && isCorrectExperienceTime && !parseInt(this.skill.experience_time)) {
        experienceTimeInput.$el.classList.add("input-invalid");
        levelInput.$el.classList.add("input-invalid");

        errorMessage = {
          message: `Validate category ${self.skill.category}`,
          description: `Zero experience time of skill ${self.skill.skill_name}`,
          duration: 2
        };
      }

      if (errorMessage) {
        this.$notification.error(errorMessage);
        return false;
      } else return true;
    },
    getNameLevelByID(id) {
      return this.levels.find(x => x.level == id).name;
    }
  }
};
</script>

<style lang="less" scoped>
.w-50 {
  width: 50%;
}

.input-invalid {
  border: 1px solid red;
  border-radius: 4px;
}

.group-skill {
  background-color: white;
}

.select-level {
  width: 120px;
}
</style>
