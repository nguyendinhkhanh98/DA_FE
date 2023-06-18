<template>
  <a-card class="shadow">
    <div class="text-right">
      <a-button type="primary" icon="save" @click="handleSaveLayout" v-if="edittingLayout">
        {{ $t("save_layout") }}
      </a-button>
    </div>

    <a-row>
      <span class="h1">{{ $t("view_time") }}</span>
      <span class="cursor-select-date">
        <span @click="visibleDropdown = !visibleDropdown">
          <div role="button" style="cursor: pointer; display: inline-block">
            <a-row>{{ timeRangeDisplay }}</a-row>
            <a-row>{{ $t(typeTimeSelectRange) }}</a-row>
          </div>
          <span class="arrow-down ml-3"></span>
        </span>
        <div>
          <a-dropdown v-model="visibleDropdown" :trigger="['contextmenu']" placement="bottomCenter">
            <i></i>
            <a-menu slot="overlay" :style="visibleOptional ? 'left:45px' : 'left:110px'">
              <template v-if="!visibleOptional">
                <a-menu-item v-for="item in timeSelectRange" :key="item">
                  <span @click="e => onSelectTimeRange(item)">{{ $t(item) }}</span>
                </a-menu-item>
                <a-menu-item class="border-as-horizontal-split" role="button">
                  <span @click="toggleSelectOptionalTime()">{{ $t("optional") }}</span>
                </a-menu-item>
              </template>
              <template v-else>
                <a-menu-item>
                  <a-form-item style="width: 300px">
                    <a-form-item :style="{ display: 'inline-block', width: 'calc(50% - 12px)' }">
                      <a-date-picker
                        class="w-100"
                        :placeholder="$t('start_date')"
                        :disabled-date="disabledDate"
                        v-model="selectTimeRange.start"
                        :default-value="moment(moment(), DATE_FORMAT)"
                      />
                    </a-form-item>
                    <span :style="{ display: 'inline-block', width: '24px', textAlign: 'center' }"> - </span>
                    <a-form-item :style="{ display: 'inline-block', width: 'calc(50% - 12px)' }">
                      <a-date-picker
                        class="w-100"
                        :placeholder="$t('end_date')"
                        :disabled-date="disabledDate"
                        v-model="selectTimeRange.end"
                        :default-value="moment(moment().add(7, 'days'), DATE_FORMAT)"
                      />
                    </a-form-item>
                  </a-form-item>
                </a-menu-item>
                <a-menu-item role="button">
                  <div style="text-align: end">
                    <a-button type="primary" @click="saveAndCloseSelectTime()">OK</a-button>
                  </div>
                </a-menu-item>
              </template>
            </a-menu>
          </a-dropdown>
        </div>
      </span>
    </a-row>

    <div style="text-align: start; font-size: 20px; color: #878a87; margin-bottom: 40px">
      {{ $t("month") }} {{ monthCurrent }}
    </div>

    <a-table
      bordered
      size="middle"
      rowKey="id"
      :columns="columns"
      :data-source="dataSourceInterns"
      :scroll="{ x: 1300 }"
      :pagination="false"
    >
      <template
        v-for="col in editableColumns"
        :slot="col.children[0].scopedSlots.customRender"
        slot-scope="text, record"
      >
        <div :key="col.key">
          <div v-if="record.editable">
            <a-input
            style="margin: -5px 0"
            ref="input"
            @change="e => handleChange(e.target.value, record.id, col.key)"
            :value="typeof text === 'string' || text instanceof String ? text : 'X'"
            />
          </div>
          <template v-else>
            {{ typeof text === "string" || text instanceof String ? text : "X" }}
          </template>
        </div>
      </template>
      <template slot="operation" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a-tooltip :title="$t('save')">
              <a-button type="primary" icon="save" @click="() => handleSave(record.id)" />
            </a-tooltip>
            <a-tooltip :title="$t('cancel')">
              <a-button class="ml-1" icon="close" @click="() => handleCancel(record.id)" />
            </a-tooltip>
          </span>
          <span v-else>
            <a-tooltip :title="$t('edit')">
              <a-button type="primary" icon="edit" :disabled="editingKey !== ''" @click="() => handleEdit(record.id)" />
            </a-tooltip>

            <a-popconfirm :title="$t('are_you_sure_to_delete')" @confirm="handleDelete(record.id)">
              <a-tooltip :title="$t('delete')">
                <a-button class="ml-1" icon="delete" type="danger" :disabled="editingKey !== ''" />
              </a-tooltip>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import moment from "moment";
import { mapActions, mapState, mapMutations } from "vuex";
import { DATE_FORMAT } from "@/constants/index";

import Draggable from "vuedraggable";
const dragOptions = {
  sort: true,
  scroll: true,
  scrollSpeed: 2,
  animation: 150,
  ghostClass: "dragable-ghost",
  chosenClass: "dragable-chose",
  dragClass: "dragable-drag",
  group: "task"
};
const timeSelectRange = ["this_week", "in_month", "last_week"];

