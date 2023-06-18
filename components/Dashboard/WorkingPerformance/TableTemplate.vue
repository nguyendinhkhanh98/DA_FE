<template>
  <a-table
    class="mt-3"
    :columns="columns"
    :data-source="dataSource"
    :rowKey="record => record.author"
    :pagination="false"
    bordered
  >
    <template slot="title">{{ tableTitle }}</template>

    <template v-for="column of columns" :slot="column.slots.title">
      {{ $t(column.slots.title) }}
    </template>

    <template slot="complete" slot-scope="text, record">
      <a-row>
        <a-col class="column-performance">
          <a-tag color="#909090">{{ `${record.complete.length} Task` }}</a-tag>
          <a-tag
            class="mt-1 tag-pointer green-tag"
            color="#00872a"
            v-for="(item, index) in record.complete"
            :key="index"
            @click="gotoJira(item.projectKey, item.issueKey)"
          >
            {{ item.issueKey }}
          </a-tag>
        </a-col>
      </a-row>
    </template>

    <template slot="notComplete" slot-scope="text, record">
      <a-row>
        <a-col class="column-performance">
          <a-tag color="#909090">{{ `${record.notComplete.length} Task` }}</a-tag>
          <a-tag
            class="mt-1 tag-pointer red-tag"
            color="red"
            v-for="(item, index) in record.notComplete"
            :key="index"
            @click="gotoJira(item.projectKey, item.issueKey)"
          >
            {{ item.issueKey }}
          </a-tag>
        </a-col>
      </a-row>
    </template>

    <template slot="working" slot-scope="text, record">
      <a-row>
        <a-col class="column-performance">
          <a-tag color="#909090">{{ `${record.working.length} Task` }}</a-tag>
          <a-tag
            v-for="(item, index) in record.working"
            :color="item.complete ? `green` : `red`"
            class="mt-1 tag-pointer"
            :key="index"
            @click="gotoJira(item.projectKey, item.issueKey)"
          >
            {{ item.issueKey }}
          </a-tag>
        </a-col>
      </a-row>
    </template>
  </a-table>
</template>
<script>
export default {
  name: "TableTemplate",
  props: {
    columns: {
      type: Array,
      default: []
    },
    dataSource: {
      type: Array,
      default: []
    },
    tableTitle: {
      type: String,
      default: ""
    }
  },
  methods: {
    gotoJira(projectKey, issueKey) {
      let baseUrl = `https://arrowtech02.atlassian.net/secure/RapidBoard.jspa`;
      window.open(`${baseUrl}?rapidView=31&projectKey=${projectKey}&modal=detail&selectedIssue=${issueKey}`);
    }
  }
};
</script>
<style lang="less" scoped>
.column-performance {
  white-space: normal;
  white-space: pre-line;
}
.tag-pointer {
  cursor: pointer;
}
.green-tag {
  color: white;
  background-color: #00872a;
}
.red-tag {
  color: white;
  background-color: #ce0000;
}
</style>
