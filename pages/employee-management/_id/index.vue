<template>
  <div>
    <a-card class="shadow">
      <h1>{{ isRegister ? $t("register") : nameUser }}</h1>
      <a-row>
        <a-spin :spinning="loading">
          <ValidationObserver v-slot="{ handleSubmit }">
            <a-col v-bind="wrapperContainerCol">
              <a-form v-bind="formLayout" @submit.prevent="handleSubmit(onSubmit)">
                <a-row>
                  <a-col :xs="24" :sm="12">
                    <ValidationProvider :name="$t('username')" rules="required" v-slot="{ errors }">
                      <a-form-item
                        :label="$t('username')"
                        :colon="false"
                        :required="true"
                        :validate-status="errors.length ? 'error' : 'success'"
                        :help="errors[0]"
                      >
                        <a-input v-model="formSubmit.username" :disabled="!isRegister" />
                      </a-form-item>
                    </ValidationProvider>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <ValidationProvider :name="$t('role')" rules="required" v-slot="{ errors }">
                      <a-form-item
                        :label="$t('role')"
                        :colon="false"
                        :required="true"
                        :validate-status="errors.length ? 'error' : 'success'"
                        :help="errors[0]"
                      >
                        <a-select
                          mode="multiple"
                          v-model="formSubmit.role"
                          :filterOption="filterOptionRole"
                          option-label-prop="label"
                        >
                          <a-select-option
                            v-for="(role, index) in activeRole"
                            :key="index"
                            :value="role.id"
                            :label="role.name | capitalize"
                          >
                            {{ role.name | capitalize }}
                            <span style="float: right" @click.stop="showModalRoleSetting">
                              <a-icon type="setting" />
                            </span>
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </ValidationProvider>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :xs="24" :sm="12">
                    <a-form-item :label="$t('password')" :colon="false">
                      <a-input-password v-model="formSubmit.password" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item :label="$t('address')" :colon="false">
                      <a-input v-model="formSubmit.address" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :xs="24" :sm="12">
                    <ValidationProvider :name="$t('full_name')" rules="required" v-slot="{ errors }">
                      <a-form-item
                        :label="$t('full_name')"
                        :colon="false"
                        :required="true"
                        :validate-status="errors.length ? 'error' : 'success'"
                        :help="errors[0]"
                      >
                        <a-input v-model="formSubmit.fullName" />
                      </a-form-item>
                    </ValidationProvider>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item :label="$t('phone')" :colon="false">
                      <a-input v-model="formSubmit.phone" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row>
                  <a-col :xs="24" :sm="12">
                    <ValidationProvider :name="$t('email')" rules="required|email" v-slot="{ errors }">
                      <a-form-item
                        :label="$t('email')"
                        :colon="false"
                        :required="true"
                        :validate-status="errors.length ? 'error' : 'success'"
                        :help="errors[0]"
                      >
                        <a-input v-model="formSubmit.email" />
                      </a-form-item>
                    </ValidationProvider>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <ValidationProvider :name="$t('jira_email')" rules="required|email" v-slot="{ errors }">
                      <a-form-item
                        :label="$t('jira_email')"
                        :colon="false"
                        :required="true"
                        :validate-status="errors.length ? 'error' : 'success'"
                        :help="errors[0]"
                      >
                        <a-input v-model="formSubmit.jira_email" />
                      </a-form-item>
                    </ValidationProvider>
                  </a-col>
                </a-row>

                <!-- <a-row>
                <a-col v-bind="colHalfPart">
                  <a-form-item label="CV" :colon="false">
                    <a-row>
                      <a-col v-bind="colHalfPart" class="pr-1">
                        <a-button v-if="formSubmit.cv" block @click="activeModal = true" class="text-ellipsis"
                          >{{ $t("see_cv") }}
                        </a-button>
                        <a-button v-else block class="text-ellipsis">{{ $t("haven't_cv") }} </a-button>
                      </a-col>

                      <a-col v-bind="colHalfPart" class="pl-1">
                        <a-upload
                          class="upload-full-width"
                          accept="application/pdf"
                          :multiple="false"
                          :file-list="fileList"
                          @change="handleChange"
                        >
                          <a-button block class="text-ellipsis">
                            <a-icon type="upload" />{{ $t("upload_file") }}</a-button
                          >
                        </a-upload>
                      </a-col>
                    </a-row>
                  </a-form-item>
                </a-col>
              </a-row> -->

                <a-row class="mt-4">
                  <a-col class="text-center">
                    <template v-if="!formSubmit.delete_flag">
                      <a-button type="primary" html-type="submit" :loading="loadingSubmit">
                        {{ isRegister ? $t("register") : $t("submit") }}
                      </a-button>

                      <a-button
                        v-if="!isRegister"
                        type="danger"
                        ghost
                        class="ml-2"
                        :loading="loadingDel"
                        @click="onDelete"
                      >
                        {{ $t("block_user") }}
                      </a-button>
                    </template>

                    <template v-else>
                      <a-button v-if="!isRegister" type="primary" :loading="loadingSubmit" @click="handleRestoreUser">
                        {{ $t("restore") }}
                      </a-button>
                    </template>
                  </a-col>
                </a-row>
              </a-form>
            </a-col>

            <a-modal v-model="activeModal" width="700px" :title="$t('see_cv')">
              <template slot="footer">
                <i></i>
              </template>

              <div class="edit-form">
                <iframe v-if="formSubmit.cv" style="width: 100%; height: 500px" :src="base64DataCV"></iframe>
              </div>
            </a-modal>
          </ValidationObserver>
        </a-spin>
      </a-row>

      <RoleSetting ref="role-setting" />
    </a-card>
    <a-card class="shadow shadow-2">
      <h1>{{ "Danh sách công việc" }}</h1>
      <a-table bordered :columns="columns" :dataSource="formSubmit.project" :loading="loading" :pagination="pagination">
        <template v-for="column of columns" :slot="column.slots.title">{{ $t(column.slots.title) }}</template>
        <template slot="no" slot-scope="text, record, index">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template slot="projectName" slot-scope="text, record">
          {{ record.project }}
        </template>
        <template slot="roleName" slot-scope="text, record">
          <a-tag color="#108ee9">
            {{ record.role }}
          </a-tag>
        </template>

        <template slot="expandedRowRender" slot-scope="text">
          <a-table
            class="mt-1 mb-1"
            :columns="projectColumns"
            :dataSource="text.listTask"
            :pagination="false"
            :rowKey="(record, index) => index"
          >
            <template v-for="column of projectColumns" :slot="column.slots.title">
              {{ $t(column.slots.title) }}
            </template>
            <template slot="no" slot-scope="text, record, index">
              {{ index + 1 }}
            </template>
            <template slot="taskAssign" slot-scope="text, record">
              {{ record.contentTask }}
            </template>
            <template slot="status" slot-scope="text, record">
              <a-tag :color="mapColorTag(record.status)"> {{ record.status }} </a-tag>
            </template>
            <template slot="startDate" slot-scope="text">
              <template>
                {{ text ? $moment(text).format("YYYY/MM/DD") : null }}
              </template>
            </template>
            <template slot="endDate" slot-scope="text">
              <template>
                {{ text ? $moment(text).format("YYYY/MM/DD") : null }}
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { columns, projectColumns, mapColorTag } from "../_id/const";
import { mapState, mapActions } from "vuex";
import RoleSetting from "@/components/UserManagement/RoleSetting";
import * as CONST from "@/constants/index.js";

