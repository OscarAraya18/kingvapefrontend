<template>
  <div class="main-header">
    <b-modal id="generalMapModal" size="lg" centered hide-header hide-footer>
      <MapComponent mapHeight="450px" mapWidth="100%"></MapComponent>
    </b-modal>

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

    <div class="logo" v-if="agentType != 'localityAgent'">
      <a href="https://www.kingvapecr.com" target="_blank">
        <img src="@/assets/images/logo.webp" alt style="width: 80px; height: auto; margin-left: 35px;"/>
      </a>
    </div>
    <i v-if="agentType != 'localityAgent'" class="i-Sidebar-Window header-icon d-sm-inline-block" style="margin-left: 10px;" @click="sideBarToggle"></i>
    <i v-if="agentType != 'localityAgent'" class="i-Full-Screen header-icon d-sm-inline-block" @click="handleFullScreen"></i>

    <div v-else>
      <b-badge style="font-size: x-large;" pill variant="success">{{ todayInvoices }}</b-badge>
    </div>

    <div style="margin: auto"></div>



    <div class="header-part-right">
      <!--
      <button @click="updateApplicationNotification()" :class="getApplicationNotificationClass()" style="position:relative; left: -100px; font-size: medium;" v-if="(ranking == false) && (agentType == 'admin')"><strong>{{ applicationNotification }}</strong></button>
      -->

      <button @click="updateApplicationStatus()" :class="getApplicationStatusClass()" style="position:relative; left: -10px; font-size: medium;" v-if="(ranking == false) && (agentType == 'admin')"><strong>{{ applicationStatus }}</strong></button>
      
      <button @click="updateAgentStatus()" :class="getAgentStatusClass()" style="position:relative; left: -10px; font-size: medium;" v-if="ranking == false && agentStatus!='' && agentName != 'Pantalla' && agentName != 'Mile Cruz'"><strong>{{ agentStatus }}</strong></button>
      

      <div style="width: 50px; height: 50px; border-radius: 100%; margin-right: 15px;" v-if="ranking == false">
        <b-dropdown id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
          <template slot="button-content">
            <img v-if="agentProfileImage!=''" :src="`data:image/png;base64,${agentProfileImage}`" style="width: 50px; height: 50px; border-radius: 100%;">
            <img v-else :src="agentDefaultProfilePicture" style="width: 50px; height: 50px; border-radius: 100%;">

          </template>
          <div class="dropdown-menu-right" aria-labelledby="userDropdown">
            <a class="dropdown-item" href="#" v-if="locality == false && localityAgent == false && agentName != 'Mile Cruz'" v-b-modal.updateProfileModal style="font-size: medium;">Modificar perfil</a>
            <a class="dropdown-item" href="#" @click.prevent="logoutUser" style="font-size: medium;">Cerrar sesión</a>
            
            <div style="display: flex; margin-right: 10px; margin-top: 10px;">
              <div class="flex-grow-1"></div>
              <h6>v {{ applicationVersion }}</h6>
            </div>
          </div>
        </b-dropdown>
      </div>
    </div>

    <b-modal scrollable size="m" hide-header hide-footer centered id="updateProfileModal">
      
      <b-button v-b-toggle.profileCollapseMenu style="width: 100%; font-size: large;">Perfil</b-button>
      <b-collapse id="profileCollapseMenu">
        <b-card v-if="loaderPerfil == false">
          <div style="display: flex;">
            <div style="width: 200px;">
              <img v-if="agentProfileImage!=''" :src="`data:image/png;base64,${agentProfileImage}`" style="width: auto; height: 210px; cursor: pointer;" id="tooltip-target-1" @click="changeProfilePicture()">
              <img v-else :src="agentDefaultProfilePicture" style="width: auto; height: 210x; cursor: pointer;" id="tooltip-target-1" @click="changeProfilePicture()">

              <input type="file" accept="image/png, image/jpeg" @change="uploadProfilePicture()" ref="profilePictureFile" style="display: none;" id="profilePictureFileDownloader">
              <b-tooltip target="tooltip-target-1" triggers="hover">Click para cambiar la foto de perfil</b-tooltip>
            </div>
            <div style="margin-left: 30px;">
              <p style="font-size: medium; margin-bottom: 5px;"><strong>Nombre de usuario:</strong></p>
              <b-form-input v-model="agentUsername" placeholder="Nombre de usuario"></b-form-input>
              <br>
              <p style="font-size: medium; margin-bottom: 5px;"><strong>Contraseña:</strong></p>
              <b-form-input v-model="agentPassword" placeholder="Contraseña"></b-form-input>
              <br>
              <button @click="updateAgentLoginCredentials()" class="btn btn-icon" style="background-color: #F9E530; font-size: 15px; width: 100%;"><i class="i-Data-Save" style="margin-right: 5px;"></i>Guardar</button>
            </div>
          </div>
        </b-card>

        <div v-else style="text-align: center;">
          <br><br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
      </b-collapse>

      <div>
        <br>
        <b-button v-b-toggle.favoriteMessagesCollapseMenu style="width: 100%; font-size: large; background-color: #F9E530;">Mensajes favoritos</b-button>
        <b-collapse id="favoriteMessagesCollapseMenu">
          <b-card>
            <div v-for="agentFavoriteMessage in agentFavoriteMessages">
              <div style="display: flex; margin-bottom: -8px;">
                <p style="font-size: medium;"><strong>{{agentFavoriteMessage.agentFavoriteMessageName}}</strong></p>
                <div style="right: 0; position: absolute; margin-right: 20px;">
                  <i @click="updateAgentFavoriteMessage(agentFavoriteMessage)" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
                  <i @click="deleteAgentFavoriteMessage(agentFavoriteMessage)" class="i-Close-Window text-25 ml-2 text-danger" style="cursor: pointer"></i>
                </div>
              </div>
              <b-form-textarea style="margin-bottom: 10px;" v-model="agentFavoriteMessage.agentFavoriteMessageTextMessageBody" placeholder="Contenido del mensaje favorito" rows="3"></b-form-textarea>
              <br>
            </div>
            <div style="text-align: center;">
              <button @click="openCreateFavoriteMessageModal()" v-b-modal.newFavoriteMessageModal class="btn btn-icon" style="background-color: #F9E530; font-size: 15px"><i class="i-Data-Save"></i> Nuevo mensaje favorito</button>
              <b-modal scrollable size="sm" centered id="newFavoriteMessageModal" title="Nuevo mensaje favorito" @ok="createAgentFavoriteMessage()">
                <b-form-input v-model="newFavoriteMessageTitle" placeholder="Título del nuevo mensaje favorito"></b-form-input>
                <br>
                <b-form-textarea v-model="newFavoriteMessageContent" placeholder="Contenido del nuevo mensaje favorito" rows="3"></b-form-textarea>
              </b-modal>
            </div>
          </b-card>
        </b-collapse>
      </div>

      <div v-if="agentType=='admin'">
        <br>
        <b-button v-b-toggle.adminCollapseMenu style="width: 100%; font-size: large; background-color: #F9E530;">Variables de entorno</b-button>
        <b-collapse id="adminCollapseMenu">
          <b-card>
            
            <div style="display: flex;">
              <p style="font-size: medium; margin-bottom: 5px;"><strong>URL del servidor:</strong></p>
              <div style="right: 0; position: absolute; margin-right: 20px;">
                <i @click="updateBackendURL()" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
              </div>
            </div>
            <b-form-input v-model="backendURLInput" placeholder="URL del servidor"></b-form-input>

            <br>

            <div style="display: flex;">
              <p style="font-size: medium; margin-bottom: 5px;"><strong>URL del websocket:</strong></p>
              <div style="right: 0; position: absolute; margin-right: 20px;">
                <i @click="updateWebsocketURL()" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
              </div>
            </div>
            <b-form-input v-model="websocketURLInput" placeholder="URL del servidor"></b-form-input>

            <br>

            <div style="display: flex;">
              <p style="font-size: medium; margin-bottom: 5px;"><strong>Token del API:</strong></p>
              <div style="right: 0; position: absolute; margin-right: 20px;">
                <i @click="updateTokenAPI()" class="i-Eraser-2 text-25 text-success ml-2" style="cursor: pointer"></i>
              </div>
            </div>
            <b-form-textarea rows="3" v-model="tokenAPI" placeholder="Token del API"></b-form-textarea>

          </b-card>
        </b-collapse>
      </div>

    </b-modal>

    <div style="position: fixed; bottom: 200px; right: 18px;" v-if="(ranking == false) && (locality == false) && (localityAgent == false) && (agentName != 'Mile Cruz')">
      <img v-b-modal.generalMapModal  class="hoverAnimationTranslator" style="cursor: pointer; width: 40px; height: 40px; position: relative; top: 10px;" src="@/assets/pageAssets/map.png">
    </div>


    <div style="position: fixed; bottom: 140px; right: 15px;">
      <b-dropdown dropup v-if="(ranking == false) && (locality == false) && (localityAgent == false) && (agentName != 'Mile Cruz')" id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
        <template slot="button-content">
          <img class="hoverAnimationTranslator" id="traductorButton" style="cursor: pointer; width: 45px; height: 40px; position: relative; top: 10px;" src="@/assets/icons/notification.png">
        </template>
        <div class="dropdown-menu-right" aria-labelledby="userDropdown">
          <div v-for="notification in notifications" class="hover">
            <div style="width: 350px;">
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
          <div v-b-modal.createNotificationModal class="hover" style="width: 350px; cursor: pointer; padding-left: 15px; padding-right: 15px; padding-top: 20px; padding-bottom: 20px; text-align: center;">
            <i class="i-Flag" style="margin-right: 5px;"></i>
            <strong>CREAR</strong>
          </div>
        </div>
      </b-dropdown>
    </div>

    
    <div style="position: fixed; bottom: 80px; right: 20px;">
      <b-dropdown v-if="(ranking == false) && (locality == false) && (localityAgent == false) && (agentName != 'Mile Cruz')" id="dropdown-1" text="Dropdown Button" class="align-self-end" toggle-class="text-decoration-none" no-caret variant="link">
        <template slot="button-content">
          <img class="hoverAnimationTranslator" id="traductorButton" style="cursor: pointer; width: 35px; height: 40px; position: relative; top: 10px;" src="@/assets/traductor.png">
        </template>
        <div class="dropdown-menu-right" aria-labelledby="userDropdown" style="width: 350px;">
          <div style="padding: 15px;">
            <b-form-textarea autofocus v-model="traduceInput" placeholder="Mensaje de bienvenida" rows="4"></b-form-textarea>
            <br>
            <div style="display: flex;">
              <div>
                <b-form-radio-group
                  style="position: relative; left: 0px;"
                  v-model="selectedLanguage"
                  :options="languageOptions"
                ></b-form-radio-group>
              </div>
              <div class="flex-grow-1"></div>
              <b-button @click="traduce()" variant="info">Traducir</b-button>
            </div>
          </div>
        </div>
      </b-dropdown>
    </div>

    <div style="position: fixed; bottom: 30px; right: 20px;" v-if="(ranking == false) && (locality == false) && (localityAgent == false) && (agentName != 'Mile Cruz')">
      <img @click="startRecording()" v-if="recordingScreen == false" class="hoverAnimationTranslator" id="traductorButton" style="cursor: pointer; width: 35px; height: 40px; position: relative; top: 10px;" src="@/assets/icons/recordScreen.png">
      <img @click="stopRecording()" v-else class="hoverAnimationTranslator" id="traductorButton" style="cursor: pointer; width: 35px; height: 40px; position: relative; top: 10px;" src="@/assets/icons/recordingScreen.png">
    </div>


    
  </div>
