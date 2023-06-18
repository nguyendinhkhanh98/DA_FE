<template>
  <div class="cell-events">
    <ul v-if="fullscreen" class="events">
      <li v-for="(item, index) in listHistoryInday" :key="index" @click.stop="onClickItemHistoryInDay(index)">
        <a-badge :color="item.color" :text="item.content" />
      </li>
    </ul>

    <ModalCreateFormOffWork
      :ref="value.format(dateFormat)"
      :calendarValue="calendarValue"
      :key="value.format(dateFormat)"
      @re-render="e => $emit('re-render', e)"
    />
  </div>
</template>

<script>
import ModalCreateFormOffWork from "@/components/HumanResources/ModalCreateFormOffWork";

import { mapState, mapMutations, mapActions } from "vuex";
import { listColorBadge } from "./const";
import * as CONST from "@/constants/index.js";

export default {
  name: "CellCalendarOffWork",
  props: ["value", "calendarValue", "fullscreen"],
  components: {
    ModalCreateFormOffWork
  },
  data() {
    return {
      dateFormat: CONST.DATE_FORMAT
    };
  },
  computed: {
    ...mapState({
      userList: state => state.modules["hr-management"].userList,
      currentHistoryOffWork: state => state.modules["hr-management"].currentHistoryOffWork
    }),
    listHistoryInday() {
      let result = [];
      for (let i = 0; i < this.currentHistoryOffWork.data.length; i++) {
        const element = this.currentHistoryOffWork.data[i];
        let historyDate = this.$moment(element.date_created);
        if (historyDate.isSame(this.value, "day")) {
          let itemColor = listColorBadge.find(item => item.type == element.type);
          result.push({ color: itemColor.color, content: this.$t(element.type), id: element.id });
        }
      }

      return result;
    }
  },
  methods: {
    showModal() {
      // Call this method from parent
      let keyRef = this.value.format(this.dateFormat);
      this.$refs[keyRef].showModal();
    },
    onClickItemHistoryInDay(index) {
      let itemSelected = this.listHistoryInday[index];
      let itemDataSelected = this.currentHistoryOffWork.data.find(item => item.id == itemSelected.id);

      let keyRef = this.value.format(this.dateFormat);
      this.$refs[keyRef].showModal("view", itemDataSelected);
      this.$emit("update-calendar", this.$moment(itemDataSelected.date_created));
    }
  }
};
</script>

<style lang="less" scoped>
.cell-events {
  .events {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      &:hover {
        background-color: #00152931;
      }
    }

    .ant-badge-status {
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
      text-overflow: ellipsis;
      font-size: 12px;
    }

    .notes-month {
      text-align: center;
      font-size: 28px;
    }
  }
}

.notes-month section {
  font-size: 28px;
}
</style>
