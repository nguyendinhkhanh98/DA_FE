<template>
  <div>
    <template v-if="text == offworkStatus.Pending">
      <a-popover v-model="visibleChangeStatus" :title="$t('change_status')" trigger="click">
        <template slot="content">
          <a-row type="flex" justify="space-around">
            <a-popconfirm
              :title="$t('are_you_sure')"
              :ok-text="$t('yes')"
              :cancel-text="$t('no')"
              @confirm="changeStatusAPI(record, 'Approved')"
            >
              <a-tag :color="mapColorTag('Approved')" style="cursor: pointer;"> Approved </a-tag>
            </a-popconfirm>

            <a-popconfirm
              :title="$t('are_you_sure')"
              :ok-text="$t('yes')"
              :cancel-text="$t('no')"
              @confirm="changeStatusAPI(record, 'Rejected')"
            >
              <a-tag :color="mapColorTag('Rejected')" style="cursor: pointer;"> Rejected </a-tag>
            </a-popconfirm>
          </a-row>
        </template>

        <a-tag :color="mapColorTag(text)" style="cursor: pointer;"> {{ text }} </a-tag>
      </a-popover>
    </template>
    <template v-else>
      <a-tag :color="mapColorTag(text)"> {{ text }} </a-tag>
    </template>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "ChangeStatusOffWork",
  props: ["text", "record", "mapColorTag"],
  data() {
    return {
      visibleChangeStatus: false
    };
  },
  computed: {
    ...mapState({
      offworkStatus: state => state.modules["hr-management"].offworkStatus
    })
  },
  methods: {
    ...mapActions({
      changeStatus: "modules/hr-management/changeStatus"
    }),
    async changeStatusAPI(record, status) {
      let data = await this.changeStatus({ id: record.id, status });
      if (!data.error) {
        this.$notification.success({
          message: data.message,
          description: data.message,
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: data.message,
          description: data.message,
          duration: 2.5
        });
      }
    }
  }
};
</script>
