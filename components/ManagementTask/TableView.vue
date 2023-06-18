<template>
  <div
    class="ant-table ant-table-default ant-table-bordered task-table-scroll"
    :class="{ 'ant-table-empty': !dataSource.length }"
  >
    <div class="ant-table-content">
      <div class="table-wrapper ant-table-body">
        <table class="w-100 table-bordered">
          <thead class="ant-table-thead">
            <tr v-if="isShowCategory">
              <th class="wrapper-header">
                <span></span>
              </th>
              <th
                class="wrapper-header"
                v-if="columns.filter(item => item.type == 'sk').length"
                :colspan="columns.filter(item => item.type != 'bsk').length - 1"
              >
                <span>
                  {{ $t("skill") }}
                </span>
              </th>
              <th
                class="wrapper-header businessSkillHightlight"
                v-if="columns.filter(item => item.type == 'bsk').length"
                :colspan="columns.filter(item => item.type == 'bsk').length"
              >
                <span>
                  {{ $t("business_skill_set") }}
                </span>
              </th>
            </tr>
            <tr>
              <th
                class="wrapper-header"
                v-for="column in columns"
                :key="column.key"
                :span="column.span"
                :width="column.width"
                :class="{ businessSkillHightlight: column.type == 'bsk' }"
              >
                <div v-if="column.key == 'user'">
                  <span>{{ $t(column.slots.title) }}</span>
                </div>

                <span>{{ $t(column.title) }}</span>
              </th>
            </tr>
          </thead>

          <tbody class="ant-table-tbody">
            <tr v-for="record in dataSource" :key="record.user" :class="getClassByType(record)">
              <td
                v-for="column in columns"
                :key="column.key"
                :class="{ businessSkillHightlight: column.type == 'bsk' }"
              >
                {{ record[column.dataIndex] }} &nbsp;
                {{ mapLevelName(record, column) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ant-table-placeholder" v-if="!dataSource.length">
        <a-empty>
          <span slot="description"> {{ $t("no_result_found") }} </span>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
const SK = "sk";
const BSK = "bsk";

export default {
  props: {
    columns: Array,
    dataSource: Array
  },
  computed: {
    ...mapState({
      engineerLevels: state => state.modules["skill-set"].levels,
      businessLevels: state => state.modules["business-skill"].levels
    }),
    isShowCategory() {
      return (
        this.columns.filter(item => item.type == "bsk").length > 0 ||
        this.columns.filter(item => item.type == "sk").length > 0
      );
    }
  },
  methods: {
    getClassByType(record) {
      const classList = {};
      if (record.type == "fit") classList["text-success"] = true;
      if (record.type == "gap") classList["text-warning"] = true;
      return classList;
    },
    mapLevelName(record, column) {
      if (column.type == SK) {
        const level = this.engineerLevels.find(item => item.level == record[column.dataIndex]);
        if (level) return `(${level.name})`;
      }

      if (column.type == BSK) {
        const level = this.businessLevels.find(item => item.level == record[column.dataIndex]);
        if (level) return `(${level.name})`;
      }

      return "";
    }
  }
};
</script>

<style lang="less" scoped>
.task-table-scroll {
  overflow-x: auto;

  .ant-table-content {
    width: auto;
    min-width: 1200px;
  }
}

.businessSkillHightlight {
  background-color: #ffeedd;
}
</style>