export default {
  data() {
    return {
      formSubmit: {},
      fileList: [],
      base64DataCV: "",
      activeModal: false,
      userId: null,
      isRegister: true,
      nameUser: null,
      loading: false,
      loadingSubmit: false,
      loadingDel: false,
      formLayout: {
        labelCol: CONST.LABEL_COLUMN_DOUBLE,
        wrapperCol: CONST.WRAPPER_COLUMN_DOUBLE
      },
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_DOUBLE,
      actionCol: CONST.ACTION_COLUMN_DOUBLE,
      formLayout: {
        labelCol: { xs: { span: 24 }, sm: { span: 8 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } }
      },
      colHalfPart: {
        xs: 24,
        sm: 12
      },
      columns: columns,
      projectColumns,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      },
      mapColorTag
    };
  },
  components: {
    RoleSetting
  },
  computed: {
    ...mapState({
      roleList: state => state.modules["user-management"].roleList,
      user: state => state.modules["auth"].user,
      projectList: state => state.modules["user-management"].projectList,
      dataFilter: state => state.modules["user-management"].dataFilter,
      userList: state => state.modules["user-management"].userList
    }),
    activeRole() {
      return this.roleList.filter(item => !item.delete_flg);
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  async created() {
    this.loading = true;
    let promises = [];

    promises.push(this.getRoleList());
    promises.push(this.getProjectList());

    this.userId = this.$route.params.id;
    if (this.userId !== "register") {
      this.isRegister = false;
      promises.push(this.getUserByIdAPI());
    }

    await Promise.all(promises);
    this.loading = false;
  },
  methods: {
    ...mapActions({
      getRoleList: "modules/user-management/getRoleList",
      createUser: "modules/user-management/createUser",
      getUserById: "modules/user-management/getUserById",
      updateUserById: "modules/user-management/updateUserById",
      deleteUserById: "modules/user-management/deleteUserById",
      getProjectList: "modules/user-management/getProjectList",
      restoreUser: "modules/user-management/restoreUser"
    }),
    onDelete() {
      const emit = this;
      this.$confirm({
        title: this.$t("are_you_sure_block_this_user"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          emit.deleteUserByIdAPI();
        },
        onCancel() {}
      });
    },
    async deleteUserByIdAPI() {
      this.loadingDel = true;
      const data = await this.deleteUserById(this.userId);
      this.loadingDel = false;
      if (data.status === 200) {
        this.$router.push({
          name: "user-management",
          params: { message: data.data.message }
        });
      } else {
        this.$notification.error({
          message: data.data.message,
          description: data.data.message,
          duration: 2.5
        });
      }
    },
    async onSubmit() {
      let data;
      this.loadingSubmit = true;
      if (this.isRegister) {
        data = await this.createUser(this.formSubmit);
      } else {
        data = await this.updateUserById(this.formSubmit);
      }
      this.loadingSubmit = false;
      if (data.status === 200) {
        this.$router.push({
          name: "user-management",
          params: { message: data.data.message }
        });
      } else {
        this.$notification.error({
          message: data.data.message || data.data.errors[0].msg,
          description: data.data.message || data.data.errors[0].msg,
          duration: 2.5
        });
      }
    },
    async getUserByIdAPI() {
      const data = await this.getUserById(this.userId);
      this.formSubmit = data.data;
      this.formSubmit.role = data.data?.role.map(item => item.role_id);
      // this.formSubmit.project = data.data?.project?.map(item => item?.listTask || []);
      if (this.formSubmit.cv) {
        this.base64DataCV = this.bufferToBase64(this.formSubmit.cv);
      }

      this.nameUser = this.formSubmit.fullName;
    },

    // getDataSource(data) {
    //   const fullName = data?.fullName
    // },

    async handleChange(infor) {
      let errorMessage = null;

      if (infor.fileList.length && infor.fileList[0].originFileObj.type != "application/pdf") {
        errorMessage = {
          message: "Error",
          description: "Please select a PDF file",
          duration: 2.5
        };
      }

      if (infor.fileList.length && infor.fileList[0].originFileObj.size > 200000) {
        errorMessage = {
          message: "Error",
          description: "Please select file size <200KB",
          duration: 2.5
        };
      }
      if (errorMessage) return this.$notification.error(errorMessage);

      this.formSubmit.cv = infor.fileList.length ? infor.fileList[0].originFileObj : "";
      let fileList = [...infor.fileList];
      fileList = fileList.slice(-1);
      this.fileList = fileList;

      if (this.formSubmit.cv != "") this.base64DataCV = await this.toBase64(this.formSubmit.cv);
    },
    filterOptionRole(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      input = input.toLowerCase();
      return textOption.includes(input);
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          return resolve(reader.result);
        };
        reader.onerror = function (error) {
          return reject(error);
        };
      });
    },
    handleRestoreUser() {
      const self = this;
      this.$confirm({
        title: this.$t("are_you_sure"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          self.restoreUserAPI();
        },
        onCancel() {}
      });
    },
    async restoreUserAPI() {
      this.loadingSubmit = true;
      let response = await this.restoreUser(this.formSubmit.id);

      if (response.statusCode === 200) {
        this.$notification.success({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
        this.loading = true;
        await this.getUserByIdAPI();
        this.loading = false;
      } else {
        this.$notification.error({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      }
      this.loadingSubmit = false;
    },
    showModalRoleSetting() {
      this.$refs["role-setting"].showModal();
    }
  }
};
</script>

<style>
.upload-full-width .ant-upload {
  width: 100%;
}
.shadow-2 {
  margin-top: 30px;
}
</style>
