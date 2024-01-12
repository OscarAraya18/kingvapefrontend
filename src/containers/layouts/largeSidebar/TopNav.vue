<template>
  <div class="main-header">


    <b-modal scrollable size="m" centered id="notificationModal" hide-header hide-footer no-close-on-backdrop>
      <div v-if="incomingNotification != null">
        <div style="display: flex;">
          <h5>NOTIFICACIÓN ENTRANTE:</h5>
          <div class="flex-grow-1" ></div>
          <i class="i-Close-Window text-25 text-danger" @click="closeNotification()" style="cursor: pointer"></i>
        </div>
        <br>
        <div>
          <strong>NOMBRE: </strong>{{incomingNotification.notificationName}}<br>
          <strong>NÚMERO: </strong>{{incomingNotification.notificationPhoneNumber}}<br>
          <strong>FECHA: </strong>{{parseHour(incomingNotification.notificationDateTime)}}<br>
        </div>
      </div>
    </b-modal>

    <b-modal scrollable size="m" centered id="createNotificationModal" hide-header hide-footer>
      <p style="font-size: medium;"><strong>Nombre:</strong></p>
      <b-form-textarea style="top: -10px; position: relative;" v-model="notificationName" class="mb-3"></b-form-textarea>
      <p style="font-size: medium;"><strong>Número:</strong></p>
      <b-form-input style="top: -10px; position: relative;" v-model="notificationPhoneNumber" class="mb-3"></b-form-input>
      <p style="font-size: medium;"><strong>Fecha:</strong></p>
      <b-form-datepicker style="top: -10px; position: relative;" v-model="notificationDate"></b-form-datepicker><br>
      <p style="font-size: medium; top: -7px; position: relative;"><strong>Hora:</strong></p>
      <b-form-timepicker style="top: -17px; position: relative;" v-model="notificationHour"></b-form-timepicker>
      <br>
      <div style="text-align: center; margin-bottom: 10px;">
        <button @click="insertNotification()" class="btn btn-primary mr-2">Crear notificación</button>        
      </div>

    </b-modal>

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

      <button @click="updateAgentStatus()" :class="getAgentStatusClass()" style="position:relative; left: -10px; font-size: medium;" v-if="ranking == false && agentStatus!=''"><strong>{{ agentStatus }}</strong></button>
      
      <b-dropdown v-if="ranking == false" id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
        <template slot="button-content">
          <i class="i-Bell header-icon d-sm-inline-block" style="margin-right: 15px; margin-bottom:5px;"></i>
        </template>
        <div class="dropdown-menu-right" aria-labelledby="userDropdown">
          <div v-for="notification in notifications" class="hover">
            <div style="width: 400px;">
              <div style="padding-left: 15px; padding-right: 15px; padding-top: 20px; padding-bottom: 20px;">
                <div style="display: flex;">
                  <div>
                    <strong>NOMBRE: </strong>{{notification.notificationName}}<br>
                    <strong>NÚMERO: </strong>{{notification.notificationPhoneNumber}}<br>
                    <strong>FECHA: </strong>{{parseHour(notification.notificationDateTime)}}<br>
                  </div>
                  <div class="flex-grow-1" ></div>
                  <div>
                    <i class="i-Close-Window text-25 text-danger" @click="deleteNotification(notification.notificationID)" style="cursor: pointer"></i>
                  </div>
                </div>
              </div>
              <hr style="margin: 0">
            </div>
          </div>
          <div v-b-modal.createNotificationModal class="hover" style="width: 400px; cursor: pointer; padding-left: 15px; padding-right: 15px; padding-top: 20px; padding-bottom: 20px; text-align: center;">
            <i class="i-Flag" style="margin-right: 5px;"></i>
            <strong>CREAR</strong>
          </div>
        </div>
      </b-dropdown>

      

      <div style="width: 50px; height: 50px; border-radius: 100%; margin-right: 15px;" v-if="ranking == false">
        <b-dropdown id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
          <template slot="button-content">
            <img v-if="agentProfileImage!=''" :src="`data:image/png;base64,${agentProfileImage}`" style="width: 50px; height: 50px; border-radius: 100%;">
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
        <b-card v-if="loaderPerfil == false">
          <div style="display: flex;">
            <div style="width: 200px;">
              <img v-if="agentProfileImage!=''" :src="`data:image/png;base64,${agentProfileImage}`" style="width: auto; height: 250px; cursor: pointer;" id="tooltip-target-1" @click="changeProfilePicture()">
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

        <div v-else style="text-align: center;">
          <br><br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
      </b-collapse>

      <br><br>

      <b-button v-b-toggle.automaticMessagesCollapseMenu style="width: 100%; font-size: large; background-color: #F9E530;">Mensajes automáticos</b-button>
      <b-collapse id="automaticMessagesCollapseMenu">
        <b-card>
          <div>
            <p style="font-size: medium;"><strong>Mensaje de bienvenida:</strong></p>
            <b-form-textarea v-model="agentStartMessage" placeholder="Mensaje de bienvenida" rows="3"></b-form-textarea>
            Estaré encantada de atenderte el día de hoy ☺️
            <br><br>
            <p style="font-size: medium;"><strong>Mensaje de despedida:</strong></p>
            <b-form-textarea v-model="agentEndMessage" placeholder="Mensaje de despedida" rows="3"></b-form-textarea>
            Lo más importante para nosotros es la atención del cliente. Puede calificarnos accediendo al siguiente enlace: https://kingvapecr.com/pages/feedback
            <br><br>
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
              <p style="font-size: medium;"><strong>{{agentFavoriteMessage.agentFavoriteMessageName}}</strong></p>
              <div style="right: 0; position: absolute; margin-right: 20px;">
              <i @click="updateAgentFavoriteMessage(agentFavoriteMessage)" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
              <i @click="deleteAgentFavoriteMessage(agentFavoriteMessage)" class="i-Close-Window text-25 ml-2 text-danger" style="cursor: pointer"></i>
              </div>
            </div>
            <b-form-textarea v-model="agentFavoriteMessage.agentFavoriteMessageTextMessageBody" placeholder="Contenido del mensaje favorito" rows="3"></b-form-textarea>
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

      loaderPerfil: false,

      agentType: '',

      ranking: false,
      isDisplay: true,

      file: null,
      profilePictureFile: null,

      isStyle: true,
      isSearchOpen: false,
      isMegaMenuOpen: false,

      agentName: '',
      agentProfileImage: '',
      agentDefaultProfilePicture: ``,
      agentUsername: '',
      agentPassword: '',
      agentStartMessage: '',
      agentWelcomeImage: '',
      agentEndMessage: '',
      agentFavoriteMessages: [],
      agentFavoriteImages: [],

      newFavoriteMessageTitle: '',
      newFavoriteMessageContent: '',

      newFavoriteImageTitle: '',
      newFavoriteImageContent: '',


      notifications: [],

      notificationName: '',
      notificationPhoneNumber: '',
      notificationDate: null,
      notificationHour: null,
      incomingNotification: null
    };
  },
  mounted() {
    
    if (localStorage.getItem('ranking') != 'yes'){
      const notificationInterval = setInterval(() => {
        for (var notificationIndex in this.notifications){
          const notificationDate = new Date(this.notifications[notificationIndex].notificationDateTime);
          if (notificationDate <= new Date()){
            if (this.notifications[notificationIndex]['notificationUsed'] == false){
              this.notifications[notificationIndex]['notificationUsed'] = true;
              this.$root.$emit('bv::show::modal', 'notificationModal');
              var soundToPlay = new Audio(require('../../../assets/pageAssets/notification.wav'));
              soundToPlay.play();
              this.incomingNotification = this.notifications[notificationIndex];
              axios.post(constants.routes.backendAPI+'/useNotification',
              {
                notificationID: this.notifications[notificationIndex]['notificationID']
              })
              .then((response) =>{ 
                console.log(response.data);
                if (response.data.success){
                  this.selectAgentNotifications();
                } else {
                  this.$bvToast.toast('Ha ocurrido un error inesperado al recibir la notificación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
                    title: 'Error al al recibir la notificación',
                    variant: 'danger',
                    solid: true
                  });
                }
              })
              .catch((error) =>{
                this.$bvToast.toast('Ha ocurrido un error inesperado al recibir la notificación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
                  title: 'Error al recibir la notificación',
                  variant: 'danger',
                  solid: true
                });
              });
            }
          }
        }
      }, 1000);

      this.selectApplicationStatus();
      this.selectAgentNotifications();
      this.agentType = localStorage.getItem('agentType');
      this.agentName = localStorage.getItem('agentName');
      this.agentProfileImage = localStorage.getItem('agentProfileImage');
      this.agentUsername = localStorage.getItem('agentUsername');
      this.agentPassword = localStorage.getItem('agentPassword');
      this.agentStartMessage = localStorage.getItem('agentStartMessage');
      this.agentEndMessage = localStorage.getItem('agentEndMessage');
      this.agentFavoriteMessages = JSON.parse(localStorage.getItem('agentFavoriteMessages'));
      this.agentDefaultProfilePicture = constants.agentDefaultProfilePicture;

      this.selectAgentStatus();

      try {
        webSocket.onmessage = (websocketMessage) => {
          const websocketMessageJSON = JSON.parse(websocketMessage.data);
          const websocketMessageID = websocketMessageJSON.websocketMessageID;
          const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;
          if (websocketMessageID == '/updateAgentStatus'){
            if (websocketMessageContent.agentID == localStorage.getItem('agentID')){
              if (websocketMessageContent.agentStatus == 'online'){
                this.agentStatus = 'ONLINE';
              } else {
                this.agentStatus = 'OFFLINE';
              }
            }
          } else if (websocketMessageID == '/updateApplicationStatus'){
            if (localStorage.getItem('agentType') == 'agent'){
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
    deleteNotification(notificationID){
      axios.post(constants.routes.backendAPI+'/deleteNotification',
      {
        notificationID: notificationID
      })
      .then((response) =>{ 
        if (response.data.success){
          this.selectAgentNotifications();
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al eliminar la notificación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al eliminar la notificación',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al eliminar la notificación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al eliminar la notificación',
          variant: 'danger',
          solid: true
        });
      });
    },

    closeNotification(){
      this.$root.$emit('bv::hide::modal', 'notificationModal');
    },

    selectAgentNotifications(){
      axios.post(constants.routes.backendAPI+'/selectAgentNotifications',
      {
        notificationAgentID: localStorage.getItem('agentID')
      })
      .then((response) =>{ 
        if (response.data.success){
          this.notifications = response.data.result;
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las notificaciones del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al consultar las notificaciones del agente',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las notificaciones del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al consultar las notificaciones del agente',
          variant: 'danger',
          solid: true
        });
      });
    },


    insertNotification(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.notificationName) && regularExpressionChecker.test(this.notificationPhoneNumber) && regularExpressionChecker.test(this.notificationDate) && regularExpressionChecker.test(this.notificationHour)){
        const dateTimeString = `${this.notificationDate} ${this.notificationHour}`;
        const dateObject = new Date(dateTimeString);
        axios.post(constants.routes.backendAPI+'/insertNotification',
        {
          notificationAgentID: localStorage.getItem('agentID'),
          notificationName: this.notificationName,
          notificationPhoneNumber: this.notificationPhoneNumber,
          notificationDate: this.notificationDate,
          notificationHour: this.notificationHour
        })
        .then((response) =>{ 
          this.$bvToast.toast('Se ha creado la notificación exitosamente', {
            title: 'Notificación creada',
            variant: 'success',
            solid: true
          });
          this.selectAgentNotifications();
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al crear la notificación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al editar crear la notificación',
            variant: 'danger',
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido de la información de la notificación no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear la notificación',
          variant: 'danger',
          solid: true
        });
      }
      
    },
    
    parseHour(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      var formattedDate = parsingDate.toLocaleString('en-GB', options);
      if (formattedDate.slice(-2) == 'am'){
        formattedDate = formattedDate.slice(0,-2) + 'AM'
      } else if (formattedDate.slice(-2) == 'pm') {
        formattedDate = formattedDate.slice(0,-2) + 'PM'
      }
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },
  
    updateAgentLoginCredentials(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.agentUsername) && regularExpressionChecker.test(this.agentPassword)){
        this.loaderPerfil = true;
        axios.post(constants.routes.backendAPI+'/updateAgentLoginCredentials',
        {
          agentID: parseInt(localStorage.getItem('agentID')),
          agentProfileImage: this.agentProfileImage,
          agentUsername: this.agentUsername,
          agentPassword: this.agentPassword 
        })
        .then((response) =>{ 
          if (response.data.success){
            this.loaderPerfil = false;
            localStorage.setItem('agentUsername', response.data.result.agentUsername);
            localStorage.setItem('agentPassword', response.data.result.agentPassword);
            localStorage.setItem('agentProfileImage', response.data.result.agentProfileImage);
            this.$bvToast.toast('Se ha editado la información del agente.', {
              title: 'Información del agente editada',
              variant: 'success',
              solid: true
            });
          } else {
            this.$bvToast.toast('Ha ocurrido un error inesperado al editar la información del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
              title: 'Error al editar la información del agente',
              variant: 'danger',
              solid: true
            });
          }
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al editar la información del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al editar la información del agente',
            variant: 'danger',
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido de la información del agente no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar la información del agente',
          variant: 'danger',
          solid: true
        });
      }
    },
   
    updateAgentAutomaticMessages(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.agentStartMessage) && regularExpressionChecker.test(this.agentEndMessage)){
        axios.post(constants.routes.backendAPI+'/updateAgentAutomaticMessages',
        {
          agentID: localStorage.getItem('agentID'),
          agentStartMessage: this.agentStartMessage,
          agentEndMessage: this.agentEndMessage 
        })
        .then((response) =>{ 
          console.log(response.data);

          localStorage.setItem('agentStartMessage', response.data.result.agentStartMessage);
          localStorage.setItem('agentEndMessage', response.data.result.agentEndMessage);
          this.$bvToast.toast('Se han editados sus mensajes exitosamente.', {
            title: 'Mensajes automáticos del agente editados',
            variant: 'success',
            solid: true
          });
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al editar los mensajes automáticos del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al editar los mensajes automáticos del agente',
            variant: 'danger',
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido de los mensajes automáticos no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar los mensajes automáticos del agente',
          variant: 'danger',
          solid: true
        });
      }
    },
    
    updateAgentFavoriteMessage(updatedAgentFavoriteMessage){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(updatedAgentFavoriteMessage.agentFavoriteMessageTextMessageBody)){
        axios.post(constants.routes.backendAPI+'/updateAgentFavoriteMessage',
        {
          agentFavoriteMessageID: updatedAgentFavoriteMessage.agentFavoriteMessageID,
          agentID: updatedAgentFavoriteMessage.agentFavoriteMessageAgentID,
          agentFavoriteMessageTextMessageBody: updatedAgentFavoriteMessage.agentFavoriteMessageTextMessageBody
        })
        .then((response) =>{
          localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
          this.$bvToast.toast('Se ha editado el mensaje favorito "' + updatedAgentFavoriteMessage.agentFavoriteMessageName + '" del agente.', {
            title: 'Mensajes favorito del agente editado',
            variant: 'success',
            solid: true
          });
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al editar el mensaje favorito del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al editar el mensaje favorito del agente',
            variant: 'danger',
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido del mensaje favorito no puede estar vacío. Por favor complete el espacio requerido e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar el mensaje favorito del agente',
          variant: 'danger',
          solid: true
        });
      }
    },

    deleteAgentFavoriteMessage(deletedAgentFavoriteMessage){
      axios.post(constants.routes.backendAPI+'/deleteAgentFavoriteMessage',
      {
        agentFavoriteMessageID: deletedAgentFavoriteMessage.agentFavoriteMessageID
      })
      .then((response) =>{
        this.agentFavoriteMessages = this.agentFavoriteMessages.filter(agentFavoriteMessage => agentFavoriteMessage.agentFavoriteMessageID != deletedAgentFavoriteMessage.agentFavoriteMessageID);
        localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
        this.$bvToast.toast('Se ha eliminado el mensaje favorito "' + deletedAgentFavoriteMessage.agentFavoriteMessageName + '" del agente.', {
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
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.newFavoriteMessageTitle) && regularExpressionChecker.test(this.newFavoriteMessageContent)){
        axios.post(constants.routes.backendAPI+'/insertAgentFavoriteMessage',
        {
          agentFavoriteMessageAgentID: parseInt(localStorage.getItem('agentID')),
          agentFavoriteMessageName: this.newFavoriteMessageTitle,
          agentFavoriteMessageTextMessageBody: this.newFavoriteMessageContent,
        })
        .then((response) =>{
          this.agentFavoriteMessages.push
          ({
            'agentFavoriteMessageID': response.data.result.agentFavoriteMessageID, 
            'agentFavoriteMessageAgentID': response.data.result.agentFavoriteMessageAgentID,
            'agentFavoriteMessageName': response.data.result.agentFavoriteMessageName,
            'agentFavoriteMessageTextMessageBody': response.data.result.agentFavoriteMessageTextMessageBody,
          });
          localStorage.setItem('agentFavoriteMessages', JSON.stringify(this.agentFavoriteMessages));
          this.newFavoriteMessageContent = '';
          this.newFavoriteMessageTitle = '';
          this.$bvToast.toast('Se ha creado el mensaje favorito "' + response.data.result.agentFavoriteMessageName + '" del agente.', {
            title: 'Mensaje favorito del agente creado',
            variant: 'success',
            solid: true
          });
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al crear el mensaje favorito del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al crear el mensaje favorito del agente',
            variant: 'danger',
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido del mensaje favorito puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el mensaje favorito del agente',
          variant: 'danger',
          solid: true
        });
      }
    },

    selectAgentStatus(){
      axios.post(constants.routes.backendAPI+'/selectAgentStatus', {'agentID': parseInt(localStorage.getItem('agentID'))})
        .then((response) => { 
          if (response.data.success){
            if (response.data.result.agentStatus == 'online'){
              this.agentStatus = 'ONLINE';
            } else {
              this.agentStatus = 'OFFLINE';
            }
          } else {
            this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al consultar el estado del agente",
              variant: "danger",
              solid: true
            });
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

    selectApplicationStatus(){
      axios.post(constants.routes.backendAPI+'/selectApplicationStatus')
      .then((response) =>{ 
        if (response.data.success){
          if (response.data.result){
            this.applicationStatus = 'ON';
          } else {
            this.applicationStatus = 'OFF';
            if (this.agentType == 'agent'){
              this.logoutUser();
            }
          }
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al consultar el estado de la aplicación",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar el estado de la aplicación",
          variant: "danger",
          solid: true
        });
      });
    },

    changeProfilePicture(){
      document.getElementById('profilePictureFileDownloader').click();
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
        this.agentProfileImage = reader.result.split(',')[1];
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
      axios.post(constants.routes.backendAPI+'/updateApplicationStatus',
      {
        active: this.applicationStatus 
      })
      .then((response) =>{ 
        if (response.data.success){
          if (this.applicationStatus == 'ON'){
            this.applicationStatus = 'OFF';
          } else {
            this.applicationStatus = 'ON';
          }
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al modificar el estado de la aplicación',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado de la aplicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al modificar el estado de la aplicación',
          variant: 'danger',
          solid: true
        });
      })
    },

    updateAgentStatus(){
      var updatedAgentStatus = '';
      if (this.agentStatus == 'ONLINE'){
        updatedAgentStatus = 'offline';
        this.agentStatus = 'OFFLINE';
      } else {
        updatedAgentStatus = 'online';
        this.agentStatus = 'ONLINE';
      }
      axios.post(constants.routes.backendAPI+'/updateAgentStatus',{
        agentID: parseInt(localStorage.getItem('agentID')),
        agentStatus: updatedAgentStatus,
        agentName: localStorage.getItem('agentName')
      })
      .then((response) => {
        if (response.data.success){
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al modificar el estado del agente',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) => {
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
        .then((response) =>{ 
          if (response.data.success){
            localStorage.clear();
            router.push("/app/sessions/signIn");
          } else {
            this.$bvToast.toast('Ha ocurrido un error inesperado al cerrar su sesión. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
              title: 'Error al cerrar su sesión',
              variant: 'danger',
              solid: true
            });
          }
        })
        .catch((error) =>{
          this.$bvToast.toast('Ha ocurrido un error inesperado al cerrar su sesión. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al cerrar su sesión',
            variant: 'danger',
            solid: true
          });
        })
      } else {
        localStorage.clear();
        router.push("/app/sessions/signIn");
      }
      
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

        this.changeSidebarProperties();
        this.changeSecondarySidebarProperties();
      }
    }
  }
};
</script>

<style>
  .hover {
      transition: background-color 0.3s ease-in-out;
    }

  .hover:hover {
    background-color: #ebebeb;
  }
</style>

