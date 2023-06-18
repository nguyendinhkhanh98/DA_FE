<template>
  <a-card class="shadow">
    <a-row class="category-header">
      <a-col :span="12">
        <h1>{{ $t("business_skill_category") }}</h1>
      </a-col>
      <a-col class="actions">
        <a-button type="primary" ghost @click="expandAllChild">
          <template>
            <i class="fas fa-arrows-alt-v"></i>
            <span class="ml-2">{{ $t("expand") }}</span>
          </template>
        </a-button>

        <a-button type="primary" icon="save" :loading="updating" @click="handleSubmit">{{ $t("save") }}</a-button>
        <BusinessSkillConfig @refetch="fetchAndExtractSkill" />
      </a-col>
    </a-row>

    <a-row>
      <CategoryCreate
        ref="category-create"
        size="small"
        :title="$t('create_category')"
        @create="onCreateBusinessCategory"
      />
    </a-row>

    <a-spin :tip="`${$t('loading')}...`" :spinning="loading">
      <draggable class="task-content mt-2" :list="listCategory" v-bind="dragOptions">
        <BusinessSkillCategory
          class="task-content-item"
          ref="task-item"
          v-for="item in listCategory"
          :key="item.category_id"
          :category="item"
          @delete-category="onDeleteBusinessCategory"
        />
      </draggable>
    </a-spin>
  </a-card>
</template>

<script>
import Draggable from "vuedraggable";
import CategoryCreate from "@/components/Category/CategoryCreate";
import BusinessSkillCategory from "@/components/BusinessSkillSet/BusinessSkillCategory";
import BusinessSkillConfig from "@/components/BusinessSkillSet/BusinessSkillConfig";
import { mapState, mapMutations, mapActions } from "vuex";
import { extractSkillToCategory, filterSkillNotNull } from "./const";

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

export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin"]
  },
  components: {
    Draggable,
    BusinessSkillCategory,
    CategoryCreate,
    BusinessSkillConfig
  },
  data() {
    return {
      dragOptions,
      dataSource: [],
      loading: false,
      expandAll: false,
      updating: false
    };
  },
  computed: {
    ...mapState({
      listCategory: state => state.modules["business-skill-category"].listCategory,
      listSkill: state => state.modules["business-skill"].listSkill,
      skillEdited: state => state.modules["business-skill-category"].skillEdited
    })
  },
  async created() {
    this.loading = true;
    await this.fetchAndExtractSkill();
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
      deleteCategory: "modules/business-skill-category/deleteCategory"
    }),
    async fetchAndExtractSkill() {
      let response = await this.fetchListBusinessSkill();
      if (response.error) {
        this.handleNotifyAPI(response);
        return;
      }

      let newListCategory = extractSkillToCategory(_.cloneDeep(response.data));
      let newBusinessSkill = filterSkillNotNull(_.cloneDeep(response.data));
      this.setListSkill(newBusinessSkill);
      this.setListCategory(newListCategory);
    },
    expandAllChild() {
      this.expandAll = !this.expandAll;
      this.$refs["task-item"].forEach(item => (item.expand = this.expandAll));
    },
    async validateListCategory() {
      let categories = this.$refs["task-item"];
      let check = await Promise.all(categories.map(item => item.validateCategoryInfo()));
      return !check.includes(false);
    },
    async handleSubmit() {
      this.updating = true;
      let isValid = await this.validateListCategory();
      if (!isValid) {
        this.expandAllChild();
        this.$notification.error({
          message: this.$t("error_data_invalid"),
          description: this.$t("error_data_invalid"),
          duration: 2.5
        });
        return;
      }
      let response = await this.updateCategoryBusinessSkill({
        editedCategories: this.listCategory,
        skillEdited: this.skillEdited
      });
      this.handleNotifyAPI(response);
      this.updating = false;
      if (response.error) return;
      this.clearSkillEdited();
    },

    async onCreateBusinessCategory(e) {
      this.$refs["category-create"].loading = true;
      let response = await this.createCategory(e);
      this.handleNotifyAPI(response);
      this.$refs["category-create"].loading = false;
      if (response.error) return;
      await this.fetchAndExtractSkill();
    },

    async onDeleteBusinessCategory(e) {
      this.$refs["task-item"].loading = true;
      let response = await this.deleteCategory(e.category_id);
      this.handleNotifyAPI(response);
      this.$refs["task-item"].loading = false;
      if (response.error) return;
      await this.fetchAndExtractSkill();
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

.category-header {
  .actions {
    float: right;
    font-size: 18px;
    font-weight: bold;
    display: inline-flex;
    button:not(:last-child) {
      margin-right: 5px;
    }
  }
}
</style>

<style lang="less">
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
