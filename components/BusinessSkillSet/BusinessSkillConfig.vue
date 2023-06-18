<template>
  <div class="skill-wapper">
    <a-button type="primary" @click="visible = !visible">
      <i class="fas fa-atlas"></i>
      <span class="ml-2">{{ $t("skill_management") }}</span>
    </a-button>

    <a-modal
      v-model="visible"
      class="modal-period"
      :title="$t('skill_management')"
      :footer="false"
      @ok="updateBusinessSkill"
    >
      <a-row style="display: flex" class="mb-2 gutter-right">
        <a-col :span="8">
          <a-input-search :placeholder="$t('search')" v-model="keySearch" />
        </a-col>

        <a-col :span="8">
          <a-select
            mode="multiple"
            allow-clear
            class="w-100"
            v-model="selectedKeyDeprecated"
            :placeholder="$t('status')"
            :filterOption="filterOptionVnTone"
          >
            <a-select-option :label="$t('active')" :value="0">
              {{ $t("active") }}
            </a-select-option>

            <a-select-option :label="$t('deprecated')" :value="1">
              {{ $t("deprecated") }}
            </a-select-option>
          </a-select>
        </a-col>

        <a-col :span="8">
          <a-select
            mode="multiple"
            allow-clear
            class="w-100"
            v-model="selectedKeyNonCategory"
            :placeholder="$t('business_skill_category')"
            :filterOption="filterOptionVnTone"
          >
            <a-select-option :label="$t('has_category')" :value="1">
              {{ $t("has_category") }}
            </a-select-option>

            <a-select-option :label="$t('non_category')" :value="0">
              {{ $t("non_category") }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <div class="ant-row mb-2">
        <BusinessSkillCreate
          size="large"
          ref="business-skill-create"
          :title="$t('create_skill')"
          @create-business="handleCreateBusinessSkill"
        />
      </div>

      <template v-for="item in listPaginationSkill">
        <BusinessSkillItem
          ref="business-skill-item"
          :key="item.skill_id"
          :skill="item"
          @refetch="$emit('refetch')"
          @delete-skill="handleArchiveBusinessSkill"
          @restore-skill="handleRestoreBusinessSkill"
        />
      </template>

      <div>
        <a-pagination
          class="mt-2"
          style="text-align: end"
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
import BusinessSkillItem from "@/components/BusinessSkillSet/BusinessSkillItem";
import BusinessSkillCreate from "@/components/BusinessSkillSet/BusinessSkillCreate";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: "SkillConfig",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "leader"]
  },
  components: {
    BusinessSkillCreate,
    BusinessSkillItem
  },
  data() {
    return {
      visible: false,
      keySearch: "",
      pageSize: 5,
      selectedKeyDeprecated: [],
      selectedKeyNonCategory: [],
      pagination: [0, this.pageSize]
    };
  },
  computed: {
    ...mapState({
      listSkillConfigure: state => state.modules["business-skill"].listSkill,
      listSkillTag: state => state.modules["skill-set"].listSkillTag
    }),
    listFilterSkill() {
      let clone = this.listSkillConfigure;

      clone = this.filterDataSourceByKeySearch(clone);
      clone = this.filterDataSourceByStatus(clone);
      clone = this.filterDataSourceByCategory(clone);
      this.handlePageChange(1, this.pageSize);

      return clone;
    },
    listPaginationSkill() {
      return this.listFilterSkill.slice(...this.pagination);
    }
  },
  methods: {
    ...mapMutations({
      setBusinessSkillFlag: "modules/business-skill/setBusinessSkillFlag"
    }),
    ...mapActions({
      createBusinessSkill: "modules/business-skill/createBusinessSkill",
      archiveBusinessSkill: "modules/business-skill/archiveBusinessSkill",
      restoreBusinessSkill: "modules/business-skill/restoreBusinessSkill"
    }),
    updateBusinessSkill() {
      this.visible = false;
      // this.$emit("update-skill", this.listSkillConfigure);
    },
    handlePageChange(page, pageSize) {
      let firstIndex = (page - 1) * pageSize;
      let endIndex = page * pageSize;
      this.pagination = [firstIndex, endIndex];
    },
    filterDataSourceByKeySearch(clone) {
      const stringSearch = this.keySearch.split("").join("(\\w*)");
      const regex = new RegExp(stringSearch, "gmi");

      return clone.filter(row => (row ? row.skill_name?.match(regex) : false));
    },
    filterDataSourceByStatus(clone) {
      if (!this.selectedKeyDeprecated.length) return clone;

      const castValueStatus = this.selectedKeyDeprecated.map(item => !!item);
      return clone.filter(item => castValueStatus.includes(item.skill_delete_flag));
    },
    filterDataSourceByCategory(clone) {
      if (!this.selectedKeyNonCategory.length) return clone;

      const castValueCategory = this.selectedKeyNonCategory.map(item => !!item);
      return clone.filter(item => castValueCategory.includes(!!item.category_id));
    },
    filterOptionVnTone(input, option) {
      let textOption = option.componentOptions?.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    async handleCreateBusinessSkill(e) {
      this.$refs["business-skill-create"].loading = true;
      let response = await this.createBusinessSkill(e);
      this.handleNotifyAPI(response);
      this.$refs["business-skill-create"].loading = false;
      if (response.error) return;
      this.$emit("refetch");
    },
    async handleArchiveBusinessSkill(e) {
      this.$refs["business-skill-item"].loading = true;
      let response = await this.archiveBusinessSkill(e.skill_id);
      this.handleNotifyAPI(response);
      this.$refs["business-skill-item"].loading = false;
      if (response.error) return;
      this.setBusinessSkillFlag({ id: e.skill_id, flag: true });
      this.$emit("refetch");
    },
    async handleRestoreBusinessSkill(e) {
      this.$refs["business-skill-item"].loading = true;
      let response = await this.restoreBusinessSkill(e.skill_id);
      this.handleNotifyAPI(response);
      this.$refs["business-skill-item"].loading = false;
      if (response.error) return;
      this.setBusinessSkillFlag({ id: e.skill_id, flag: false });
      this.$emit("refetch");
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
