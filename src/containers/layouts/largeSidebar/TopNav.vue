<template>
  <div class="main-header">
    <div class="logo">
      <a href="https://www.kingvapecr.com" target="_blank">
        <img src="@/assets/images/logo.webp" alt style="width: 80px; height: auto; margin-left: 35px;"/>
      </a>
    </div>
    <i class="i-Sidebar-Window header-icon d-sm-inline-block" style="margin-left: 10px;" @click="sideBarToggle"></i>
    <i class="i-Full-Screen header-icon d-sm-inline-block" @click="handleFullScreen"></i>
    
    <div style="margin: auto"></div>

    <div class="header-part-right">
      <button @click="updateApplicationStatus()" :class="getApplicationStatusClass()" style="position:relative; left: -10px; font-size: medium;" v-if="(ranking == false) && (agentType == 'admin')"><strong>{{ applicationStatus }}</strong></button>

      <button @click="updateAgentStatus()" :class="getAgentStatusClass()" style="position:relative; left: -10px; font-size: medium;" v-if="ranking == false"><strong>{{ agentStatus }}</strong></button>
      <div style="width: 50px; height: 50px; border-radius: 100%; margin-right: 15px;" v-if="ranking == false">
        <b-dropdown id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
          <template slot="button-content">
            <img v-if="agentProfilePicture!=''" :src="agentProfilePicture" style="width: 50px; height: 50px; border-radius: 100%;">
            <img v-else :src="agentDefaultProfilePicture" style="width: 50px; height: 50px; border-radius: 100%;">

          </template>
          <div class="dropdown-menu-right" aria-labelledby="userDropdown">
            <a class="dropdown-item" href="#" v-b-modal.updateProfileModal style="font-size: medium;">Modificar perfil</a>
            <a class="dropdown-item" href="#" @click.prevent="logoutUser" style="font-size: medium;">Cerrar sesión</a>
          </div>
        </b-dropdown>
      </div>
    </div>

    <b-modal scrollable size="m" hide-header hide-footer centered id="updateProfileModal">
      <b-button v-b-toggle.profileCollapseMenu style="width: 100%; font-size: large; color: red;">Perfil</b-button>
      <b-collapse id="profileCollapseMenu">
        <b-card>
          <div style="display: flex;">
            <div style="width: 200px;">
              <img v-if="agentProfilePicture!=''" :src="agentProfilePicture" style="width: auto; height: 250px; cursor: pointer;" id="tooltip-target-1" @click="changeProfilePicture()">
              <img v-else :src="agentDefaultProfilePicture" style="width: auto; height: 250px; cursor: pointer;" id="tooltip-target-1" @click="changeProfilePicture()">

              <input type="file" accept="image/png, image/jpeg" @change="uploadProfilePicture()" ref="profilePictureFile" style="display: none;" id="profilePictureFileDownloader">
              <b-tooltip target="tooltip-target-1" triggers="hover">Click para cambiar la foto de perfil</b-tooltip>
            </div>
            <div style="margin-left: 30px;">
              <p style="font-size: medium;"><strong>Nombre de usuario:</strong></p>
              <b-form-input v-model="agentUsername" placeholder="Nombre de usuario"></b-form-input>
              <br>
              <p style="font-size: medium;"><strong>Contraseña:</strong></p>
              <b-form-input v-model="agentPassword" placeholder="Contraseña"></b-form-input>
              <br><br>
              <button @click="updateAgentLoginCredentials()" class="btn btn-icon" style="background-color: #F9E530; font-size: 15px"><i class="i-Data-Save"></i>Guardar cambios</button>
            </div>
          </div>
        </b-card>
      </b-collapse>

      <br><br>

      <b-button v-b-toggle.automaticMessagesCollapseMenu style="width: 100%; font-size: large; background-color: #F9E530;">Mensajes automáticos</b-button>
      <b-collapse id="automaticMessagesCollapseMenu">
        <b-card>
          <div>
            <p style="font-size: medium;"><strong>Mensaje de bienvenida:</strong></p>
            <b-form-textarea v-model="agentWelcomeMessage" placeholder="Mensaje de bienvenida" rows="3"></b-form-textarea>
            <br>
            <p style="font-size: medium;"><strong>Mensaje de despedida:</strong></p>
            <b-form-textarea v-model="agentEndMessage" placeholder="Mensaje de despedida" rows="3"></b-form-textarea>
            <br>
            <div style="text-align: center;">
              <button @click="updateAgentAutomaticMessages()" class="btn btn-icon" style="background-color: #F9E530; font-size: 15px"><i class="i-Data-Save"></i>Guardar cambios</button>
            </div>  
          </div>
        </b-card>
      </b-collapse>

      <br><br>

      <b-button v-b-toggle.favoriteMessagesCollapseMenu style="width: 100%; font-size: large; background-color: #F9E530;">Mensajes favoritos</b-button>
      <b-collapse id="favoriteMessagesCollapseMenu">
        <b-card>
          <div v-for="agentFavoriteMessage in agentFavoriteMessages">
            <div style="display: flex;">
              <p style="font-size: medium;"><strong>{{agentFavoriteMessage.title}}</strong></p>
              <div style="right: 0; position: absolute; margin-right: 20px;">
              <i @click="updateAgentFavoriteMessage(agentFavoriteMessage)" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
              <i @click="deleteAgentFavoriteMessage(agentFavoriteMessage)" class="i-Close-Window text-25 ml-2 text-danger" style="cursor: pointer"></i>
              </div>
            </div>
            <b-form-textarea v-model="agentFavoriteMessage.content" placeholder="Contenido del mensaje favorito" rows="3"></b-form-textarea>
            <br>
          </div>
          <div style="text-align: center;">
            <button @click="openCreateFavoriteMessageModal()" v-b-modal.newFavoriteMessageModal class="btn btn-icon" style="background-color: #F9E530; font-size: 15px"><i class="i-Data-Save"></i>Nuevo mensaje favorito</button>
            <b-modal scrollable size="sm" centered id="newFavoriteMessageModal" title="Nuevo mensaje favorito" @ok="createAgentFavoriteMessage()">
              <b-form-input v-model="newFavoriteMessageTitle" placeholder="Título del nuevo mensaje favorito"></b-form-input>
              <br>
              <b-form-textarea v-model="newFavoriteMessageContent" placeholder="Contenido del nuevo mensaje favorito" rows="3"></b-form-textarea>
            </b-modal>
          </div>
        </b-card>
      </b-collapse>

      <br>

    </b-modal>

    
  </div>
