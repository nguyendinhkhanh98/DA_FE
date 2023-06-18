<template>
  <a-row>
    <a-row class="table-inside">
      <table class="w-100">
        <thead class="ant-table-thead">
          <tr>
            <th v-for="column in columns" :key="column.key" :span="column.span" :class="column.class">
              {{ $t(column.title) }}
            </th>
          </tr>
        </thead>
        <tbody class="ant-table-tbody">
          <GroupSkill
            ref="group-skill"
            v-for="skill in record.skills"
            :key="skill.id"
            :skill="skill"
            @skill-change="onSkillChanged"
          />
        </tbody>
      </table>
    </a-row>
  </a-row>
</template>

<script>
import GroupSkill from "@/components/SkillSet/GroupSkill";
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import { columns } from "./const.js";

export default {
  name: "GroupCategory",
  props: {
    record: {
      type: Object,
      default: {}
    }
  },
  components: {
    GroupSkill
  },
  computed: {
    ...mapState({
      routeID: state => state.modules["skill-set"].routeID,
      routeInfo: state => state.modules["skill-set"].routeInfo
    }),
    ...mapGetters({
      isDraft: "modules/skill-set/isDraft",
      isReject: "modules/skill-set/isReject",
      levelSkill: "modules/skill-set/levelSkill",
      levelEnglish: "modules/skill-set/levelEnglish"
    }),
    columns() {
      if (this.isDraft || this.isReject || this.routeID == "add") return columns.filter(item => item.showAll);
      return columns;
    }
  },
  methods: {
    onSkillChanged(skill, key, value) {
      this.$emit("change-skill", skill, key, value);
    },
    validateFormCreate() {
      let groupSkill = this.$refs["group-skill"];
      let listState = groupSkill.map(item => item.validateFormCreate());
      return !listState.includes(false);
    },
    validateFormReview() {
      let groupSkill = this.$refs["group-skill"];
      let listState = groupSkill.map(item => item.validateFormReview());
      return !listState.includes(false);
    },
    validateFormZeroExperienceTime() {
      let groupSkill = this.$refs["group-skill"];
      let listState = groupSkill.map(item => item.validateFormZeroExperienceTime());
      return !listState.includes(false);
    }
  }
};
</script>

<style lang="less" scoped>
.table-bordered {
  border-collapse: collapse;
  & table,
  th,
  td {
    border: 1px solid #e8e8e8;
  }
}

.th-120 {
  max-width: 150px;
  width: 150px;
}

.th-200 {
  max-width: 200px;
  width: 200px;
}

.table-inside {
  table {
    th {
      white-space: initial;
    }
  }
}
</style>
