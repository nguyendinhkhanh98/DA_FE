<template>
  <a-card class="shadow">
    <a-row class="dock-sticky">
      <a-row class="mb-2">
        <a-col v-bind="{ xs: 24, sm: 24, md: 16 }">
          <span v-if="isNaN(routeID)" class="h1">{{ $t("create_assessment") }}</span>
          <span v-if="!isNaN(routeID) && routeInfo" class="h1">
            <span>{{ routeInfo.user_created }}</span>
            <span class="mx-2">.</span>
            <span>{{ routeInfo.period_name }}</span>
            <span class="mx-2">.</span>
            <a-tag :color="mapColorTag(routeInfo.status)"> {{ routeInfo.status }} </a-tag>
          </span>

          <a-tooltip placement="top">
            <template slot="title">
              <span>{{ $t("terminology") }}</span>
            </template>

            <a-icon
              type="question-circle"
              @click="() => (showGuide = true)"
              :style="{ fontSize: '20px' }"
              class="ml-1"
            />
          </a-tooltip>
        </a-col>

        <a-col
          v-bind="{ xs: 24, sm: 24, md: 8 }"
          v-if="!canShowIfNonPeriodAvaiable"
          style="text-align: end"
          class="py-2"
        >
          <a-button class="ml-1" type="primary" @click="toggleAll">
            <i class="fas fa-arrows-alt-v mr-1"></i>
            <span>{{ $t("expand") }}</span>
          </a-button>
        </a-col>
      </a-row>

      <a-row v-if="!canShowIfNonPeriodAvaiable">
        <a-col v-bind="{ xs: 24, sm: 24, md: 10 }">
          <template v-if="routeID == 'add' || hasPeriod">
            <a-form
              v-bind="{
                labelCol: { span: 12 },
                wrapperCol: { span: 12 }
              }"
              class="form-select-period"
            >
              <a-form-item :label="$t('period_name')" :colon="false" required>
                <a-select
                  show-search
                  :filterOption="filterOptionPeriod"
                  :disabled="routeID != 'add'"
                  :value="userPeriod.period_id"
                  @change="val => (userPeriod.period_id = val)"
                >
                  <a-select-option v-for="item in listPeriod" :key="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :label="$t('leader')" :colon="false" required>
                <a-select
                  show-search
                  :filterOption="filterOptionLeader"
                  :disabled="!isEnabledSelectPeriod"
                  :value="userPeriod.leader_id"
                  @change="val => (userPeriod.leader_id = val)"
                >
                  <a-select-option v-for="item in listFilterLeaderExceptMine" :key="item.id">
                    {{ item.fullName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </template>
        </a-col>

        <a-col v-if="isLeader && routeID != 'add'" :xs="24" :md="1">
          <a-form
            v-bind="{
              labelCol: { span: 12 },
              wrapperCol: { span: 12 }
            }"
            class="form-select-period"
          >
            <a-form-item :label="'Test'" style="visibility: hidden" :colon="false" required> </a-form-item>

            <a-form-item :colon="false">
              <template slot="label">
                <i
                  class="far fa-edit ml-2"
                  @click="
                    visible = true;
                    prevLeaderId = userPeriod.leader_id;
                  "
                ></i>
              </template>
            </a-form-item>
          </a-form>
        </a-col>

        <a-col v-bind="{ xs: 24, sm: 24, md: { span: 11, offset: 2 } }" class="pl-3" v-if="showSkillSetInfo">
          <table>
            <tr>
              <td>{{ $t("skill") }}</td>
              <td class="text-bold">: {{ skillSetInfo.totalSkill }}</td>
            </tr>

            <tr>
              <td>{{ $t("level") }}</td>
              <td class="text-bold">: {{ skillSetInfo.totalLevel }}</td>
            </tr>

            <tr>
              <td>{{ $t("experience_time") }}</td>
              <td class="text-bold">: {{ skillSetInfo.totalExperienceTime }}</td>
            </tr>
          </table>
        </a-col>
      </a-row>
    </a-row>

    <a-row class="main-content">
      <SkillSetContent
        ref="skill-set-content"
        v-bind="{ period: userPeriod, loading }"
        @commit="(data, type) => commitData(data, type, 'create')"
        @draft="(data, type) => commitData(data, type, 'draft')"
        @reject="rejectData"
        @data-change="handleDataChange"
      />
      <template v-if="!listPeriod.length && canShowIfNonPeriodAvaiable">
        <a-result status="error">
          <template slot="title">
            <span>{{ $t("notify_empty_period") }}</span>
          </template>

          <template slot="subTitle">
            <span>{{ $t("contact_for_period_empty") }}</span>
            <br />
            <a-button type="link" @click="gotoMySkillSet">
              {{ $t("view_my_skillset") }}<a-icon type="caret-right" />
            </a-button>
          </template>
        </a-result>
      </template>
    </a-row>

    <a-modal v-model="showGuide" title="Instructions" class="modal-terminology">
      <template slot="footer">
        <a-button key="back" @click="() => (showGuide = false)">
          {{ $t("cancel") }}
        </a-button>
      </template>
      <ul>
        <li><b>Experience time </b>: Experience of business skills by month</li>
        <li><b>Level </b>: An objective assessment of your ability at work</li>
        <ul>
          <li><strong>Level L0 </strong>: No knowledge or no experience</li>
          <li><strong>Level L1 </strong>: Has knowledge</li>
          <li><strong>Level L2 </strong>: Can be done with support, or has experience</li>
          <li><strong>Level L3 </strong>: Can be done on your own or has experience</li>
          <li><strong>Level L4 </strong>: Can or has experience in teaching others</li>
        </ul>
      </ul>
    </a-modal>

    <a-modal
      v-model="visible"
      title="Update leader"
      :okButtonProps="{ props: { loading: updating } }"
      @ok="updateLeader"
      @cancel="userPeriod.leader_id = prevLeaderId"
    >
      <a-form
        v-bind="{
          labelCol: { span: 12 },
          wrapperCol: { span: 12 }
        }"
        class="form-select-period"
      >
        <a-form-item :label="$t('leader')" :colon="false" required>
          <a-select
            show-search
            :filterOption="filterOptionLeader"
            :value="userPeriod.leader_id"
            @change="val => (userPeriod.leader_id = val)"
          >
            <a-select-option v-for="item in listFilterLeaderExceptMine" :key="item.id">
              {{ item.fullName }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { mapColorTag } from "../const.js";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import moment from "moment";

import SkillSetContent from "@/components/SkillSet/SkillSetContent";

export default {
  name: "SkillSetDetail",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "intern"]
  },
  data() {
    return {
      mapColorTag,
      loading: true,
      showGuide: false,
      userPeriod: {
        id: null,
        period_id: null,
        leader_id: null
      },
      isToggleAll: true,
      skillSetInfo: {
        totalSkill: 0,
        totalLevel: 0,
        totalExperienceTime: 0
      },
      visible: false,
      prevLeaderId: null,
      updating: false
    };
  },
  components: {
    SkillSetContent
  },
  async created() {
    this.loading = true;
    this.findAndSetRouteID();
    let promise = [];

    // Add new skill set
    if (isNaN(this.routeID)) {
      this.setRouteInfo(null);
      promise.push(this.FetchPeriod({ type: "empty" }));
    } else {
      promise.push(this.GetInfoPeriodByID(this.routeID).then(result => this.setRouteInfo(result)));
      promise.push(this.FetchSkillSet({ user_period_id: this.routeID, type: "view" }));
      promise.push(this.FetchPeriod({ type: "view" }));
    }

    if (!Object.keys(this.listSkill).length) promise.push(this.FetchSkill());
    if (!this.listUserOnlyName.length) promise.push(this.GetListUser());
    if (!this.levels.length) promise.push(this.GetLevels());
    if (!this.listLeader.length) promise.push(this.getAndFillListLeader());

    await Promise.all(promise);
    this.loading = false;
  },
  computed: {
    ...mapState({
      levels: state => state.modules["skill-set"].levels,
      listPeriod: state => state.modules["skill-set"].listPeriod,
      listSkill: state => state.modules["skill-set"].listSkill,
      listSkillSet: state => state.modules["skill-set"].skillSet,
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName,
      routeID: state => state.modules["skill-set"].routeID,
      routeInfo: state => state.modules["skill-set"].routeInfo,
      userInfo: state => state.userInfo,
      listLeader: state => state.modules["skill-set"].listLeader
    }),
    ...mapGetters({
      isDraft: "modules/skill-set/isDraft",
      isReject: "modules/skill-set/isReject",
      isLeader: "modules/skill-set/isLeader"
    }),
    hasPeriod() {
      return this.userPeriod.id || this.userPeriod.period_id || this.userPeriod.leader_id;
    },
    renderCreateSkillSet() {
      let isCreate = this.routeID == "add";
      let haveSelected = this.userPeriod.period_id && this.userPeriod.leader_id;
      return isCreate && haveSelected ? true : false;
    },
    canShowIfNonPeriodAvaiable() {
      let inCreatePage = this.routeID == "add" && !this.loading;
      let isEmptyPeriodList = this.listPeriod.length == 0;
      return inCreatePage && isEmptyPeriodList;
    },
    isDraftOrRejectStatus() {
      return this.isDraft || this.isReject;
    },
    listFilterLeaderExceptMine() {
      return this.routeID == "add" ? this.listLeader.filter(item => item.id != this.userInfo.id) : this.listLeader;
    },
    isEnabledSelectPeriod() {
      let isAdd = this.routeID == "add";
      return isAdd || this.isDraftOrRejectStatus;
    },
    showSkillSetInfo() {
      let haveSelected = this.userPeriod.period_id && this.userPeriod.leader_id;
      return (
        this.skillSetInfo.totalExperienceTime >= 0 &&
        this.skillSetInfo.totalLevel >= 0 &&
        this.skillSetInfo.totalSkill >= 0 &&
        haveSelected
      );
    }
  },
  watch: {
    listSkillSet() {
      if (this.routeInfo && this.routeID != "add") {
        let { id, period_id, leader_id } = this.routeInfo;
        this.userPeriod = { id, period_id, leader_id };
      }
    },
    routeInfo(newVal) {
      if (newVal) {
        let { id, period_id, leader_id } = this.routeInfo;
        if (this.routeID != "add") this.userPeriod = { id, period_id, leader_id };
      }
    },
    async renderCreateSkillSet(val) {
      if (val) {
        this.loading = true;
        await this.FetchSkillSet({ type: "empty" });
        this.loading = false;
      }
    }
  },
  methods: {
    ...mapActions({
      GetInfoPeriodByID: "modules/skill-set/GetInfoPeriodByID",
      FetchSkill: "modules/skill-set/FetchSkill",
      GetListUser: "modules/skill-set/GetListUser",
      CreateSkillSet: "modules/skill-set/CreateSkillSet",
      UpdateSkillSet: "modules/skill-set/UpdateSkillSet",
      FetchSkillSet: "modules/skill-set/FetchSkillSet",
      FetchPeriod: "modules/skill-set/FetchPeriod",
      UpdateDraftSkillSet: "modules/skill-set/UpdateDraftSkillSet",
      CommitDraftSkillSet: "modules/skill-set/CommitDraftSkillSet",
      FetchAllUserPeriod: "modules/skill-set/FetchAllUserPeriod",
      GetLevels: "modules/skill-set/GetLevels",
      RejectSkillSet: "modules/skill-set/RejectSkillSet",
      getAndFillListLeader: "modules/skill-set/getAndFillListLeader",
      updateLeaderById: "modules/skill-set/updateLeaderById"
    }),
    ...mapMutations({
      setRouteID: "modules/skill-set/setRouteID",
      setRouteInfo: "modules/skill-set/setRouteInfo",
      setUserCreatedByValue: "modules/skill-set/setUserCreatedByValue"
    }),
    findAndSetRouteID() {
      let pathName = location.pathname;
      let paths = _.filter(pathName.split("/"), o => o);

      this.setRouteID(this.$route.params.id || paths[1]);
    },
    async commitData(data, type, mode) {
      let self = this;
      let clone = _.cloneDeep(data);
      let dataClone = _.map(clone, item => {
        let condition = /^[0-9]+$/gm.test(item.level) && /^[0-9]+$/gm.test(item.experience_time);
        return condition ? item : null;
      });
      dataClone = _.filter(dataClone, item => item);
      if (!dataClone.length) {
        return this.$notification.error({
          message: "Data invalid",
          description: "Sorry, please choose at least one field",
          duration: 2.5
        });
      }

      if (!data.period.period_id || !data.period.leader_id) {
        return this.$notification.error({
          message: "Data invalid",
          description: "Please choose period in ahead",
          duration: 2.5
        });
      }

      let payload = {
        period: data.period,
        data: dataClone,
        leader_id: this.userPeriod.leader_id
      };
      payload.mode = mode;
      let response = null;

      this.$refs["skill-set-content"].spinning = true;
      if (mode == "draft") {
        if (type == "add") response = await self.CreateSkillSet(payload);
        else {
          response = await self.UpdateDraftSkillSet(payload);
        }
      }

      if (response != null) {
        self.handleResponseIncome(response, false);
        this.$router.push(`/skill-set/${response.data}`);
        this.$refs["skill-set-content"].spinning = false;
        return;
      }

      if (type == "add") response = await self.CreateSkillSet(payload);
      else {
        if (self.isDraftOrRejectStatus) response = await self.CommitDraftSkillSet(payload);
        else response = await self.UpdateSkillSet(payload);
      }
      self.handleResponseIncome(response, true);
      this.$refs["skill-set-content"].spinning = false;
    },
    async rejectData(e) {
      let response = await this.RejectSkillSet(e);
      this.handleResponseIncome(response, true);
    },
    handleResponseIncome(response, redirect) {
      if (response.success && response.code == 200) {
        if (redirect) this.$router.push(`/skill-set`);

        this.FetchAllUserPeriod();
        this.$notification.success({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      }
    },
    toggleAll() {
      this.isToggleAll = !this.isToggleAll;
      this.$refs["skill-set-content"].expandAll(this.isToggleAll);
    },
    filterOptionPeriod(input, option) {
      return option.componentOptions.children[0].text.includes(input);
    },
    filterOptionLeader(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());

      return textOption.includes(input);
    },
    gotoMySkillSet() {
      this.setUserCreatedByValue([this.userInfo?.fullName]);
      this.$router.push(`/skill-set`);
    },
    handleDataChange(dataChanged) {
      let cloneData = dataChanged.filter(item => item.level !== null && item.experience_time !== null);
      let totalSkill = cloneData.length;
      let totalLevel = cloneData.reduce((sum, item) => (sum += item.level), 0);
      let totalExperienceTime = cloneData.reduce((sum, item) => (sum += item.experience_time), 0);

      this.skillSetInfo.totalSkill = totalSkill;
      this.skillSetInfo.totalLevel = totalLevel;
      this.skillSetInfo.totalExperienceTime = totalExperienceTime;
    },
    async updateLeader() {
      this.updating = true;
      let response = await this.updateLeaderById({ id: this.routeID, leader_id: this.userPeriod.leader_id });
      if (response.success && response.code == 200) this.FetchAllUserPeriod();
      this.$notification.info({
        message: response.message,
        description: response.message,
        duration: 2.5
      });

      this.visible = false;
      this.updating = false;
    }
  }
};
</script>

<style lang="less" scoped>
.shadow {
  .main-content {
    height: 100%;

    .gutter-row {
      height: 100%;
      display: flex;
      flex-direction: column;

      .gutter-box {
        .width-height() {
          height: 100%;
          max-height: 100%;
          width: 90%;
          border-top: 1px solid rgba(65, 64, 64, 0.219);
        }

        &-left {
          .width-height();
          box-sizing: border-box;
          position: absolute;
          overflow-y: auto;
        }

        &-right {
          .width-height();
          box-sizing: border-box;
          position: absolute;
          overflow-y: auto;
        }
      }
    }
  }
}
</style>

<style lang="less">
.shadow {
  div.ant-card-body {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .gutter-box {
    border-top: 1px solid rgba(65, 64, 64, 0.219);
  }
}

.modal-terminology {
  .ant-modal-wrap {
    .ant-modal {
      top: 50px !important;
      width: 1200px !important;
    }
  }
}

.form-select-period {
  .ant-form-item {
    .ant-form-item-label {
      text-align: inherit !important;
    }
  }
}
</style>
