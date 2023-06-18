<template>
  <a-card class="shadow">
    <span class="h1">{{ $t("asset_history") }}</span>

    <a-row type="flex" justify="start">
      <a-col :xs="24" :sm="24" :md="16">
        <a-tabs default-active-key="1">
          <a-tab-pane key="1">
            <span slot="tab">
              <a-icon type="fund" />
              {{ $t("status_history") }}
            </span>
            <a-timeline :reverse="false">
              <a-timeline-item v-for="(item, index) in filterHistoryStatus" :key="index">
                <div class="item-status">
                  <span>
                    <a-tag color="#108ee9"> {{ mapUser(item.user_change_id) }} </a-tag>
                    {{ $t("change_status_from") }}
                    <a-tag color="orange"> {{ mapStatus(item.status_id_before) }} </a-tag>
                    {{ $t("change_status_to") }}
                    <a-tag color="green"> {{ mapStatus(item.status_id_after) }} </a-tag>
                  </span>
                  <span>{{ `${mapDate(item.created_at)}` }}</span>
                  <span class="comment"> {{ item.comment }}</span>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>

          <a-tab-pane key="2">
            <span slot="tab">
              <a-icon type="contacts" />
              {{ $t("assign_history") }}
            </span>
            <a-timeline>
              <a-timeline-item v-for="(item, index) in filterHistoryAssign" :key="index">
                <div class="item-status">
                  <span>
                    <a-tag color="#108ee9"> {{ mapUser(item.user_change_id) }} </a-tag>
                    {{ $t("assign_manager_to") }}
                    <a-tag color="green"> {{ mapUser(item.manager_id_after) }} </a-tag>
                    {{ $t("assign_manager_from") }}
                    <a-tag color="orange"> {{ mapUser(item.manager_id_before) }} </a-tag>
                  </span>
                  <span>{{ `${mapDate(item.created_at)}` }}</span>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import _ from "lodash";
import moment from "moment";

import { mapState, mapActions } from "vuex";

export default {
  name: "AssetHistory",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  props: {
    thisRecord: Object
  },
  data() {
    return {
      listHistory: []
    };
  },
  computed: {
    ...mapState({
      userListOnlyName: state => state.modules["user-management"].userListOnlyName,
      listStatus: state => state.modules["asset-management"].listStatus
    }),
    filterHistoryStatus() {
      return this.listHistory.filter(item => item.type == "change_status");
    },
    filterHistoryAssign() {
      return this.listHistory.filter(item => item.type == "assign_manager").reverse();
    }
  },
  watch: {
    async thisRecord() {
      if (this.thisRecord && this.thisRecord.asset_code) {
        let { data } = await this.getStatusByID(this.thisRecord);
        this.thisRecord.comment = data.length && data[0].comment ? data[0].comment : "";
        this.listHistory = data;
      }
    }
  },
  async mounted() {
    if (this.thisRecord && this.thisRecord.asset_code) {
      let { data } = await this.getStatusByID(this.thisRecord);
      this.thisRecord.comment = data.length && data[0].comment ? data[0].comment : "";
      this.listHistory = data;
    }
  },
  methods: {
    ...mapActions({
      getStatusByID: "modules/asset-management/getStatusByID"
    }),
    mapUser(id) {
      let item = _.find(this.userListOnlyName, o => o.id == id);
      return item ? item.full_name : this.$t("empty_manager");
    },
    mapStatus(id) {
      let item = _.find(this.listStatus, o => o.id == id);
      return item ? item.name : "";
    },
    mapDate(raw) {
      moment.locale(this.$i18n.locale);
      return moment(raw).format("MMMM Do YYYY, h:mm:ss a");
    }
  }
};
</script>

<style lang="less" scoped>
button {
  margin: 2px;
}

.shadow {
  .item-status {
    display: flex;
    flex-direction: column;
  }

  .comment {
    color: rgb(179, 169, 169);
  }
}
</style>
