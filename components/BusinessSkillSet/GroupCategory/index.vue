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
          <GroupBusinessSkill
            ref="group-skill"
            v-for="skill in record.business_skills"
            :key="skill.skill_id"
            :skill="skill"
            @skill-change="onSkillChanged"
          />
        </tbody>
      </table>
    </a-row>
  </a-row>
</template>

<script>
import GroupBusinessSkill from "@/components/BusinessSkillSet/GroupBusinessSkill";
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
    GroupBusinessSkill
  },
  computed: {
    ...mapState({
      routeID: state => state.modules["business-skill"].routeID,
      routeInfo: state => state.modules["business-skill"].routeInfo
    }),
    ...mapGetters({
      isDraft: "modules/business-skill/isDraft",
      isReject: "modules/business-skill/isReject"
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
