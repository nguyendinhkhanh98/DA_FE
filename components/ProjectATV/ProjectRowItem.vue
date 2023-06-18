<template>
  <tr :key="record.id" :class="{ 'text-danger': record.delete_flag }" class="ant-table-row ant-table-row-level-0">
    <td v-for="column in columns" :key="column.id" class="category-item">
      <div v-if="column.key == 'no'" class="text-center">{{ index }}</div>

      <span v-if="column.key == 'status'">
        <a-tag v-if="!record.delete_flag" color="green">
          {{ $t("active") }}
        </a-tag>
        <a-tag v-else color="red">
          {{ $t("deprecated") }}
        </a-tag>
      </span>

      <div v-if="column.key == 'detail'" style="text-align: end">
        <template v-if="!record.delete_flag">
          <template v-if="!editting">
            <a-tooltip :title="$t('edit')">
              <a-button icon="edit" type="primary" @click="$router.push(`/project-management/${record.id}`)" />
            </a-tooltip>

            <a-popconfirm
              :title="$t('are_you_sure')"
              :ok-text="$t('yes')"
              :cancel-text="$t('no')"
              @confirm="$emit('deprecate', record)"
            >
              <a-tooltip :title="$t('archive')">
                <a-button icon="delete" type="danger" />
              </a-tooltip>
            </a-popconfirm>
          </template>
          <template v-else>
            <a-tooltip :title="$t('save')">
              <a-button icon="save" type="primary" @click="handleSaveRecord" />
            </a-tooltip>
            <a-tooltip :title="$t('cancel')">
              <a-button icon="close" type="danger" @click="handleCancel" />
            </a-tooltip>
          </template>
        </template>
        <template v-else>
          <a-popconfirm
            :title="$t('are_you_sure')"
            :ok-text="$t('yes')"
            :cancel-text="$t('no')"
            @confirm="$emit('restore', record)"
          >
            <a-tooltip :title="$t('restore')">
              <a-button icon="undo" type="danger" />
            </a-tooltip>
          </a-popconfirm>
        </template>
      </div>

      <span v-if="column.key == 'project'">
        <span v-if="!editting">
          {{ record[column.dataIndex] }}
        </span>
        <a-input v-else ref="input-edit" :defaultValue="record.name" style="width: auto" />
      </span>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    index: Number,
    columns: Array,
    record: Object,
    mode: {
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ["create", "update"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      editting: this.mode == "create" ? true : false
    };
  },
  watch: {
    async editting(newVal, oldVal) {
      if (newVal) this.focusInput();
    }
  },
  mounted() {
    if (this.editting) this.focusInput();
  },
  methods: {
    handleCancel() {
      this.editting = false;
      this.$emit("cancel");
    },
    async handleSaveRecord() {
      let vNodeInput = this.$refs["input-edit"];
      let targetValue = Array.isArray(vNodeInput) ? vNodeInput[0].$el.value : vNodeInput.$el.value;
      this.editting = false;

      if (this.mode == "create") {
        this.$emit("create", { ...this.record, name: targetValue });
        return;
      }

      this.$emit("update", { ...this.record, name: targetValue });
    },
    async focusInput() {
      await this.$nextTick();
      let vNodeInput = this.$refs["input-edit"];
      let targetInput = Array.isArray(vNodeInput) ? vNodeInput[0].$el : vNodeInput.$el;
      targetInput.focus();
    }
  }
};
</script>
