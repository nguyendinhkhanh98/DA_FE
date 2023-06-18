<template>
  <a-card class="shadow">
    <h1>{{ $t("edit_profile") }}</h1>
    <a-row>
      <ValidationObserver v-slot="{ handleSubmit }">
        <a-col :xs="{ span: 24 }" :sm="{ span: 18, offset: 2 }">
          <a-form @submit.prevent="handleSubmit(onSubmit)" v-bind="formLayout">
            <a-row>
              <a-col v-bind="colHalfPart">
                <a-form-item :label="$t('full_name')" :colon="false">
                  <a-input v-model="formSubmit.fullName" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colHalfPart">
                <a-form-item :label="$t('phone')" :colon="false">
                  <a-input v-model="formSubmit.phone" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row>
              <a-col v-bind="colHalfPart">
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
              <a-col v-bind="colHalfPart">
                <a-form-item :label="$t('address')" :colon="false">
                  <a-input v-model="formSubmit.address" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row>
              <a-col v-bind="colHalfPart">
                <a-form-item :label="$t('profile_position')" :colon="false">
                  <a-input v-model="formSubmit.position" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colHalfPart">
                <a-form-item :label="$t('profile_about')" :colon="false">
                  <a-input v-model="formSubmit.about" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item
              :label="$t('profile_project')"
              :colon="false"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
            >
              <ckeditor v-model="formSubmit.projectDescription" :config="{}"></ckeditor>
            </a-form-item>

            <a-form-item
              :label="$t('profile_interested')"
              :colon="false"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
            >
              <a-textarea :rows="4" v-model="formSubmit.interestedProject"></a-textarea>
            </a-form-item>

            <a-row>
              <a-col v-bind="colHalfPart">
                <a-form-item label="CV" :colon="false">
                  <a-row>
                    <a-col v-if="cv" v-bind="colHalfPart" class="pr-1">
                      <a-button block @click="activeModal = true" class="text-ellipsis">{{ $t("see_cv") }} </a-button>
                    </a-col>

                    <a-col v-bind="colHalfPart" class="pl-1">
                      <a-upload
                        class="upload-full-width"
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
            </a-row>

            <a-row class="mt-4">
              <a-col :xs="{ span: 24 }" :sm="{ span: 24, offset: 1 }" style="text-align: center">
                <a-button type="primary" html-type="submit" :loading="loadingSubmit">
                  <i class="fas fa-save mr-2"></i>
                  {{ $t("save") }}
                </a-button>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </ValidationObserver>
    </a-row>

    <a-modal v-model="activeModal" width="700px" :title="$t('see_cv')">
      <template slot="footer">
        <i></i>
      </template>
      <div class="edit-form">
        <iframe v-if="cv" style="height: 500px; width: 100%" :src="bufferToBase64(cv)"></iframe>
      </div>
    </a-modal>
  </a-card>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      loadingSubmit: false,
      activeModal: false,
      formSubmit: {
        fullName: "",
        email: "",
        address: "",
        phone: ""
      },
      cv: "",
      fileList: [],
      formLayout: {
        labelCol: { xs: { span: 24 }, sm: { span: 8 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } }
      },
      colHalfPart: {
        xs: 24,
        sm: 12
      }
    };
  },
  async mounted() {
    this.formSubmit = await this.getProfile();
    this.cv = this.formSubmit.cv;
    this.formSubmit.cv = "";
  },
  methods: {
    ...mapActions({
      getProfile: "modules/edit-profile/getProfile",
      editProfile: "modules/edit-profile/editProfile"
    }),
    async onSubmit() {
      this.loadingSubmit = true;
      const reponse = await this.editProfile(this.formSubmit);
      this.loadingSubmit = false;
      if (reponse.status === 200) {
        this.fileList = [];
        this.formSubmit = await this.getProfile();
        this.cv = this.formSubmit.cv;
        this.formSubmit.cv = "";
        this.$notification.success({
          message: reponse.data.message,
          description: reponse.data.message,
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: reponse.data.error,
          description: reponse.data.error,
          duration: 2.5
        });
      }
    },
    handleChange(infor) {
      if (infor.fileList[0].originFileObj.type == "application/pdf") {
        if (infor.fileList[0].originFileObj.size < 200000) {
          this.formSubmit.cv = infor.fileList[0].originFileObj;
          let fileList = [...infor.fileList];
          fileList = fileList.slice(-1);
          this.fileList = fileList;
        } else {
          this.$notification.error({
            message: "Error",
            description: "Please select file size <200KB",
            duration: 2.5
          });
        }
      } else {
        this.$notification.error({
          message: "Error",
          description: "Please select a PDF file",
          duration: 2.5
        });
      }
    }
  }
};
</script>

<style>
.hide-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.edit-form {
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  border: 1px solid #ededed;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2);
  background: #f2f5f3;
}

.upload-full-width .ant-upload {
  width: 100%;
}
</style>
