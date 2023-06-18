<template>
  <a-card class="shadow">
    <div class="h1">{{ $t("employee_task_history") }}</div>
    <a-table
      class="mt-2"
      :scroll="{ x: true }"
      :rowKey="record => record.id"
      :columns="columns"
      :data-source="items"
      :pagination="pagination"
      bordered
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>
      <template slot="no" slot-scope="record, text, index">{{
        (pagination.current - 1) * pagination.pageSize + index + 1
      }}</template>
      <template slot="skills" slot-scope="skills">
        <tag-tooltip
          :listTags="
            skills.map(item => {
              return { id: item.id, name: item.name };
            })
          "
        />
      </template>
    </a-table>
  </a-card>
</template>
<script>
import { mapActions } from "vuex";
import TagTooltip from "@/components/TagTooltip";
export default {
  components: {
    TagTooltip
  },
  data() {
    return {
      items: [],
      columns: [
        {
          key: "no",
          slots: { title: "no_" },
          scopedSlots: { customRender: "no" },
          width: "50px"
        },
        {
          dataIndex: "full_name",
          key: "name",
          slots: { title: "full_name" },
          width: "120px"
        },
        {
          dataIndex: "name",
          key: "project",
          slots: { title: "project" },
          width: "120px"
        },
        {
          slots: { title: "duration" },
          dataIndex: "period",
          key: "period",
          width: "120px"
        },
        {
          slots: { title: "skill" },
          dataIndex: "skills",
          key: "skills",
          width: "150px",
          scopedSlots: { customRender: "skills" }
        },
        {
          slots: { title: "business_skill" },
          dataIndex: "business_skills",
          key: "business_skills",
          width: "250px",
          scopedSlots: { customRender: "skills" }
        },
        {
          slots: { title: "comment" },
          dataIndex: "comment",
          key: "comment",
          width: "250px"
        }
      ],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      }
    };
  },
  methods: {
    ...mapActions({
      getAllTaskHistory: "modules/management-task/getAllTaskHistory"
    }),
    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
    }
  },
  async mounted() {
    let data = await this.getAllTaskHistory();
    this.items = data.map(item => {
      return {
        ...item,
        period: `${this.$moment(item.start_date).format("YYYY/MM/DD")} - ${
          item.end_date ? this.$moment(item.end_date).format("YYYY/MM/DD") : this.$moment().format("YYYY/MM/DD")
        }`
      };
    });
    this.pagination.total = this.items.length;
  }
};
</script>