<template>
  <a-card class="shadow">
    <div class="h1">{{ $t("doc_type_management") }}</div>
    <div class="text-right">
      <a-button type="primary" @click="onAddNew" icon="plus">{{ $t("create_category") }}</a-button>
    </div>
    <a-table bordered :rowKey="record => record.id" :columns="columns" :data-source="items" class="mt-2">
      <template>
        <span v-for="(column, index) of columns" :key="index" :slot="column.slots.title">{{
          $t(column.slots.title)
        }}</span>
      </template>
      <template slot="no" slot-scope="text, record, index">{{ index + 1 }} </template>
      <template slot="date" slot-scope="text">
        <template>
          {{ text ? $moment(text).format("YYYY/MM/DD") : null }}
        </template>
      </template>
      <template slot="actionCol" slot-scope="text, record">
        <a-button @click="edit(record)" type="primary" icon="edit" size="small" />
        <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.id)">
          <a-button type="danger" icon="delete" size="small" />
        </a-popconfirm>
      </template>
    </a-table>

    <!-- Modal update or create -->
    <a-modal
      :visible="openModalAddOrUpdate"
      v-if="openModalAddOrUpdate"
      :title="currentId ? $t('update_category') : $t('create_category')"
      @ok="handleOk"
      @cancel="
        openModalAddOrUpdate = false;
        currentId = null;
      "
    >
      <a-form :form="form" :layout="'vertical'">
        <a-form-item :label="$t('name')">
          <a-input
            v-decorator="['name', { rules: [{ required: true, message: 'This field is required' }] }]"
            :placeholder="$t('name')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      columns: [
        {
          key: "no",
          slots: { title: "no_" },
          scopedSlots: { customRender: "no" },
          width: "50px"
        },
        {
          dataIndex: "name",
          key: "name",
          slots: { title: "name" },
          width: "150px"
        },
        {
          slots: { title: "created_at" },
          dataIndex: "created_at",
          key: "created_at",
          scopedSlots: { customRender: "date" },
          width: "150px"
        },
        {
          slots: { title: "action" },
          key: "action",
          width: "55px",
          scopedSlots: { customRender: "actionCol" }
        }
      ],
      openModalAddOrUpdate: false,
      form: this.$form.createForm(this, { name: "coordinated" }),
      currentId: null
    };
  },
  computed: {
    ...mapState({
      items: state => state.modules["document"].listCategories
    })
  },
  methods: {
    ...mapActions({
      getListCategories: "modules/document/getListCategories",
      updateOrCreateCategory: "modules/document/updateOrCreateCategory",
      deleteCategory: "modules/document/deleteCategory"
    }),
    edit(record) {
      this.form = this.$form.createForm(this, {
        mapPropsToFields: () => {
          return {
            name: this.$form.createFormField({
              value: record.name
            })
          };
        }
      });
      this.currentId = record.id;
      this.openModalAddOrUpdate = true;
    },
    handleOk() {
      this.form.validateFields(async (err, values) => {
        if (err) return;
        try {
          let payload = {
            id: this.currentId,
            name: values.name
          };
          await this.updateOrCreateCategory(payload);
          this.$notification.success({
            message: "Success",
            description: `${this.currentId ? "Update" : "Create new"} category successfully`
          });
          this.form.resetFields();
          this.openModalAddOrUpdate = false;
          this.currentId = null;
          this.getListCategories();
        } catch (error) {
          this.$notification.error({
            message: "Error",
            description: "Something went wrong! Please try again"
          });
        }
      });
    },
    async onDelete(id) {
      await this.deleteCategory(id);
      this.getListCategories();
    },
    onAddNew() {
      this.openModalAddOrUpdate = true;
      this.form = this.$form.createForm(this, { name: "coordinated" });
    }
  },
  created() {
    this.getListCategories();
  }
};
</script>
<style lang="scss" scoped>
</style>