export default {
  name: "view-calendar",
  middleware: "permissions",
  components: {
    Draggable
  },
  meta: {
    permissions: ["admin", "manager", "leader"]
  },
  data() {
    return {
      dayOfMonth: moment().daysInMonth(),
      start: moment().startOf("isoWeek"),
      end: moment().endOf("isoWeek"),
      DATE_FORMAT: DATE_FORMAT,
      days: [
        <div>
          <a-icon type="check" class="text-success" />
          <br />
          <a-icon type="close" class="text-danger" />
        </div>,
        <div>
          <a-icon type="close" class="text-danger" />
          <br />
          <a-icon type="check" class="text-success" />
        </div>,
        <div>
          <a-icon type="check" class="text-success" />
        </div>,
        <div>
          <a-icon type="close" class="text-danger" />
        </div>
      ],
      actions: [
        <a-tooltip>
          <a-button type="primary" icon="line-chart" />
        </a-tooltip>,
        <a-tooltip>
          <a-button icon="control" />
        </a-tooltip>,
        <a-tooltip>
          <a-button icon="delete" />
        </a-tooltip>
      ],
      visibleDropdown: false,
      visibleOptional: false,
      timeSelectRange,
      typeTimeSelectRange: timeSelectRange[0],
      selectTimeRange: {
        start: moment(moment(), DATE_FORMAT),
        end: moment(moment(), DATE_FORMAT)
      },
      editting: "",
      dragOptions,
      editingKey: "",
      edittingLayout: false,
      enableDragable: false,
      dataSourceInterns: [],
      cacheData: [],
      column: [],
      listRecordChange: [],
      visible: true,
    };
  },
  async created() {
    await this.getTimeWorks({
      start: moment(this.start),
      end: moment(this.end)
    });
    this.createData();
  },
  watch: {
    async start() {
      await this.getTimeWorks({
        start: moment(this.start),
        end: moment(this.end)
      });
      this.createData();
    },
    async end() {
      await this.getTimeWorks({
        start: moment(this.start),
        end: moment(this.end)
      });
      this.createData();
    },
  },
  computed: {
    ...mapState({
      user: state => state.modules["auth"].user,
      timeWorks: state => state.modules["intern-management"].timeWorks
    }),
    monthCurrent: () => {
      return moment().format("MM-YYYY");
    },
    timeRangeDisplay() {
      let start = moment(this.start).format(DATE_FORMAT);
      let end = moment(this.end).format(DATE_FORMAT);
      return `${start} - ${end}`;
    },
    columns() {
      let columns = [
        {
          scopedSlots: { customRender: "day" },
          title: "Day",
          dataIndex: "day",
          key: "day",
          width: 150,
          align: "center",
          children: [
            {
              title: "Full name",
              dataIndex: "name",
              key: "name",
              width: 150,
              align: "center",
              scopedSlots: { customRender: "name" }
            }
          ]
        }
      ];
      for (let i = moment(this.start); i <= moment(this.end); i.add(1, "day")) {
        columns.push({
          title: i.format("D"),
          dataIndex: i.format("YYYY-MM-DD"),
          key: i.format("YYYY-MM-DD"),
          align: "center",
          width: 80,
          className: this.isLastWeek(i),
          children: [
            {
              title: this.convertTimeToDay(i),
              dataIndex: i.format("YYYY-MM-DD"),
              key: i.format("YYYY-MM-DD"),
              align: "center",
              className: this.isLastWeek(i),
              scopedSlots: { customRender: i.format("YYYY-MM-DD") }
            }
          ]
        });
      }
      columns.push({
        title: "Operation",
        dataIndex: "operation",
        key: "operation",
        scopedSlots: { customRender: "operation" },
        align: "center"
      });
      return columns;
    },
    editableColumns() {
      return this.columns.filter(column => !["day", "operation"].includes(column.dataIndex));
    },
  },
  methods: {
    ...mapMutations({
      setDataSourceIterns: "modules/intern-management/setDataSourceIterns"
    }),
    ...mapActions({
      getTimeWorks: "modules/intern-management/getTimeWorks",
      updateTimeWorkIntern: "modules/intern-management/updateTimeWorkIntern",
      deleteTimeWorkIntern: "modules/intern-management/deleteTimeWorkIntern",
    }),
    createData() {
      let data = [];
      for (let timeOfIntern in this.timeWorks) {
        let time = {
          id: parseInt(timeOfIntern),
          name: this.timeWorks[timeOfIntern][0],
          editable: false,
        };
        for (let i = moment(this.start); i <= moment(this.end); i.add(1, "day")) { 
          let index = this.timeWorks[timeOfIntern][i.format("D")];
          time[i.format("YYYY-MM-DD")] = index != null ? `${index.value}` : "X";
        }
        data.push(time);
      }
      this.dataSourceInterns = data;
    },
    moment,
    onSelectTimeRange(key, value) {
      this.visibleDropdown = !this.visibleDropdown;
      switch (key) {
        case "in_month":
          this.start = moment().startOf("month");
          this.end = moment().endOf("month");
          this.typeTimeSelectRange = key;
          this.getTimeWorks({
            start: moment(this.start),
            end: moment(this.end)
          });
          break;
        case "last_week":
          this.start = moment().subtract(1, "weeks").startOf("isoWeek");
          this.end = moment().subtract(1, "weeks").endOf("isoWeek");
          this.typeTimeSelectRange = key;
          this.getTimeWorks({
            start: moment(this.start),
            end: moment(this.end)
          });
          break;
        case "this_week":
          this.start = moment().startOf("isoWeek");
          this.end = moment().endOf("isoWeek");
          this.typeTimeSelectRange = key;
          this.getTimeWorks({
            start: moment(this.start),
            end: moment(this.end)
          });
          break;
        case "optional_start_time":
          this.start = value;
          this.typeTimeSelectRange = "optional";
          break;
        case "optional_end_time":
          this.end = value;
          this.typeTimeSelectRange = "optional";
          break;
      }
    },
    toggleSelectOptionalTime() {
      this.visibleOptional = !this.visibleOptional;
    },
    saveAndCloseSelectTime(e) {
      this.visibleOptional = !this.visibleOptional;
      this.visibleDropdown = !this.visibleDropdown;

      this.onSelectTimeRange("optional_start_time", this.selectTimeRange.start);
      this.onSelectTimeRange("optional_end_time", this.selectTimeRange.end);
      this.getTimeWorks({
        start: moment(this.start),
        end: moment(this.end)
      });
    },
    disabledDate(current) {
      // Can not select days outside of month
      let startDayOfMonth = moment().startOf("months");
      let endDayOfMonth = moment().add(1, "months").startOf("months");

      let inMonth = startDayOfMonth.isBefore(current) && endDayOfMonth.isAfter(current);
      return !inMonth;
    },
    gotoAdd() {
      this.$router.push("/intern-management/view-time/add");
    },
    handleChange(value, intern_id, key) {
      const newData = [...this.dataSourceInterns];  
      const target = newData.filter(intern => intern_id == intern.id)[0];
      if (target) {
        target[key] = value;
        this.dataSourceInterns = newData;
      }
    },
    handleEdit(intern_id) {
      this.editingKey = intern_id;
      this.cacheData = this.dataSourceInterns.map(item => ({ ...item }));
      this.dataSourceInterns.find(intern => intern_id == intern.id).editable = true;
    },
    handleSave(intern_id) {
      let target = this.dataSourceInterns.find(intern => intern.id == intern_id);
      if (target) {
        target.editable = false;
      }
      const keyArray = ["editable", "id", "name"];
      let keys = Object.keys(target).filter(item => !keyArray.includes(item))
      keys.forEach(item => {
        if(target[item] == "X") {
          keys = keys.filter(key => key != item);
        }
      })
      let listPayload = [];
      keys.forEach(item => {
        let payload = {
          dayOfMonth: `${item} 00:00:00+07`,
          value: !!parseFloat(target[item]) ? Math.round(parseFloat(target[item])): 0,
          id: intern_id,
        }
        listPayload.push(payload)
      })
      this.updateTimeWorkIntern(listPayload);
      this.editingKey = "";
    },
    handleCancel(intern_id) {
      this.dataSourceInterns = this.cacheData;
      this.dataSourceInterns.find(intern => intern_id == intern.id).editable = false;
      this.editingKey = "";
    },
    handleDelete(intern_id) {
      this.deleteTimeWorkIntern(intern_id);
      this.createData();
    },
    openNotification(placement) {
    this.$notification.open({
      message: `Value is invalid`,
      description: ''
    });
    },
  }
};
</script>

