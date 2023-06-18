<template>
  <div class="role-item py-1">
    <span v-if="!editting">
      <span>{{ roleData.name | capitalize }}</span>
      <a-tag color="red" v-if="roleData.delete_flg">
        {{ $t("deprecated") }}
      </a-tag>
    </span>
    <a-input v-else ref="input-edit" :defaultValue="roleData.name" style="width: auto;" />

    <span class="role-item-actions">
      <template v-if="!roleData.delete_flg">
        <template v-if="!editting">
          <a-icon type="edit" class="text-link" @click="editting = true"></a-icon>
          <a-popconfirm
            :title="$t('are_you_sure')"
            :ok-text="$t('yes')"
            :cancel-text="$t('no')"
            @confirm="$emit('deprecate')"
          >
            <a-icon type="delete" class="text-danger"></a-icon>
          </a-popconfirm>
        </template>
        <template v-else>
          <a-icon type="save" class="text-link" @click="handleSaveRole"></a-icon>
          <a-icon type="close" class="text-danger" @click="handleCancel"></a-icon>
        </template>
      </template>
      <template v-else>
        <a-popconfirm
          :title="$t('are_you_sure')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="$emit('restore')"
        >
          <a-icon type="undo" class="text-danger"></a-icon>
        </a-popconfirm>
      </template>
    </span>
  </div>
</template>

<script>
import TableTemplate from "../Dashboard/WorkingPerformance/TableTemplate.vue";
export default {
  components: { TableTemplate },
  props: {
    roleData: Object,
    mode: {
      type: String,
      validator: function(value) {
        // The value must match one of these strings
        return ["create", "update"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      cachedRole: {},
      editting: this.mode == "create" ? true : false
    };
  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  mounted() {
    this.cachedRole = { ...this.roleData };
  },
  methods: {
    async handleSaveRole() {
      let targetValue = this.$refs["input-edit"].$el.value;
      this.editting = false;

      if (this.mode == "create") {
        this.$emit("create", { ...this.roleData, name: targetValue });
        return;
      }

      this.$emit("update", { ...this.roleData, name: targetValue });
    },
    handleCancel() {
      this.editting = false;
      this.$emit("cancel");
    }
  }
};
</script>

<style lang="less" scoped>
.role-item {
  &:hover {
    background-color: rgb(230, 247, 254);

    .role-item-actions {
      display: inline-block;
    }
  }

  &-actions {
    // display: none;
    float: right;

    & > * {
      padding: 4px;
      cursor: pointer;

      & * {
        cursor: pointer;
      }
    }
  }
}
</style>
