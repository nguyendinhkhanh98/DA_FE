<template>
  <a-card class="shadow">
    <h1>{{ $t("change_password") }}</h1>
    <a-row>
      <ValidationObserver v-slot="{ handleSubmit }">
        <a-col :xs="{ span: 24 }" :sm="{ span: 18, offset: 2 }">
          <a-form @submit.prevent="handleSubmit(onSubmit)">
            <a-row>
              <a-col :xs="24" :sm="12">
                <ValidationProvider :name="$t('current_password')" rules="required" v-slot="{ errors }">
                  <a-form-item
                    :label="$t('current_password')"
                    :label-col="{ xs: { span: 24 }, sm: { span: 8 } }"
                    :wrapper-col="{ xs: { span: 24 }, sm: { span: 16 } }"
                    :colon="false"
                    :required="true"
                    :validate-status="errors.length ? 'error' : 'success'"
                    :help="errors[0]"
                  >
                    <a-input v-model="currentPassword" type="password" />
                  </a-form-item>
                </ValidationProvider>
              </a-col>
            </a-row>
            <a-row>
              <a-col :xs="24" :sm="12">
                <ValidationProvider
                  :name="$t('enter_new_password')"
                  :rules="{ required: true, min: 5, regex: /\d/ }"
                  v-slot="{ errors }"
                  vid="enter_new_password"
                >
                  <a-form-item
                    :label="$t('enter_new_password')"
                    :label-col="{ xs: { span: 24 }, sm: { span: 8 } }"
                    :wrapper-col="{ xs: { span: 24 }, sm: { span: 16 } }"
                    :colon="false"
                    :required="true"
                    :validate-status="errors.length ? 'error' : 'success'"
                    :help="$t('note_password_input')"
                  >
                    <a-input v-model="newPassword" type="password" />
                  </a-form-item>
                </ValidationProvider>
              </a-col>
            </a-row>
            <a-row>
              <a-col :xs="24" :sm="12">
                <ValidationProvider
                  :name="$t('reenter_new_password')"
                  rules="required|confirmed:enter_new_password"
                  v-slot="{ errors }"
                >
                  <a-form-item
                    :label="$t('reenter_new_password')"
                    :label-col="{ xs: { span: 24 }, sm: { span: 8 } }"
                    :wrapper-col="{ xs: { span: 24 }, sm: { span: 16 } }"
                    :colon="false"
                    :required="true"
                    :validate-status="errors.length ? 'error' : 'success'"
                    :help="errors[0]"
                  >
                    <a-input v-model="reEnterNewPassword" type="password" />
                  </a-form-item>
                </ValidationProvider>
              </a-col>
            </a-row>
            <a-row>
              <a-col :xs="24" :sm="24">
                <a-form-item :wrapper-col="{ xs: { span: 20 }, sm: { span: 20, offset: 4 } }" :colon="false">
                  <a-button type="primary" html-type="submit" :loading="loadingSubmit">
                    <i class="fas fa-save mr-2"></i>
                    {{ $t("submit") }}
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </ValidationObserver>
    </a-row>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      currentPassword: "",
      newPassword: "",
      reEnterNewPassword: "",
      loadingSubmit: false
    };
  },
  methods: {
    ...mapActions({
      changePassword: "modules/change-password/changePassword"
    }),
    async onSubmit() {
      this.loadingSubmit = true;
      this.changePassword({ password: this.currentPassword, newPassword: this.newPassword })
        .then(response => {
          this.$notification.success({
            message: response.data.message,
            description: response.data.message,
            duration: 2.5
          });
          this.loadingSubmit = false;
        })
        .catch(error => {
          this.$notification.error({
            message: error.response.data.error,
            description: error.response.data.error,
            duration: 2.5
          });
          this.loadingSubmit = false;
        });
    }
  }
};
</script>

<style></style>