<style lang="less" scoped>
.cursor-select-date {
  cursor: pointer;
  float: right;

  .arrow-down {
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgb(46, 46, 46);
  }
}

.border-as-horizontal-split {
  border-top: 1px solid rgba(0, 0, 0, 0.11);
}

.calendar__title {
  text-align: start;
  font-size: 27px;
  font-weight: bold !important;
  margin-bottom: 10px;
}

// // button add
// .button-responsive {
//   margin: 2px;
//   height: 32px;
//   line-height: 1.499;
//   position: relative;
//   display: inline-block;
//   font-weight: 400;
//   white-space: nowrap;
//   text-align: center;
//   padding: 0 15px;
//   font-size: 14px;
//   border-radius: 4px;
//   border: 1px solid #d9d9d9;
//   box-shadow: 0 2px 0 rgba(0, 0, 0, 0.01);
//   cursor: pointer;
//   transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
//   user-select: none;
//   touch-action: manipulation;
//   background: transparent;
//   -webkit-tap-highlight-color: rgba(0, 0, 0 ,0);
// }

// .button-primary {
//   color: white;
//   background-color: #0052cc;
// }

// // responsive
// @media (max-width: 767px) {
//   .icon-responsive {
//     margin: 0px !important;
//   }
//   .span-responsive {
//     display: none;
//   }
// }

.editable-row-operations a {
  margin-right: 8px;
}
</style>
