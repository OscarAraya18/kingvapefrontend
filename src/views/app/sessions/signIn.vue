<template>
  <div
    class="auth-layout-wrap"
    :style="{ backgroundImage: 'url(' + bgImage + ')' }"
  >
    <b-toast id="example-toast" title="BootstrapVue" static no-auto-hide>
      Hello, world! This is a toast message.
    </b-toast>

    <div class="auth-content">
      <div class="card o-hidden">

            <div class="p-4">
              <div class="text-center" style="margin-bottom: -50px; margin-top: -50px;">
                <img style="width: 300px; height: auto;" :src="logo"/>
              </div>

              <b-form @submit.prevent="formSubmit">
                <b-form-group label="Nombre de usuario" class="text-15">
                  <b-form-input
                    class="form-control text-14"
                    type="text"
                    v-model="username"
                    required
                  ></b-form-input>
                </b-form-group>
                
                <b-form-group label="Contraseña" class="text-15" style="margin-top: 20px;">
                  <div style="display: flex; align-items: center;">
                    <b-form-input
                    class="form-control text-14"
                    :type="passwordType"
                    v-model="password"
                    ></b-form-input>
                    <i @click="seePassword()" class="i-Eye1" style="margin-left: 10px; cursor: pointer; font-size: 2em;"></i>
                  
                  </div>
                </b-form-group>

                <br>
                <b-button
                  type="submit"
                  tag="button"
                  class="btn btn-block mt-2"
                  variant="mt-2"
                  style="background-color: #F9E530; font-size: 15px"
                  :disabled="loading"
                >
                  INICIAR SESIÓN
                </b-button>

                <b-button
                  class="btn btn-block mt-3"
                  variant="mt-2"
                  style="background-color: #fff8bc; font-size: 15px"
                  @click="openRanking()"
                >
                  ABRIR RANKING
                </b-button>

                <div v-once class="typo__p" v-if="loading">
                  <div class="spinner sm spinner-primary mt-3"></div>
                </div>
                
              </b-form>

            </div>

      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

import axios from 'axios';
import router from "../../../router";
const constants = require('@../../../src/constants.js'); 

export default {
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "SignIn"
  },
  data() {
    return {
      username: "",
      password: "",

      passwordType: 'password',

      userId: "",
      bgImage: require("@/assets/images/wallpaper2.jpg"),
      logo: require("@/assets/images/logo.png"),
      signInImage: require("@/assets/images/photo-long-3.jpg")
    };
  },
  mounted(){
    if(localStorage.getItem("agentID")){
      router.push('/app/apps/chat')

    }
  },
  
  computed: {
    validation() {
      return this.userId.length > 4 && this.userId.length < 13;
    },
    ...mapGetters(["loggedInUser", "loading", "error"])
  },

  methods: {
    openRanking(){
      axios.post(constants.routes.backendAPI+'/rankingLogin',{
        username: this.username,
        password: this.password,
      })
      .then(response =>{ 
        if (response.data.success == true){
          localStorage.setItem('ranking', 'yes');
          router.push('/app/apps/ranking');
        } else {
          this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al abrir el ranking",
          variant: "danger",
          solid: true
        });
        }

      })
      .catch(error =>{
        this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al iniciar sesión",
          variant: "danger",
          solid: true
        });
      })
    },


    seePassword(){
      if (this.passwordType == 'text'){
        this.passwordType = 'password';
      } else {
        this.passwordType = 'text';
      }
    },

    ...mapActions(["login"]),
    formSubmit() {

      axios.post(constants.routes.backendAPI+'/agentLogin',{
        agentUsername: this.username,
        agentPassword: this.password,
      })
      .then(response =>{ 
        if (response.data.success == true){
          localStorage.setItem('agentID', response.data.agentID);
          localStorage.setItem('agentName', response.data.agentName);
          localStorage.setItem('agentUsername', response.data.agentUsername);
          localStorage.setItem('agentPassword', response.data.agentPassword);

          localStorage.setItem('agentProfilePicture', response.data.agentProfilePicture)
          localStorage.setItem('agentType', response.data.agentType);
          localStorage.setItem('agentWelcomeMessage', response.data.agentWelcomeMessage);
          localStorage.setItem('agentEndMessage', response.data.agentEndMessage);

          localStorage.setItem('agentFavoriteMessages', JSON.stringify(response.data.agentFavoriteMessages));


          router.push('/app/apps/chat');
        } else {
          if (response.data.applicationStatus == 'on'){
            this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al iniciar sesión",
              variant: "danger",
              solid: true
            });
          } else {
            this.$bvToast.toast("En este momento, la aplicación se encuentra fuera de línea para su uso. Contacte con su administrador de sistema o con soporte técnico si considera que esto se trata de un error.", {
              title: "Aplicación fuera de línea",
              variant: "danger",
              solid: true
            });
          }
        }
      })
      
      .catch(error =>{
        console.log(error);
        this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al iniciar sesión",
          variant: "danger",
          solid: true
        });
      })
    },

    makeToast(variant = null, msg) {
      this.$bvToast.toast(msg, {
        title: ` ${variant || "default"}`,
        variant: variant,
        solid: true
      });
    }
  },
  watch: {
    loggedInUser(val) {
      if (val && val.uid && val.uid.length > 0) {
        this.makeToast("success", "Successfully Logged In");

        setTimeout(() => {
          this.$router.push("/");
        }, 500);
      }
    },
    error(val) {
      if (val != null) {
        this.makeToast("warning", val.message);
      }
    }
  }
};
</script>

<style>
.spinner.sm {
  height: 2em;
  width: 2em;
}
</style>
