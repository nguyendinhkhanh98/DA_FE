<template>
  <div class="shadow ant-card-body">
    <a-spin :tip="`${$t('loading')}...`" :spinning="loading">
      <template v-if="!loading">
        <category-group
          ref="categoryGroup"
          :title="$t('category')"
          :data-source="dataSource"
          :list-category="listCategory"
          @submit="onSubmit"
          @create="onCreate"
          @delete-category="deleteCategory"
          @create-skill="handleCreateSkill"
          @update-skill="handleSubmitSkill"
        />
      </template>
    </a-spin>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import CategoryGroup from "@/components/Category/CategoryGroup";

export default {
  name: "category",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager"]
  },
  components: { CategoryGroup },
  data() {
    return {
      loading: false,
      dataSource: [],
      listCategory: []
    };
  },
  computed: {
    ...mapState({
      listSkillConfigure: state => state.modules["skill-set"].listSkillConfigure
    })
  },
  async created() {
    this.loading = true;

    let promise = [];
    promise.push(this.fetchAndFillSkillConfigure());
    promise.push(this.fetchAndFillCategory());
    await Promise.all(promise);

    this.loading = false;
  },
  methods: {
    ...mapActions({
      FetchCategory: "modules/skill-set/FetchCategory",
      UpdateCategory: "modules/skill-set/UpdateCategory",
      CreateCategory: "modules/skill-set/CreateCategory",
      fetchAndFillSkillConfigure: "modules/skill-set/fetchAndFillSkillConfigure",
      CreateSkill: "modules/skill-set/CreateSkill",
      UpdateSkill: "modules/skill-set/UpdateSkill",
      DeleteCategory: "modules/skill-set/DeleteCategory"
    }),
    async onSubmit() {
      this.$refs.categoryGroup.loading = true;
      let data = await this.UpdateCategory({
        skills: this.dataSource.filter(item => item.id),
        category: this.listCategory
      });
      let options = {
        message: data.message,
        description: data.message,
        duration: 2.5
      };
      if (data.success) {
        this.$notification.success(options);
      } else {
        this.$notification.error(options);
      }
      this.$refs.categoryGroup.loading = false;
    },
    async onCreate(e) {
      this.$refs.categoryGroup.loading = true;
      let { data, message, success } = await this.CreateCategory(e);
      if (success) {
        this.$notification.success({
          message: message,
          description: message,
          duration: 2.5
        });
        let item = {
          category: data[0].name,
          description: data[0].description,
          category_id: data[0].id,
          sort: data[0].sort,
          delete_flag: data[0].delete_flag
        };
        this.listCategory.push(item);
      } else {
        this.$notification.error({
          message: message,
          description: message,
          duration: 2.5
        });
      }
      this.$refs.categoryGroup.loading = false;
    },
    async handleCreateSkill(e) {
      this.$refs.categoryGroup.loading = true;
      let { data, message, success } = await this.CreateSkill(e);
      if (success) {
        this.$notification.success({
          message: message,
          description: message,
          duration: 2.5
        });
        let item = {
          id: data[0].id,
          name: data[0].name,
          category: data[0].category,
          description: data[0].description,
          category_id: data[0].category_id
        };
        this.listSkillConfigure.push(item);
      } else {
        this.$notification.error({
          message: message,
          description: message,
          duration: 2.5
        });
      }
      this.$refs.categoryGroup.loading = false;
    },
    async handleSubmitSkill(list) {
      this.$refs.categoryGroup.loading = true;
      let data = await this.UpdateSkill(list);

      let options = {
        message: data.message,
        description: data.message,
        duration: 2.5
      };
      if (data.success) {
        this.$notification.success(options);
        this.fetchAndFillCategory();
      } else {
        this.$notification.error(options);
      }
      this.$refs.categoryGroup.loading = false;
    },
    async deleteCategory(e) {
      this.$refs.categoryGroup.loading = true;
      let data = await this.DeleteCategory({ id: e.category_id, name: e.category });
      this.fetchAndFillCategory();
      this.$refs.categoryGroup.loading = false;
    },
    async fetchAndFillCategory() {
      let { data } = await this.FetchCategory();
      this.dataSource = _.cloneDeep(data);
      let category = _.uniq(data.map(item => item.category).filter(item => item));
      this.listCategory = category
        .map(c => {
          let temp = _.find(data, item => item.category == c);
          return {
            category: temp.category,
            category_id: temp.category_id,
            description: temp.category_description,
            sort: temp.sort,
            delete_flag: temp.category_delete_flag
          };
        })
        .sort((a, b) => a.sort - b.sort);
    }
  }
};
</script>
<style lang="less" scoped>
.shadow {
  display: flex;
  flex-direction: column;
  background: white;
}
</style>
