<template>
  <div class="skill-wapper">
    <a-button type="primary" @click="visible = !visible">
      <i class="fas fa-atlas"></i>
      <span class="ml-2">{{ $t("skill_management") }}</span>
    </a-button>

    <a-modal v-model="visible" :title="$t('skill_management')" @ok="updateSkill" class="modal-period">
      <template slot="footer">
        <a-button key="cancel" @click="visible = !visible">{{ $t("cancel") }}</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="updateSkill">{{ $t("save") }}</a-button>
      </template>

      <a-row style="display: flex;" class="mb-2 gutter-right">
        <a-col :span="6">
          <a-input-search :placeholder="$t('search')" v-model="keySearch" />
        </a-col>

        <a-col :span="6">
          <a-select
            mode="multiple"
            allow-clear
            class="w-100"
            v-model="selectedKeyDeprecated"
            :placeholder="$t('status')"
            :filterOption="filterOptionForTag"
          >
            <a-select-option :label="$t('active')" :value="0">
              {{ $t("active") }}
            </a-select-option>

            <a-select-option :label="$t('deprecated')" :value="1">
              {{ $t("deprecated") }}
            </a-select-option>
          </a-select>
        </a-col>

        <a-col :span="6">
          <a-select
            mode="multiple"
            allow-clear
            class="w-100"
            v-model="selectedKeyNonCategory"
            :placeholder="$t('category')"
            :filterOption="filterOptionForTag"
          >
            <a-select-option :label="$t('has_category')" :value="1">
              {{ $t("has_category") }}
            </a-select-option>

            <a-select-option :label="$t('non_category')" :value="0">
              {{ $t("non_category") }}
            </a-select-option>
          </a-select>
        </a-col>

        <a-col :span="6">
          <a-select
            mode="multiple"
            class="w-100"
            allow-clear
            v-model="selectedTag"
            :placeholder="$t('tag')"
            :filterOption="filterOptionForTag"
          >
            <a-select-option v-for="(item, index) in listSkillTag" :key="index" :label="item.name" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <div class="ant-row mb-2">
        <SkillCreate
          :loading="loading"
          size="large"
          :title="$t('create_skill')"
          @create="$emit('create', $event)"
          :list-category="listCategory"
        />
      </div>

      <template v-for="item in listPaginationSkill">
        <SkillItem :key="item.id" :skill="item" :list-category="listCategory" />
      </template>

      <div>
        <a-pagination
          class="mt-2"
          style="text-align: end;"
          :total="listFilterSkill.length"
          :show-total="(total, range) => `${range[0]}-${range[1]} of ${total}`"
          :page-size="pageSize"
          :default-current="1"
          @change="handlePageChange"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import SkillItem from "@/components/Category/SkillItem";
import SkillCreate from "@/components/Category/SkillCreate";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

import { mapState, mapActions } from "vuex";
export default {
  name: "SkillConfig",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "leader"]
  },
  components: {
    SkillItem,
    SkillCreate
  },
  props: {
    listCategory: Array,
    loading: Boolean
  },
  data() {
    return {
      visible: false,
      visibleStatus: false,
      visibleCategory: false,
      pageSize: 5,
      keySearch: "",
      selectedKeyDeprecated: [],
      selectedKeyNonCategory: [],
      pagination: [0, this.pageSize],
      selectedTag: []
    };
  },
  computed: {
    ...mapState({
      listSkillConfigure: state => state.modules["skill-set"].listSkillConfigure,
      listSkillTag: state => state.modules["skill-set"].listSkillTag
    }),
    listFilterSkill() {
      let clone = this.listSkillConfigure;

      clone = this.filterDataSourceByKeySearch(clone);
      clone = this.filterDataSourceByStatus(clone);
      clone = this.filterDataSourceByCategory(clone);
      clone = this.filterDataSourceByTag(clone);
      this.handlePageChange(1, this.pageSize);

      return clone;
    },
    styleStatus() {
      let style = {};
      if (this.selectedKeyDeprecated.length) style.color = "#1890ff";
      return style;
    },
    styleNonCategory() {
      let style = {};
      if (this.selectedKeyNonCategory.length) style.color = "#1890ff";
      return style;
    },
    listPaginationSkill() {
      return this.listFilterSkill.slice(...this.pagination);
    }
  },
  created() {
    this.fetchSkillTag();
  },
  methods: {
    ...mapActions({
      CreateNewPeriod: "modules/skill-set/CreateNewPeriod",
      fetchSkillTag: "modules/skill-set/fetchSkillTag"
    }),
    updateSkill() {
      this.visible = false;
      this.$emit("update-skill", this.listSkillConfigure);
    },
    handlePageChange(page, pageSize) {
      let firstIndex = (page - 1) * pageSize;
      let endIndex = page * pageSize;
      this.pagination = [firstIndex, endIndex];
    },
    filterDataSourceByKeySearch(clone) {
      const stringSearch = this.keySearch.split("").join("(\\w*)");
      const regex = new RegExp(stringSearch, "gmi");

      return clone.filter(row => (row ? row.name?.match(regex) : false));
    },
    filterDataSourceByStatus(clone) {
      if (!this.selectedKeyDeprecated.length) return clone;

      const castValueStatus = this.selectedKeyDeprecated.map(item => !!item);
      return clone.filter(item => castValueStatus.includes(item.delete_flag));
    },
    filterDataSourceByCategory(clone) {
      if (!this.selectedKeyNonCategory.length) return clone;

      const castValueCategory = this.selectedKeyNonCategory.map(item => !!item);
      return clone.filter(item => castValueCategory.includes(!!item.category_id));
    },
    async removeFilterStatus() {
      await this.$nextTick();
      this.selectedKeyDeprecated = [];
    },
    async removeFilterCategory() {
      await this.$nextTick();
      this.selectedKeyNonCategory = [];
    },
    filterOptionForTag(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    filterDataSourceByTag(clone) {
      if (!this.selectedTag.length) return clone;

      return clone.filter(item => {
        if (!item.tag) return false;

        let tagIntersection = _.intersection(item.tag, this.selectedTag);
        return tagIntersection.length;
      });
    }
  }
};
</script>

<style lang="less">
.modal-period {
  .ant-modal {
    top: 50px;
    width: 700px !important;
  }
}

.gutter-right {
  .ant-col {
    &:not(&:last-child) {
      padding-right: 4px;
    }

    &:not(&:first-child) {
      padding-left: 4px;
    }
  }
}
</style>
