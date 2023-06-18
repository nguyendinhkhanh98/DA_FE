<template>
  <div>
    <a-tooltip placement="top">
      <template slot="title">
        <span>{{ $t("export_excel") }}</span>
      </template>
      <a-button type="primary" ghost @click="visible = !visible">
        <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
      </a-button>
    </a-tooltip>

    <ValidationObserver ref="formExportSkillSet" v-slot="{ handleSubmit }">
      <a-modal v-model="visible" :title="$t('export_excel')" @ok="handleSubmit(handleOk)" @cancel="hideModalExport">
        <template slot="footer">
          <a-button key="cancel" @click="hideModalExport">{{ $t("cancel") }}</a-button>
          <a-button key="submit" type="primary" @click="handleSubmit(handleOk)" :loading="loading">{{
            $t("export")
          }}</a-button>
        </template>

        <a-form>
          <ValidationProvider :name="$t('period_name')" rules="required" v-slot="{ errors }">
            <a-form-item
              :label="$t('period_name')"
              :required="true"
              :validate-status="errors.length ? 'error' : 'success'"
              :help="errors[0]"
            >
              <a-select
                :placeholder="$t('period_name')"
                :filter-option="filterOptionPeriod"
                show-search
                option-filter-prop="children"
                allowClear
                v-model="selectedItemsPeriod"
              >
                <a-select-option v-for="item in listFilterPeriod" :key="`${item.id}`">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </ValidationProvider>

          <ValidationProvider :name="$t('user')" rules="required" v-slot="{ errors }">
            <a-form-item
              :label="$t('user')"
              :required="true"
              :validate-status="errors.length ? 'error' : 'success'"
              :help="errors[0]"
            >
              <a-select
                :placeholder="$t('user')"
                :filter-option="filterOptionUser"
                show-search
                option-filter-prop="children"
                allowClear
                v-model="selectedItemsUser"
                mode="multiple"
                @change="handleChangeUser"
              >
                <a-select-option value="all" key="all">
                  {{ $t("all") }}
                </a-select-option>

                <a-select-option v-for="item in listUserOnlyName" :key="item.id" :value="item.id">{{
                  item.full_name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </ValidationProvider>
        </a-form>
      </a-modal>
    </ValidationObserver>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  name: "ExportSkillSet",
  data() {
    return {
      visible: false,
      loading: false,
      selectedItemsPeriod: [],
      selectedItemsUser: []
    };
  },
  computed: {
    ...mapState({
      listPeriod: state => state.modules["skill-set"].listPeriod,
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName
    }),
    listFilterPeriod() {
      return this.listPeriod.filter(period => !period.delete_flag);
    }
  },
  created() {
    if (!this.listUserOnlyName.length) this.GetListUser();
  },
  methods: {
    ...mapActions({
      FetchPeriod: "modules/skill-set/FetchPeriod",
      GetListUser: "modules/skill-set/GetListUser",
      ExportSkillSet: "modules/skill-set/ExportSkillSet"
    }),
    async handleOk() {
      if (!this.selectedItemsPeriod.length || !this.selectedItemsUser.length) {
        return this.$notification.error({
          message: "Cannot export",
          description: "You need select period and user",
          duration: 2.5
        });
      }

      this.loading = true;
      let values = {
        period_id: this.selectedItemsPeriod,
        user_id: this.selectedItemsUser
      };

      let allPeriod = _.find(values.period_id, item => item == "all");
      let allUser = _.find(values.user_id, item => item == "all");

      if (allPeriod) values.period_id = this.listFilterPeriod.map(item => item.id);
      if (allUser) values.user_id = this.listUserOnlyName.map(item => item.id);

      try {
        let response = await this.ExportSkillSet(values);
        const fileName = response.headers["content-disposition"].split("=")[1];
        const url = URL.createObjectURL(
          new Blob([response.data], {
            type: "application/vnd.ms-excel"
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.log(error);

        this.$notification.error({
          message: "Thao tác lỗi",
          description:
            "Hệ thống không thể thực hiện hành động này! \n Kỳ đánh giá hoặc danh sách người dùng không hợp lệ",
          duration: 2.5
        });
      }
      this.loading = false;
    },
    filterOptionPeriod(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      return textOption.indexOf(input.toLowerCase()) >= 0;
    },
    filterOptionUser(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    handleChangeUser(value) {
      let valueSelectedAll = value.length && value[value.length - 1] == "all";

      if (valueSelectedAll) this.selectedItemsUser = ["all"];
      else this.selectedItemsUser = value.filter(item => item != "all");
    },
    resetForm() {
      this.selectedItemsPeriod = [];
      this.selectedItemsUser = [];
    },
    hideModalExport() {
      this.resetForm();
      this.$refs.formExportSkillSet?.reset();
      this.visible = false;
    }
  }
};
</script>
