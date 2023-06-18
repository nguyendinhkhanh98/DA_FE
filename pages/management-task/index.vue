<template>
  <a-card class="shadow">
    <h1>{{ $t("management_task") }}</h1>

    <a-row type="flex" align="bottom" justify="space-between">
      <span class="text-bold">{{ $t("total_result") }} : {{ dataSource.length }}</span>

      <a-button type="primary" @click="gotoDetail('add')" style="display: inline-block">
        <i class="fas fa-plus mr-2"></i> <span>{{ $t("create") }}</span>
      </a-button>
    </a-row>

    <a-table
      class="mt-1"
      bordered
      :columns="columns"
      :dataSource="dataSource"
      :rowKey="(record, index) => index"
      :pagination="false"
      :scroll="{ x: true }"
      :loading="loading"
    >
      <div slot="no" slot-scope="text, record, index">{{ index + 1 }}</div>

      <template v-for="column of columns" :slot="column.slots.title">
        <div :key="column.key" v-if="column.key == 'name'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-input v-model="dataFilter.name" allowClear />
        </div>

        <div :key="column.key" v-else-if="column.key == 'business_skills'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.business_skills"
            :filterOption="filterOptionVietnamese"
            style="width: 180px"
            mode="multiple"
            allowClear
          >
            <template v-for="item in listBusinessSkill">
              <a-select-option :key="item.skill_id" v-if="item.skill_id">
                {{ item.skill_name }}
              </a-select-option>
            </template>
          </a-select>
        </div>

        <div :key="column.key" v-else-if="column.key == 'skills'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.skills"
            :filterOption="filterOptionVietnamese"
            style="width: 180px"
            mode="multiple"
            allowClear
          >
            <template v-for="item in listSkill">
              <a-select-option :key="item.id" v-if="item.id">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </div>

        <div :key="column.key" v-else-if="column.key == 'status'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.status"
            :filterOption="filterOptionVietnamese"
            mode="multiple"
            allowClear
            style="width: 100px"
          >
            <a-select-option v-for="item in listStatus" :key="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>

        <div :key="column.key" v-else>
          <span>{{ $t(column.slots.title) }}</span>
        </div>
      </template>

      <template slot="description" slot-scope="text">
        <pre class="my-1" style="white-space: pre-line; font-family: sans-serif">
            {{ text }}
          </pre
        >
      </template>

      <template slot="name" slot-scope="text, record">
        {{ text }}
        <a-tag v-if="record.delete_flag" color="red">
          {{ $t("deprecated") }}
        </a-tag>
      </template>

      <template slot="started_at" slot-scope="text">
        {{ $moment(text).format(TIME_FORMAT) }}
      </template>

      <template slot="skills" slot-scope="skills">
        <tag-tooltip
          :listTags="
            skills.map(item => {
              return { id: item.id, name: item.name };
            })
          "
        />
      </template>

      <template slot="business_skills" slot-scope="skills">
        <tag-tooltip
          :listTags="
            skills.map(item => {
              return { id: item.id, name: item.name };
            })
          "
        />
      </template>

      <template slot="status" slot-scope="text">
        <a-tag :color="mapColorTag(text.id)"> {{ text.name }} </a-tag>
      </template>

      <template slot="action" slot-scope="text, record">
        <a-tooltip :title="$t('fit_gap_task')">
          <a-button type="primary" @click="gotoFitGapTask(text)" icon="line-chart" />
        </a-tooltip>

        <a-tooltip :title="$t('detail')">
          <a-button @click="gotoDetail(text)" icon="control" />
        </a-tooltip>

        <a-tooltip :title="$t('archive')">
          <a-popconfirm
            :title="!record.delete_flag ? $t('are_you_sure_archive') : $t('are_you_sure')"
            :ok-text="$t('yes')"
            :cancel-text="$t('no')"
            @confirm="!record.delete_flag ? handleArchiveTask(text) : handleRestoreTask(text)"
          >
            <a-button v-if="!record.delete_flag" type="danger" icon="delete" :loading="updating" />
          </a-popconfirm>
        </a-tooltip>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { filterSkillNotNull, columns, mapColorTag } from "./const";