</template>


<script>
import Util from "@/utils";
import Sidebar from "./Sidebar";
import searchComponent from "../common/search";
import { isMobile } from "mobile-device-detect";
import { mapGetters, mapActions } from "vuex";
import { mixin as clickaway } from "vue-clickaway";
import router from "../../../router";
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');

export default {
  mixins: [clickaway],
  components: {
    Sidebar,
    searchComponent
  },

  data() {
    return {
      agentStatus: '',
      applicationStatus: '',

      agentType: '',

      ranking: false,
      isDisplay: true,

      file: null,
      profilePictureFile: null,

      isStyle: true,
      isSearchOpen: false,
      isMegaMenuOpen: false,

      agentName: '',
      agentProfilePicture: '',
      agentDefaultProfilePicture: ``,
      agentUsername: '',
      agentPassword: '',
      agentWelcomeMessage: '',
      agentWelcomeImage: '',
      agentEndMessage: '',
      agentFavoriteMessages: [],
      agentFavoriteImages: [],

      newFavoriteMessageTitle: '',
      newFavoriteMessageContent: '',

      newFavoriteImageTitle: '',
      newFavoriteImageContent: ''
    };
  },
  mounted() {
    if (localStorage.getItem('ranking') != 'yes'){
      this.agentType = localStorage.getItem('agentType');

      this.agentName = localStorage.getItem('agentName');
      this.agentProfilePicture = localStorage.getItem('agentProfilePicture');
      this.agentUsername = localStorage.getItem('agentUsername');
      this.agentPassword = localStorage.getItem('agentPassword');

      this.agentWelcomeImage = localStorage.getItem('agentWelcomeImage');
      this.agentWelcomeMessage = localStorage.getItem('agentWelcomeMessage');
      this.agentEndMessage = localStorage.getItem('agentEndMessage');

      this.agentFavoriteMessages = JSON.parse(localStorage.getItem('agentFavoriteMessages'));

      this.agentDefaultProfilePicture = constants.agentDefaultProfilePicture;

      this.getAgentStatus();
      this.getApplicationStatus();

      try {
        webSocket.onmessage = (websocketMessage) => {
          const websocketMessageJSON = JSON.parse(websocketMessage.data);
          if (websocketMessageJSON['websocketMessageID'] == 'updateAgentStatus'){
            this.getAgentStatus();
          } else if (websocketMessageJSON['websocketMessageID'] == 'turnOffApplication'){
            if (this.agentType != 'admin'){
              this.logoutUser();
            }
          }
        }
      } catch {
    
      }
      
    } else {
      this.ranking = true;
    }
    
  },
  computed: {
    ...mapGetters(["getSideBarToggleProperties"])
  },

  methods: {
  
    updateAgentLoginCredentials(){
      axios.post(constants.routes.backendAPI+'/updateAgentLoginCredentials',
        {
          agentID: localStorage.getItem('agentID'),
          agentProfilePicture: this.agentProfilePicture,
          agentUsername: this.agentUsername,
          agentPassword: this.agentPassword 
        }
      )
      .then(() =>{ 
        localStorage.setItem('agentProfilePicture', this.agentProfilePicture);
        localStorage.setItem('agentUsername', this.agentUsername);
        localStorage.setItem('agentPassword', this.agentPassword);
        this.$bvToast.toast('Se ha editado la información del agente.', {
          title: 'Información del agente editada',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al editar la información del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar la información del agente',
          variant: 'danger',
          solid: true
        });
      });
    },
   
    updateAgentAutomaticMessages(){
      axios.post(constants.routes.backendAPI+'/updateAgentAutomaticMessages',
      {
        agentID: localStorage.getItem('agentID'),
        agentWelcomeImage: this.agentWelcomeImage,
        agentWelcomeMessage: this.agentWelcomeMessage,
        agentEndMessage: this.agentEndMessage 
      })
      .then(() =>{ 
        localStorage.setItem('agentWelcomeImage', this.agentWelcomeImage);
        localStorage.setItem('agentWelcomeMessage', this.agentWelcomeMessage);
        localStorage.setItem('agentEndMessage', this.agentEndMessage);
        this.$bvToast.toast('Se han editados los mensajes automáticos del agente.', {
          title: 'Mensajes automáticos del agente editados',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al editar los mensajes automáticos del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar los mensajes automáticos del agente',
          variant: 'danger',
          solid: true
        });
      });
    },
    
    updateAgentFavoriteMessage(updatedAgentFavoriteMessage){
      axios.post(constants.routes.backendAPI+'/updateAgentFavoriteMessage',
      {
        agentID: localStorage.getItem('agentID'),
        agentFavoriteMessageTitle: updatedAgentFavoriteMessage.title,
        agentFavoriteMessageContent: updatedAgentFavoriteMessage.content
      })
      .then(() =>{
        localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
        this.$bvToast.toast('Se ha editado el mensaje favorito "' + updatedAgentFavoriteMessage.title + '" del agente.', {
          title: 'Mensajes favorito del agente editado',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al editar el mensaje favorito del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar el mensaje favorito del agente',
          variant: 'danger',
          solid: true
        });
      });
    },

    deleteAgentFavoriteMessage(deletedAgentFavoriteMessage){
      axios.post(constants.routes.backendAPI+'/deleteAgentFavoriteMessage',
      {
        agentID: localStorage.getItem('agentID'),
        agentFavoriteMessageTitle: deletedAgentFavoriteMessage.title
      })
      .then(() =>{
        this.agentFavoriteMessages = this.agentFavoriteMessages.filter(agentFavoriteMessage => agentFavoriteMessage.title != deletedAgentFavoriteMessage.title);
        localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
        this.$bvToast.toast('Se ha eliminado el mensaje favorito "' + deletedAgentFavoriteMessage.title + '" del agente.', {
          title: 'Mensaje favorito del agente eliminado',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al eliminar el mensaje favorito del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al eliminar el mensaje favorito del agente',
          variant: 'danger',
          solid: true
        });
      });
    },

    openCreateFavoriteMessageModal(){
      this.newFavoriteMessageTitle = '';
      this.newFavoriteMessageContent = '';
    },

    createAgentFavoriteMessage(){
      axios.post(constants.routes.backendAPI+'/createAgentFavoriteMessage',
      {
        agentID: localStorage.getItem('agentID'),
        agentFavoriteMessageTitle: this.newFavoriteMessageTitle,
        agentFavoriteMessageContent: this.newFavoriteMessageContent,
      })
      .then(() =>{
        this.agentFavoriteMessages.push({'title': this.newFavoriteMessageTitle, 'content': this.newFavoriteMessageContent});
        localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
        this.$bvToast.toast('Se ha creado el mensaje favorito "' + this.newFavoriteMessageTitle + '" del agente.', {
          title: 'Mensaje favorito del agente creado',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al crear el mensaje favorito del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el mensaje favorito del agente',
          variant: 'danger',
          solid: true
        });
      });
    },

    deleteAgentFavoriteImage(deletedAgentFavoriteImage){
      axios.post(constants.routes.backendAPI+'/deleteAgentFavoriteImage',
      {
        agentID: localStorage.getItem('agentID'),
        agentFavoriteImageTitle: deletedAgentFavoriteImage.title
      })
      .then(() =>{
        this.agentFavoriteImages = this.agentFavoriteImages.filter(agentFavoriteImage => agentFavoriteImage.title != deletedAgentFavoriteImage.title);
        localStorage.setItem('agentFavoriteImages', JSON.stringify(this.agentFavoriteImages));
        this.$bvToast.toast('Se ha eliminado la imagen favorita "' + deletedAgentFavoriteImage.title + '" del agente.', {
          title: 'Imagen favorita del agente eliminada',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al eliminar la imagen favorita del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al eliminar la imagen favorita del agente',
          variant: 'danger',
          solid: true
        });
      });
    },

    openCreateFavoriteImageModal(){
      this.newFavoriteImageTitle = '';
      this.newFavoriteImageContent = '';
    },

    createAgentFavoriteImage(){
      axios.post(constants.routes.backendAPI+'/createAgentFavoriteImage',
      {
        agentID: localStorage.getItem('agentID'),
        agentFavoriteImageTitle: this.newFavoriteImageTitle,
        agentFavoriteImageContent: this.newFavoriteImageContent,
      })
      .then(() =>{
        this.agentFavoriteImages.push({'title': this.newFavoriteImageTitle, 'content': this.newFavoriteImageContent});
        localStorage.setItem('agentFavoriteImages', JSON.stringify(this.agentFavoriteImages));
        this.$bvToast.toast('Se ha creado la imagen favorita "' + this.newFavoriteImageTitle + '" del agente.', {
          title: 'Imagen favorita del agente creada',
          variant: 'success',
          solid: true
        });
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al crear la imagen favorita del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear la imagen favorita del agente',
          variant: 'danger',
          solid: true
        });
      });
    },

    getAgentStatus(){
      axios.post(constants.routes.backendAPI+'/getAgentStatus', {'agentID': localStorage.getItem('agentID')})
        .then(response =>{ 
          if (response.data.agentStatus == 'online'){
            this.agentStatus = 'ONLINE';
          } else {
            this.agentStatus = 'OFFLINE';
          }
      })
      .catch(() =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar el estado del agente",
          variant: "danger",
          solid: true
        });
      });
    },

    getApplicationStatus(){
      axios.post(constants.routes.backendAPI+'/getApplicationStatus')
        .then(response =>{ 
          if (response.data.applicationStatus == 'on'){
            this.applicationStatus = 'ON';
          } else {
            this.applicationStatus = 'OFF';
            if (this.agentType == 'agent'){
              this.logoutUser();
            }
          }
      })
      .catch(() =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar el estado de la aplicación",
          variant: "danger",
          solid: true
        });
      });
    },


    changeWelcomeImage(){
      document.getElementById('welcomeImageDownloader').click();
    },

    changeProfilePicture(){
      document.getElementById('profilePictureFileDownloader').click();
    },

    changeNewFavoriteImage(){
      document.getElementById('newFavoriteImageFileDownloader').click();
    },
    
    uploadFiles(){
      var reader = new FileReader();
      this.file = this.$refs.imageFile.files[0]
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        this.agentWelcomeImage = reader.result;
      };
    },

    uploadProfilePicture(){
      var reader = new FileReader();
      this.file = this.$refs.profilePictureFile.files[0]
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        this.agentProfilePicture = reader.result;
      };
    },

    uploadNewFavoriteImage(){
      var reader = new FileReader();
      this.file = this.$refs.profilePictureFile.files[0]
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        this.newFavoriteImageContent = reader.result;
      };
    },

    getAgentStatusClass(){
      if (this.agentStatus == 'ONLINE'){
        return 'btn btn-icon btn-rounded btn-success mr-2';
      }
      return 'btn btn-icon btn-rounded btn-danger mr-2';
    },

    getApplicationStatusClass(){
      if (this.applicationStatus == 'ON'){
        return 'btn btn-icon btn-rounded btn-success mr-2';
      }
      return 'btn btn-icon btn-rounded btn-danger mr-2';
    },

    updateApplicationStatus(){
      var temp = '';
      if (this.applicationStatus == 'ON'){
        temp = 'off';
        this.applicationStatus = 'OFF';
      } else {
        temp = 'on';
        this.applicationStatus = 'ON';
      }
      axios.post(constants.routes.backendAPI+'/updateApplicationStatus',{
        applicationStatus: temp 
      })
      .then(() =>{ 
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al modificar el estado de la aplicación',
          variant: 'danger',
          solid: true
        });
      })
    },

    updateAgentStatus(){
      var temp = '';
      if (this.agentStatus == 'ONLINE'){
        temp = 'offline';
        this.agentStatus = 'OFFLINE';
      } else {
        temp = 'online';
        this.agentStatus = 'ONLINE';
      }
      axios.post(constants.routes.backendAPI+'/updateAgentStatus',{
        agentID: localStorage.getItem('agentID'),
        agentStatus: temp 
      })
      .then(() =>{ 
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al modificar el estado del agente',
          variant: 'danger',
          solid: true
        });
      })
    },


    ...mapActions([
      "changeSecondarySidebarProperties",

      "changeSidebarProperties",
      "changeThemeMode",
      "signOut"
    ]),

    handleFullScreen() {
      Util.toggleFullScreen();
    },
    logoutUser() {
      if (this.ranking == false){
        axios.post(constants.routes.backendAPI+'/updateAgentStatus',{
          agentID: localStorage.getItem('agentID'),
          agentStatus: 'offline' 
        })
        .then(() =>{ 
          localStorage.clear();
          router.push("/app/sessions/signIn");
        })
        .catch(error =>{
          console.log(error);
        })
    } else {
      localStorage.clear();
      router.push("/app/sessions/signIn");
    }
      
    },

    closeMegaMenu() {
      this.isMegaMenuOpen = false;
    },
    toggleMegaMenu() {
      this.isMegaMenuOpen = !this.isMegaMenuOpen;
    },
    toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen;
    },

    sideBarToggle(el) {
      if (
        this.getSideBarToggleProperties.isSideNavOpen &&
        this.getSideBarToggleProperties.isSecondarySideNavOpen &&
        isMobile
      ) {
        this.changeSidebarProperties();
        this.changeSecondarySidebarProperties();
      } else if (
        this.getSideBarToggleProperties.isSideNavOpen &&
        this.getSideBarToggleProperties.isSecondarySideNavOpen
      ) {
        this.changeSecondarySidebarProperties();
      } else if (this.getSideBarToggleProperties.isSideNavOpen) {
        this.changeSidebarProperties();
      } else if (
        !this.getSideBarToggleProperties.isSideNavOpen &&
        !this.getSideBarToggleProperties.isSecondarySideNavOpen &&
        !this.getSideBarToggleProperties.isActiveSecondarySideNav
      ) {
        this.changeSidebarProperties();
      } else if (
        !this.getSideBarToggleProperties.isSideNavOpen &&
        !this.getSideBarToggleProperties.isSecondarySideNavOpen
      ) {
        // console.log("4");

        this.changeSidebarProperties();
        this.changeSecondarySidebarProperties();
        // console.log("4");
      }
    }
  }
};
</script>

