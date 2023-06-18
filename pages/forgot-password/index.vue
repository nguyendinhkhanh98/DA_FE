<template>
  <a-row type="flex" justify="center" align="middle" style="background:#ECECEC; height: 100vh; padding-bottom: 150px;">
    <a-col :md="6" :xs="24">
      <a-card style="border-radius: 5px;" class="m-2 shadow">
        <h1>{{ $t("forgot_password") }}</h1>
        <ValidationObserver v-slot="{ handleSubmit }">
          <a-form id="form-login" @submit.prevent="handleSubmit(onForgotPassword)">
            <ValidationProvider :name="$t('email')" rules="required" v-slot="{ errors }">
              <a-form-item :label="$t('email')" :validate-status="errors[0] ? 'error' : 'success'" :help="errors[0]">
                <a-input v-model="email" name="email" :placeholder="$t('enter_your_email_to_search')" />
              </a-form-item>
            </ValidationProvider>
            <a-button class="mt-3" type="primary" htmlType="submit" block>
              {{ $t("send") }}
            </a-button>
            <a-row class="mt-1">
              <nuxt-link style="float: right;" to="/login">{{ $t("login") }}</nuxt-link>
            </a-row>
          </a-form>
        </ValidationObserver>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { mapActions } from "vuex";
export default {
  layout: "guest",
  data() {
    return {
      email: ""
    };
  },
  mounted() {
    localStorage.removeItem("token");
  },
  methods: {
    ...mapActions({
      forgotPassword: "modules/auth/forgotPassword"
    }),
    onForgotPassword() {
      this.forgotPassword({ email: this.email })
        .then(response => {
          this.$notification.success({
            message: this.$t("forgot_password"),
            description: response.data.message,
            duration: 5
          });
        })
        .catch(error => {
          this.$notification.error({
            message: this.$t("forgot_password"),
            description: error.response.data.error,
            duration: 2.5
          });
        });
    }
  }
};
</script>

<style></style>