import * as CONST from "@/constants/index.js";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import TagTooltip from "@/components/TagTooltip";

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: {
    TagTooltip
  },
  data() {
    return {
      mapColorTag,
      loading: false,
      columns: columns,
      TIME_FORMAT: CONST.DATE_FORMAT,
      dataFilter: {
        name: "",
        skills: [],
        business_skills: [],
        status: []
      },
      updating: false
    };
  },
  computed: {
    ...mapState({
      listCategory: state => state.modules["business-skill-category"].listCategory,
      listBusinessSkill: state => state.modules["business-skill"].listSkill,
      skillEdited: state => state.modules["business-skill-category"].skillEdited,
      listTask: state => state.modules["management-task"].listTask,
      listSkill: state => state.modules["management-task"].listSkill,
      listStatus: state => state.modules["management-task"].listStatus
    }),
    dataSource() {
      let clone = _.cloneDeep(this.listTask);
      clone = clone.filter(item => !item.delete_flag);

      clone = this.filterDataByName(clone);
      clone = this.filterDataBySkills(clone);
      clone = this.filterDataByBusinessSkill(clone);
      clone = this.filterDataByStatus(clone);

      // this.dataFilter.pagination.total = clone.length;
      return clone;
    }
  },
  async created() {
    this.loading = true;
    await this.fetchAndExtractSkill();
    await this.fetchListTask();
    await this.fetchListSkill();
    await this.fetchListStatus();
    this.loading = false;
  },
  methods: {
    ...mapMutations({
      setListCategory: "modules/business-skill-category/setListCategory",
      setListSkill: "modules/business-skill/setListSkill",
      clearSkillEdited: "modules/business-skill-category/clearSkillEdited"
    }),
    ...mapActions({
      fetchListBusinessSkill: "modules/business-skill/fetchListBusinessSkill",
      updateCategoryBusinessSkill: "modules/business-skill-category/updateCategoryBusinessSkill",
      createCategory: "modules/business-skill-category/createCategory",
      archiveTask: "modules/management-task/archiveTask",
      restoreTask: "modules/management-task/restoreTask",
      fetchListTask: "modules/management-task/fetchListTask",
      fetchListSkill: "modules/management-task/fetchListSkill",
      fetchListStatus: "modules/management-task/fetchListStatus",
      createTask: "modules/management-task/createTask"
    }),
    async fetchAndExtractSkill() {
      let response = await this.fetchListBusinessSkill();
      if (response.error) {
        this.handleNotifyAPI(response);
        return;
      }

      let newBusinessSkill = filterSkillNotNull(_.cloneDeep(response.data));
      newBusinessSkill = newBusinessSkill.filter(skill => !skill.skill_delete_flag);
      this.setListSkill(newBusinessSkill);
    },
    async handleArchiveTask(id) {
      this.updating = true;
      let response = await this.archiveTask(id);
      this.handleNotifyAPI(response);
      this.updating = false;
      if (response.error) return;
      await this.fetchListTask();
    },

    async handleRestoreTask(id) {
      let response = await this.restoreTask(id);
      this.handleNotifyAPI(response);
      if (response.error) return;
      await this.fetchListTask();
    },
    filterDataByName(clone) {
      this.setColorHeader("name");
      if (this.dataFilter.name) {
        return clone.filter(item => {
          let itemRemoveVietnameseTonesLower = removeVietnameseTones(item.name.toLowerCase());
          let nameRemoveVietnameseTonesLower = removeVietnameseTones(this.dataFilter.name.toLowerCase());
          return itemRemoveVietnameseTonesLower.includes(nameRemoveVietnameseTonesLower);
        });
      }

      return clone;
    },
    filterDataBySkills(clone) {
      this.setColorHeader("skills");
      if (this.dataFilter.skills.length) {
        return clone.filter(item => {
          let listSkillIdOfTask = item.skills.map(skill => skill.id);
          let intersection = _.intersection(listSkillIdOfTask, this.dataFilter.skills);

          return intersection.length;
        });
      }
      return clone;
    },
    filterDataByBusinessSkill(clone) {
      this.setColorHeader("business_skills");
      if (this.dataFilter.business_skills.length) {
        return clone.filter(item => {
          let listSkillIdOfTask = item.business_skills.map(skill => skill.id);
          let intersection = _.intersection(listSkillIdOfTask, this.dataFilter.business_skills);

          return intersection.length;
        });
      }
      return clone;
    },
    filterDataByStatus(clone) {
      this.setColorHeader("status");
      if (this.dataFilter.status.length) {
        return clone.filter(item => this.dataFilter.status.includes(item.status.id));
      }
      return clone;
    },
    gotoDetail(text) {
      this.$router.push(`/management-task/${text}`);
    },
    gotoFitGapTask(text) {
      let option = {
        name: "management-task-fit-gap-task",
        query: { task_id: text }
      };
      this.$router.push(option);
    },
    filterOptionVietnamese(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    setColorHeader(key) {
      let header = document.querySelector(`th[key="${key}"]`);
      if (header) {
        if (this.dataFilter[key] && this.dataFilter[key].length) {
          header.classList.add("text-link");
        } else {
          header.classList.remove("text-link");
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
@shadow-color: rgba(153, 153, 153, 0.342);
.task-content {
  z-index: 1;
  height: 100%;

  &-item {
    cursor: move;
    &:first-child {
      box-shadow: 0 -1px 1px @shadow-color, 0 1px 1px @shadow-color;
    }
  }
}

.icon-in-button {
  font-size: 12px;
}
</style>

<style lang="less">
.header-filtered {
  color: #0052cc !important;
  background: #f5f5f5 !important;
}
.dragable-ghost {
  border: 1px dashed chocolate;
  opacity: 1;
}
.dragable-chose {
  // border: 1px dashed blue;
  opacity: 1;
}
.dragable-drag {
  border: 1px dashed red;
  opacity: 0;
}
</style>
