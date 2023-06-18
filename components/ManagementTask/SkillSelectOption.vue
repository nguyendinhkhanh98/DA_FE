<template>
  <div>
    <a-select
      class="mr-1"
      ref="skill_id"
      show-search
      :style="{ width: mode == 'skill' ? '290px' : '365px' }"
      v-model="skill.id"
      :placeholder="$t(mode == 'skill' ? 'skill' : 'business_skill')"
      :filterOption="filterOptionVietnamese"
      @change="trigger = !trigger"
    >
      <template v-if="mode == 'skill'">
        <a-select-option v-for="item in listSkillFiltered" :key="item.id">
          {{ item.name }}
        </a-select-option>
      </template>
      <template v-else>
        <a-select-option v-for="item in listSkillFiltered" :key="item.skill_id">
          <pre class="bskill-select">
            {{ item.skill_name }}
          </pre>
        </a-select-option>
      </template>
    </a-select>

    <a-select
      class="mr-1"
      ref="skill_name"
      show-search
      :style="{ width: mode == 'skill' ? '155px' : '80px' }"
      v-model="skill.level"
      :placeholder="$t('level')"
      :filterOption="filterOptionVietnamese"
      @change="trigger = !trigger"
    >
      <template v-if="mode == 'skill'">
        <a-select-option v-for="item in listSkillLevel" :key="item.level">
          {{ item.name }}
        </a-select-option>
      </template>
      <template v-else>
        <a-select-option v-for="item in listBusinessLevel" :key="item.level">
          {{ item.name }}
        </a-select-option>
      </template>
    </a-select>

    <span v-if="!skill.mark" :style="{ width: `calc(100% - ${mode == 'skill' ? '495px' : '530px'})` }">
      <a-button type="danger" @click="$emit('onDelete')" icon="delete" size="small" />
    </span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  props: {
    skill: Object,
    taskSkills: Array,
    mode: {
      type: String,
      required: true,
      validator: function (value) {
        return ["skill", "bskill"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      trigger: true
    };
  },
  computed: {
    ...mapState({
      listSkill: state => state.modules["management-task"].listSkill,
      listBusinessSkill: state => state.modules["business-skill"].listSkill,
      listStatus: state => state.modules["management-task"].listStatus,
      levels: state => state.modules["skill-set"].levels,
      listBusinessLevel: state => state.modules["management-task"].listBusinessLevel
    }),
    listSkillFiltered() {
      if (this.mode == "skill") return this.filterListSkillNotSelected;
      else return this.filterListBusinessSkillNotSelected;
    },
    filterListSkillNotSelected() {
      const listEngineerSkillExist = this.taskSkills;
      let listEngineerSkill = this.listSkill && this.listSkill.length ? this.listSkill : [];
      listEngineerSkill = listEngineerSkill.filter(item => {
        if (item.skill_delete_flag) return false;
        if (!item.category_id) return false;
        return true;
      });
      if (!listEngineerSkillExist || !listEngineerSkillExist.length) return listEngineerSkill;

      const listSkillIdExist = listEngineerSkillExist.map(item => item.id).filter(item => item != this.skill.id);
      const listSkillOriginal = listEngineerSkill.map(item => item.id);
      const listFilterSkillId = _.xor(listSkillIdExist, listSkillOriginal);
      return listEngineerSkill.filter(item => listFilterSkillId.includes(item.id));
    },
    filterListBusinessSkillNotSelected() {
      const listBusinessSkillExist = this.taskSkills;
      let listBusinessSkill = this.listBusinessSkill && this.listBusinessSkill.length ? this.listBusinessSkill : [];
      listBusinessSkill = listBusinessSkill.filter(item => {
        if (item.skill_delete_flag) return false;
        if (!item.category_id) return false;
        return true;
      });

      if (!listBusinessSkillExist || !listBusinessSkillExist.length) return listBusinessSkill;

      let listSkillIdExist = listBusinessSkillExist.map(item => item.id).filter(item => item != this.skill.id);
      let listSkillOriginal = listBusinessSkill.map(item => item.skill_id);
      let listFilterSkillId = _.xor(listSkillIdExist, listSkillOriginal);
      return listBusinessSkill.filter(item => listFilterSkillId.includes(item.skill_id));
    },
    filled() {
      return this.skill.id && this.skill.level;
    },
    listSkillLevel() {
      return this.levels.filter(item => item.type == "skill");
    }
  },
  watch: {
    trigger() {
      if (!this.filled) return;
      if (this.skill.mark) delete this.skill.mark;
      this.$emit("filled");
    }
  },
  methods: {
    filterOptionVietnamese(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    validate() {
      const skillIdEl = this.$refs["skill_id"];
      const skillNameEl = this.$refs["skill_name"];

      const isCorrectId = !isNaN(parseInt(this.skill.id));
      const isCorrectLevel = !isNaN(parseInt(this.skill.level));

      const filledFullSkill = isCorrectId && isCorrectLevel;
      const filledHalfSkill = isCorrectId || isCorrectLevel;

      if (filledHalfSkill && !filledFullSkill) {
        skillIdEl.$el.classList.add("input-element-invalid");
        skillNameEl.$el.classList.add("input-element-invalid");

        this.$notification.error({
          message: this.$t("error_data_invalid"),
          description: ``,
          duration: 2
        });
        return false;
      }
      return true;
    }
  }
};
</script>
<style lang="less">
.bskill-select {
  overflow: unset !important;
  white-space: pre-line !important;
  margin-bottom: 0px !important;
  font-family: sans-serif !important;
}
.ant-select-selection-selected-value > .bskill-select {
  overflow: hidden !important;
  white-space: nowrap !important;
  font-family: sans-serif !important;
  text-overflow: ellipsis;
}
</style>