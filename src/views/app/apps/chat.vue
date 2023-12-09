<template>
  <div class="no-gutters">
    <div class="row no-gutters">
      <div class="col-md-9" style="padding-right: 25px;">
        <div class="card chat-sidebar-container sidebar-container" style="z-index: 1000;">
          <div class="chat-sidebar-wrap sidebar" :class="{'ml-0': isMobile}" style="overflow-y: scroll; height: 100%;">

            <button class="btn btn-primary mr-2" style="display: none;" type="button" v-b-modal.transferConversationModal ref="buttonTransfer">Finalizar</button>
            <b-modal scrollable size="m" centered id="transferConversationModal" title="Solicitud de transferencia" @ok="acceptTransferWhatsappConversation()">
              <div style="text-align: center;">
                <p class="m-0">{{transferRequestName}} ha solicitado transferir una conversación</p>
              </div>
            </b-modal>

            <div class="border-right" style="height: 100%;">
              <vue-perfect-scrollbar :settings="{ suppressScrollX: true}" class="contacts-scrollable perfect-scrollbar rtl-ps-none ps scroll">   
                <div v-if="loaders.activeConversations == true" style="text-align: center;">
                  <br><br><br><span class="spinner-glow spinner-glow-primary"></span>
                </div>
                
                <div v-else v-for="activeConversationID in sortedConversationsID" @click="changeCurrentActiveConversation(activeConversationsAsJSON[activeConversationID])" style="cursor: pointer;" class="p-3 d-flex border-bottom align-items-center" id="hint">
                  <h6 style="padding-top: 10px;">
                    {{ activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientProfileName }} ({{activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber}})
                    <br><br>
                    {{ parseHour(activeConversationsAsJSON[activeConversationID].whatsappConversationMessages[activeConversationsAsJSON[activeConversationID].whatsappConversationMessages.length-1].whatsappGeneralMessageCreationDateTime) }}
                  </h6>
                  <div class="flex-grow-1"></div>
                  <div style="top: -12px; position: relative;"><b-form-checkbox v-model="activeConversationsAsJSON[activeConversationID].selected"></b-form-checkbox></div>
                  <div v-if="activeConversationsAsJSON[activeConversationID].whatsappConversationMessages[activeConversationsAsJSON[activeConversationID].whatsappConversationMessages.length-1].whatsappGeneralMessageOwnerPhoneNumber != null" style="height: 15px; width: 15px; background-color: red; border-radius: 100px;"></div>
                  <div v-else style="height: 15px; width: 15px; background-color: green; border-radius: 100px;"></div>
                  <b-tooltip target="hint" v-if="hints[activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber]">{{hints[activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber]}}</b-tooltip>
                </div>


              </vue-perfect-scrollbar>
            </div>

            
            <div style="position: absolute; width: 100%; bottom: 0; background-color: #F9E530; height: 50px; text-align: center; cursor:pointer;">
              <b-dropdown ref="dropDownSucursales" dropup :text="textoSucursalesCalcular" variant="primary" style="margin: 0 auto; font-size: medium; top: 5px" size="lg">
                <b-dropdown-item href="#" v-b-modal.escazuConversationsModal>Escazú ({{escazuConversations.length}})</b-dropdown-item>
                <b-dropdown-item href="#" v-b-modal.zapoteConversationsModal>Zapote ({{zapoteConversations.length}})</b-dropdown-item>
                <b-dropdown-item href="#" v-b-modal.cartagoConversationsModal>Cartago ({{cartagoConversations.length}})</b-dropdown-item>
                <b-dropdown-item href="#" v-b-modal.pendingConversationsModal>Pendientes ({{pendingConversations.length}})</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <b-modal scrollable size="m" centered hide-footer id="escazuConversationsModal" title="Conversaciones pendientes de Escazú">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="escazuConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item v-for="escazuConversation in escazuConversations" @click="grabStoreConversation(escazuConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{escazuConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{escazuConversation.storeMessageRecipientPhoneNumber}}<br>
                <strong>Pedido:</strong> {{escazuConversation.storeMessageRecipientOrder}}<br>
                <strong>Cédula:</strong> {{escazuConversation.storeMessageRecipientID}}<br>
                <strong>Fecha:</strong> {{escazuConversation.storeMessageStartDateTime}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="zapoteConversationsModal" title="Conversaciones pendientes de Zapote">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="zapoteConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item v-for="zapoteConversation in zapoteConversations" @click="grabStoreConversation(zapoteConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{zapoteConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{zapoteConversation.storeMessageRecipientPhoneNumber}}<br>
                <strong>Pedido:</strong> {{zapoteConversation.storeMessageRecipientOrder}}<br>
                <strong>Cédula:</strong> {{zapoteConversation.storeMessageRecipientID}}<br>
                <strong>Fecha:</strong> {{zapoteConversation.storeMessageStartDateTime}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="cartagoConversationsModal" title="Conversaciones pendientes de Cartago">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="cartagoConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item v-for="cartagoConversation in cartagoConversations" @click="grabStoreConversation(cartagoConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{cartagoConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{cartagoConversation.storeMessageRecipientPhoneNumber}}<br>
                <strong>Pedido:</strong> {{cartagoConversation.storeMessageRecipientOrder}}<br>
                <strong>Cédula:</strong> {{cartagoConversation.storeMessageRecipientID}}<br>
                <strong>Fecha:</strong> {{parseHour(cartagoConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="pendingConversationsModal" title="Conversaciones pendientes">
            <b-list-group v-if="loader2 == false">
              <b-list-group-item v-if="pendingConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item style="cursor: pointer" v-for="pendingConversation in pendingConversations" button @click="grabPendingConversation(pendingConversation)">
                <strong>Nombre:</strong> {{pendingConversation.whatsappConversationRecipientProfileName}}<br>
                <strong>Número:</strong> {{pendingConversation.whatsappConversationRecipientPhoneNumber}}<br>
                <strong>Fecha:</strong> {{parseHour(pendingConversation.whatsappConversationStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>

          <b-modal scrollable size="m" centered hide-footer id="historyConversationsModal" title="Historial de conversaciones">
            <b-list-group v-if="historyLoader == false">
              <b-list-group-item v-if="historyConversations.length == 0">
                No hay conversaciones en el historial
              </b-list-group-item>
              <b-list-group-item v-b-modal.historyOpenModal style="cursor: pointer" v-for="historyConversation in historyConversations" @click="openHistoryConversation(historyConversation)" button>
                <div style="display: flex;">
                  <div>
                    <strong>Atendido por:</strong> {{historyConversation.agentName}}<br>
                    <strong>Resultado:</strong> {{historyConversation.whatsappConversationCloseComment}}<br>
                    <strong>Inicio:</strong> {{parseHour(historyConversation.whatsappConversationStartDateTime)}}<br>
                    <strong>Fin:</strong> {{parseHour(historyConversation.whatsappConversationEndDateTime)}}<br>
                  </div>
                  <div class="flex-grow-1"></div>
                  <button @click="rememberCart(historyConversation)" class="btn btn-icon btn-primary mr-2"><i class="i-Shopping-Cart"></i>Recordar carrito</button>

                </div>
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>


          <b-modal scrollable size="lg" centered hide-footer id="historyOpenModal" hide-header>
            <div v-if="openHistoryLoader == true" style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
            <div v-else>
              <div v-for="currentActiveConversationMessage in currentHistoryConversation.whatsappConversationMessages" @contextmenu.prevent="replyMessageRightClick(currentActiveConversationMessage)">
                
                <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
                  <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                    <div class="d-flex">
                      <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                          <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">
                              <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                                
                                <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                                  <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                                  <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                  </b-dropdown>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                  <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                </div>
                                
                                <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                          <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                          <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                          <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                            <b-dropdown-item @click="saveLocation('CASA', currentActiveConversationMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('TRABAJO', currentActiveConversationMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('OTRO', currentActiveConversationMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                          </b-dropdown>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                          <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                        </div>
                        
                        <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>

                        </div>
                      
                      </div>
                      <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="margin-left: 0; margin-right:auto;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                      <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                      <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                          <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">
                              <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                                
                                <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                                  <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                                  <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                  </b-dropdown>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                  <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                </div>
                                
                                <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                              
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                                </div>
                              
                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                          <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                        </div>
                        
                        <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>
                        </div>
                      
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </b-modal>



          <div class="chat-content-wrap sidebar-content" v-if="currentActiveConversation!=null">
            <div class="d-flex pl-3 pr-3 pt-3 pb-3 o-hidden box-shadow-1 chat-topbar">
              <a class="link-icon d-md-none" @click="isMobile = !isMobile"><i class="icon-regular i-Right ml-0 mr-3"></i></a>
              <div class="d-flex align-items-center" style="width: 100%;">
                <input type="checkbox" v-if="verifiedUser" :checked="true" style="accent-color: #FFD733; margin-right: 10px;" onclick="return false;">
                <p class="m-0 text-title text-16">{{ currentActiveConversation.whatsappConversationRecipientProfileName }} ({{currentActiveConversation.whatsappConversationRecipientPhoneNumber}})</p>
                <div class="flex-grow-1"></div>
                <button @click="getHistoryConversations()" class="btn btn-icon btn-primary mr-2" v-if="availableConversation == true" v-b-modal.historyConversationsModal><i class="i-Clock"></i>Historial</button>
                <button @click="vistaItems = 'Productos'" class="btn btn-icon btn-primary mr-2" v-if="availableConversation == true"><i class="i-Shopping-Cart"></i>Buscar productos</button>
                <button @click="vistaItems = 'Orden'" class="btn btn-icon btn-primary" v-if="availableConversation == true"><i class="i-Check"></i>Resumen de la orden</button>
              </div>
            </div>

            <vue-perfect-scrollbar ref="scrollRef" :settings="{ suppressScrollX: true, wheelPropagation: false }" class="chat-content perfect-scrollbar rtl-ps-none ps scroll" style="padding-bottom: 30px;">
              <div v-for="currentActiveConversationMessage in currentActiveConversation.whatsappConversationMessages" @contextmenu.prevent="replyMessageRightClick(currentActiveConversationMessage)">
                <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
                  <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                    <div class="d-flex">
                      <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                          <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            <div v-for="answeredMessage in currentActiveConversation.whatsappConversationMessages">
                              <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                                
                                <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                                  <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                                  <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                  </b-dropdown>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                  <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                </div>
                                
                                <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                          <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                          <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                          <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                            <b-dropdown-item @click="saveLocation('CASA', currentActiveConversationMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('TRABAJO', currentActiveConversationMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('OTRO', currentActiveConversationMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                          </b-dropdown>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                          <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                        </div>
                        
                        <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>

                        </div>
                      
                      </div>
                      <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="margin-left: 0; margin-right:auto;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                      <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                      <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                          <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            <div v-for="answeredMessage in currentActiveConversation.whatsappConversationMessages">
                              <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                                
                                <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                                  <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                                  <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                  </b-dropdown>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                  <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                </div>
                                
                                <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                              
                                <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                                  <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                                </div>
                              
                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                          <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                        </div>
                        
                        <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </vue-perfect-scrollbar>
           <div v-if="availableConversation == true" class="pl-3 pr-3 pt-4 pb-3 box-shadow-1 chat-input-area" style="position: absolute; bottom: 0; width: 100%; z-index: 1000; background-color:white">
              <div v-if="loaders.fileShare == true" style="text-align: center;">
                <br><br><span class="spinner-glow spinner-glow-primary"></span>
              </div>
              <div v-else>
                <div v-if="repliedMessage != null">
                  <div style="background-color: rgb(255, 216, 251); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                    <div>
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Respondiendo a:</strong></p>
                      <i class="i-Close-Window text-25 text-danger" style="float: right; position: relative; top:-25px; cursor: pointer;" @click="cancelReply()"></i>
                    </div><br>
                    
                    <p v-if="repliedMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{repliedMessage.whatsappTextMessageBody}}</p>
                    
                    <div v-if="repliedMessage.whatsappGeneralMessageType == 'contact'"> 
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{repliedMessage.whatsappContactMessageName}}</p>
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{repliedMessage.whatsappContactMessagePhoneNumber}}</p>
                    </div>
                    
                    <div v-if="repliedMessage.whatsappGeneralMessageType == 'image'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${repliedMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${repliedMessage.whatsappImageMessageFile}`">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="repliedMessage.whatsappImageMessageCaption != null">{{repliedMessage.whatsappImageMessageCaption}}</p>
                    </div>
                    
                    <div v-if="repliedMessage.whatsappGeneralMessageType=='video'"> 
                      <video controls width="400" :src="`data:video/mp4;base64,${repliedMessage.whatsappVideoMessageFile}`"></video>
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="repliedMessage.whatsappImageMessageCaption != null">{{repliedMessage.whatsappVideoMessageCaption}}</p>
                    </div>
                    
                    <div v-if="repliedMessage.whatsappGeneralMessageType=='location'" class="m-0">
                      <GmapMap :center="getLocation(repliedMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(repliedMessage)" :draggable="false"/></GmapMap><br>
                      <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{repliedMessage.whatsappLocationMessageLatitude}}</p>
                      <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{repliedMessage.whatsappLocationMessageLongitude}}</p><br>
                      <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                        <b-dropdown-item @click="saveLocation('CASA', repliedMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                        <b-dropdown-item @click="saveLocation('TRABAJO', repliedMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                        <b-dropdown-item @click="saveLocation('OTRO', repliedMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                      </b-dropdown>
                    </div>
                    
                    <div v-if="repliedMessage.whatsappGeneralMessageType=='document'" class="m-0">
                      <a style="color: black;" :href="`data:${repliedMessage.whatsappDocumentMessageMimeType};base64,${repliedMessage.whatsappDocumentMessageFile}`" :download="repliedMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{repliedMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                    </div>
                    
                    <audio controls v-if="repliedMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${repliedMessage.whatsappAudioMessageFile}`"></audio>
                  
                    <div v-if="repliedMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(repliedMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="repliedMessage.whatsappFavoriteImageMessageDriveURL">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="repliedMessage.whatsappFavoriteImageMessageCaption != null">{{repliedMessage.whatsappFavoriteImageMessageCaption}}</p>
                    </div>
                  
                  </div><br>
                </div>
                <div class="form-group">
                  <b-form-textarea ref="textoEnviar" :disabled='sendingMessageDisable' class="form-control" placeholder="Escribe un mensaje" @keyup.enter="sendWhatsappTextMessage()" v-model="currentActiveConversation.textoEnviar" style="margin-bottom: 20px;" no-resize rows="3"/>
                </div>              
                <div class="d-flex">
                  <button class="btn btn-primary mr-2" type="button" v-b-modal.endConversationModal>Finalizar</button>
                  <b-modal scrollable size="m" centered id="endConversationModal" title="Finalizar conversación" @ok="closeWhatsappConversation()">
                    <b-dropdown variant="primary" text="Motivos frecuentes" style="width: 100%">
                      <b-dropdown-item @click="addCloseConversationReason('Consulta sobre producto sin venta')">Consulta sobre producto sin venta</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Consulta sobre horarios')">Consulta sobre horarios</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Consulta sobre sucursales')">Consulta sobre sucursales</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Número equivocado')">Número equivocado</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Cliente no deseado')">Cliente no deseado</b-dropdown-item>
                    </b-dropdown><br><br>
                    <b-form-textarea no-resize rows="5" class="form-control" placeholder="Motivo de la finalización de la conversación" v-model="closeConversationReason"/>    
                  </b-modal>
                  <b-dropdown dropup variant="primary" text="Transferir" style="margin-right: 10px;">
                    <template v-for="agent in agents">
                      <b-dropdown-item style="z-index: 1000;" @click="requestTransferWhatsappConversation(agent)">{{agent.agentName}}</b-dropdown-item>
                    </template>
                    <b-dropdown-item style="z-index: 1000;" v-if="agents.length == 0">No hay agentes disponibles</b-dropdown-item>
                  </b-dropdown>
                  <div class="flex-grow-1"></div>
                  <b-dropdown dropup variant="primary" text="Tiendas" style="margin-right: 10px;">
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappStoreLocationMessage('Zapote')">Zapote</b-dropdown-item>
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappStoreLocationMessage('Escazu')">Escazu</b-dropdown-item>
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappStoreLocationMessage('Cartago')">Cartago</b-dropdown-item>
                    <b-dropdown-item style="z-index: 1000;">Heredia</b-dropdown-item>
                  </b-dropdown>
                  <b-dropdown dropup variant="primary" text="Ubicaciones" style="margin-right: 10px;">
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappLocationMessage('CASA')">CASA</b-dropdown-item>
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappLocationMessage('TRABAJO')">TRABAJO</b-dropdown-item>
                    <b-dropdown-item style="z-index: 1000;" @click="sendWhatsappLocationMessage('OTRO')">OTRO</b-dropdown-item>
                  </b-dropdown>
                  <button class="btn btn-icon btn-rounded btn-primary mr-2" type="button" @click="uploadImage()" id="sendFiles"><i class="i-Folder-With-Document"></i></button>
                  <input type="file" accept="image/png, image/jpeg, application/pdf" @change="sendWhatsappImageMessage()" ref="imageFile" style="display: none;" id="imageUploader">
                  <b-tooltip target="sendFiles">Enviar imágenes de la computadora</b-tooltip>
                  <button id="sendFavoriteImages" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.imageModal @click="deselectImages()"><i class="i-Folder"></i></button>
                  <b-tooltip target="sendFavoriteImages">Enviar imágenes del catálogo</b-tooltip>
                  <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
                    <img style="width: 1000px;" :src="bigImageSource">
                  </b-modal>
                  <b-modal @ok="sendWhatsappFavoriteImageMessage()" scrollable title="Catálogo de desechables" size="m" centered id="imageModal">
                    <div v-if="loaderImages == true" style="text-align: center;">
                      <br><span class="spinner-glow spinner-glow-primary"></span>
                    </div>
                    <div v-else>
                      <b-list-group>
                        <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item :style="getImageStyle(agentFavoriteImage)" v-for="(agentFavoriteImage, index) in agentFavoriteImages" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImage(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 80px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                  </b-modal>
                  <button id="sendFavoriteMessages" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.favoriteModal @click="openAgentFavoriteMessagesModal()"><i class="i-Love"></i></button>
                  <b-tooltip target="sendFavoriteMessages">Enviar mensajes favoritos</b-tooltip>
                  <b-modal scrollable title="Mensajes favoritos" size="m" centered hide-footer id="favoriteModal">
                    <b-list-group>
                      
                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteMessage in agentFavoriteMessages" button @click="sendWhatsappFavoriteTextMessage(agentFavoriteMessage.agentFavoriteMessageTextMessageBody)">
                        <h6><strong>{{agentFavoriteMessage.agentFavoriteMessageName}}</strong></h6>
                        {{agentFavoriteMessage.agentFavoriteMessageTextMessageBody}}
                      </b-list-group-item>

                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteImage in agentFavoriteImages2" button @click="sendSelectedWhatsappFavoriteImageMessage(agentFavoriteImage)">
                        <h6><strong>{{agentFavoriteImage.whatsappFavoriteImageName}}</strong></h6>
                        <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 150px; height: auto;"/>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias'"><br>
                          Te envío por acá nuestras cuentas bancarias en caso de que canceles por transferencia
                        </div>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Mensaje de bienvenida'"><br>
                          {{ agentStartMessage }}
                        </div>
                      </b-list-group-item>

                    </b-list-group>
                  </b-modal>
                  <button id="sendAudio" class="btn btn-icon btn-rounded btn-primary mr-2" type="button" @click="startRecording()" v-b-modal.recordAudioModal><i class="i-Microphone-3"></i></button>
                  <b-tooltip target="sendAudio">Enviar audio</b-tooltip>
                  <b-modal id="recordAudioModal" hide-footer hide-header size="sm" centered>
                    <div v-if="(!isRecording) && (loaderAudio == false)"><audio controls :src="recordedAudioFile" style="width:270px;"></audio><br></div>
                    <div v-if="isRecording" style="text-align: center;"><h2>{{recordedTime}}</h2></div>
                    <div style="text-align: center;">
                      <div v-if="loaderAudio == false">
                        <button v-if="isRecording" class="btn btn-icon btn-primary" type="button" @click="pauseAudioRecording()"><i class="i-Pause"></i></button>
                        <button class="btn btn-icon btn-primary" type="button" @click="sendWhatsappAudioMessage()" v-if="!isRecording"><i class="i-Paper-Plane"></i></button>
                      </div>
                      <div v-if="loaderAudio == true" style="text-align: center;">
                        <br><span class="spinner-glow spinner-glow-primary"></span><br>
                      </div>
                    </div>
                  </b-modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 scrollable-container" v-if="(currentActiveConversation != null) && (availableConversation == true)">
          <b-card v-if="vistaItems == 'Productos'">
            <div class="d-flex" style="align-items: center;">
              <h3 class="ul-widget__head-title">
                Buscar productos
              </h3>
              <div class="flex-grow-1"></div>
            </div>
            <br>
            <b-form-input
                @keyup="selectProductos()"
                v-model="producto"
                id="buscador" 
                type="text"
                required
                placeholder="Coloca el nombre del producto"
                :class="{'loading-effect': loading}"
              ></b-form-input>
            
            <div v-if="loading == true" style="text-align: center;">
              <br><br>
              <span class="spinner-glow spinner-glow-primary"></span>
            </div>

            <div v-if="enviandoProductoLoader == true" style="text-align: center;">
              <br><br>
              <span class="spinner-glow spinner-glow-primary"></span>
            </div>

            <div class="ul-widget__body" v-else>
              <div class="ul-widget1" v-for="producto in productos" :key="producto.codigoProducto">
                <div class="ul-widget__item ul-widget4__users">
                  <div class="ul-widget4__img">
                    <div style="display: flex;">
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('Extra Ice')" :src="iceLogoSRC"/>
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('ICE')" :src="iceLogoSRC"/>
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('Postre')" :src="postreLogoSRC"/>
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('Tabaco')" :src="tabacoLogoSRC"/>
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('Wax')" :src="waxLogoSRC"/>
                      <img style="width: 30px; height: auto;" v-if="producto.consignacion.includes('Hierba')" :src="hierbaLogoSRC"/>
                    </div>
                    <img :src="producto.localizacion" alt="Imagen no disponible"/>
                  </div>
                  <div class="ul-widget2__info ul-widget4__users-info">
                    <a href="#" variant="info" v-if="producto.productosAsociados.length==0" @click="AgregarItem(producto,'info')" class="ul-widget2__title">{{ producto.descripcion }}</a>
                    <a href="#" variant="info" v-if="producto.productosAsociados.length!=0" style="cursor: default;" class="ul-widget2__title">{{ producto.descripcion }}</a>

                    <span class="ul-widget2__username">{{ producto.codigoProducto }}</span>
                    <span style="font-size:8px" class="ul-widget2__username">{{ producto.subFamilia }}</span>
                    <span class="ul-widget4__number text-success">₡{{ producto.precioVenta }}</span>
                    
                    <div v-if="producto.productosAsociados.length != 0">
                      <div v-for="nivelNicotina in producto.productosAsociados" :key="producto.codigoAsoiado" style="display: inline;"> 
                        <b-badge variant="dark" style="cursor:pointer; margin: 3px;" @click="AgregarItemVariacion(producto, nivelNicotina.codigoAsoiado, nivelNicotina.descripcion,'info')">{{nivelNicotina.nicotina}} MG</b-badge>
                      </div>
                    </div>

                    <div style="display: flex">
                      
                      <button class="btn btn-icon btn-success mr-2" @click="sendWhatsappProductMessage(producto)">
                        Enviar
                      </button>
                      <button v-b-modal.stockModal v-if="producto.productosAsociados.length == 0" class="btn btn-icon btn-warning mr-2" @click="cargarExistencia(producto.codigoProducto)">
                        Stock
                      </button>

                      <button v-b-modal.stockModal  v-else="producto.productosAsociados.length == 0" class="btn btn-icon btn-warning mr-2" @click="cargarExistenciaNicotina(producto.productosAsociados)">
                        Stock
                      </button>
                    </div> 


                   

                  </div>
                </div>
              </div>
            </div> 

            <b-modal scrollable size="sm" centered hide-header hide-footer id="stockModal">
                      <div>
                        <div v-if="stockLoader == true" style="text-align: center;">
                          <br>
                          <span class="spinner-glow spinner-glow-primary"></span>
                        </div>
                        <div v-else>
                          <p class="m-0" style="white-space: pre-line; font-size: medium;">{{stockContent}}</p>
                        </div>
                      </div>
                    </b-modal>

          </b-card>
          <b-card v-else title="Resumen de la orden">
            <b-tabs  
                    active-nav-item-class="nav nav-tabs"
                    content-class="width:100%"
                    style="width:100%"
                    >
                        <b-tab active>
                            <template slot="title">
                                <i class="i-File-Clipboard-File--Text ul-tab__icon text-muted mr-1"> </i>
                                Datos del cliente
                            </template>

                            <br>
                            <p style="font-size: medium;">Información personal</p>
                            <b-form-group
                              style="width:100%"
                              label-for="input-1"
                            >
                              <b-form-input 
                                v-model="currentActiveConversation.whatsappConversationRecipientProfileName"
                                type="text"
                                required
                                placeholder="Nombre del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="currentActiveConversation.whatsappConversationRecipientPhoneNumber"
                                placeholder="Número de teléfono del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="currentActiveConversation.whatsappConversationRecipientID"
                                placeholder="Cédula del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="currentActiveConversation.whatsappConversationRecipientEmail"
                                placeholder="Correo electrónico del cliente"
                              ></b-form-input>
                              
                            </b-form-group>
                            
                            <br>
                            <p style="font-size: medium;">Información del envío</p>
                            <b-form-group
                              style="width:100%"
                              label-for="input-1"
                            >
                              <b-form-select
                                v-model="Sucursal"
                                :options="Sucursales"
                                id="inline-form-custom-select-pref1"
                                style="margin-bottom: 10px;"
                              />
                              <b-form-select
                                v-model="MetodoEnvio"
                                :options="MetodosEnvio"
                                id="inline-form-custom-select-pref1"
                                style="margin-bottom: 10px;"
                              >
                              </b-form-select>
                              <b-form-select
                                v-model="MetodoPago"
                                :options="MetodosPagos"
                                id="inline-form-custom-select-pref1"
                                style="margin-bottom: 10px;"
                              >
                              </b-form-select>
                              <b-form-input
                                type="text"
                                v-model="pagaCon"
                                placeholder="El cliente paga con..."
                                style="margin-bottom: 10px;"
                              ></b-form-input>
                              <b-form-select
                                type="text"
                                v-model="estadoPago"
                                :options="estadosPagos"
                                style="margin-bottom: 10px;"
                              ></b-form-select>

                              <b-form-select
                                type="text"
                                v-model="ubicacion" 
                                style="margin-bottom: 10px;"
                                :options="ubicaciones">
                              </b-form-select>

                              <b-form-input
                                type="text"
                                v-model="latitud"
                                placeholder="Latitud"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="longitud"
                                style="margin-bottom: 10px;"
                                placeholder="Longitud"
                              ></b-form-input>
                        
                              <b-form-textarea
                                rows="3"
                                type="text"
                                v-model="currentActiveConversation.whatsappConversationRecipientLocationDetails"
                                style="margin-bottom: 10px;"
                                placeholder="Nota de la dirección"
                              ></b-form-textarea>

                              <b-form-textarea
                                rows="3"
                                type="text"
                                style="margin-bottom: 10px;"
                                placeholder="Nota del envío"
                                v-model="currentActiveConversation.whatsappConversationRecipientNote"
                              ></b-form-textarea>
                            </b-form-group>

                            <div style="text-align: center;" v-if="loaderOrdenEnviada == false">
                              <br>
                              <b-button @click="OrdenExpress()" variant="primary"
                                >Enviar orden a la central</b-button
                              >
                              <br><br>
                              <b-button @click="sendWhatsappOrderTextMessage()" variant="warning"
                                >Compartir orden con el cliente</b-button
                              >
                              <br><br>
                            </div>

                            <div v-else style="text-align: center;">
                              <br>
                              <span class="spinner-glow spinner-glow-primary"></span>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title"> 
                                <i class="i-Shopping-Cart  ul-tab__icon mr-1"> </i>
                                Carrito
                            </template>
                            <b-row class="">
                              <vue-good-table
                                  :columns="columns"
                                  styleClass="tableOne vgt-table description-content"
                                  :rows="currentActiveConversation.whatsappConversationProducts"
                                  mode="remote"
                                  :key="id"
                                  compactMode
                                  style="width:100%"
                              >
                                  <template slot="table-row" slot-scope="props">
                                      <!-- Descripción - Dropdown -->
                                      <span v-if="props.column.field == 'descripcion'">
                                          <div style="display: flex;">
                                            <i @click="EliminarLinea(props.row.id)" class="icon-regular ml-0 mr-3 i-Eraser-2" style="color:red; cursor: pointer; margin-right: 5px;"></i>
                                            <b-dropdown class="text-dropdown description-content" size="sm" no-caret>
                                                <template slot="button-content">{{props.row.descripcion}}</template>
                                            </b-dropdown>
                                          </div>
                                      </span>

                                      
                                      <!-- Cantidad - Input -->
                                      <span v-if="props.column.field == 'cantidad'">
                                          <b-form-input
                                              :value="props.row.cantidad"
                                              @input="updateFieldCant('cantidad', $event, props.row)"
                                              required
                                              onfocus="this.select();"
                                              placeholder="Nombre"
                                          ></b-form-input>
                                      </span>
                                      <span v-if="props.column.field == 'descuento'">
                                          <b-form-input
                                              :value="props.row.descuento"
                                              @input="updateFieldDesc('descuento', $event, props.row)"
                                              required
                                              @keyup="calcularDescuento()"
                                              onfocus="this.select();"
                                              placeholder="Descuento"
                                          ></b-form-input>
                                      </span>

                                      
                                      <span v-if="props.column.field == 'precioVenta'">
                                          {{props.row.precio}}
                                      </span>

                                      
                                  </template>
                              </vue-good-table >
                            
                            
                            <p class="font-weight-bold text-muted" style="font-size: medium;"> 
                                <br><br>
                                Subtotal: {{calcularSubTotal}}  <br>
                                Descuento: {{calcularDescuento}} <br>
                                Total: {{calcularTotal}}  
                            </p>
                            
                            
                            
                          </b-row>
                        </b-tab>
                    </b-tabs> 
            
          </b-card>
      </div>
    </div>

    
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');


import router from "../../../router";
import {gmapApi} from 'vue2-google-maps';

import { BDropdown } from 'bootstrap-vue';


export default {
  watch: {
    ubicacion(newLocation, old){
      if (newLocation != 'Ubicación de envío'){
        this.latitud = this.currentActiveConversation.whatsappConversationRecipientLocations[newLocation].latitude;
        this.longitud = this.currentActiveConversation.whatsappConversationRecipientLocations[newLocation].longitude;
      } else {
        this.latitud = '';
        this.longitud = '';
      }
    },

    letra(newLetra, old){
      if (newLetra == 'Select by letter'){
        for (var contactIndex in this.contactsList){
          this.contactsList[contactIndex].selected = false;
        } 
      } else {
        for (var contactIndex in this.contactsList){
          if (this.contactsList[contactIndex].contactName[0].toUpperCase() == newLetra){
            this.contactsList[contactIndex].selected = true;
          }
        }
      }
    }
  }, 
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Chat",
  },
  data() {
    return { 

      agentStartMessage: '',

      loaders: 
      {
        activeConversations: false,
        grabConversation: false,
        fileShare: false,
      },


      sendingMessageDisable: false,


      loaderOrdenEnviada: false,
      
      openHistoryLoader: false,
      historyLoader: false,
      historyConversations: [],
      currentHistoryConversation: {},

      hints: {},


      repliedMessage: null,
      stockLoader: false,
      stockContent: '',
      loaderAudio: false,

      allImageSelected: false,

      availableConversation: true,
      iceLogoSRC: `data:image/png;base64,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`,
      postreLogoSRC: `data:image/png;base64,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`,
      tabacoLogoSRC: `data:image/png;base64,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`,
      waxLogoSRC: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAwCAYAAABqkJjhAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMLSURBVGhD7Zg/kAtxFMe/d7nj5s5xc8gkjAIFlU6loqIwVCoVnYYGDZVKp6JBRXMVGjRGo9LpzBgKkiGXy925/JNkE9+fezuTWZG835/E3Ew+M5l9e7ez89m37/f27U50CLYQk7LdMoyFh81YeNiE7xLLz4FKDth+Hsjukz+GI6xw8TF/92VnG7DwFshwG5CwJVF+KIGhAVTfSxyOcMLRB6BOyW4a74BfEgcinPDyKwm6WWKJbEgchkDClCpTrhfVlxKEIYxwiVItiZNET5hliQMQQJh1u3ZP4l7k+f9e5eKGv3CRGWwkFluSFltdYcAxSvyEI2ZvNe67/TDH8cIi2fXAT/gHZbUSHR6bp7gn7sI19tiflrVZuQusS+yIozDbWP66xDbwIs2s4VEabsLfbgFNx0XUugN85VPREXthM+CUmSkf6pR27Bp2wtFHYEXTFQbxZbO71GTXAjvhHBdNqGG0wzZXYAIs0QubrlB1r72e1B6xvCRWohcu8uTBecMSs8uyUpg1Vwuc3Zg675xFm9MJr1O2LXFoOs+4ACVWoBOuM8NDg4/rhn7I1wk3k8IngMUXwK4Lsu9JW9+T9Yuum9QpIM1X+Oxp+cPo0AlPyDYmykmwH5iScETohKePSBDDVvRn6toNzLA8fJnmeZTohOeOShBjRkuZbbNX/r4DVvCCZyVUoBQ+zixIHFPhLGCeUilm/8ADnsnxC49ZD/MSK1AuOp5xLtkROLx/56u9GWBmeUGHX7Nr3GBN8wImD24eMhBe5PwZiXVYfFtbAT6d5TybaEGTF4HMNWCn7MfkKL/BR28/UreBQ+e4lX0FygwbuDD23pS4izanrvxJPr35JrHGB0D8fSIa9DGCtZu2kzVYZFgosHZLHOK9YMksPqWwfd1bZFhIsyvs4c+ZY7xZvGAHWYN9hmPMbJy7yltv8bEvxQvNXLLqCknchWNW2ZNLnJWb/xo/aTfFWl24zDvjYSr4C8dE7B51ZrvyWV6j2DZ2cN6YoaTlwupHOOERYb/o/jNj4WEzFh4uwG9BieBgJKlt7QAAAABJRU5ErkJggg==`,
      hierbaLogoSRC: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAqCAYAAAAj6gIfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ9SURBVGhD7ZhfSFt3FMe/iSZqNNHMjKHbJHMP+lAflkkHzhep0OEg3YNlD4KwkYeBD5XSQqllYw/tU9lfBnnoKghSxgajwgIjDxksDaykHSx7MC/WpW10602MXk3ivdHsl/Q4Y3L/1dxrEfZ5yTnnJd977jnnd37XVGTgmGKm32OJoeJXnszjxt9xZMnXG+PEZ37A19mvcDfvw7dPBArqi0HieYQ2vwRXtgXEcvNYLJQdXTFEvJiaxe2dimwXbyKY0T/7BojnEWaZPljnLPvZBSTI0wv9xW9GcGeH7EqK8/hljWyd0F38RvaOTIaTuJ+Pk60POovncU/4mexaskIEi2Trgb7i8zH8KVUy/xFCLEOmDugrfiuKGJnSxBHfTpFdP/LiCzwSqRiWeAEihdRYEqNkyZMoPCBLHXFzGTEuDk7mjJBdzDb++RgXcnv160aPZQJjbe/A47BSrBp2MD0axS3FsmGYLuJSzzh6ya2mJPg3/iZus95Zp5ir+Udce6mbvH1kM++wvAYb2cAyEuJV+NdOYerhLMIZnuKVpMDtkqlEMSmZSZGP4tYjH6ZT72OuQniJLrOLrIPIl419CB4y92EltOvH3Ppo+SHuHngGHilNy/UDcBUnmMjH8P3jSUylpxDaiUmU6GmcsEm/bXnxjX14w1r7qvYoPcSN9Cg+SUbBlU7+LQ7PNEhYTy2uXsJ02odgQWH+N4zgzVayq1CcNgO2CUi/sD14rIhTuLx6FYFsEjmKKhNBIh+BPzmGz7ZDKsPAioHmt+EgrxqVm1SpCcdYExqz0qrCmvsKa+4ecqtRzDwrfIy0fljRuEcJy3qLV1Z4CRXxDOc4zjTIjUcDMZ3Du07l/1UXX8p+2zmV2tebbnhavehtJFcGDeIZHeOYtLrJOQIaL2KyU/1taxPP6HdewUkTOYbCEvXCkKY+0ywezQPwdcwoNlD9uOFhJTrcQq4K2sQXBKykIwhsxTUvaYejCZntBQRTy+DyFFJAcc6Xju4gW5J+EiMGi5bCjvaGD3DWcRYnZZZBefFrs5je8Bv2wUg7VvTbAjj/op38fbTX/HOjiX5rUV4PtpYR3ji4Wx8dneiyfIQzdi88tUkvo7LbEKxhuc04fs+HcI/dllZ3jfj+6Ea7uQ+vNw7iRNMg3nJ0w6JySGkTr4iA8ONTmGMP+EyYZ/Dpq150kXsY6q/59QUEJIRb2B7+VFg3XCyjNezOIpgm+5DULX4pt0AfVPcYxHBrAF+8MkHi3Rhun8N1xwz6TZUjL4lwLlrXCK4/88Xt8o/FdBojtu9w/eVvMOnqhKUc3cfh9OJ8z6+41jYDj7nzabDIa7zASKNDzQPZrABbzT0zBv9fPtzHEN5zfo6xquuQmGMXYItdtSmV0GXO1wpXx9JSn/ASumReGgGJ1B9YLdrR29EHV51CpTBQvPEcg/VAnv/FPx+AfwHCw33sgBcIGAAAAABJRU5ErkJggg==`,

      loaderImages: false,
      loader2: false,
      enviandoProductoLoader: false,
      textoSucursales: 'Sucursales ',

      closeConversationReason: '', 
      transferRequestName: '',
      transferFromAgentID: '',
      transferConversationID: '',
      transferConversationProducts: '',
      

      status: 'accepted',
      verifiedUser: false,
			zoom: 15,

      agentName: '',
      pendingConversations: [],


      zapoteConversations: [],
      escazuConversations: [],
      cartagoConversations: [],

      // Variables del chat -------
      activeConversation: '',
      activeConversations: [],
      activeConversationsAsJSON: {},
      currentActiveConversation: null,
      updatedActiveConversationID: '',
      
      newTextMessageContent: '',

      createNewConversationDialog: false,
      newConversationRecipientPhoneNumber: '',
      newConversationTextMessageContent: '',

      emojis: [],

      recordAudioDialog: false,
      isRecording: false,
      recordedTime: '0:00',
      mediaRecorder: null,
      recordedAudioFile: null,
      startTime: '',
      chunks: [],

      file: null,
      // Esta aqui variables del chat -------


      agents: [],
      temp: '',
      emojis: [],

      newConversationTextMessage: '',
      newConversationPhoneNumber: '',


      recentContacts: [],
      search: "",
      isMobile: false,
      Localidad: "Select location",
      producto:"",
      productos:[],
      loading:false,
      timeouts: [],
      orden: [],
      vistaItems: 'Productos',
      columns: [
        {
          label: "Nombre",
          field: "descripcion",
          width: "200px",
          thClass: "gull-th-class"
        },
        {
          label: "Cantidad",
          field: "cantidad",
          width: "100px",
        },
        {
          label: "Descuento",
          field: "descuento",
          width: "100px",
        },
        {
          label: "Precio",
          field: "precioVenta",
          width: "100px",
          type: "number",
        },
      ],


      today: new Date().toISOString().substr(0, 10),
      name:"",
      multiplo: 10,
      phone:"",
      address:"",
      email:"",
      detallesOrden:"",
      tipoPago:"",
      descuento:0,
      localidad:"",
      metodoPago:"",
      metodoToma:"",
      Sucursal:"Sucursal de envío",
      Sucursales:["Sucursal de envío","King Vape Escazu", "King Vape Zapote","King Vape Cartago", "King Vape Heredia"],
      
      letra: "Select by letter",
      letras: ["Select by letter", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],

      ubicacion: "Ubicación de envío",
      ubicaciones: ["Ubicación de envío", "CASA", "TRABAJO", "OTRO"],

      estadoPago:"Estado de pago",
      estadosPagos:["Estado de pago", "Pagado","Pendiente"],
      pagaCon:"",
      modoretiro:"",

      latitud:"",
      longitud:"",
      locations: [],
      
      cedula:"",
      nota:"",
      NoOrden:"5",
      MesaSeleccionada: 0,
      DireccionCliente2: "",
      DireccionCliente3: "",
      dividendo: "",
      clienteTipoCedula:"FISICA",
      MetodoPago: "Método de pago",
      MetodosPagos: ["Método de pago","Efectivo","Tarjeta","SINPE","Transferencia"],
      MetodosEnvio: ["Método de envío","Retiro en sucursal","Envío por motorizado","Correo o encomienda"],
      MetodoEnvio: "Método de envío",

      contactsList: [],
      allContactSelected: false,
      massTextMessageContent: '',

      agentFavoriteMessages: [],
      agentFavoriteImages: [],
      agentFavoriteImages2: [],

      recordAudioDialog: false,
      isRecording: false,
      mediaRecorder: null,
      recordedAudioFile: null,
      startTime: '',
      chunks: [],
      bigImageSource: '',

      sortedConversationsID: []
    };
  },

  methods: {

    sortConversations(){
      var conversationsToSort = [];
      for (var activeConversationID in this.activeConversationsAsJSON){
        const whatsappConversationMessages = this.activeConversationsAsJSON[activeConversationID].whatsappConversationMessages;
        const whatsappConversationMessagesAmount = whatsappConversationMessages.length;
        const lastWhatsappConversationMessage = whatsappConversationMessages[whatsappConversationMessagesAmount-1];
        const lastWhatsappConversationMessageDate = new Date(lastWhatsappConversationMessage.whatsappGeneralMessageCreationDateTime);
        conversationsToSort.push({activeConversationID: activeConversationID, lastWhatsappConversationMessageDate: lastWhatsappConversationMessageDate});
      }

      conversationsToSort = conversationsToSort.sort((a, b) => b.lastWhatsappConversationMessageDate - a.lastWhatsappConversationMessageDate);
      const sortedConversationsID = conversationsToSort.map(conversation => conversation.activeConversationID);
      this.sortedConversationsID = sortedConversationsID
    },


    rememberCart(conversation){
      this.currentActiveConversation.whatsappConversationProducts = JSON.parse(conversation.whatsappConversationProducts);
      this.showNotification('success', 'Carrito recordado', 'Ha recordado el carrito de la compra previa del cliente.')

    },


    openBigImage(bigImageSource){
      this.bigImageSource = bigImageSource;
    },
    parseHour(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const formattedDate = parsingDate.toLocaleString('en-US', options);
      return formattedDate;
    },

    openHistoryConversation(historyConversation){
      this.openHistoryLoader = true;
      this.currentHistoryConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: historyConversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::hide::modal','historyConversationsModal');
          this.currentHistoryConversation = response.data.result[historyConversation.whatsappConversationID];
          this.openHistoryLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
      
    },

    getHistoryConversations(){
      this.xx = false;
      this.historyLoader = true;
      this.historyConversations = [];
      axios.post(constants.routes.backendAPI+'/selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber', 
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          this.historyConversations = response.data.result;
          this.historyLoader = false;
        } else {
          this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


    replyMessageRightClick(message){
      this.repliedMessage = message;
    },
    cancelReply(){
      this.repliedMessage = null;
    },
    openImageModal(){
      axios.post(constants.routes.backendAPI+'/selectFavoriteImages')
        .then((response) =>{
          if (response.data.success){
            for (var agentFavoriteImageIndex in response.data.result){
              if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == true){
                this.agentFavoriteImages.push(response.data.result[agentFavoriteImageIndex]);
              } else {
                this.agentFavoriteImages2.push(response.data.result[agentFavoriteImageIndex]);
              }
            }
            for (var agentFavoriteImageIndex in this.agentFavoriteImages){
              this.agentFavoriteImages[agentFavoriteImageIndex]['selected'] = false;
            }
          } else {
            this.showNotification('danger', 'Error al consultar las imágenes del catálogo', 'Ha ocurrido un error inesperado al consultar las imágenes del catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) => {
          console.log(error);
          this.showNotification('danger', 'Error al consultar las imágenes del catálogo', 'Ha ocurrido un error inesperado al consultar las imágenes del catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
    },

    deselectImages(){
      for (var agentFavoriteImageIndex in this.agentFavoriteImages){
        this.agentFavoriteImages[agentFavoriteImageIndex]['selected'] = false;
      }
    },

    openAgentFavoriteMessagesModal(){
      this.agentFavoriteMessages = JSON.parse(localStorage.getItem('agentFavoriteMessages'));
    },

    addCloseConversationReason(reason){
      this.closeConversationReason = reason;
    },

    pauseAudioRecording(){
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },

    async startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.startTime = new Date();

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
            this.recordedAudioFile = reader.result;
        };
        reader.readAsDataURL(blob);
        
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordAudioDialog = true;

      this.updateRecordedTime();
    },

    updateRecordedTime() {
      setInterval(() => {
        if ((this.startTime !== null) && (this.isRecording == true)) {
          const currentTime = new Date();
          const elapsedTime = currentTime - this.startTime;
          this.recordedTime = this.formatTime(elapsedTime);
        }
      }, 10);
    },

    formatTime(ms) {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },

    cargarTesting(codigo){
      return new Promise((cargarTestingPromiseResolve) => {
        axios.get('https://noah.cr/BackendKingVape/api/ProductosWebs/'+codigo).then(function(response){
        var textoExistencia = '';
        for (var indice in response.data){
          if (textoExistencia == ''){
            textoExistencia = response.data[indice].sitio + ': ' + response.data[indice].cantidadInvActual;
          } else {
            textoExistencia = textoExistencia + '\n' + response.data[indice].sitio + ': ' + response.data[indice].cantidadInvActual;
          }
        }
        cargarTestingPromiseResolve(textoExistencia + '\n\n');
        }).catch(function(error){
          alert('Producto no encontrado');
        });
      });
    },

    async cargarExistenciaNicotina(productosPorNicotina){
      this.stockLoader = true;
      var texto = '';
      for (var indiceProducto in productosPorNicotina){
        var codigoProducto = productosPorNicotina[indiceProducto].codigoAsoiado;
        var a = await this.cargarTesting(codigoProducto);
        texto = texto + productosPorNicotina[indiceProducto].nicotina + 'MG:\n' + a;
      }
      this.stockLoader = false;
      this.stockContent = texto;
    },

    cargarExistencia(codigoProducto){
      this.stockLoader = true;
      let me = this;
      axios.get('https://noah.cr/BackendKingVape/api/ProductosWebs/'+codigoProducto).then(function(response){
        var textoExistencia = '';
        for (var indice in response.data){
          if (textoExistencia == ''){
            textoExistencia = response.data[indice].sitio + ': ' + response.data[indice].cantidadInvActual;
          } else {
            textoExistencia = textoExistencia + '\n' + response.data[indice].sitio + ': ' + response.data[indice].cantidadInvActual;
          }
        }
        me.stockLoader = false;
        me.stockContent = textoExistencia;
        
      }).catch(function(error){
        me.$bvToast.toast("Ha ocurrido un error inesperado al consultar el stock. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar stock",
          variant: "danger",
          solid: true
        });
      });
    },
  
    saveLocation(locationName, whatsappGeneralMessage){
      this.currentActiveConversation.whatsappConversationRecipientLocations[locationName] = {latitude: whatsappGeneralMessage.whatsappLocationMessageLatitude, longitude: whatsappGeneralMessage.whatsappLocationMessageLongitude};
      this.showNotification('success', 'Ubicación registrada', "Ha registrado la ubicación '"+locationName+"' al cliente exitosamente.");
    },

    getLocation(whatsappGeneralMessage){
      return {lat: whatsappGeneralMessage.whatsappLocationMessageLatitude, lng: whatsappGeneralMessage.whatsappLocationMessageLongitude}
    },


    getImageVariant(image){
      if (image.selected == true) {
        return 'success'
      } else {
        return 'default'
      }
    },

    getImageStyle(image){
      return 'cursor: pointer';
    },

    getAllFavoriteVariant(){
      var variant = 'success';
      for(var imageIndex in this.agentFavoriteImages){
        if (this.agentFavoriteImages[imageIndex].selected == false){
          variant = 'default';
        };
      } 
      return variant;
    },

    selectFavoriteImage(image){
      this.$set(this.agentFavoriteImages, image, { ...this.agentFavoriteImages[image], selected: !this.agentFavoriteImages[image].selected });
    },

    selectAllFavoriteImage(){
      if (this.allImageSelected == false){
        for (var imageIndex in this.agentFavoriteImages) {
          this.$set(this.agentFavoriteImages, imageIndex, { ...this.agentFavoriteImages[imageIndex], selected: true });
        }
      } else {
        for (var imageIndex in this.agentFavoriteImages) {
          this.$set(this.agentFavoriteImages, imageIndex, { ...this.agentFavoriteImages[imageIndex], selected: false });
        }
      }
      this.allImageSelected = !this.allImageSelected;
    },

    
    CleanData(){
      this.name = "";
      this.phone = "";
      this.cedula = "";
      this.email = "";
      this.MetodoEnvio = "";
      this.MetodoPago= "";
      this.pagaCon ="";
      this.estadoPago = "";
      this.address = "";
      this.nota = "";
    },

    updateFieldCant(field, value, row) {
      this.currentActiveConversation.whatsappConversationProducts[row.originalIndex].cantidad = value;

      const codigoProducto = row.CodigoP;
      const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
      if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        for (var productoIndex in ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][productoIndex]['CodigoP'] == codigoProducto){
            ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][productoIndex]['cantidad'] = value;
          }
        }
      }
      localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
    },


    updateFieldDesc(field, value, row) {
      this.currentActiveConversation.whatsappConversationProducts[row.originalIndex].descuento = value;

      const codigoProducto = row.CodigoP;
      const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
      if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        for (var productoIndex in ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][productoIndex]['CodigoP'] == codigoProducto){
            ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][productoIndex]['descuento'] = value;

          }
        }
      }
      localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
    },


    ValidarData(){
      var Valido = 1;

      if(this.orden.length == 0){
          this.$bvToast.toast('Por favor, agregue al menos un producto al carrito para generar la orden, e intentelo nuevamente.', {
            title: 'Error al generar la orden',
            variant: 'danger',
            solid: true
          });
          Valido = 0;

        } else if(this.name == ""){
          this.$bvToast.toast('Por favor, agregue el nombre del cliente para generar la orden, e intentelo nuevamente.', {
            title: 'Error al generar la orden',
            variant: 'danger',
            solid: true
          });
          Valido = 0;

        } else if(this.phone == ""){
        this.$bvToast.toast('Por favor, agregue el teléfono del cliente para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;

        } else if(this.cedula == ""){
        this.$bvToast.toast('Por favor, agregue la cédula del cliente para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;

      } else if(this.Sucursal == "Sucursal de envío"){
        this.$bvToast.toast('Por favor, seleccione una sucursal de envío para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;

      
      } else if(this.MetodoEnvio == "Método de envío"){
        this.$bvToast.toast('Por favor, seleccione un método de envío para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;

      } else if(this.MetodoPago == "Método de pago"){
        this.$bvToast.toast('Por favor, seleccione un método de pago para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;
      
      } else if(this.estadoPago == "Estado de pago"){
        this.$bvToast.toast('Por favor, seleccione un estado de pago para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;
      
      
      } else if(this.currentActiveConversation.address == ""){
        this.$bvToast.toast('Por favor, agregue una nota de la dirección para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;
        
      
      } else if(this.currentActiveConversation.nota == ""){
        this.$bvToast.toast('Por favor, agregue una nota del envío para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;
      } 


    return Valido;

    },

    OrdenExpress(){
      this.phone = this.currentActiveConversation.whatsappConversationRecipientPhoneNumber;
      this.name = this.currentActiveConversation.whatsappConversationRecipientProfileName;
      this.repliedMessage = null;
      this.cedula = this.currentActiveConversation.whatsappConversationRecipientID;
      this.email = this.currentActiveConversation.whatsappConversationRecipientEmail;
      this.address = this.currentActiveConversation.whatsappConversationRecipientLocationDetails;
      this.nota = this.currentActiveConversation.whatsappConversationRecipientNote; 
      this.orden = this.currentActiveConversation.whatsappConversationProducts;
      this.producto = '';

      if(this.ValidarData() == 1){
        var metodoEnvioCorregido = '';
        if (this.MetodoEnvio == 'Retiro en sucursal'){
          metodoEnvioCorregido = 'Retira en sucursal';
        } else if (this.MetodoEnvio == 'Envío por motorizado'){
          metodoEnvioCorregido = 'Envio Propio';
        } else {
          metodoEnvioCorregido = 'Correos de CR';
        }

        this.loaderOrdenEnviada = true;
        var me = this;
        this.loading = true;
        var momentoActual = new Date(); 
        var hora = momentoActual.getHours(); 
        var minuto = momentoActual.getMinutes(); 
        var segundo = momentoActual.getSeconds();
        var time = hora + ":" + minuto + ":" + segundo;
        let header={"Authorization" : "Bearer "};
        let configuracion= {headers : header};

        axios.post('https://noah.cr/BackendKingVape/api/ordenexpress/CrearMesaTotal',
        {
          'fecha': this.today.toString(),
          'cajero': this.agentName,
          'total': this.calcularTotal,
          'Nombre': this.name,
          'telefono': this.phone,
          'Direccion': this.address,
          'tipoPago1': this.MetodoPago,
          'Hora': time,
          'descuento': this.calcularDescuento,
          'localidad': this.Sucursal,
          'estado': 0,
          'nota':" Estado Pago: " +this.estadoPago+" "+this.pagaCon+" "+this.nota,
          'tipoCompra': metodoEnvioCorregido,
          'detalles': this.orden,
          'correo': this.email,
          'latitud': this.latitud,
          'longitud': this.longitud,
          'Mesa':"50",
          'TipoCedula':'FISICA',
          'Cedula':this.cedula,
          'Direccion2':this.DireccionCliente2,
          'Direccion3':this.DireccionCliente3,
          'Personas':this.dividendo,
          'Mensajero':'',
          'MedioOrden':'Whatsapp',
          'Facturacion': false
        },configuracion)
        
        .then(function (response) {
          me.$swal({
            title: "Se ha enviado la orden al sistema de comandas de la pantalla",
            text: "¿Quiere archivar la conversación?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonText: 'Cancelar',
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirmar"
          })
          .then((result) => {
            axios.post(constants.routes.backendAPI+'/insertOrUpdateContact',
            {
              'contactName': me.name,
              'contactPhoneNumber': me.phone,
              'contactID': me.cedula,
              'contactEmail': me.email,
              'contactLocations': me.currentActiveConversation.whatsappConversationRecipientLocations,
              'contactLocationDetails': me.address,
              'contactNote': me.nota
            }).then(function (){
              
            })
            if (result.value) {
              const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
              if (ordenesActualesLocalStorage[me.phone]){
                delete ordenesActualesLocalStorage[me.phone];
              }
              localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));

              var whatsappConversationID = null;
              for (var conversationID in me.activeConversationsAsJSON) {
                if (me.activeConversationsAsJSON[conversationID].whatsappConversationRecipientPhoneNumber == me.phone) {
                  whatsappConversationID = conversationID;
                }
              }

              var total = 0;
              for (var productIndex in me.activeConversationsAsJSON[whatsappConversationID].whatsappConversationProducts){
                total = total + (me.activeConversationsAsJSON[whatsappConversationID].whatsappConversationProducts[productIndex].cantidad * me.activeConversationsAsJSON[whatsappConversationID].whatsappConversationProducts[productIndex].precio)
              }


              axios.post(constants.routes.backendAPI+'/closeWhatsappConversation',
              {
                whatsappConversationRecipientPhoneNumber: me.phone,
                whatsappConversationCloseComment: 'Venta',
                whatsappConversationAmount: total,
                whatsappTextMessageBody: localStorage.getItem('agentEndMessage'),
                whatsappConversationProducts: me.activeConversationsAsJSON[whatsappConversationID].whatsappConversationProducts
              })
              .then((response) =>{ 
                if (response.data.success){
                  me.showNotification('success', 'Conversación finalizada', 'Ha finalizado la conversación exitosamente.')

                  delete me.activeConversationsAsJSON[response.data.result];
                  me.sortConversations();
                  me.currentActiveConversation = null;
                } else {
                  this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
                }
              })
              .catch((error) =>{
                this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
              })

            }
            me.CleanData();
            me.loading = false;
            me.loaderOrdenEnviada = false;
          });
        })
        .catch(function (error) {
          this.showNotification('danger', 'Error al generar la orden', 'Ha ocurrido un error inesperado al general la orden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          this.loading = false; 
        });
      }
    },

      EliminarLinea(id){
        this.currentActiveConversation.whatsappConversationProducts = this.currentActiveConversation.whatsappConversationProducts.filter(e => e.id != id)
        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber].filter(e => e.id != id);
        }
        localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
      },
      AgregarItem(item,variant = null){
        this.currentActiveConversation.whatsappConversationProducts.push({
          CodigoP:item.codigoProducto,
          descripcion: item.descripcion,
          cantidad: 1,
          precio: item.precioVenta,
          id: item.id,
          descuento: 0,
        });
        this.$bvToast.toast(item.descripcion + " cargado al carrito.", {
          title: `Producto cargado al carrito`,
          variant: variant,
          solid: true
        });

        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber].push({
            CodigoP: item.codigoProducto,
            descripcion: item.descripcion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          });
        } else {
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = [{
            CodigoP: item.codigoProducto,
            descripcion: item.descripcion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          }];
        }
        localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
      },

      AgregarItemVariacion(item, codigoVariacion, descripcionVariacion, variant = null){
        this.currentActiveConversation.whatsappConversationProducts.push({
          CodigoP: codigoVariacion,
          descripcion: item.descripcion + '. Variación: ' + descripcionVariacion,
          cantidad: 1,
          precio: item.precioVenta,
          id: item.id,
          descuento: 0
        });
        this.$bvToast.toast(item.descripcion + " cargado al carrito.", {
          title: `Producto cargado al carrito`,
          variant: variant,
          solid: true
        });

        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber].push({
            CodigoP: codigoVariacion,
            descripcion: item.descripcion + ' ' + descripcionVariacion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          });
        } else {
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = [{
            CodigoP: codigoVariacion,
            descripcion: item.descripcion + ' ' + descripcionVariacion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          }];
        }

        localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
      },

      selectProductos(){
        this.repliedMessage = null;
        let me=this;
        let Objeto = [];
        let myInput = document.getElementById('buscador');
        myInput = myInput.value;
        let cant = myInput.length;
        if ( cant > 2 ) {
          var search_term = myInput;
          
          this.timeouts.map( timeout => {
            window.clearTimeout( timeout );
          } );
          this.timeouts.push(
            setTimeout( () => {
              this.loading = true;
              axios.get('https://bakend2king.kingvape.cr/api/Productos/BuscadorEnter5/King Vape/'+myInput).then( response => {
                me.productos = [];
                Objeto = response.data

                  // Cargar Productos 
                  Objeto.map(function(x){
                    me.productos.push({descripcion:x.descripcion,
                      codigoProducto:x.codigoProducto,
                      consignacion:x.consignacion,
                      precioVenta:x.precioVenta,
                      localizacion:x.localizacion,
                      datosAdicionales:x.subFamilia,
                      ubicacion:x.ubicacion,
                      id: me.productos.length + 2,
                      productosAsociados: x.productosAsociados
                    });
                  });
                  //me.productos= Objeto;
                  me.loading = false;
                } )
                .catch( error => { } );
            }, 500 )
          );
        } else {
          this.timeouts.map( timeout => {
            window.clearTimeout( timeout );
          } );
          this.productos = [];
        }
      },


    uploadImage(){
      document.getElementById('imageUploader').click();
    },


    getMessageOwnerColor(messageOwner){
      if(messageOwner == null){
        return "background-color:#ceefff";
      } 
      return "background-color:#dedede";
    },
    getMessageOwnerStyle(messageOwner){
      if(messageOwner != null){
        return 'user';
      } 
    },


    sendWhatsappTextMessage(){
      this.sendingMessageDisable = true;
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappTextMessage',
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappGeneralMessageRepliedMessageID: repliedMessageID,
        whatsappTextMessageBody: this.currentActiveConversation['textoEnviar']
      }) 
      .then((response) =>{ 
        if (response.data.success){
          this.$refs.textoEnviar.focus();
          this.currentActiveConversation['textoEnviar'] = '';
          this.sendingMessageDisable = false;
          this.repliedMessage = null;
          this.newTextMessageContent = '';
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);          
          this.scrollDown();
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    sendWhatsappFavoriteTextMessage(whatsappTextMessageContent){
      this.sendingMessageDisable = true;
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappTextMessage',
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappGeneralMessageRepliedMessageID: repliedMessageID,
        whatsappTextMessageBody: whatsappTextMessageContent
      }) 
      .then((response) =>{ 
        if (response.data.success){
          this.sendingMessageDisable = false;
          this.repliedMessage = null;
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);      
          this.scrollDown();
          this.sortConversations();
          this.$root.$emit('bv::hide::modal','favoriteModal');
        } else {
          this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }); 
    },

    sendWhatsappOrderTextMessage(){
      if (this.currentActiveConversation.whatsappConversationProducts.length != 0){
        var whatsappTextMessageContent = '';
        for (var productIndex in this.currentActiveConversation.whatsappConversationProducts){
          if (whatsappTextMessageContent != ''){
            whatsappTextMessageContent = whatsappTextMessageContent + `%0a%0a*Nombre*: ` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['descripcion'] + `%0a*Precio*: ₡` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['precio'] + `%0a*Cantidad*: ` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['cantidad'] + `%0a*Subtotal*: ₡` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['cantidad']*this.currentActiveConversation.whatsappConversationProducts[productIndex]['precio'];
          } else {
            whatsappTextMessageContent = `*Nombre*: ` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['descripcion'] + `%0a*Precio*: ₡` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['precio'] + `%0a*Cantidad*: ` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['cantidad'] + `%0a*Subtotal*: ₡` + this.currentActiveConversation.whatsappConversationProducts[productIndex]['cantidad']*this.currentActiveConversation.whatsappConversationProducts[productIndex]['precio'];
          }
        }
        whatsappTextMessageContent = whatsappTextMessageContent + `%0a%0a*SUBTOTAL*: ₡` + this.calcularSubTotal;
        whatsappTextMessageContent = whatsappTextMessageContent + `%0a*DESCUENTO*: ₡` + this.calcularDescuento;
        whatsappTextMessageContent = whatsappTextMessageContent + `%0a*TOTAL*: ₡` + this.calcularTotal;        
        var repliedMessageID = ''
        if (this.repliedMessage != null){
          repliedMessageID = this.repliedMessage.messageID;
        }
        this.sendingMessageDisable = true;
        axios.get(constants.routes.backendAPI
            +'/sendWhatsappTextMessage?'
            +'&whatsappConversationRecipientPhoneNumber='+this.currentActiveConversation.whatsappConversationRecipientPhoneNumber
            +'&whatsappTextMessageBody='+whatsappTextMessageContent
            +'&whatsappGeneralMessageRepliedMessageID='+repliedMessageID
        ).then((response) =>{ 
          if (response.data.success){
            this.sendingMessageDisable = false;
            this.repliedMessage = null;
            const whatsappConversationID = response.data.result.whatsappConversationID;
            this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);      
            this.scrollDown();
            this.sortConversations();
          } else {
            this.showNotification('danger', 'Error al enviar el carrito al cliente', 'Ha ocurrido un error inesperado al enviar el carrito. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) =>{
          this.showNotification('danger', 'Error al enviar el carrito al cliente', 'Ha ocurrido un error inesperado al enviar el carrito. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        });  
      } else {
        this.showNotification('danger', 'Error al enviar el carrito al cliente', 'Debe colocar al menos un producto en el carrito para poder enviarlo al cliente.')
      } 
    },

    sendWhatsappImageMessage(){
      this.file = this.$refs.imageFile.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        var repliedMessageID = '';
        if (this.repliedMessage != null){
          repliedMessageID = this.repliedMessage.messageID
        }
        this.loaders.fileShare = true;
        axios.post(constants.routes.backendAPI+'/sendWhatsappImageMessage', 
        {
          whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
          whatsappImageMessageFile: reader.result,
          whatsappGeneralMessageRepliedMessageID: repliedMessageID
        })
        .then((response) =>{
          if (response.data.success){
            this.loaders.fileShare = false;
            this.file = null;
            this.repliedMessage = null;
            const whatsappConversationID = response.data.result.whatsappConversationID;
            this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result); 
            this.scrollDown();
            this.sortConversations();
          } else {
            this.showNotification('danger', 'Error al enviar la imagen al cliente', 'Ha ocurrido un error inesperado al enviar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) =>{
          this.showNotification('danger', 'Error al enviar la imagen al cliente', 'Ha ocurrido un error inesperado al enviar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      };
      reader.onerror = function (error) {
        this.showNotification('danger', 'Error al cargar la imagen', 'Ha ocurrido un error inesperado al cargar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      };
    },

    sendWhatsappAudioMessage(){
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.messageID
      }
      this.loaderAudio = true;
      axios.post(constants.routes.backendAPI+'/sendWhatsappAudioMessage', 
      {
        'whatsappConversationRecipientPhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        'whatsappGeneralMessageRepliedMessageID': repliedMessageID,
        'whatsappAudioMessageFile': this.recordedAudioFile
      }).then((response) =>{
        if (response.data.success){
          this.loaderAudio = false;
          this.repliedMessage = null;
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);
          this.$root.$emit('bv::hide::modal','recordAudioModal');
          this.scrollDown();
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al enviar el audio', 'Ha ocurrido un error inesperado al enviar el audio. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        console.log(error)
        this.showNotification('danger', 'Error al enviar el audio', 'Ha ocurrido un error inesperado al enviar el audio. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    sendWhatsappLocationMessage(locationName){
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.messageID
      }
      if (this.currentActiveConversation.whatsappConversationRecipientLocations[locationName]){
        axios.post(constants.routes.backendAPI+'/sendWhatsappLocationMessage',{
          whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
          whatsappGeneralMessageRepliedMessageID: repliedMessageID,
          whatsappLocationMessageLatitude: this.currentActiveConversation.whatsappConversationRecipientLocations[locationName].latitude,
          whatsappLocationMessageLongitude: this.currentActiveConversation.whatsappConversationRecipientLocations[locationName].longitude,
        })
        .then((response) =>{
          if (response.data.success){
            this.repliedMessage = null;
            const whatsappConversationID = response.data.result.whatsappConversationID;
            this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);          
            this.scrollDown();
            this.sortConversations();
          } else {
            this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) =>{
          this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      } else {
        this.showNotification('danger', 'Error al enviar la ubicación', 'El cliente no cuenta con una ubicación asignada. Por favor complete la información e intentelo nuevamente.')
      }
    },

    sendWhatsappStoreLocationMessage(locationName){
      var latitud = 0;
      var longitud = 0;
      if (locationName == 'Zapote'){
        var latitud = 9.920173;
        var longitud = -84.051987;
      } else if (locationName == 'Escazu'){
        var latitud = 9.949093;
        var longitud = -84.163117;
      } else if (locationName == 'Cartago') {
        var latitud = 9.864751;
        var longitud = -83.925354;
      } else if (locationName == 'Heredia') {
        var latitud = 9.864751;
        var longitud = -83.925354;
      }
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappLocationMessage',{
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappGeneralMessageRepliedMessageID: repliedMessageID,
        whatsappLocationMessageLatitude: latitud,
        whatsappLocationMessageLongitude: longitud,
      })
      .then((response) =>{
        if (response.data.success){
          this.repliedMessage = null;
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);          
          this.scrollDown();
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


    async sendWhatsappFavoriteImageMessage(){
      const currentConversation = this.currentActiveConversation;
      for (var image in this.agentFavoriteImages){
        if (this.agentFavoriteImages[image].selected){       
          await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
          {
            whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
            whatsappFavoriteImageMessageContent: this.agentFavoriteImages[image],
            whatsappFavoriteImageMessageCaption: null
          })
          .then((response) => {
            if (response.data.success){
              this.agentFavoriteImages[image].selected = false;
              this.repliedMessage = null;
              const whatsappConversationID = response.data.result.whatsappConversationID;
              this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);
              this.scrollDown();
            } else {
              this.showNotification('danger', 'Error al enviar el catálogo al cliente', 'Ha ocurrido un error inesperado al enviar el catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            }
          })
          .catch((error) =>{
            this.showNotification('danger', 'Error al enviar el catálogo al cliente', 'Ha ocurrido un error inesperado al enviar el catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          })
        }
      }
      
      this.sortConversations();
    },

    sendSelectedWhatsappFavoriteImageMessage(selectedWhatsappFavoriteImage){
      var text = '';
      if (selectedWhatsappFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias'){
        text = 'Te envío por acá nuestras cuentas bancarias en caso de que canceles por transferencia';
      } else {
        text = localStorage.getItem('agentStartMessage');
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappFavoriteImageMessageContent: selectedWhatsappFavoriteImage,
        whatsappFavoriteImageMessageCaption: text
      })
      .then((response) => {
        if (response.data.success){
          this.scrollDown();
          this.sortConversations();
          this.repliedMessage = null;
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);
          this.$root.$emit('bv::hide::modal','favoriteModal');
        } else {
          this.showNotification('danger', 'Error al enviar el catálogo al cliente', 'Ha ocurrido un error inesperado al enviar el catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        console.log(error);
        this.showNotification('danger', 'Error al enviar el catálogo al cliente', 'Ha ocurrido un error inesperado al enviar el catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    async sendWhatsappProductMessage(product){
      this.repliedMessageID = null;
      this.enviandoProductoLoader = true;
      const whatsappProductImageMessageCaption = `*Nombre:* ` + product.descripcion + `. *Precio:* ₡` + product.precioVenta + `. *Descripción:* ` + product.datosAdicionales;
      axios.post(constants.routes.backendAPI+'/sendWhatsappProductImageMessage', 
      {
        'whatsappConversationRecipientPhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        'whatsappProductImageMessageURL': product.localizacion,
        'whatsappProductImageMessageCaption': whatsappProductImageMessageCaption
      })
      .then((response) =>{
        if (response.data.success){
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);
          this.enviandoProductoLoader = false;
          this.scrollDown();
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al enviar el producto al cliente', 'Ha ocurrido un error inesperado al enviar el producto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al enviar el producto al cliente', 'Ha ocurrido un error inesperado al enviar el producto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    requestTransferWhatsappConversation(transferedAgent){
      var whatsappConversationID = null;
      for (var conversationID in this.activeConversationsAsJSON) {
        if (this.activeConversationsAsJSON.hasOwnProperty(conversationID) && this.activeConversationsAsJSON[conversationID] === this.currentActiveConversation) {
          whatsappConversationID = conversationID;
        }
      }
      if (whatsappConversationID != null){
        axios.post(constants.routes.backendAPI+'/requestTransferWhatsappConversation',
        {
          currentAgentDI: parseInt(localStorage.getItem('agentID')),
          currentAgentName: localStorage.getItem('agentName'),
          newAgentID: transferedAgent.agentID,
          whatsappConversationID: whatsappConversationID,
          whatsappConversationProducts: this.currentActiveConversation.whatsappConversationProducts
        })
        .then((response) =>{ 
          if (response.data.success){
            this.showNotification('info', 'Transferencia solicitada', 'Se ha solicitado la transferencia al otro agente. Por favor espere...');

          } else {
            this.showNotification('danger', 'Error al solicitar la transferencia', 'Ha ocurrido un error inesperado al solicitar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch((error) =>{
          this.showNotification('danger', 'Error al solicitar la transferencia', 'Ha ocurrido un error inesperado al solicitar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al solicitar la transferencia', 'Ha ocurrido un error inesperado al solicitar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }  
    },

    acceptTransferWhatsappConversation(){
      axios.post(constants.routes.backendAPI+'/acceptTransferWhatsappConversation',
      {
        currentAgentID: this.transferFromAgentID,
        newAgentID: parseInt(localStorage.getItem('agentID')),
        whatsappConversationID: this.transferConversationID
      })
      .then(async (response) =>{
        if (response.data.success){
          this.playSound('grabConversation');
          this.showNotification('success', 'Conversación transferida', 'Ha aceptado la transferencia exitosamente.');
          await this.selectAgentConversation(this.transferConversationID);
        } else {
          this.showNotification('danger', 'Error al aceptar la transferencia', 'Ha ocurrido un error inesperado al aceptar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((error) =>{
        console.log(error);
        this.showNotification('danger', 'Error al aceptar la transferencia', 'Ha ocurrido un error inesperado al aceptar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    changeCurrentActiveConversation(currentActiveConversation){
      this.currentActiveConversation = currentActiveConversation;
      this.productos = [];
      this.repliedMessage = null;
      this.producto = '';
      this.verifiedUser = '';
      var availableConversation = false;
      for (var activeConversationMessage in currentActiveConversation.whatsappConversationMessages){
        if (currentActiveConversation.whatsappConversationMessages[activeConversationMessage] != null){
          if (currentActiveConversation.whatsappConversationMessages[activeConversationMessage].whatsappGeneralMessageOwnerPhoneNumber != null) {
            availableConversation = true;
          }
        }
      }
      this.availableConversation = availableConversation;
      const databaseOrders = JSON.parse(localStorage.getItem('ordenesActuales'));
      if (databaseOrders[currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        this.currentActiveConversation.whatsappConversationProducts = databaseOrders[currentActiveConversation.whatsappConversationRecipientPhoneNumber];        
      }
      this.scrollDown();
    },

    closeWhatsappConversation(){
      axios.post(constants.routes.backendAPI+'/closeWhatsappConversation',
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappConversationCloseComment: this.closeConversationReason,
        whatsappConversationAmount: 0,
        whatsappTextMessageBody: localStorage.getItem('agentEndMessage'),
        whatsappConversationProducts: []
      })
      .then((response) =>{ 
        if (response.data.success){
          const whatsappConversationID = response.data.result;
          this.showNotification('success', 'Conversación cerrada', "Se ha cerrado la conversación asociada al número '" + this.currentActiveConversation.whatsappConversationRecipientPhoneNumber + "'.");
          delete this.activeConversationsAsJSON[whatsappConversationID];

          this.currentActiveConversation = null;
          this.repliedMessage = null;
          const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
          if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
            delete ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
          }
          localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
          this.sortConversations();

        } else {
          this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    grabStoreConversation(storeMessage){
      this.loaders.grabConversation = true;
      axios.post(constants.routes.backendAPI+'/grabStoreConversation',{
        storeMessageID: storeMessage.storeMessageID,
        storeMessageStoreMessageID: storeMessage.storeMessageStoreMessageID,
        storeMessageStoreName: storeMessage.storeMessageStoreName,
        storeMessageAssignedAgentID: parseInt(localStorage.getItem('agentID')),
        storeMessageRecipientPhoneNumber: storeMessage.storeMessageRecipientPhoneNumber,
        storeMessageRecipientProfileName: storeMessage.storeMessageRecipientProfileName,
        messageToClientContent: localStorage.getItem('agentStartMessage')
      })
      .then((response) =>{
        if (response.data.success){
          if (storeMessage.storeMessageStoreName == 'Escazu'){
            this.escazuConversations = this.escazuConversations.filter(escazuConversation => escazuConversation.storeMessageID != storeMessage.storeMessageID);
          } else if (storeMessage.storeMessageStoreName == 'Zapote'){
            this.zapoteConversations = this.zapoteConversations.filter(zapoteConversation => zapoteConversation.storeMessageID != storeMessage.storeMessageID);
          } else if (storeMessage.storeMessageStoreName == 'Cartago'){
            this.cartagoConversations = this.cartagoConversations.filter(cartagoConversation => cartagoConversation.storeMessageID != storeMessage.storeMessageID);
          }
          this.hints[storeMessage.storeMessageRecipientPhoneNumber] = storeMessage.storeMessageRecipientOrder;
          this.loaders.grabConversation = false;
          const whatsappConversationID = response.data.result;
          this.playSound('grabConversation');
          this.showNotification('success', 'Conversación asignada', 'Ha tomado la conversación proveniente de la tienda exitosamente. Recuerde esperar a la respuesta del cliente.');
          this.selectAgentConversation(whatsappConversationID);
        } else {
          this.showNotification('danger', 'Error al tomar la conversación', 'Ha ocurrido un error inesperado al tomar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al tomar la conversación', 'Ha ocurrido un error inesperado al tomar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    grabPendingConversation(pendingConversation){
      this.loader2 = true;
      axios.post(constants.routes.backendAPI+'/grabWhatsappPendingConversation',
      {
        whatsappConversationID: pendingConversation.whatsappConversationID,
        whatsappConversationAssignedAgentID: parseInt(localStorage.getItem('agentID')),
        whatsappConversationRecipientPhoneNumber: pendingConversation.whatsappConversationRecipientPhoneNumber,
        whatsappTextMessageBody: localStorage.getItem('agentStartMessage')
      })
      .then((response) =>{
        if (response.data.success){
          this.pendingConversations = this.pendingConversations.filter(deletedPendingConversation => deletedPendingConversation.whatsappConversationID != pendingConversation.whatsappConversationID);
          this.loader2 = false;
          const whatsappConversationID = pendingConversation.whatsappConversationID;
          this.playSound('grabConversation');
          this.showNotification('success', 'Conversación asignada', 'Ha tomado la conversación pendiente exitosamente.');
          this.selectAgentConversation(whatsappConversationID);
        } else {
          this.showNotification('danger', 'Error al tomar la conversación', 'Ha ocurrido un error inesperado al tomar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al tomar la conversación', 'Ha ocurrido un error inesperado al tomar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },
    
    selectAllPendingConversation(){
      axios.get(constants.routes.backendAPI+'/selectAllWhatsappPendingConversation')
      .then((response) =>{
        if (response.data.success){
          this.pendingConversations = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las conversaciones pendientes', 'Ha ocurrido un error inesperado al consultar los mensajes pendientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al consultar las conversaciones pendientes', 'Ha ocurrido un error inesperado al consultar los mensajes pendientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectAgentConversations(){
      this.loaders.activeConversations = true;
      axios.post(constants.routes.backendAPI+'/selectAgentConversations',
      {
        whatsappConversationAssignedAgentID: parseInt(localStorage.getItem('agentID')),
        whatsappConversationIsActive: true
      })
      .then((response) =>{
        if (response.data.success){
          const respondedActiveConversations = response.data.result;
          const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
          if (ordenesActualesLocalStorage){
            for (var activeConversationID in respondedActiveConversations){
              var activeConversation = respondedActiveConversations[activeConversationID];
              var activeConversationRecipientPhoneNumber = activeConversation.whatsappConversationRecipientPhoneNumber;
              if (ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber]){
                activeConversation['whatsappConversationProducts'] = ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber];
              }
              respondedActiveConversations[activeConversationID]['textoEnviar'] = '';
              respondedActiveConversations[activeConversationID]['latitude'] = 0;
              respondedActiveConversations[activeConversationID]['longitude'] = 0;

            }    
          }
          this.activeConversationsAsJSON = {};
          this.activeConversationsAsJSON = respondedActiveConversations;
          this.loaders.activeConversations = false;
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al consultar las conversaciones activas', 'Ha ocurrido un error inesperado al consultar las conversaciones pendientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al consultar las conversaciones activas', 'Ha ocurrido un error inesperado al consultar las conversaciones pendientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectAgentConversation(whatsappConversationID){
      this.loaders.activeConversations = true;
      axios.post(constants.routes.backendAPI+'/selectAgentConversation',
      {
        whatsappConversationID: whatsappConversationID,
      })
      .then((response) =>{
        if (response.data.success){
          const respondedActiveConversations = response.data.result;
          const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
          if (ordenesActualesLocalStorage){
            for (var activeConversationID in respondedActiveConversations){
              var activeConversation = respondedActiveConversations[activeConversationID];
              var activeConversationRecipientPhoneNumber = activeConversation.whatsappConversationRecipientPhoneNumber;
              if (ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber]){
                activeConversation['whatsappConversationProducts'] = ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber];
              }
              activeConversation['textoEnviar'] = '';
              activeConversation['latitude'] = 0;
              activeConversation['longitude'] = 0;
            }    
          }
          const selectAgentConversationResult = response.data.result[whatsappConversationID]; 
          this.$set(this.activeConversationsAsJSON, whatsappConversationID, selectAgentConversationResult);
          this.loaders.activeConversations = false;
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al consultar la nueva conversación', 'Ha ocurrido un error inesperado al consultar la nueva conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al consultar la nueva conversación', 'Ha ocurrido un error inesperado al consultar la nueva conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectAllStoreMessage(){
      axios.get(constants.routes.backendAPI+'/selectAllStoreMessage')
      .then((response) =>{
        this.zapoteConversations = [];
        this.escazuConversations = [];
        this.cartagoConversations = [];
        if (response.data.success){
          const selectAllStoreMessageResult = response.data.result;
          for (var storeMessageIndex in selectAllStoreMessageResult){
            var newStoreMessageInformation =
            {
              storeMessageID: selectAllStoreMessageResult[storeMessageIndex].storeMessageID,
              storeMessageStoreName: selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName,
              storeMessageRecipientPhoneNumber: selectAllStoreMessageResult[storeMessageIndex].storeMessageRecipientPhoneNumber,
              storeMessageRecipientProfileName: selectAllStoreMessageResult[storeMessageIndex].storeMessageRecipientProfileName,
              storeMessageStartDateTime: selectAllStoreMessageResult[storeMessageIndex].storeMessageStartDateTime,
              storeMessageStoreMessageID: selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreMessageID,
              storeMessageRecipientID: selectAllStoreMessageResult[storeMessageIndex].storeMessageRecipientID,
              storeMessageRecipientOrder: selectAllStoreMessageResult[storeMessageIndex].storeMessageRecipientOrder
            }
            if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Zapote'){
              this.zapoteConversations.push(newStoreMessageInformation);
            } else if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Escazu'){
              this.escazuConversations.push(newStoreMessageInformation);
            } else if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Cartago'){
              this.cartagoConversations.push(newStoreMessageInformation);
            }
          }
        } else {
          this.showNotification('danger', 'Error al consultar los mensajes de las sucursales', 'Ha ocurrido un error inesperado al consultar los mensajes de las sucursales. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al consultar los mensajes de las sucursales', 'Ha ocurrido un error inesperado al consultar los mensajes de las sucursales. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectAllAgentStatus(){
      axios.get(constants.routes.backendAPI+'/selectAllAgentStatus')
      .then((response) =>{
        if (response.data.success){
          const agentStatusInformation = response.data.result;
          this.agents = [];
          for (var agentIndex in agentStatusInformation){
            if ((agentStatusInformation[agentIndex].agentStatus == 'online') && (agentStatusInformation[agentIndex].agentID != localStorage.getItem('agentID'))){
              const newAgent = {'agentID': agentStatusInformation[agentIndex].agentID, 'agentName': agentStatusInformation[agentIndex].agentName};
              this.agents.push(newAgent);
            }
          }
        } else {
          this.showNotification('danger', 'Error al consultar el estado de los agentes', 'Ha ocurrido un error inesperado al consultar el estado de los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        console.log(error);
        this.showNotification('danger', 'Error al consultar el estado de los agentes', 'Ha ocurrido un error inesperado al consultar el estado de los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    receiveWhatsappStoreMessage(websocketMessageContent){
      const newWhatsappStoreMessageInformation = 
      {
        storeMessageStoreName: websocketMessageContent.storeMessageStoreName,
        storeMessageRecipientPhoneNumber: websocketMessageContent.storeMessageRecipientPhoneNumber,
        storeMessageRecipientProfileName: websocketMessageContent.storeMessageRecipientProfileName,
        storeMessageStartDateTime: websocketMessageContent.storeMessageStartDateTime,
        storeMessageStoreMessageID: websocketMessageContent.storeMessageStoreMessageID,
        storeMessageID: websocketMessageContent.storeMessageID,
        storeMessageRecipientID: websocketMessageContent.storeMessageRecipientID,
        storeMessageRecipientOrder: websocketMessageContent.storeMessageRecipientOrder
      };
      if (websocketMessageContent.storeMessageStoreName == 'Zapote'){
        var newZapoteConversations = this.zapoteConversations;
        this.zapoteConversations = [];
        newZapoteConversations.push(newWhatsappStoreMessageInformation);
        this.zapoteConversations = newZapoteConversations;
      } else if (websocketMessageContent.storeMessageStoreName == 'Escazu'){
        var newEscazuConversations = this.escazuConversations;
        this.escazuConversations = [];
        newEscazuConversations.push(newWhatsappStoreMessageInformation);
        this.escazuConversations = newEscazuConversations;
      } else if (websocketMessageContent.storeMessageStoreName == 'Cartago'){
        var newCartagoConversations = this.cartagoConversations;
        this.cartagoConversations = [];
        newCartagoConversations.push(newWhatsappStoreMessageInformation);
        this.cartagoConversations = newCartagoConversations;
      }
      this.playSound('receiveWhatsappStoreMessage');
    },

    receiveWhatsappMessage(websocketMessageContent){
      const whatsappConversationID = websocketMessageContent.whatsappConversationID;
      if (whatsappConversationID in this.activeConversationsAsJSON){
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(websocketMessageContent);
        this.availableConversation = true;
        this.scrollDown();
        this.playSound('receiveWhatsappMessage');
        this.sortConversations();
      }
    },


    receiveWhatsappConversation(websocketMessageContent){
      const whatsappConversationAssignedAgentID = websocketMessageContent.whatsappConversationAssignedAgentID;
      if (whatsappConversationAssignedAgentID == localStorage.getItem('agentID')){
        const whatsappConversationID = websocketMessageContent.whatsappConversationID;
        whatsappConversationID['whatsappConversationProducts'] = [];
        this.$set(this.activeConversationsAsJSON, whatsappConversationID, websocketMessageContent);
        this.playSound('receiveWhatsappMessage');
        this.availableConversation = true;
        this.sortConversations();
      }
    },

    receiveWhatsappPendingConversation(websocketMessageContent){
      this.pendingConversations.push(websocketMessageContent);
      this.playSound('receiveWhatsappStoreMessage');
    },

    receiveAgentStatusUpdate(websocketMessageContent){
      if (websocketMessageContent.agentID != localStorage.getItem('agentID')){
        if (websocketMessageContent.agentStatus == 'offline'){
          this.agents = this.agents.filter(remainingAgent => remainingAgent.agentID != websocketMessageContent.agentID);
        } else {
          this.agents.push({'agentID': websocketMessageContent.agentID, 'agentName': websocketMessageContent.agentName});
        }
      }
    },
    
    receiveGrabPendingConversation(websocketMessageContent){
      this.pendingConversations = this.pendingConversations.filter(pendingConversation => pendingConversation.whatsappConversationID != websocketMessageContent);
    },

    receiveGrabStoreConversation(websocketMessageContent){
      const storeMessageID = websocketMessageContent.storeMessageID;
      const storeMessageStoreName = websocketMessageContent.storeMessageStoreName;
      if (storeMessageStoreName == 'Escazu'){
        this.escazuConversations = this.escazuConversations.filter(escazuConversation => escazuConversation.storeMessageID != storeMessageID);
      } else if (storeMessageStoreName == 'Zapote'){
        this.zapoteConversations = this.zapoteConversations.filter(zapoteConversation => zapoteConversation.storeMessageID != storeMessageID);
      } else if (storeMessageStoreName == 'Cartago'){
        this.cartagoConversations = this.cartagoConversations.filter(cartagoConversation => cartagoConversation.storeMessageID != storeMessageID);
      }
    },

    receiveRequestTransferWhatsappConversation(websocketMessageContent){
      if (websocketMessageContent.newAgentID == parseInt(localStorage.getItem('agentID'))){
        this.transferRequestName = websocketMessageContent.currentAgentName;
        this.transferFromAgentID = websocketMessageContent['previousAgentID'];
        this.transferConversationID = websocketMessageContent.whatsappConversationID;
        this.transferConversationProducts = websocketMessageContent.whatsappConversationProducts;
        this.$refs.buttonTransfer.click();
      }
    },

    receiveAcceptTransferWhatsappConversation(websocketMessageContent){
      if (websocketMessageContent.whatsappConversationID in this.activeConversationsAsJSON){
        delete this.activeConversationsAsJSON[websocketMessageContent.whatsappConversationID];
        this.sortConversations();
        this.currentActiveConversation = null;
      }
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    playSound(soundType){
      if (soundType == 'receiveWhatsappStoreMessage'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/pending.wav'));
      } else if (soundType == 'receiveWhatsappMessage'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/inbox.mp3'));
      } else if (soundType == 'grabConversation'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/grab.wav'));
      }
      soundToPlay.play();
    },

    scrollDown(){
      this.$nextTick(() => {
        if (this.$refs.scrollRef) {
          const psContainer = this.$refs.scrollRef.$el;
          psContainer.scrollTop = psContainer.scrollHeight;
        }
      });
    },
    
  },

  computed: {
    ...mapGetters([
      "getContactLists",
      "getRecentUser",
      "getCurrentUser",
      "getSelectedUser",
    ]),

    filterContacts() {
      return this.getContactLists.filter((contact) => {
        return contact.name.toLowerCase().match(this.search.toLowerCase());
      });
    },

    calcularDescuento:function(){
			var resultado=0.0; 
				for(var j=0;j<this.currentActiveConversation.whatsappConversationProducts.length;j++)
				  { 
						resultado = resultado + ((this.currentActiveConversation.whatsappConversationProducts[j].descuento/100)*((this.currentActiveConversation.whatsappConversationProducts[j].precio) * this.currentActiveConversation.whatsappConversationProducts[j].cantidad));
          }
			
			return resultado.toFixed(2);
		},

    calcularSubTotal:function(){
			var resultado=0.0; 
				for(var j=0;j<this.currentActiveConversation.whatsappConversationProducts.length;j++)
				  { 
						resultado = resultado + this.currentActiveConversation.whatsappConversationProducts[j].cantidad * this.currentActiveConversation.whatsappConversationProducts[j].precio ;
          }
			
			return resultado.toFixed(2);
		},

    calcularTotal:function(){
			var resultado=0.0; 
				resultado = this.calcularSubTotal - this.calcularDescuento
        resultado = Math.round(resultado / this.multiplo) * this.multiplo;
			return resultado.toFixed(2);
		},

    textoSucursalesCalcular: function(){
      const total = this.escazuConversations.length + this.zapoteConversations.length + this.cartagoConversations.length + this.pendingConversations.length;
      return this.textoSucursales + '(' + total + ')'
    }


  },

  mounted(){
    this.agentStartMessage = localStorage.getItem('agentStartMessage');

    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }
    if (localStorage.getItem('ordenesActuales') == null){
      localStorage.setItem('ordenesActuales', JSON.stringify({}))
    }
    this.agentName = localStorage.getItem('agentName');
    this.selectAllAgentStatus();
    this.selectAllStoreMessage();
    this.selectAgentConversations();
    this.selectAllPendingConversation();
    this.openImageModal();

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;

        if (websocketMessageID == '/receiveWhatsappStoreMessage'){
          this.receiveWhatsappStoreMessage(websocketMessageContent);
        } else if (websocketMessageID == '/receiveWhatsappMessage'){
          this.receiveWhatsappMessage(websocketMessageContent);
        } else if (websocketMessageID == '/receiveWhatsappConversation'){
          this.receiveWhatsappConversation(websocketMessageJSON.websocketMessageContent);
        } else if (websocketMessageID == '/receiveWhatsappPendingConversation'){
          this.receiveWhatsappPendingConversation(websocketMessageJSON.websocketMessageContent);
        } else if (websocketMessageID == '/updateAgentStatus'){
          this.receiveAgentStatusUpdate(websocketMessageContent);
        } else if (websocketMessageID == '/grabPendingConversation') {
          this.receiveGrabPendingConversation(websocketMessageContent);
        } else if (websocketMessageID == '/grabStoreConversation') {
          this.receiveGrabStoreConversation(websocketMessageContent);
        } else if (websocketMessageID == '/requestTransferWhatsappConversation'){
          this.receiveRequestTransferWhatsappConversation(websocketMessageContent);
        } else if (websocketMessageID == '/acceptTransferWhatsappConversation'){
          this.receiveAcceptTransferWhatsappConversation(websocketMessageContent);
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

};
</script>

<style>
  .lang-dropdown .dropdown-menu { 
    width: 300px !important;
    min-width: 600px !important;
  }

  .scrollable-container {
    max-height: 80vh; /* 80% de la altura del viewport */
    overflow-y: auto; /* permite el desplazamiento vertical cuando sea necesario */
  }
  .loading-effect::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10;
      background: repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 10px,
          #ddd 10px,
          #ddd 20px
      );
      animation: loading 1s infinite;
  }

  @keyframes loading {
      0% {
          background-position: 0 0;
      }
      100% {
          background-position: 50px 50px;
      }
  }

  .description-content .btn {
      word-wrap: break-word;
      max-width: 100%;
  }

  .text-dropdown .btn {
      background: none;
      color: inherit;
      border: none;
      word-wrap: break-word;
      max-width: 100%;
      padding: 0;
      font: inherit;
      cursor: pointer;
      font-size: 10px;
      outline: inherit;
  }


  .scrollable-container {
    max-height: 80vh; /* 80% de la altura del viewport */
    overflow-y: auto; /* permite el desplazamiento vertical cuando sea necesario */
  }
  .loading-effect::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10;
      background: repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 10px,
          #ddd 10px,
          #ddd 20px
      );
      animation: loading 1s infinite;
  }

  @keyframes loading {
      0% {
          background-position: 0 0;
      }
      100% {
          background-position: 50px 50px;
      }
  }


</style>
