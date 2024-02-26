<template>
  <div
    class="auth-layout-wrap"
    :style="{ backgroundImage: 'url(' + bgImage + ')' }"
  >

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
                    v-model="inputs.username"
                    required
                  ></b-form-input>
                </b-form-group>
                
                <b-form-group label="Contraseña" class="text-15" style="margin-top: 20px;">
                  <div style="display: flex; align-items: center;">
                    <b-form-input
                    class="form-control text-14"
                    :type="passwordType"
                    v-model="inputs.password"
                    ></b-form-input>
                    <i @click="seePassword()" class="i-Eye1" style="margin-left: 10px; cursor: pointer; font-size: 2em;"></i>
                  
                  </div>
                </b-form-group>

                <br>
                <b-button
                  v-if="loaderPerfil == false"
                  type="submit"
                  tag="button"
                  class="btn btn-block mt-2"
                  variant="mt-2"
                  style="background-color: #F9E530; font-size: 15px"
                  :disabled="loaderPerfil || loaderTienda || loaderRanking"
                >
                  INICIAR SESIÓN
                </b-button>
                

                <div v-else style="text-align: center;">
                  <span class="spinner-glow spinner-glow-primary"></span>
                </div>

                <div style="display: flex;">

                  <div style="width: 50%;">
                    <b-button
                      v-if="loaderTienda == false"
                      class="btn btn-block mt-3"
                      variant="mt-2 mr-3"
                      style="background-color: #ffd65c; font-size: 15px"
                      @click="openLocality()"
                      :disabled="loaderPerfil || loaderTienda || loaderRanking"
                    >
                      TIENDA
                    </b-button>
                    <div v-else style="text-align: center;">
                      <br><span class="spinner-glow spinner-glow-primary"></span>
                    </div>
                  </div>

                  <div style="width: 48%;">
                    <b-button
                      v-if="loaderRanking == false"
                      class="btn btn-block mt-3"
                      variant="mt-2 ml-3"
                      style="background-color: #d8ff75; font-size: 15px"
                      @click="openRanking()"
                      :disabled="loaderPerfil || loaderTienda || loaderRanking"
                    >
                      RANKING
                    </b-button>
                    <div v-else style="text-align: center;">
                      <br><span class="spinner-glow spinner-glow-primary"></span>
                    </div>
                  </div>
                  
                </div>

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
      inputs: 
      {
        username: '',
        password: ''
      },

      loaderPerfil: false,
      loaderTienda: false,
      loaderRanking: false,

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
    openLocality(){
      this.loaderTienda = true;
      axios.post(constants.routes.backendAPI+'/localityLogin',{
        localityUsername: this.inputs.username,
        localityPassword: this.inputs.password,
      })
      .then(response =>{ 
        if (response.data.success == true){
          localStorage.setItem('locality', 'yes');
          localStorage.setItem('localityID', response.data.result['localityID']);
          localStorage.setItem('localityName', response.data.result['localityName']);
          localStorage.setItem('localityPassword', response.data.result['localityPassword']);

          router.push('/app/apps/transfer');
        } else {
          this.loaderTienda = false;

          this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al iniciar sesión",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch(() =>{
        this.loaderTienda = false;

        this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al iniciar sesión",
          variant: "danger",
          solid: true
        });
      })
    },

    openRanking(){
      this.loaderRanking = true;
      axios.post(constants.routes.backendAPI+'/rankingLogin',
      {
        username: this.inputs.username,
        password: this.inputs.password,
      })
      .then(response =>{ 
        this.loaderRanking = false;
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
        this.loaderRanking = false;
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
      this.loaderPerfil = true;
      axios.post(constants.routes.backendAPI+'/agent/login',
      {
        'agentUsername': this.inputs.username,
        'agentPassword': this.inputs.password,
      })
      .then((response) =>{ 
        this.loaderPerfil = false;
        if (response.data.success == true){
          localStorage.setItem('agentID', response.data.result.agentID);
          localStorage.setItem('agentName', response.data.result.agentName);
          localStorage.setItem('agentUsername', response.data.result.agentUsername);
          localStorage.setItem('agentPassword', response.data.result.agentPassword);
          localStorage.setItem('agentType', response.data.result.agentType);
          localStorage.setItem('agentStartMessage', response.data.result.agentStartMessage);
          localStorage.setItem('agentEndMessage', response.data.result.agentEndMessage);
          localStorage.setItem('agentProfileImage', response.data.result.agentProfileImage);

          axios.post(constants.routes.backendAPI+'/selectAgentFavoriteMessages',{
            agentID: parseInt(localStorage.getItem('agentID'))
          })
          .then(response =>{ 
            if (response.data.success == true){
              localStorage.setItem('agentFavoriteMessages', JSON.stringify(response.data.result));
              router.push('/app/apps/chat');
            } else {
              this.$bvToast.toast("Ha ocurrido un error al consultar la información del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
                title: "Error al consultar la información del agente",
                variant: "danger",
                solid: true
              });
            }
          })
          .catch(() =>{
            this.loaderPerfil = false;
            this.$bvToast.toast("Ha ocurrido un error al consultar la información del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al consultar la información del agente",
              variant: "danger",
              solid: true
            });
          })
        } else {
          this.loaderPerfil = false;
          this.$bvToast.toast("Por favor, revise que su nombre de usuario y contraseña sean correctas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al iniciar sesión",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch(() =>{
        this.loaderPerfil = false;
        this.$bvToast.toast("Ha ocurrido un error al iniciar sesión. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
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