</template>


<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Util from "@/utils";
import Sidebar from "./Sidebar";
import searchComponent from "../common/search";
import { isMobile } from "mobile-device-detect";
import { mixin as clickaway } from "vue-clickaway";
import router from "../../../router";
import axios from 'axios';
import MapComponent from "../../../components/mapComponent.vue";
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:payitcr.com');

export default {
  mixins: [clickaway],
  components: {
    Sidebar,
    searchComponent,
    MapComponent
  },

  data() {
    return {
      applicationNotification: '',


      cartagoMap: [],
      cartagoMapOptions: {
        strokeColor: "#55b5ab",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#55b5ab",
        fillOpacity: 0.4,
      },

      zapoteMap: [],
      zapoteMapOptions: {
        strokeColor: "#fed330",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#fed330",
        fillOpacity: 0.4,
      },

      herediaMap: [],
      herediaMapOptions: {
        strokeColor: "#a78dcc",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#a78dcc",
        fillOpacity: 0.4,
      },

      escazuMap: [],
      escazuMapOptions: {
        strokeColor: "#db67a3",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#db67a3",
        fillOpacity: 0.4,
      },

      redMap: [],
      redMapOptions: {},

      agentStatus: '',
      applicationStatus: '',


      loaderPerfil: false,

      agentType: '',

      ranking: false,

      locality: false,
      localityAgent: false,

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
      incomingNotification: null,


      traduceInput: '',
      traduceLoader: false,

      selectedLanguage: 'EN',
      languageOptions: [{ text: 'Traducir al inglés', value: 'EN' },{ text: 'Traducir al español', value: 'ES' }],


      recordingScreen: false,
      screenRecorder: null,
      recordedScreenChunks: [],

      backendURLInput: '',
      websocketURLInput: '',
      tokenAPI: '',


      todayInvoices: 0,

      applicationVersion: 0

    };
  },

  mounted() {
    this.cartagoMap = constants.routes.cartagoMap;
    this.herediaMap = constants.routes.herediaMap;
    this.zapoteMap = constants.routes.zapoteMap;
    this.escazuMap = constants.routes.escazuMap;

    this.redMap = constants.routes.redMap;
    this.redMapOptions = constants.routes.redMapOptions;


    this.backendURLInput = this.$store.getters.getBackendURL;
    this.websocketURLInput = this.$store.getters.getWebsocketURL;

    this.applicationVersion = this.$store.getters.getApplicationVersion;

    this.agentType = localStorage.getItem('agentType');

    if (localStorage.getItem('ranking') != 'yes' && (localStorage.getItem('locality') != 'yes') && (localStorage.getItem('agentType') != 'localityAgent')){

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

      if (this.agentType == 'admin'){
        this.selectApplicationNotification();
      }
      this.selectApplicationStatus();

      //this.selectAgentNotifications();
      this.agentName = localStorage.getItem('agentName');
      this.agentProfileImage = localStorage.getItem('agentProfileImage');
      this.agentUsername = localStorage.getItem('agentUsername');
      this.agentPassword = localStorage.getItem('agentPassword');
      this.agentStartMessage = localStorage.getItem('agentStartMessage');
      this.agentEndMessage = localStorage.getItem('agentEndMessage');
      this.agentFavoriteMessages = JSON.parse(localStorage.getItem('agentFavoriteMessages'));

      this.selectAgentStatus();

      try {
        webSocket.onmessage = (websocketMessage) => {
          const websocketMessageJSON = JSON.parse(websocketMessage.data);
          const websocketMessageID = websocketMessageJSON.websocketMessageID;
          const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;
          if (websocketMessageID == '/agent/update/agentStatus'){
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

    if (localStorage.getItem('locality') == 'yes'){
      this.locality = true;
      this.ranking = false;
      this.agentProfileImage = '';
      this.agentDefaultProfilePicture = constants.routes.agentDefaultProfilePicture;
    }

    if (localStorage.getItem('agentType') == 'localityAgent'){
      this.localityAgent = true;
      this.ranking = false;
      this.agentProfileImage = '';
      this.agentDefaultProfilePicture = constants.routes.agentDefaultProfilePicture;
      this.getTodayInvoices();
    }
    
  
  },
  computed: {
    ...mapGetters(["getSideBarToggleProperties"]),
  },

  created(){
    window.addEventListener('beforeunload', (event) => {
        if (this.recordingScreen){
          event.preventDefault();
          event.returnValue = 'Si actualiza la página, se perderá el progreso de la grabación de pantalla en curso. Si desea continuar, por favor, detenga la grabación';
        }
      });
  },

  methods: {
    updateEdited(mvcArray) {
      let paths = [];
      for (let i=0; i<mvcArray.getLength(); i++) {
        let path = [];
        for (let j=0; j<mvcArray.getAt(i).getLength(); j++) {
          let point = mvcArray.getAt(i).getAt(j);
          path.push({lat: point.lat(), lng: point.lng()});
        }
        paths.push(path);
      }
      console.log(paths);
    },


    getTodayInvoices(){
      axios.post('https://payitcr.com/selectTodayLocalityAgentShippedInvoices',
      {
        whatsappInvoiceLocalityAgentID: localStorage.getItem('localityAgentID')
      })
      .then((response) =>{ 
        if (response.data.success){
          this.todayInvoices = response.data.result[0].result;
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las comandas entregadas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al consultar las comandas entregadas',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las comandas entregadas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al consultar las comandas entregadas',
          variant: 'danger',
          solid: true
        });
      });
    },

    updateBackendURL(){
      console.log(this.$store.state.database.backendURL);
      this.$store.commit('updateBackendURL', this.backendURLInput);
      console.log(this.$store.state.database.backendURL);
    },  


    startRecording(){
      navigator.mediaDevices.getDisplayMedia({ video: {
      width: { ideal: 1280  },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },})
        .then(stream => {
          this.screenRecorder = new MediaRecorder(stream);
          this.screenRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              this.recordedScreenChunks.push(event.data);
            }
          };
          this.screenRecorder.onstop = () => {
            const blob = new Blob(this.recordedScreenChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = new Date().toString();;
            downloadLink.click();
            this.recordedScreenChunks = [];
            URL.revokeObjectURL(url);
          };
          this.screenRecorder.start();
          this.recordingScreen = true;
        })
        .catch(error => {
          console.error('Error accessing screen:', error);
        });
    },

    stopRecording() {
      this.screenRecorder.stop();
      this.recordingScreen = false;
    },


    traduce(){
      axios.post(constants.routes.backendAPI+'/traduceText',
      {
        textToTraduce: this.traduceInput,
        languageToTraduce: this.selectedLanguage
      })
      .then((response) =>{ 
        if (response.data.success){
          this.traduceInput = response.data.result;
          navigator.clipboard.writeText(response.data.result);
          this.$bvToast.toast('Se ha traducido y copiado el texto exitosamente.', {
            title: 'Texto traducido',
            variant: 'success',
            solid: true
          });
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al traducir. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al traducir',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al traducir. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al traducir',
          variant: 'danger',
          solid: true
        });
      });
    },


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
        axios.post(constants.routes.backendAPI+'/agent/update/loginCredentials',
        {
          agentID: parseInt(localStorage.getItem('agentID')),
          'agentProfileImageAsBase64': this.agentProfileImage,
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
        axios.post(constants.routes.backendAPI+'/agent/update/automaticMessages',
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


    selectApplicationNotification(){
      axios.post(constants.routes.backendAPI+'/selectApplicationNotification')
      .then((response) =>{ 
        if (response.data.success){
          if (response.data.result){
            this.applicationNotification = 'ALLOW NOTIFICATIONS';
          } else {
            this.applicationNotification = 'DECLINE NOTIFICATIONS';
          }
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado de las notificaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al consultar el estado de las notificaciones",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar el estado de las notificaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar el estado de las notificaciones",
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

    getApplicationNotificationClass(){
      if (this.applicationNotification == 'ALLOW NOTIFICATIONS'){
        return 'btn btn-icon btn-rounded btn-info mr-2';
      }
      return 'btn btn-icon btn-rounded btn-warning mr-2';
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


    updateApplicationNotification(){
      axios.post(constants.routes.backendAPI+'/updateApplicationNotification',
      {
        notification: this.applicationNotification 
      })
      .then((response) =>{ 
        if (response.data.success){
          if (this.applicationNotification == 'ALLOW NOTIFICATIONS'){
            this.applicationNotification = 'DECLINE NOTIFICATIONS';
          } else {
            this.applicationNotification = 'ALLOW NOTIFICATIONS';
          }
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado de las notificaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al modificar el estado de las notificaciones',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al modificar el estado de las notificaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al modificar el estado de la notificaciones',
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
      axios.post(constants.routes.backendAPI+'/agent/update/agentStatus',{
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
        if (this.locality == true || this.agentType == 'localityAgent'){
          localStorage.clear();
          router.push("/app/sessions/signIn");
        } else {
          axios.post(constants.routes.backendAPI+'/agent/update/agentStatus',{
            agentID: localStorage.getItem('agentID'),
            agentStatus: 'offline' 
          })
          .then((response) =>{ 
            console.log(response.data);
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
            console.log(error);
            this.$bvToast.toast('Ha ocurrido un error inesperado al cerrar su sesión. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
              title: 'Error al cerrar su sesión',
              variant: 'danger',
              solid: true
            });
          })
        }
      } else {
        //localStorage.clear();
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

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }

  .hoverAnimationTranslator:hover {
    animation: pulse 1.4s infinite;
  }
</style>

