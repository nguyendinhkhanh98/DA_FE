<template>
  <a-col>
    <h3 :id="`skill-${skill.id}`">{{ skill.name }}</h3>
    <a-row class="mx-1">
      <a-col class="wapper-label" :span="8">
        <label class="label-skill" :title="$t('experience_time')">{{ $t("experience_time") }}</label>
      </a-col>
      <a-col :span="8">
        <div
          :class="{
            'ant-input-number': true,
            'ant-input-number-disabled': routeID != 'add' && !isDraft
          }"
          style="width: 100%"
        >
          <div class="ant-input-number-input-wrap">
            <input
              ref="experience_time"
              type="number"
              class="ant-input-number-input"
              min="0"
              :value="skillData.experience_time"
              :disabled="routeID != 'add' && !isDraft"
              @change="e => handleFormChange('experience_time', e.target.value)"
            />
          </div>
        </div>
      </a-col>
      <a-col class="wapper-label last_evaluate" :span="8" v-if="!isNaN(skill.last_experience_time)">
        <label class="label-skill">{{ `(Last: ${skill.last_experience_time})` }}</label>
      </a-col>
    </a-row>

    <a-row class="mt-1 mx-1">
      <a-col class="wapper-label" :span="8">
        <label :title="$t('level')">{{ $t("level") }}</label>
      </a-col>

      <a-col :span="8">
        <a-select
          ref="level"
          :disabled="routeID != 'add' && !isDraft"
          :default-value="skillData.level"
          @change="val => handleFormChange('level', val)"
        >
          <template v-if="skill.category != 'Foreign Languages'">
            <a-select-option v-for="item in levelSkill" :key="item.level">
              {{ item.name }}
            </a-select-option>
          </template>
          <template v-else>
            <a-select-option v-for="item in levelEnglish" :key="item.level">
              {{ item.name }}
            </a-select-option>
          </template>
        </a-select>
      </a-col>

      <a-col class="wapper-label last_evaluate" :span="8" v-if="!isNaN(skill.last_level)">
        <label>{{ `(Last: ${skill.last_level})` }}</label>
      </a-col>
    </a-row>

    <template v-if="routeID != 'add' && !isDraft">
      <a-row class="mt-1 mx-1 leader-review wapper-label">
        <a-col :span="8">
          <label :title="$t('level_review')">{{ $t("level_review") }}</label>
        </a-col>

        <a-col :span="8">
          <a-select
            ref="level_review"
            :disabled="disableReview"
            :default-value="skillData.level_review"
            @change="val => handleFormChange('level_review', val)"
          >
            <template v-if="skill.category != 'Foreign Languages'">
              <a-select-option v-for="item in levelSkill" :key="item.level">
                {{ item.name }}
              </a-select-option>
            </template>
            <template v-else>
              <a-select-option v-for="item in levelEnglish" :key="item.level">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-col>

        <a-col class="wapper-label last_evaluate" :span="8" v-if="!isNaN(skill.last_level)">
          <label>{{ `(Last: ${skill.last_level})` }}</label>
        </a-col>
      </a-row>

      <a-row class="mt-1 mx-1 leader-review">
        <a-col class="wapper-label" :span="8">
          <label :title="$t('skill_note')">{{ $t("skill_note") }}</label>
        </a-col>

        <a-col :span="8">
          <a-input
            :disabled="disableReview"
            :default-value="skillData.note"
            @change="e => handleFormChange('note', e.target.value)"
          />
        </a-col>
      </a-row>
    </template>
    <hr />
  </a-col>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "CellSkill",
  props: {
    skill: Object,
    routeID: String,
    isDraft: Boolean,
    skillData: Object,
    category: Number,
    disableReview: Boolean
  },
  computed: {
    ...mapState({
      levels: state => state.modules["skill-set"].levels
    }),
    levelSkill() {
      return this.levels.filter(item => item.type == "skill");
    },
    levelEnglish() {
      return this.levels.filter(item => item.type == "fl");
    }
  },
  mounted() {
    this.handleFormChange("note", this.skill.note);
  },
  methods: {
    handleFormChange(key, value) {
      this.skill[key] = value;
      this.$emit("change", this.skill, key, value);
    }
  }
};
</script>

<style lang="less" scoped>
.ant-select {
  width: 100%;
}

.leader-review {
  color: green;
}

.last_evaluate {
  padding-left: 2rem;
  color: rgb(255, 193, 7);
}

.wapper-label {
  height: 32px;
  .label-skill {
    vertical-align: middle;
    vertical-align: -webkit-baseline-middle;
  }
  label {
    .label-skill();
  }
}
</style>
