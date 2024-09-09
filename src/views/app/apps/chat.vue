<template>
  <div class="no-gutters">

    <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
      <img style="width: 1000px;" :src="bigImageSource">
    </b-modal>

    <b-modal scrollable size="m" centered id="IDModal" hide-footer hide-header>
      <div v-if="loaderID == true" style="text-align: center;">
        <br>
        <span class="spinner-glow spinner-glow-primary"></span>
      </div>
      
      <div v-else style="display: flex;">
        <div>
          <div v-if="insertIDClientSource">
            <p style="margin: 0; font-size: 15px;">
              <strong>Cédula del cliente:</strong>
            </p>
            <br>      
            <img v-if="insertIDClientType == 'image'" style="width: 200px;" :src="insertIDClientSource">
            <iframe v-else :src="insertIDClientSource" width="50%" height="300px"></iframe>
          </div>
        </div>
        <div>
          <div v-if="insertIDAuthorizedSource" style="margin-left: 20px">
            <p style="margin: 0; font-size: 15px;">
              <strong>Cédula del autorizado del cliente:</strong>
            </p>
            <br>      
            <img v-if="insertIDAuthorizedType == 'image'" style="width: 200px;" :src="insertIDAuthorizedSource">
            <iframe v-else :src="insertIDAuthorizedSource" width="50%" height="300px"></iframe>
          </div>
        </div>
        <div v-if="insertIDClientSource == null && insertIDAuthorizedSource == null" style="text-align: center;">
          <p style="margin: 0; font-size: 15px;">
            Sin cédula
          </p>
        </div>
      </div>
    </b-modal>


    <b-modal id="selectIDTypeModal" :size="m" hide-footer hide-header centered>
      <div style="text-align: center;">
        <button @click="openInsertClientID(true)" class="btn btn-success mr-2" type="button">Registrar cédula del cliente</button>
        <br><br>
        <button @click="openInsertClientID(false)" class="btn btn-warning mr-2" type="button">Registrar cédula del autorizado del cliente</button>
      </div>
    </b-modal>


    <b-modal scrollable size="m" centered id="insertIDModal" hide-footer hide-header>
      <div v-if="loaderID == true" style="text-align: center;">
        <br>
        <span class="spinner-glow spinner-glow-primary"></span>
      </div>
      
      <div v-else>
        <div v-if="idIsClient" style="display: flex;">
          <div v-if="insertIDClientSource" style="width: 50%; margin-right: 1%">
            <p style="margin: 0; font-size: 15px;">
              <strong>Cédula actual del cliente:</strong>
            </p>
            <br>
            <img v-if="insertIDClientType == 'image'" style="width: 200px;" :src="'data:image/png;base64,'+insertIDClientSource">
            <iframe v-else :src="'data:application/pdf;base64,'+insertIDClientSource" width="50%" height="300px"></iframe>
          </div>
          <div>
            <p style="margin: 0; font-size: 15px;">
              <strong>Nueva cédula del cliente:</strong>
            </p>
            <br>
            <img v-if="insertIDNewType == 'image' && insertIDNewSource" style="width: 200px;" :src="insertIDNewSource">
            <iframe v-else :src="insertIDNewSource" width="50%" height="300px"></iframe>
          </div>
        </div>

        <div v-else style="display: flex;">
          <div v-if="insertIDAuthorizedSource" style="width: 50%; margin-right: 1%">
            <p style="margin: 0; font-size: 15px;">
              <strong>Cédula actual del autorizado del cliente:</strong>
            </p>
            <br>
            <img v-if="insertIDAuthorizedType == 'image'" style="width: 200px;" :src="'data:image/png;base64,'+insertIDAuthorizedSource">
            <iframe v-else :src="'data:application/pdf;base64,'+insertIDAuthorizedSource" width="50%" height="300px"></iframe>
          </div>
          <div>
            <p style="margin: 0; font-size: 15px;">
              <strong>Nueva cédula del autorizado del cliente:</strong>
            </p>
            <br>
            <img v-if="insertIDNewType == 'image' && insertIDNewSource" style="width: 200px;" :src="insertIDNewSource">
            <iframe v-else :src="insertIDNewSource" width="50%" height="300px"></iframe>
          </div>
        </div>
          
          
        <br>
        <div style="text-align: center">
          <button @click="insertClientIDS()" class="btn btn-info mr-2" type="button">Registrar cédula</button>
        </div>
      </div>
    </b-modal>


    <b-modal scrollable size="m" centered id="modalCodigoDescuento" title="Canjear código de descuento" @ok="redeemDiscountCode()">
      <b-form-input v-model="inputCodigoDescuento" placeholder='Código de descuento'></b-form-input>
    </b-modal>

    <div style="position: absolute; top: 5px; left: 30px; display: flex;">
      <div style="min-height: 25px; min-width: 25px; background-color: rgb(0, 177, 0); border-radius: 100px; display: flex; align-items: center; justify-content: center;">
        <p style="margin: 0; font-size: 15px;">
          <strong>{{getCurrentRespondedConversationsAmount()}}</strong>
        </p>
      </div>

      <div style="min-height: 25px; min-width: 25px; background-color: rgb(255, 111, 111); border-radius: 100px; display: flex; align-items: center; justify-content: center; margin-left: 5px;">
        <p style="margin: 0; font-size: 15px;">
          <strong>{{getCurrentNotRespondedConversationsAmount()}}</strong>
        </p>
      </div>
    </div>

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

            <b-modal scrollable size="sm" centered id="saveInvoiceLocation" hide-header @ok="saveInvoiceLocation()">
              <b-form-input v-model="invoiceLocationName" type="text" placeholder="Coloque un nombre para la ubicación"></b-form-input>
            </b-modal>

            <b-modal scrollable size="m" centered id="commentsModal" hide-header hide-footer>
              <div style="max-height: 800px; overflow-y: auto;">
                <b-list-group>
                  <b-list-group-item v-for="openedComment in openedComments" button>
                    <div v-if="openedComment.whatsappConversationTextCommentBody != null">
                      <strong>{{parseHour(openedComment.whatsappConversationCommentSentDateTime)}}</strong><br>
                      <div style="display: flex;">
                        <strong>Comentario:</strong> {{openedComment.whatsappConversationTextCommentBody}}<br>
                        <div class="flex-grow-1"></div>
                        <button v-if="openedComment.whatsappConversationCommentSeenDateTime == null" @click="updateWhatsappConversationCommentSeenDateTime(openedComment.whatsappConversationCommentID)" class="btn btn-success mr-1 ml-1">Recibir</button>
                        <button v-else class="btn btn-info mr-1 ml-1">Recibido</button>
                      </div>
                    </div>
                    <div v-else-if="openedComment.whatsappConversationAudioCommentFile != null">
                      <strong>{{parseHour(openedComment.whatsappConversationCommentSentDateTime)}}</strong><br><br>
                      <div style="display: flex;">
                        <audio controls :src="`data:audio/webm;base64,${openedComment.whatsappConversationAudioCommentFile}`"></audio>
                        <div class="flex-grow-1"></div>
                        <button v-if="openedComment.whatsappConversationCommentSeenDateTime == null" @click="updateWhatsappConversationCommentSeenDateTime(openedComment.whatsappConversationCommentID)" class="btn btn-success mr-1 ml-1">Recibir</button>
                        <button v-else class="btn btn-info mr-1 ml-1">Recibido</button>
                      </div>
                    </div>
                    <div v-else-if="openedComment.whatsappConversationProductCommentName != null">
                      <strong>{{parseHour(openedComment.whatsappConversationCommentSentDateTime)}}</strong><br>   
                      <div style="display: flex;">
                        <div>               
                          <strong>Nombre:</strong> {{openedComment.whatsappConversationProductCommentName}}<br>
                          <strong>Código:</strong> {{openedComment.whatsappConversationProductCommentSKU}}<br>
                        </div>
                        <div class="flex-grow-1"></div>
                        <button v-if="openedComment.whatsappConversationCommentSeenDateTime == null" @click="updateWhatsappConversationCommentSeenDateTime(openedComment.whatsappConversationCommentID)" class="btn btn-success mr-1 ml-1">Recibir</button>
                      </div>
                    </div>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-modal>

            <div class="border-right" style="height: 100%;">
              <vue-perfect-scrollbar :settings="{ suppressScrollX: true}" class="contacts-scrollable perfect-scrollbar rtl-ps-none ps scroll">   
                <div v-if="loaders.activeConversations == true" style="text-align: center;">
                  <br><br><br><span class="spinner-glow spinner-glow-primary"></span>
                </div>
                
                <div v-else v-for="activeConversationID in sortedConversationsID" @click="changeCurrentActiveConversation(activeConversationsAsJSON[activeConversationID], activeConversationID)" :style="getConversationStyle(activeConversationID)" class="p-3 d-flex border-bottom align-items-center hoverTest" :id="'hint'+activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber">
                  <h3 style="margin-right: 15px;">
                    <strong>
                      {{getReferenciaSucursal(activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber)}}
                    </strong>
                  </h3>
                  <h6 style="padding-top: 10px;">
                    <strong>{{activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientProfileName}}</strong> 
                    <br>
                    {{parsePhone(activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber)}}
                    <br><br>
                    {{ parseHour(activeConversationsAsJSON[activeConversationID].whatsappConversationMessages[activeConversationsAsJSON[activeConversationID].whatsappConversationMessages.length-1].whatsappGeneralMessageCreationDateTime) }}
                  </h6>
                  <div class="flex-grow-1"></div>

                  <div style="position: relative; left: -6px; top: -12px;">  
                    <b-form-checkbox @input="changeLocalStorageWhatsappInvoiceInformation('whatsappConversationPin', activeConversationsAsJSON[activeConversationID].whatsappConversationPin)" v-model="activeConversationsAsJSON[activeConversationID].whatsappConversationPin"></b-form-checkbox>
                  </div>

                  <div style="position: relative; left: -7px;" v-if="conversationComments[activeConversationID]">  
                    <div v-if="conversationComments[activeConversationID].length > 0">
                      <img v-if="conversationComments[activeConversationID].filter(item => item.whatsappConversationCommentSeenDateTime == null).length > 0" v-b-modal.commentsModal @click="openCommentsModal(conversationComments[activeConversationID])" class="newMessageAnimation" src="@/assets/pageAssets/commentRed.png" alt style="width: 25px; height: auto;"/>
                      <img v-else v-b-modal.commentsModal @click="openCommentsModal(conversationComments[activeConversationID])" src="@/assets/pageAssets/comment.png" alt style="width: 25px; height: auto;"/>
                    </div>
                  </div>

                  <div class="newMessageAnimation" v-if="activeConversationsAsJSON[activeConversationID].whatsappConversationMessages[activeConversationsAsJSON[activeConversationID].whatsappConversationMessages.length-1].whatsappGeneralMessageOwnerPhoneNumber != null" style="min-height: 15px; min-width: 15px; background-color: rgb(255, 111, 111); border-radius: 100px; display: flex; align-items: center; justify-content: center;">
                    <p style="margin: 0; font-size: 10px;">
                      <strong>{{getIncomingMessagesAmount(activeConversationsAsJSON[activeConversationID].whatsappConversationMessages)}}</strong>
                    </p>
                  </div>
                  <div v-else style="min-height: 15px; min-width: 15px; background-color: rgb(0, 177, 0); border-radius: 100px;"></div>
                  
                  <b-tooltip placement="right" :target="'hint'+activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber" v-if="hints[activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber]">{{hints[activeConversationsAsJSON[activeConversationID].whatsappConversationRecipientPhoneNumber]}}</b-tooltip>
                
                </div>


              </vue-perfect-scrollbar>
            </div>


            <div style="position: absolute; width: 100%; bottom: 0; background-color: #F9E530; height: 50px; text-align: center; cursor:pointer;">
              <b-dropdown ref="dropDownSucursales" dropup :text="textoSucursalesCalcular" variant="primary" style="margin: 0 auto; font-size: medium; top: 5px" size="lg">
                <b-dropdown-item style="background-color: #fed330" href="#" v-b-modal.zapoteConversationsModal>Zapote ({{zapoteConversations.length}})</b-dropdown-item>
                <b-dropdown-item style="background-color: #55b5ab" href="#" v-b-modal.cartagoConversationsModal>Cartago ({{cartagoConversations.length}})</b-dropdown-item>
                <b-dropdown-item style="background-color: #db67a3" href="#" v-b-modal.escazuConversationsModal>Escazú ({{escazuConversations.length}})</b-dropdown-item>
                <b-dropdown-item style="background-color: #a78dcc" href="#" v-b-modal.herediaConversationsModal>Heredia ({{herediaConversations.length}})</b-dropdown-item>
                <b-dropdown-item style="background-color: #6473d1" href="#" v-b-modal.metroPlazaConversationsModal>Metro Plaza ({{metroPlazaConversations.length}})</b-dropdown-item>

                <b-dropdown-item style="background-color: #8fd2ff" href="#" v-b-modal.planetVapeConversationsModal>Planet Vape ({{planetVapeConversations.length}})</b-dropdown-item>

                <b-dropdown-item style="background-color: #dedede" href="#" v-b-modal.pendingConversationsModal>Pendientes ({{pendingConversations.length}})</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>

          <b-modal @ok="deleteStoreConversation()" scrollable size="m" centered id="deleteStoreConversationModal" title="Eliminar mensaje de tienda">
            <b-form-textarea class="form-control" placeholder="Motivo" v-model="deleteStoreMessageReason" style="width: 100%" no-resize rows="3"/>
          </b-modal>


          <b-modal scrollable size="m" centered hide-footer id="escazuConversationsModal" title="Conversaciones pendientes de Escazú">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="escazuConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(escazuConversation)" v-for="escazuConversation in escazuConversations" @click="grabStoreConversation(escazuConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{escazuConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(escazuConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{escazuConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="escazuConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(escazuConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="zapoteConversationsModal" title="Conversaciones pendientes de Zapote">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="zapoteConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(zapoteConversation)" v-for="zapoteConversation in zapoteConversations" @click="grabStoreConversation(zapoteConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{zapoteConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(zapoteConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{zapoteConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="zapoteConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(zapoteConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="cartagoConversationsModal" title="Conversaciones pendientes de Cartago">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="cartagoConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(cartagoConversation)" v-for="cartagoConversation in cartagoConversations" @click="grabStoreConversation(cartagoConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{cartagoConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(cartagoConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{cartagoConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="cartagoConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(cartagoConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="herediaConversationsModal" title="Conversaciones pendientes de Heredia">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="herediaConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(herediaConversation)" v-for="herediaConversation in herediaConversations" @click="grabStoreConversation(herediaConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{herediaConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(herediaConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{herediaConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="herediaConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(herediaConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="metroPlazaConversationsModal" title="Conversaciones pendientes de Metro Plaza">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="metroPlazaConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(metroPlazaConversation)" v-for="metroPlazaConversation in metroPlazaConversations" @click="grabStoreConversation(metroPlazaConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{metroPlazaConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(metroPlazaConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{metroPlazaConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="metroPlazaConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(metroPlazaConversation.storeMessageStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>
          <b-modal scrollable size="m" centered hide-footer id="planetVapeConversationsModal" title="Conversaciones pendientes de Planet Vape">
            <b-list-group v-if="loaders.grabConversation == false">
              <b-list-group-item v-if="planetVapeConversations.length == 0">No hay conversaciones pendientes</b-list-group-item>
              <b-list-group-item @contextmenu.prevent="openDeleteStoreMessageModal(planetVapeConversation)" v-for="planetVapeConversation in planetVapeConversations" @click="grabStoreConversation(planetVapeConversation)" button style="cursor: pointer;">
                <strong>Nombre:</strong> {{planetVapeConversation.storeMessageRecipientProfileName}}<br>
                <strong>Número:</strong> {{parsePhone(planetVapeConversation.storeMessageRecipientPhoneNumber)}}<br>
                <strong>Pedido:</strong> {{planetVapeConversation.storeMessageRecipientOrder}}<br>
                <div style="display: flex;">
                  <strong>Cédula:</strong>
                  <div style="margin-left: 3px;" v-if="planetVapeConversation.storeMessageRecipientID == 'S'">✔️</div>
                  <div style="margin-left: 3px;" v-else>❌</div>
                </div>
                <strong>Fecha:</strong> {{parseHour(planetVapeConversation.storeMessageStartDateTime)}}
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
                <strong>Número:</strong> {{parsePhone(pendingConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                <strong>Fecha:</strong> {{parseHour(pendingConversation.whatsappConversationStartDateTime)}}
              </b-list-group-item>
            </b-list-group>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>

          <b-modal scrollable size="lg" centered hide-footer hide-header id="historyConversationsModal" @shown="scrollToBottomHistory()">
            <div v-if="historyLoader == true" style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
            
            <div v-else style="height: 60vh; overflow-y: auto;" ref='historyScroll'>
              <vue-good-table
                :columns="historyConversationsColumns"
                :line-numbers="false"
                styleClass="order-table vgt-table"
                :rows="historyConversations">
                <template slot="table-row" slot-scope="props">  
                  <div v-if="props.column.field == 'whatsappConversationStartDateTime'">
                    <p>{{parseHour(props.row.whatsappConversationStartDateTime)}}</p>
                  </div>
                  <div v-else-if="props.column.field == 'whatsappConversationEndDateTime'">
                    <p>{{parseHour(props.row.whatsappConversationEndDateTime)}}</p>
                  </div>
                  <div v-else-if="props.column.field == 'whatsappConversationActions'">
                    <i v-if='props.row.whatsappConversationAmount != 0' :id="'productos'+props.row.whatsappConversationID" class="i-Shopping-Cart text-25 text-info" @click="rememberCart(props.row)" style="cursor: pointer; margin-right: 10px;"></i>
                    <b-tooltip v-if='props.row.productos.length != 0' :target="'productos'+props.row.whatsappConversationID" triggers="hover" variant="info" placement="left">
                      <div v-for="element in props.row.productos">
                        <p><strong>{{ element.descripcion }}: </strong>{{element.cantidad}}</p>
                      </div>
                    </b-tooltip>
                    <i class="i-Notepad text-25 text-warning" @click="openHistoryConversation(props.row)" v-b-modal.historyOpenModal style="cursor: pointer; margin-right: 7px;"></i>
                  </div>
                </template>
              </vue-good-table>
            </div>  
          </b-modal>

          <b-modal scrollable size="sm" centered id="saveStickerModal" title="Guardar sticker" @ok="saveSticker()">
            <b-form-input v-model="stickerName" type="text" placeholder="Nombre del sticker"></b-form-input>
          </b-modal>

          <b-modal hide-footer scrollable title="Stickers" size="m" centered id="sendStickerModal">   
            <b-nav tabs justified>
              <b-nav-item :active="getActiveStickerItem('Mis stickers')" @click="changeActiveStickerItem('Mis stickers')">Mis stickers</b-nav-item>
              <b-nav-item :active="getActiveStickerItem('Todos los stickers')" @click="changeActiveStickerItem('Todos los stickers')">Todos los stickers</b-nav-item>
            </b-nav>
            <br>

            <div v-if="loaderSendSticker == false">
              <div v-if="currentStickerItem == 'Mis stickers'">
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                  <img @click="sendWhatsappStickerMessage(currentSticker)" v-for="currentSticker in currentMyStickers" style="cursor: pointer; width: 105px; margin: 5px;" :src="`data:image/png;base64,${currentSticker.stickerFile}`">
                </div>
              </div>

              <div v-else>
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                  <img @click="sendWhatsappStickerMessage(currentSticker)" v-for="currentSticker in currentStickers" style="cursor: pointer; width: 105px; margin: 5px;" :src="`data:image/png;base64,${currentSticker.stickerFile}`">
                </div>
              </div>
            </div>

            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>


          <b-modal scrollable title="Promociones del día de la madre" size="m" centered id="promosModal" @ok="sendPromos()">   
            <div v-if="loaderPromos == false">
              <b-list-group style="height: 700px; overflow-y: auto;">

                <b-list-group-item :variant="getAllPromoVariant()" style="cursor: pointer;" @click="selectAllPromo()" v-if="agentFavoriteImages.length != 0">Seleccionar todas las promociones</b-list-group-item>
                
                <b-list-group-item style="cursor: pointer;" v-for="(promoImage, index) in promos" :variant="getImageVariant(promoImage)" button @click="selectPromo(index)">
                  <div style="display:flex; ">
                    <img :src="promoImage.whatsappFavoriteImageDriveURL" style="width: 70px; height: auto;"/>
                    <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                      <h6>{{promoImage.whatsappFavoriteImageName}}</h6>
                    </div>
                  </div>
                </b-list-group-item>

              </b-list-group>
            </div>
            <div v-else style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </b-modal>


          <b-modal scrollable size="m" centered hide-footer id="historyMessageModal" hide-header>
            <b-list-group v-if="loaders.historyMessage == false && historyMessage != null">
              
              <p v-if="historyMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{historyMessage.whatsappTextMessageBody}}</p>
              
              <div v-if="historyMessage.whatsappGeneralMessageType == 'contact'"> 
                <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{historyMessage.whatsappContactMessageName}}</p>
                <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{historyMessage.whatsappContactMessagePhoneNumber}}</p>
              </div>
              
              <div v-if="historyMessage.whatsappGeneralMessageType == 'image'"> 
                <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`">
                <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappImageMessageCaption}}</p>
                
                <button @click="openClientIDTypeModal(currentActiveConversation.whatsappConversationRecipientPhoneNumber, `data:image/png;base64,${historyMessage.whatsappImageMessageFile}`, 'image')" v-if="historyMessage.whatsappImageMessageType == 'image'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>
              </div>
              
              <div v-if="historyMessage.whatsappGeneralMessageType=='video'"> 
                <video controls width="400" :src="`data:video/mp4;base64,${historyMessage.whatsappVideoMessageFile}`"></video>
                <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappVideoMessageCaption}}</p>
              </div>
              
              <div v-if="historyMessage.whatsappGeneralMessageType=='location'" class="m-0">

                <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="465px" :clientLongitude="historyMessage.whatsappLocationMessageLongitude" :clientLatitude="historyMessage.whatsappLocationMessageLatitude"></MapComponent>

                <br>
                <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{historyMessage.whatsappLocationMessageLatitude}}</p>
                <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{historyMessage.whatsappLocationMessageLongitude}}</p><br>
                <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                  <b-dropdown-item @click="saveLocation('CASA', historyMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                  <b-dropdown-item @click="saveLocation('TRABAJO', historyMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                  <b-dropdown-item @click="saveLocation('OTRO', historyMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                  <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(historyMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
                </b-dropdown>
              </div>
              
              <div v-if="historyMessage.whatsappGeneralMessageType=='document'" class="m-0">
                <a style="color: black;" :href="`data:${historyMessage.whatsappDocumentMessageMimeType};base64,${historyMessage.whatsappDocumentMessageFile}`" :download="historyMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{historyMessage.whatsappDocumentMessageFileName}}</strong></p></a>
              </div>
              
              <audio controls v-if="historyMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${historyMessage.whatsappAudioMessageFile}`"></audio>
              
              <div v-if="historyMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                <img v-b-modal.bigImageModal @click="openBigImage(historyMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="historyMessage.whatsappFavoriteImageMessageDriveURL">
                <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappFavoriteImageMessageCaption != null">{{historyMessage.whatsappFavoriteImageMessageCaption}}</p>
              </div>

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
                            
                            <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                              <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                            </div>
                            
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
                                  <button @click="openClientIDTypeModal(currentHistoryConversation.whatsappConversationRecipientPhoneNumber, `data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`, 'image')" v-if="answeredMessage.whatsappImageMessageType == 'image'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>

                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                                  <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                                  <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                                  <MapComponent v-if="showMap"  mapHeight="250px" mapWidth="600px" :clientLongitude="answeredMessage.whatsappLocationMessageLongitude" :clientLatitude="answeredMessage.whatsappLocationMessageLatitude"></MapComponent>

                                  <br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                    <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(answeredMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
                                  </b-dropdown>
                                </div>
                                
                                <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                  <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                  <button @click="openClientIDTypeModal(currentHistoryConversation.whatsappConversationRecipientPhoneNumber, `data:application/pdf;base64,${answeredMessage.whatsappDocumentMessageFile}`, 'pdf')" v-if="answeredMessage.whatsappDocumentMessageMimeType == 'application/pdf'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>

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
                          <button @click="openClientIDTypeModal(currentHistoryConversation.whatsappConversationRecipientPhoneNumber, `data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`, 'image')" v-if="currentActiveConversationMessage.whatsappImageMessageType == 'image'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>

                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                          <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">

                          <MapComponent v-if="showMap"  mapHeight="250px" mapWidth="600px" :clientLongitude="currentActiveConversationMessage.whatsappLocationMessageLongitude" :clientLatitude="currentActiveConversationMessage.whatsappLocationMessageLatitude"></MapComponent>

                          <br>
                          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                          <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                            <b-dropdown-item @click="saveLocation('CASA', currentActiveConversationMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('TRABAJO', currentActiveConversationMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('OTRO', currentActiveConversationMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                            <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(currentActiveConversationMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
                          </b-dropdown>
                        </div>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                          <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                          <button @click="openClientIDTypeModal(currentHistoryConversation.whatsappConversationRecipientPhoneNumber, `data:application/pdf;base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`, 'pdf')" v-if="currentActiveConversationMessage.whatsappDocumentMessageMimeType == 'application/pdf'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>

                        </div>
                        
                        <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                        
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                          <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>
                        </div>
                      </div>

                      <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="display:flex; margin-left: 0; margin-right:auto;" class="text-small text-muted">
                        <img :id="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/read.png">
                        <img :id="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/delivered.png">
                        <img :id="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/send.png">
                        <b-tooltip :target="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">
                          <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                        </b-tooltip>
                        <b-tooltip :target="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">
                          <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                        </b-tooltip>
                        <b-tooltip :target="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else>
                          <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                          <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                        </b-tooltip>
                        {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}
                      </span>
                      <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                      
                      <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                        <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                          <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            
                            <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                              <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                            </div>
                            
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

                                  <MapComponent v-if="showMap"  mapHeight="250px" mapWidth="600px" :clientLongitude="answeredMessage.whatsappLocationMessageLongitude" :clientLatitude="answeredMessage.whatsappLocationMessageLatitude"></MapComponent>

                                  <br>
                                  <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                  <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                  <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                    <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                    <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                    <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(answeredMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
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

                          <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="600px" :clientLongitude="currentActiveConversationMessage.whatsappLocationMessageLongitude" :clientLatitude="currentActiveConversationMessage.whatsappLocationMessageLatitude"></MapComponent>

                          <br>
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


          <div class="chat-content-wrap sidebar-content" v-if="currentActiveConversation==null">
            <div style="position: absolute; bottom:0; right:0; padding: 20px;">
              <img src="@/assets/images/logo.webp" alt style="width: 150px; height: auto;"/>
            </div>
          </div>

          <div class="chat-content-wrap sidebar-content" v-if="currentActiveConversation!=null">

            <div class="d-flex pl-3 pr-3 pt-3 pb-3 o-hidden box-shadow-1 chat-topbar">
              <a class="link-icon d-md-none" @click="isMobile = !isMobile"><i class="icon-regular i-Right ml-0 mr-3"></i></a>
              <div class="d-flex align-items-center" style="width: 100%;">
                <input type="checkbox" v-if="currentActiveConversation.whatsappConversationRecipientID != 0" :checked="true" style="accent-color: #FFD733; margin-right: 10px;" onclick="return false;">
                <p class="m-0 text-title text-16"><strong>{{currentActiveConversation.whatsappConversationRecipientProfileName}}</strong> {{parsePhone(currentActiveConversation.whatsappConversationRecipientPhoneNumber)}}</p>
                <div class="flex-grow-1"></div>
                <button @click="getHistoryConversations()" class="btn btn-icon btn-primary mr-2" v-b-modal.historyConversationsModal><i class="i-Clock"></i>Historial</button>
                <button @click="vistaItems = 'Productos'" class="btn btn-icon btn-primary mr-2" v-if="availableConversation == true"><i class="i-Shopping-Cart"></i>Buscar productos</button>
                <button @click="vistaItems = 'Orden'" class="btn btn-icon btn-primary" v-if="availableConversation == true"><i class="i-Check"></i>Resumen de la orden</button>
              </div>
            </div>

            
            
            <div style="background-image: url('https://i.postimg.cc/fTRJ9KCf/8c98994518b575bfd8c949e91d20548b.jpg');">
              <div class="chat-content scroll" style="padding-bottom: 35px; overflow-y: scroll" ref="scrollRef">
                <div v-for="currentActiveConversationMessage in currentActiveConversation.whatsappConversationMessages" @contextmenu.prevent="replyMessageRightClick(currentActiveConversationMessage)">
                  <div class="d-flex mb-30 appearMessageAnimation" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
                    <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                      <div class="d-flex">
                        <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                            <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                              
                              <div v-if="currentActiveConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                                <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                              </div>
                              
                              <div v-else v-for="answeredMessage in currentActiveConversation.whatsappConversationMessages">
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

                                    <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="600px" :clientLongitude="answeredMessage.whatsappLocationMessageLongitude" :clientLatitude="answeredMessage.whatsappLocationMessageLatitude"></MapComponent>

                                    <br>
                                    <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                    <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                    <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                      <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                      <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                      <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                      <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(answeredMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
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
                            <div style="display: flex;">
                              <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                              <button @click="openSaveStickerModal(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" v-if="currentActiveConversationMessage.whatsappImageMessageType == 'sticker'" class="btn btn-icon btn-rounded btn-primary ml-2" style="height: 40px;" type="button" v-b-modal.saveStickerModal><i class="i-Disk"></i></button>
                              <button @click="openClientIDTypeModal(currentActiveConversation.whatsappConversationRecipientPhoneNumber, `data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`, 'image')" v-if="currentActiveConversationMessage.whatsappImageMessageType == 'image'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>
                            </div>
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                          </div>
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                            <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                          </div>
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">

                            <MapComponent v-if="showMap" mapHeight="450px" mapWidth="800px" :clientLongitude="currentActiveConversationMessage.whatsappLocationMessageLongitude" :clientLatitude="currentActiveConversationMessage.whatsappLocationMessageLatitude"></MapComponent>

                            
                            <br>
                            <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                            <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                            <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                              <b-dropdown-item @click="saveLocation('CASA', currentActiveConversationMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                              <b-dropdown-item @click="saveLocation('TRABAJO', currentActiveConversationMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                              <b-dropdown-item @click="saveLocation('OTRO', currentActiveConversationMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                              <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(currentActiveConversationMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
                            </b-dropdown>
                          </div>
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                            <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                            <button @click="openClientIDTypeModal(currentActiveConversation.whatsappConversationRecipientPhoneNumber, `data:application/pdf;base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`, 'pdf')" v-if="currentActiveConversationMessage.whatsappDocumentMessageMimeType == 'application/pdf'" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>

                          </div>
                          
                          <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                            <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>

                          </div>
                        
                        </div>

                        <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="display:flex; margin-left: 0; margin-right:auto;" class="text-small text-muted">
                          <img :id="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/read.png">
                          <img :id="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/delivered.png">
                          <img :id="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/send.png">
                          <b-tooltip :target="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">
                            <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                          </b-tooltip>
                          <b-tooltip :target="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">
                            <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                          </b-tooltip>
                          <b-tooltip :target="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else>
                            <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                            <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                          </b-tooltip>
                          {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}
                        </span>
                        <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                        

                        <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                          
                          <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                            <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                              <div v-if="currentActiveConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                                <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                              </div>
                              
                              <div v-else v-for="answeredMessage in currentActiveConversation.whatsappConversationMessages">
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
                                    <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="1000px" :clientLongitude="answeredMessage.whatsappLocationMessageLongitude" :clientLatitude="answeredMessage.whatsappLocationMessageLatitude"></MapComponent>

                                    <br>
                                    <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                                    <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                                    <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                                      <b-dropdown-item @click="saveLocation('CASA', answeredMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                                      <b-dropdown-item @click="saveLocation('TRABAJO', answeredMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                                      <b-dropdown-item @click="saveLocation('OTRO', answeredMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                                      <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(answeredMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
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
                            <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="1000px" :clientLongitude="currentActiveConversationMessage.whatsappLocationMessageLongitude" :clientLatitude="currentActiveConversationMessage.whatsappLocationMessageLatitude"></MapComponent>

                            
                            <br>
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
            </div>
            <div class="pl-3 pr-3 pt-4 pb-3 box-shadow-1 chat-input-area" style="position: absolute; bottom: 0; width: 100%; z-index: 1000; background-color:white">
              <div v-if="loaders.fileShare == true" style="text-align: center;">
                <br><br><span class="spinner-glow spinner-glow-primary"></span>
              </div>
              <div v-else>
                <div v-if="repliedMessage != null">
                  <div style="background-color: rgb(255, 238, 252); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
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
                      <MapComponent v-if="showMap"  mapHeight="450px" mapWidth="1000px" :clientLongitude="repliedMessage.whatsappLocationMessageLongitude" :clientLatitude="repliedMessage.whatsappLocationMessageLatitude"></MapComponent>
                      <br>
                      <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{repliedMessage.whatsappLocationMessageLatitude}}</p>
                      <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{repliedMessage.whatsappLocationMessageLongitude}}</p><br>
                      <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
                        <b-dropdown-item @click="saveLocation('CASA', repliedMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
                        <b-dropdown-item @click="saveLocation('TRABAJO', repliedMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
                        <b-dropdown-item @click="saveLocation('OTRO', repliedMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
                        <b-dropdown-item v-b-modal.saveInvoiceLocation @click="openSaveInvoiceLocationModal(repliedMessage)" style="z-index: 1000;">COMANDA</b-dropdown-item>
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
                <div class="form-group" style="display: flex; align-items: center;" v-if="availableConversation == true">
                  <b-form-textarea ref="textoEnviar" :disabled='sendingMessageDisable' class="form-control" placeholder="Escribe un mensaje" @keyup.enter="handleEnter" @keyup="detectShortcuts()" v-model="currentActiveConversation.textoEnviar" style="margin-bottom: 20px; width: 100%" no-resize rows="3"/>
                  
                </div>

                <div class="d-flex" v-if="agentType == 'agent'"> 
                  <button class="btn btn-primary mr-2" type="button" @click="openEndConversationModal()" v-b-modal.endConversationModal>Finalizar</button>
                  <b-modal scrollable size="m" centered id="endConversationModal" title="Finalizar conversación sin venta" @ok="closeWhatsappConversation()">
                    <b-form-select v-model="selectedCloseLocality" :options="closeLocalityOptions"></b-form-select>
                    <br><br><br>
                    
                    <b-dropdown variant="primary" text="Motivos frecuentes" style="width: 100%">
                      <b-dropdown-item @click="addCloseConversationReason('Venta perdida')">Venta perdida</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Venta para otro día')">Venta para otro día</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Consulta sobre productos')">Consulta sobre productos</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('No contestó')">No contestó</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Pasa a tienda')">Pasa a tienda</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Consulta de horario/ubicación')">Consulta de horario/ubicación</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Vuelve a escribir')">Vuelve a escribir</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Reclamo o garantía')">Reclamo o garantía</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Menor de edad')">Menor de edad</b-dropdown-item>
                      <b-dropdown-item @click="addCloseConversationReason('Error')">Error</b-dropdown-item>
                    </b-dropdown><br><br>
                    <b-form-textarea no-resize rows="5" disabled="true" class="form-control" placeholder="Motivo de la finalización de la conversación" v-model="closeConversationReason"/>    
                    <br>
                    <b-form-textarea v-if="closeConversationReason == 'Reclamo o garantía'" no-resize rows="3" class="form-control" placeholder="Productos relacionados al reclamo" v-model="wrongProducts"/>   

                    <br>
                    <b-form-checkbox id="checkbox-1" v-model="sendEndMessage">Enviar mensaje de despedida</b-form-checkbox>
                  </b-modal>

                  <button class="btn btn-primary mr-2" type="button" v-b-modal.closeDuplicateModal>Duplicado</button>
                  <b-modal scrollable size="m" centered id="closeDuplicateModal" title="Cerrar duplicado" @ok="closeWhatsappDuplicateConversation()">
                    <p>¿Estás seguro de cerrar esta conversación como duplicada? Esta acción no es reversible</p>
                  </b-modal>

                  <b-dropdown dropup variant="primary" text="Transferir">
                    <template v-for="agent in agents">
                      <b-dropdown-item :style="getAgentColor(agent)" @click="requestTransferWhatsappConversation(agent)">
                        {{agent.agentName}}
                      </b-dropdown-item>
                    </template>
                    <b-dropdown-item style="z-index: 2000; overflow-y: auto;" v-if="agents.length == 0">No hay agentes disponibles</b-dropdown-item>
                  </b-dropdown>

                  <div class="flex-grow-1" ></div>

                  <b-dropdown dropup variant="primary" text="Tiendas" style="margin-right: 10px;" v-if="availableConversation == true">
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Zapote')">Zapote</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Escazu')">Escazu</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Cartago')">Cartago</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Heredia')">Heredia</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Metro Plaza')">Metro Plaza</b-dropdown-item>

                  </b-dropdown>
                  <b-dropdown dropup variant="primary" text="Ubicaciones" style="margin-right: 10px;" v-if="availableConversation == true">
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('CASA')">CASA</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('TRABAJO')">TRABAJO</b-dropdown-item>
                    <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('OTRO')">OTRO</b-dropdown-item>
                  </b-dropdown>
                  <button v-if="availableConversation == true" class="btn btn-icon btn-rounded btn-primary mr-2" type="button" @click="uploadImage()" id="sendFiles"><i class="i-Folder-With-Document"></i></button>
                  <input v-if="availableConversation == true" type="file" accept="image/png, image/jpeg, application/pdf" @change="sendWhatsappImageMessage()" ref="imageFile" style="display: none;" id="imageUploader">
                  <b-tooltip target="sendFiles">Archivos de la computadora</b-tooltip>
                  
                  <button v-if="availableConversation == true" id="sendDisposables" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.disposablesModal @click="deselectImages()">
                    <i class="i-Shopping-Bag"></i>
                  </button>
                  <b-tooltip target="sendDisposables">Desechables</b-tooltip>
                  
                 
                  <b-modal @ok="sendWhatsappFavoriteImageMessage()" scrollable title="Catálogo de desechables" size="m" centered id="disposablesModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItem('Nicotina')" @click="changeActiveNavItem('Nicotina')">Nicotina</b-nav-item>
                      <b-nav-item :active="getActiveNavItem('Zero')" @click="changeActiveNavItem('Zero')">Zero</b-nav-item>
                    </b-nav>
                    <br>
                    
                    <div v-if="currentNavItem == 'Nicotina'">
                      <b-form-input @keyup="buscarCatalogoNicotina()" v-model="catalogoNicotinaBuscado" placeholder="Nombre del catálogo a buscar"></b-form-input>
                      <br>
                      <b-list-group style="height: 700px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()" v-if="agentFavoriteImages.length != 0">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" @click="selectAllFavoriteImage()" v-else>No se ha encontrado ningún catálogo con el nombre "{{ catalogoNicotinaBuscado }}"</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in agentFavoriteImages" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImage(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 70px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 700px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in agentFavoriteImages2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImage(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 70px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                  </b-modal>

                  <button v-if="availableConversation == true" id="sendLiquids" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.liquidsModal @click="deselectImages()">
                    <i class="i-Drop"></i>
                  </button>
                  <b-tooltip target="sendLiquids">Líquidos</b-tooltip>
                  <b-modal @ok="sendWhatsappFavoriteImageMessageLiquid()" scrollable title="Catálogo de líquidos" size="m" centered id="liquidsModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItemLiquid('Ice')" @click="changeActiveNavItemLiquid('Ice')">Ice</b-nav-item>
                      <b-nav-item :active="getActiveNavItemLiquid('noIce')" @click="changeActiveNavItemLiquid('noIce')">No Ice</b-nav-item>
                    </b-nav>
                    <br>
                    <div v-if="currentNavItemLiquid == 'Ice'">
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageLiquid()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in liquids1" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageLiquid(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 80px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageLiquid()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in liquids2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageLiquid(index)">
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


                  <button v-if="availableConversation == true" id="sendSalts" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.saltsModal @click="deselectImages()">
                    <i class="i-Delicious"></i>
                  </button>
                  <b-tooltip target="sendSalts">Sales</b-tooltip>
                  <b-modal @ok="sendWhatsappFavoriteImageMessageSalt()" scrollable title="Catálogo de sales" size="m" centered id="saltsModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItemSalt('saltIce')" @click="changeActiveNavItemSalt('saltIce')">Ice</b-nav-item>
                      <b-nav-item :active="getActiveNavItemSalt('saltNoIce')" @click="changeActiveNavItemSalt('saltNoIce')">No Ice</b-nav-item>
                    </b-nav>
                    <br>
                    <div v-if="currentNavItemSalt == 'saltIce'">
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantSalt()" style="cursor: pointer;" @click="selectAllFavoriteImageSalt()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in salts1" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageSalt(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 80px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageSalt()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in salts2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageSalt(index)">
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
                  



                  <button v-if="availableConversation == true" id="sendFavoriteMessages" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.favoriteModal @click="openAgentFavoriteMessagesModal()"><i class="i-Love"></i></button>
                  <b-tooltip target="sendFavoriteMessages">Mensajes favoritos</b-tooltip>
                  
                  <b-modal scrollable title="Mensajes favoritos" size="m" centered hide-footer id="favoriteModal">
                    
                    
                    <b-list-group>

                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteMessage in agentFavoriteMessages" button @click="sendWhatsappFavoriteTextMessage(agentFavoriteMessage.agentFavoriteMessageTextMessageBody)">
                        <h6><strong>{{agentFavoriteMessage.agentFavoriteMessageName}}</strong></h6>
                        {{agentFavoriteMessage.agentFavoriteMessageTextMessageBody}}
                      </b-list-group-item>

                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteImage in agentFavoriteImages3" button @click="sendSelectedWhatsappFavoriteImageMessage(agentFavoriteImage)">
                        <h6><strong>{{agentFavoriteImage.whatsappFavoriteImageName}}</strong></h6>
                        <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 150px; height: auto;"/>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BAC)'"><br>
                          Te envío por acá nuestras cuentas bancarias del BAC en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata
                        </div>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BCR)'"><br>
                          Te envío por acá nuestras cuentas bancarias del BCR en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata
                        </div>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Mensaje de bienvenida'"><br>
                          {{ agentStartMessage }}
                        </div>
                      </b-list-group-item>

                    </b-list-group>
                  </b-modal>

                  
                  <button v-if="availableConversation == true" id="sendPromos" class="btn btn-icon btn-rounded mr-2" style="background-color: #faafed; display: none" type="button" @click="openPromosModal()" v-b-modal.promosModal><i class="i-Gift-Box"></i></button>
                  <b-tooltip target="sendPromos">Promocioness</b-tooltip>

                  <button v-if="availableConversation == true" id="sendAudio" class="btn btn-icon btn-rounded btn-primary mr-2" type="button" @click="startRecording()" v-b-modal.recordAudioModal><i class="i-Microphone-3"></i></button>
                  <b-tooltip target="sendAudio">Audio</b-tooltip>
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

                <div v-if="agentType == 'admin'"> 
                  
                  <button v-if="availableConversation == true" id="sendDisposables" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.disposablesModal @click="deselectImages()">
                    <i class="i-Shopping-Bag"></i>
                  </button>
                  <b-tooltip target="sendDisposables">Desechables</b-tooltip>
  
                  <b-modal @ok="sendWhatsappFavoriteImageMessage()" scrollable title="Catálogo de desechables" size="m" centered id="disposablesModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItem('Nicotina')" @click="changeActiveNavItem('Nicotina')">Nicotina</b-nav-item>
                      <b-nav-item :active="getActiveNavItem('Zero')" @click="changeActiveNavItem('Zero')">Zero</b-nav-item>
                    </b-nav>
                    <br>
                    <div v-if="currentNavItem == 'Nicotina'">
                      <b-form-input @keyup="buscarCatalogoNicotina()" v-model="catalogoNicotinaBuscado" placeholder="Nombre del catálogo a buscar"></b-form-input>
                      <br>

                      <b-list-group style="height: 700px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()" v-if="agentFavoriteImages.length != 0">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" @click="selectAllFavoriteImage()" v-else>No se ha encontrado ningún catálogo con el nombre "{{ catalogoNicotinaBuscado }}"</b-list-group-item>
                        
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in agentFavoriteImages" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImage(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 70px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 700px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in agentFavoriteImages2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImage(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 70px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                  </b-modal>

                  <button v-if="availableConversation == true" id="sendLiquids" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.liquidsModal @click="deselectImages()">
                    <i class="i-Drop"></i>
                  </button>
                  <b-tooltip target="sendLiquids">Líquidos</b-tooltip>
                  <b-modal @ok="sendWhatsappFavoriteImageMessageLiquid()" scrollable title="Catálogo de líquidos" size="m" centered id="liquidsModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItemLiquid('Ice')" @click="changeActiveNavItemLiquid('Ice')">Ice</b-nav-item>
                      <b-nav-item :active="getActiveNavItemLiquid('noIce')" @click="changeActiveNavItemLiquid('noIce')">No Ice</b-nav-item>
                    </b-nav>
                    <br>
                    <div v-if="currentNavItemLiquid == 'Ice'">
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageLiquid()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in liquids1" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageLiquid(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 80px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageLiquid()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in liquids2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageLiquid(index)">
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


                  <button v-if="availableConversation == true" id="sendSalts" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.saltsModal @click="deselectImages()">
                    <i class="i-Delicious"></i>
                  </button>
                  <b-tooltip target="sendSalts">Sales</b-tooltip>
                  <b-modal @ok="sendWhatsappFavoriteImageMessageSalt()" scrollable title="Catálogo de sales" size="m" centered id="saltsModal">
                    <b-nav tabs justified>
                      <b-nav-item :active="getActiveNavItemSalt('saltIce')" @click="changeActiveNavItemSalt('saltIce')">Ice</b-nav-item>
                      <b-nav-item :active="getActiveNavItemSalt('saltNoIce')" @click="changeActiveNavItemSalt('saltNoIce')">No Ice</b-nav-item>
                    </b-nav>
                    <br>
                    <div v-if="currentNavItemSalt == 'saltIce'">
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantSalt()" style="cursor: pointer;" @click="selectAllFavoriteImageSalt()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in salts1" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageSalt(index)">
                          <div style="display:flex; ">
                            <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 80px; height: auto;"/>
                            <div style="margin: 0; left: 40%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                              <h6>{{agentFavoriteImage.whatsappFavoriteImageName}}</h6>
                            </div>
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div v-else>
                      <b-list-group style="height: 400px; overflow-y: auto;">
                        <b-list-group-item :variant="getAllFavoriteVariantLiquid()" style="cursor: pointer;" @click="selectAllFavoriteImageSalt()">Seleccionar todo el catálogo</b-list-group-item>
                        <b-list-group-item style="cursor: pointer;" v-for="(agentFavoriteImage, index) in salts2" :variant="getImageVariant(agentFavoriteImage)" button @click="selectFavoriteImageSalt(index)">
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
                  

                  <button v-if="availableConversation == true" id="sendFavoriteMessages" class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.favoriteModal @click="openAgentFavoriteMessagesModal()"><i class="i-Love"></i></button>
                  <b-tooltip target="sendFavoriteMessages">Enviar mensajes favoritos</b-tooltip>
                  
                  <b-modal scrollable title="Mensajes favoritos" size="m" centered hide-footer id="favoriteModal">
                    
                    
                    <b-list-group>

                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteMessage in agentFavoriteMessages" button @click="sendWhatsappFavoriteTextMessage(agentFavoriteMessage.agentFavoriteMessageTextMessageBody)">
                        <h6><strong>{{agentFavoriteMessage.agentFavoriteMessageName}}</strong></h6>
                        {{agentFavoriteMessage.agentFavoriteMessageTextMessageBody}}
                      </b-list-group-item>

                      <b-list-group-item style="cursor: pointer;" v-for="agentFavoriteImage in agentFavoriteImages3" button @click="sendSelectedWhatsappFavoriteImageMessage(agentFavoriteImage)">
                        <h6><strong>{{agentFavoriteImage.whatsappFavoriteImageName}}</strong></h6>
                        <img :src="agentFavoriteImage.whatsappFavoriteImageDriveURL" style="width: 150px; height: auto;"/>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BAC)'"><br>
                          Te envío por acá nuestras cuentas bancarias del BAC en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata
                        </div>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BCR)'"><br>
                          Te envío por acá nuestras cuentas bancarias del BCR en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata
                        </div>
                        <div v-if="agentFavoriteImage.whatsappFavoriteImageName == 'Mensaje de bienvenida'"><br>
                          {{ agentStartMessage }}
                        </div>
                      </b-list-group-item>

                    </b-list-group>
                  </b-modal>

                  <button v-if="availableConversation == true" id="sendPromos" class="btn btn-icon btn-rounded mr-2" style="background-color: #faafed; display: none" type="button" @click="openPromosModal()" v-b-modal.promosModal><i class="i-Gift-Box"></i></button>
                  <b-tooltip target="sendPromos">Promociones</b-tooltip>


                  <button v-if="availableConversation == true" id="sendAudio" class="btn btn-icon btn-rounded btn-primary mr-2" type="button" @click="startRecording()" v-b-modal.recordAudioModal><i class="i-Microphone-3"></i></button>
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

                  <div style="margin-top: 10px;">
                    <button class="btn btn-primary mr-2" type="button" @click="openEndConversationModal()" v-b-modal.endConversationModal>Finalizar</button>
                    <b-modal scrollable size="m" centered id="endConversationModal" title="Finalizar conversación sin venta" @ok="closeWhatsappConversation()">
                      <b-form-select v-model="selectedCloseLocality" :options="closeLocalityOptions"></b-form-select>
                      <br><br><br>
                      
                      <b-dropdown variant="primary" text="Motivos frecuentes" style="width: 100%">
                        <b-dropdown-item @click="addCloseConversationReason('Venta perdida')">Venta perdida</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Venta para otro día')">Venta para otro día</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Consulta sobre productos')">Consulta sobre productos</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('No contestó')">No contestó</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Pasa a tienda')">Pasa a tienda</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Consulta de horario/ubicación')">Consulta de horario/ubicación</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Vuelve a escribir')">Vuelve a escribir</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Reclamo o garantía')">Reclamo o garantía</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Menor de edad')">Menor de edad</b-dropdown-item>
                        <b-dropdown-item @click="addCloseConversationReason('Error')">Error</b-dropdown-item>
                      </b-dropdown><br><br>
                      <b-form-textarea no-resize rows="5" class="form-control" placeholder="Motivo de la finalización de la conversación" v-model="closeConversationReason"/> 
                      <br>
                      <b-form-textarea v-if="closeConversationReason == 'Reclamo o garantía'" no-resize rows="3" class="form-control" placeholder="Productos relacionados al reclamo" v-model="wrongProducts"/>   
   
                      <br>
                      <b-form-checkbox id="checkbox-1" v-model="sendEndMessage">Enviar mensaje de despedida</b-form-checkbox>
                    </b-modal>


                    <button class="btn btn-primary mr-2" type="button" v-b-modal.closeDuplicateModal>Duplicado</button>
                    <b-modal scrollable size="m" centered id="closeDuplicateModal" title="Cerrar duplicado" @ok="closeWhatsappDuplicateConversation()">
                      <p>¿Estás seguro de cerrar esta conversación  como duplicada? Esta acción no es reversible</p>
                    </b-modal>


                    <b-dropdown dropup variant="primary" text="Transferir">
                      <template v-for="agent in agents">
                        <b-dropdown-item :style="getAgentColor(agent)" @click="requestTransferWhatsappConversation(agent)">
                          {{agent.agentName}}
                        </b-dropdown-item>
                      </template>
                      <b-dropdown-item style="z-index: 2000; overflow-y: auto;" v-if="agents.length == 0">No hay agentes disponibles</b-dropdown-item>
                    </b-dropdown>

                    <b-dropdown dropup variant="primary" text="Tiendas" style="margin-left: 10px;" v-if="availableConversation == true">
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Zapote')">Zapote</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Escazu')">Escazu</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Cartago')">Cartago</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Heredia')">Heredia</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappStoreLocationMessage('Metro Plaza')">Metro Plaza</b-dropdown-item>

                    </b-dropdown>
                    <b-dropdown dropup variant="primary" text="Ubicaciones" style="margin-left: 10px;" v-if="availableConversation == true">
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('CASA')">CASA</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('TRABAJO')">TRABAJO</b-dropdown-item>
                      <b-dropdown-item style="z-index: 2000;" @click="sendWhatsappLocationMessage('OTRO')">OTRO</b-dropdown-item>
                    </b-dropdown>
                  </div>

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
                    <img style="cursor: pointer;" v-b-modal.bigImageModal @click="openBigImage(producto.localizacion)" :src="producto.localizacion" alt="N/A"/>
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
          <b-card v-else-if="vistaItems == 'Orden'">
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

                            <b-card style="background-color: #e8e8e8">
                              <div style="text-align: center">
                                <p style="font-size: medium;"><strong>INFORMACIÓN PERSONAL:</strong></p>
                              </div>
                              <b-form-group style="width:100%;">
                                <b-form-input v-model="currentActiveConversation.whatsappConversationRecipientProfileName" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceClientName', currentActiveConversation.whatsappConversationRecipientProfileName)" placeholder='Nombre del cliente' style='margin-bottom: 10px;'></b-form-input>
                                <b-form-input v-model="currentActiveConversation.whatsappConversationRecipientPhoneNumber" placeholder="Número de teléfono del cliente" style="margin-bottom: 10px;"></b-form-input>
                                <div style="display: flex; width: 100%;">
                                  <div style="margin-right: 5%; width: 80%;">
                                    <b-form-input v-model="currentActiveConversation.whatsappConversationRecipientID" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceClientID', currentActiveConversation.whatsappConversationRecipientID)" placeholder='Cédula del cliente' style='margin-bottom: 10px;'></b-form-input>
                                  </div>

                                  <div style="position: relative; top: -2px;">
                                    <button @click="selectClientIDSImage(currentActiveConversation.whatsappConversationRecipientPhoneNumber)" class="btn btn-icon btn-info"><i class="i-ID-Card"></i></button>
                                  </div>
                                </div>
                                
                                <b-form-input v-model="currentActiveConversation.whatsappConversationRecipientEmail" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceClientEmail', currentActiveConversation.whatsappConversationRecipientEmail)" placeholder="Correo electrónico del cliente"></b-form-input> 
                              </b-form-group>
                            </b-card>

                            <br>
                            
                            <b-card style="background-color: #e8e8e8">
                              <div style="text-align: center">
                                <p style="font-size: medium;"><strong>INFORMACIÓN DEL ENVÍO:</strong></p>
                              </div>

                              <b-form-group style="width:100%">
                                <div :style="getLocalityOptionsColor()">
                                  <b-form-select  v-model="selectedLocality" :options="localityOptions" @change="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceLocalityName', selectedLocality)"/>
                                </div>

                                <b-form-select v-model="whatsappInvoiceShippingMethod" :options="whatsappInvoiceShippingMethodOptions" @change="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceShippingMethod', whatsappInvoiceShippingMethod)" style="margin-bottom: 10px; margin-top: 10px;"/>
                                
                                <div style="display: flex;">
                                  <b-form-select v-model="whatsappInvoicePaymentMethod" :options="whatsappInvoicePaymentMethodOptions" @change="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoicePaymentMethod', whatsappInvoicePaymentMethod)" :style="getWhatsappInvoicePaymentMethodStyle()"></b-form-select>
                                  <b-button v-if="getWhatsappInvoicePaymentMethodIsSINPE()" v-b-modal.paymentMethodValidatorModal style="margin-bottom: 15px; margin-left: 10px; width: 30%" @click="validatePaymentMethod()" variant="info">Validar</b-button>


                                  <b-modal scrollable size="m" centered hide-header hide-footer id="paymentMethodValidatorModal">
                                    <div>
                                      <div v-if="currentTransactions != null">
                                        <h4><strong>Transacciones disponibles:</strong></h4><br>
                                        <b-list-group>
                                          <b-list-group-item v-if="currentTransactions.length == 0">No hay transacciones por asociar</b-list-group-item>
                                          <b-list-group-item v-b-modal.syncTransactionModal @click="openSyncTransactionModal(currentTransaction)" v-for="currentTransaction in currentTransactions" button style="cursor: pointer;">
                                            <strong>ID:</strong> {{currentTransaction.transactionID}}<br>
                                            <strong>Detalle:</strong> {{currentTransaction.transactionNote}}<br>
                                            <strong>Monto:</strong> ₡{{currentTransaction.transactionAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}<br>
                                            <strong>Fecha:</strong> {{parseHour(currentTransaction.transactionDate)}}
                                          </b-list-group-item>
                                        </b-list-group>
                                      </div>
                                      <div v-else style="text-align: center;">
                                        <br>
                                        <span class="spinner-glow spinner-glow-primary"></span>
                                      </div>
                                    </div>
                                  </b-modal>

                                  <b-modal size="lg" @ok="syncTransactionToMessage()" hide-header centered id="syncTransactionModal">
                                    <div v-if="currentTransaction != null">
                                      <h4><strong>Mensaje relacionado:</strong></h4><br>
                                      <div style="height: 500px; overflow-y: scroll; border: 1px solid gray;">
                                        <div v-for="currentActiveConversationMessage in currentActiveConversation.whatsappConversationMessages">
                                          <div @click="selectTransactionMessage(currentActiveConversationMessage.whatsappGeneralMessageID)" style="cursor: pointer;" class="d-flex mb-30" v-if="(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null) && ((currentActiveConversationMessage.whatsappGeneralMessageType == 'text') || (currentActiveConversationMessage.whatsappGeneralMessageType == 'image') || (currentActiveConversationMessage.whatsappGeneralMessageType == 'document'))" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
                                            <div :style="getMessageOwnerColorTransaction(currentActiveConversationMessage.selected)" class="message flex-grow-1">
                                              <div class="d-flex">
                                                <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                                                  <span style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                                                  <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>                            
                                                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                                                    <img style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                                                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                                                  </div>                                     
                                                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                                                    <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <br><br>

                                      <h4><strong>Sucursal relacionada:</strong></h4>
                                      <b-form-select v-model="selectedLocality" :options="localityOptions"></b-form-select>
                                      <br><br>
                                      
                                    </div>
                                  </b-modal>
                                </div>
                                
                                <b-form-select v-model="whatsappInvoicePaymentState" :options="whatsappInvoicePaymentStateOptions" @change="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoicePaymentState', whatsappInvoicePaymentState)" style="margin-bottom: 10px;"></b-form-select>
                                
                                <b-form-select v-model="whatsappInvoiceClientLocationName" :options="whatsappInvoiceClientLocationOptions" style="margin-bottom: 10px;" @change="changeLocalStorageWhatsappInvoiceLocationInformation()"></b-form-select>
                                <b-form-input v-model="latitud" placeholder="Latitud" style="margin-bottom: 10px;"></b-form-input>
                                <b-form-input v-model="longitud" placeholder="Longitud" style="margin-bottom: 10px;"></b-form-input>

                                <b-form-input v-model="whatsappInvoiceClientLocationURL" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceClientLocationURL', whatsappInvoiceClientLocationURL)" placeholder="Enlace de ubicación" style="margin-bottom: 10px;"></b-form-input>

                          
                                <b-form-textarea v-model="currentActiveConversation.whatsappConversationRecipientLocationDetails" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceShippingNote', currentActiveConversation.whatsappConversationRecipientLocationDetails)" placeholder="Nota de la dirección" rows="3" style="margin-bottom: 10px;"></b-form-textarea>
                                <b-form-textarea v-model="currentActiveConversation.whatsappConversationRecipientNote" @keyup="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceLocationNote', currentActiveConversation.whatsappConversationRecipientNote)" placeholder="Nota del envío" rows="3" style="margin-bottom: 10px;"></b-form-textarea>
                              
                                <br>
                                <b-form-checkbox @input="changeLocalStorageWhatsappInvoiceInformation('whatsappInvoiceIsForToday', currentActiveConversation.whatsappConversationIsForToday)" v-model="currentActiveConversation.whatsappConversationIsForToday">Pedido para hoy</b-form-checkbox>
                              
                              </b-form-group>
                            </b-card>


                            <div style="text-align: center;" v-if="loaderOrdenEnviada == false">
                              <br>
                              
                              <b-card style="background-color: #e8e8e8">
                                <b-button block @click="insertWhatsappInvoice()" variant="primary">Finalizar venta</b-button>
                                <br>
                                <b-button block @click="sendWhatsappOrderTextMessage()" variant="warning">Compartir carrito</b-button>
                                <br>
                                <b-button block @click="saveContact()" variant="info">Guardar contacto</b-button>
                                
                              </b-card>
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
                                            <i @click="EliminarLinea(props.row.CodigoP)" class="icon-regular ml-0 mr-3 i-Eraser-2" style="color:red; cursor: pointer; margin-right: 5px;"></i>
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
                                              onfocus="this.select();"
                                              placeholder="Descuento"
                                          ></b-form-input>
                                      </span>

                                      
                                      <span v-if="props.column.field == 'precioVenta'">
                                          {{props.row.precio}}
                                      </span>

                                      
                                  </template>
                              </vue-good-table>
                            
                            
                            <p class="font-weight-bold text-muted" style="font-size: medium;"> 
                                <br><br>
                                Subtotal: {{calcularSubTotal}}  <br>
                                Descuento: {{calcularDescuento}} <br>
                                Total: {{calcularTotal}}  
                            </p>                            
                            
                          </b-row>

                          <h5 v-if="displayCodigoDescuento" style="background-color: #18d100">Se ha aprobado el código de descuento '{{ displayCodigoDescuento }}' para esta conversación</h5>
                          <br>
                          <button v-b-modal.modalCodigoDescuento @click="openModalCodigoDescuento()" class="btn btn-icon btn-primary"><i class="i-Check"></i>Canjear código de descuento</button>

                        </b-tab>
                    </b-tabs> 



          </b-card> 
      </div>
    </div>

    
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

import router from "../../../router"; 
import { BDropdown } from 'bootstrap-vue';
import Vue from 'vue';

import MapComponent from "../../../components/mapComponent.vue";


export default {
  watch: {
    whatsappInvoiceClientLocationName(newLocation, old){
      if (newLocation != 'Ubicación de envío'){
        this.latitud = this.currentActiveConversation.whatsappConversationRecipientLocations[newLocation].latitude;
        this.longitud = this.currentActiveConversation.whatsappConversationRecipientLocations[newLocation].longitude;
      } else {
        this.latitud = '';
        this.longitud = '';
      }
    },

    insertContactReminderSelectedType(){
      if (this.insertContactReminderSelectedType == 'Seguimiento de producto'){
        this.insertContactReminderMessage = 'Hola, feliz día! Te quería avisar que nos acaba de llegar    ' + '   por lo que habías preguntado! Contamos con motorizados listos para realizar tu envío cuanto antes 🏍️🔥. Si gustas solo nos respondes este mensaje y podemos coordinar tu pedido! Recuerda que nuestro envío es totalmente gratuito';
      } else if (this.insertContactReminderSelectedType == 'Envío de guía'){
        this.insertContactReminderMessage = 'Hola, feliz día! Mis compañeros encargados de correos y encomiendas justo me compartieron tu guía, con el número   ' + '   . Por favor responde este mensaje para compartirte una foto de la guía! Muchas gracias!';
      } else {
        this.insertContactReminderMessage = '';
      }
    }

  }, 

  components: {
    MapComponent
  },

  data() {
    return {
      insertContactReminderMessage: null,

      showMap: false,

      catalogoNicotinaBuscado: '',

      db: null,

      cartagoMap: [],
      cartagoMapOptions: {},
      zapoteMap: [],
      zapoteMapOptions: {},
      herediaMap: [],
      herediaMapOptions: {},
      escazuMap: [],
      escazuMapOptions: {},
      redMap: [],
      redMapOptions: {},

      zapoteConversations: [],
      escazuConversations: [],
      cartagoConversations: [],
      herediaConversations: [],
      metroPlazaConversations: [],

      planetVapeConversations: [],

      localityOptions: [],
      selectedLocality: null,
      selectedCloseLocality: 'Seleccione una localidad',
      closeLocalityOptions: [],
      localityColors: {},
      
      currentTransactions: null,
      stickerName: '',
      stickerFile: '',
      loaderSendSticker: false,

      agentType: '',

      sendEndMessage: false,

      agentStartMessage: '',

      loaders: 
      {
        historyMessage: false,
        activeConversations: false,
        grabConversation: false,
        fileShare: false,
      },


      sendingMessageDisable: false,


      loaderOrdenEnviada: false,
      
      openHistoryLoader: false,
      historyLoader: false,
      historyConversations: [],

      historyConversationsColumns: [{label: "Atendido por", field: "agentName", thClass: "text-left", tdClass: "text-left"}, {label: "Resultado", field: "whatsappConversationCloseComment", thClass: "text-left", tdClass: "text-left"}, {label: "Fecha de inicio", field: "whatsappConversationStartDateTime", thClass: "text-left", tdClass: "text-left"}, {label: "Fecha de finalización", field: "whatsappConversationEndDateTime", thClass: "text-left", tdClass: "text-left"}, {label: "", field: "whatsappConversationActions", thClass: "text-right", tdClass: "text-right"}],


      currentHistoryConversation: {},

      hints: {},


      repliedMessage: null,
      stockLoader: false,
      stockContent: '',
      loaderAudio: false,

      allImageSelected: false,
      allImageSelectedLiquid: false,
      allImageSelectedSalt: false,

      availableConversation: true,
      
      iceLogoSRC: '',
      postreLogoSRC: '',
      tabacoLogoSRC: '',
      waxLogoSRC: '',
      hierbaLogoSRC: '',

      loaderImages: false,
      loader2: false,
      enviandoProductoLoader: false,
      textoSucursales: 'Sucursales ',

      closeConversationReason: '', 
      wrongProducts: '',
      transferRequestName: '',
      transferFromAgentID: '',
      transferConversationID: '',
      transferConversationProducts: '',
      

			zoom: 15,

      agentName: '',
      pendingConversations: [],

      // Variables del chat -------
      activeConversation: '',
      activeConversations: [],
      activeConversationsAsJSON: {},
      currentActiveConversation: null,
      updatedActiveConversationID: '',
      
      createNewConversationDialog: false,
      newConversationRecipientPhoneNumber: '',
      newConversationTextMessageContent: '',


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

      multiplo: 10,
      descuento:0,
    
      latitud:"",
      longitud:"",
      locations: [],
      

      whatsappInvoiceShippingMethodOptions: ['Método de envío', 'Retiro en sucursal', 'Envío por motorizado', 'Correos de CR', 'Encomienda', 'Uber Flash'],
      whatsappInvoiceShippingMethod: 'Método de envío',
      
      whatsappInvoicePaymentMethodOptions: ['Método de pago', 'Efectivo', 'Tarjeta', 'Pago mixto', 'SINPE (confirmado)', 'SINPE (contra entrega)', 'Transferencia'],
      whatsappInvoicePaymentMethod: 'Método de pago',

      whatsappInvoicePaymentStateOptions: ['Estado del pago', 'Pagado', 'Pendiente', 'Pago parcial'],
      whatsappInvoicePaymentState: 'Estado del pago',

      whatsappInvoiceClientLocationOptions: ['Ubicación de envío', 'CASA', 'TRABAJO', 'OTRO'],
      whatsappInvoiceClientLocationName: 'Ubicación de envío',

      whatsappInvoiceClientLocationURL: '',

      agentFavoriteMessages: [],
      agentFavoriteImages: [],
      agentFavoriteImagesBackup: [],
      agentFavoriteImages2: [],
      agentFavoriteImages3: [],
      liquids1: [],
      liquids2: [],

      salts1: [],
      salts2: [],

      recordAudioDialog: false,
      isRecording: false,
      mediaRecorder: null,
      recordedAudioFile: null,
      startTime: '',
      chunks: [],
      bigImageSource: '',

      sortedConversationsID: [],

      historyMessage: null,

      currentActiveConversationID: null,

      currentNavItem: 'Nicotina',
      currentNavItemLiquid: 'Ice',
      currentNavItemSalt: 'saltIce',
      currentStickerItem: 'Mis stickers',

      paymentMethodValidatorPhoneNumber: '',
      paymentMethodValidatorAmount: 0,
      validatePaymentMethodLoader: false,
      
      currentMyStickers: [],
      currentStickers: [],

      deleteStoreMessageID: 0,
      deleteStoreMessageStoreMessageID: '',
      deleteStoreMessageName: '',
      deleteStoreMessageReason: 'Duplicado',

      currentTransaction: null,
      syncTransactionTitle: '',

      clientVerifierLoader: false,


      websocketConnection: null,
      websocketIsConnected: false,
      websocketReconnectInterval: 3000,
      websocketPingInterval: null,

      websocketAbort: false,

      invoiceLocationMessage: null,
      invoiceLocationName: '',


      conversationComments: [],
      openedComments: [],

      openedCommentsTable: [],


      scrollAvailable: true,

      inputCodigoDescuento: '',
      displayCodigoDescuento: null,


      loaderID: false,

      insertIDPhoneNumber: null,
      insertIDLoader: false,
      insertIDClientSource: null,
      insertIDClientType: null,
      insertIDAuthorizedSource: null,
      insertIDAuthorizedType: null,

      insertIDNewSource: null,
      insertIDNewType: null,

      idIsClient: false,

      loaderPromos: false,
      promos: [],
      allPromoSelected: false
    };
  },

  methods: {

    handleEnter(event){
      if (!event.shiftKey) {
        this.sendWhatsappTextMessage();
      }
    },

    insertClientIDS(){
      this.insertIDLoader = true;
      axios.post(constants.routes.backendAPI+'/insertClientIDS',
      {
        'idIsClient': this.idIsClient,
        'clientIDSPhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        'clientIDSType': this.insertIDNewType,
        'clientIDSImage': this.insertIDNewSource
      })
      .then((response) =>{
        if (response.data.success){
          this.insertIDModalLoader = false;
          this.$root.$emit('bv::hide::modal', 'insertIDModal');
          this.showNotification('success', 'Cédula del cliente registrada', 'Se ha registrado la cédula del cliente exitosamente.');
          this.currentActiveConversation.whatsappConversationRecipientIDHasImage = true;
        } else {
          this.showNotification('danger', 'Error al registrar la cédula del cliente', 'Ha ocurrido un error inesperado registrar la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.$root.$emit('bv::hide::modal', 'insertIDModal');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al registrar la cédula del cliente', 'Ha ocurrido un error inesperado registrar la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.$root.$emit('bv::hide::modal', 'insertIDModal');
      })
    },

    openClientIDTypeModal(phoneNumber, source, type){
      this.insertIDPhoneNumber = phoneNumber;
      this.insertIDNewSource = source;
      this.insertIDNewType = type;
      this.$root.$emit('bv::show::modal', 'selectIDTypeModal');
    },

    openInsertClientID(isClientID){
      this.idIsClient = isClientID;
      this.$root.$emit('bv::hide::modal', 'selectIDTypeModal');
      this.$root.$emit('bv::show::modal', 'insertIDModal');
      this.loaderID = true;
      axios.post(constants.routes.backendAPI+'/selectClientIDSImage',
      {
        'clientIDSPhoneNumber': this.insertIDPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          if (isClientID){
            this.insertIDClientSource = response.data.result.source;
            this.insertIDClientType = response.data.result.type;
          } else {
            this.insertIDAuthorizedSource = response.data.result.secondarySource;
            this.insertIDAuthorizedType = response.data.result.secondaryType;
          }
          this.loaderID = false;
        } else {
          this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectClientIDSImage(clientIDSPhoneNumber){
      this.loaderID = true;
      this.insertIDClientSource = null;
      this.insertIDClientType = null;
      this.insertIDAuthorizedSource = null;
      this.insertIDAuthorizedType = null;

      this.$root.$emit('bv::show::modal', 'IDModal');
      axios.post(constants.routes.backendAPI+'/selectClientIDSImage',
      {
        'clientIDSPhoneNumber': clientIDSPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          if (response.data.result.source){
            if (response.data.result.type == 'image'){
              this.insertIDClientSource = `data:image/png;base64,${response.data.result.source}`;
              this.insertIDClientType = response.data.result.type;
              this.loaderID = false;
            } else {
              const binaryString = window.atob(response.data.result.source);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              this.insertIDClientSource = URL.createObjectURL(blob);
              this.insertIDClientType = response.data.result.type;
              this.loaderID = false;
            }
          }

          if (response.data.result.secondarySource){
            if (response.data.result.secondaryType == 'image'){
              this.insertIDAuthorizedSource = `data:image/png;base64,${response.data.result.secondarySource}`;
              this.insertIDAuthorizedType = response.data.result.secondaryType;
              this.loaderID = false;
            } else {
              const binaryString = window.atob(response.data.result.secondarySource);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              this.insertIDAuthorizedSource = URL.createObjectURL(blob);
              this.insertIDAuthorizedType = response.data.result.secondaryType;
              this.loaderID = false;
            }
          }

        } else {
          this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.$root.$emit('bv::hide::modal', 'IDModal');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.$root.$emit('bv::hide::modal', 'IDModal');
      })

    },


    detectShortcuts(){
      const lastChar = this.currentActiveConversation.textoEnviar[this.currentActiveConversation.textoEnviar.length - 1];
      if (lastChar){
        if (lastChar == '@'){
          const nombre = this.currentActiveConversation.whatsappConversationRecipientProfileName.split(' ')[0];
          if (nombre){
            this.currentActiveConversation.textoEnviar = this.currentActiveConversation.textoEnviar.slice(0, -1);
            this.currentActiveConversation.textoEnviar = this.currentActiveConversation.textoEnviar + nombre;
          }
        }
      }

    },


    redeemDiscountCode(){
      axios.post(constants.routes.backendAPI+'/redeemDiscountCode',
      {
        'discountCodeValue': this.inputCodigoDescuento,
        'discountCodePhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        'discountCodeWhatsappConversationID': this.currentActiveConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Código de descuento canjeado', response.data.result);
          var codigosDescuento = JSON.parse(localStorage.getItem('codigosDescuento'));
          codigosDescuento[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = this.inputCodigoDescuento;
          localStorage.setItem('codigosDescuento', JSON.stringify(codigosDescuento));
          this.displayCodigoDescuento = this.inputCodigoDescuento;
        } else {
          this.showNotification('danger', 'Error al canjear el código de descuento', response.data.result || 'Error al canjear el código de descuento', 'Ha ocurrido un error inesperado al canjear el código de descuento. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al canjear el código de descuento', 'Ha ocurrido un error inesperado al canjear el código de descuento. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })

    },

    openModalCodigoDescuento(){
      this.inputCodigoDescuento = '';
    },


    buscarCatalogoNicotina(){
      this.agentFavoriteImages = this.agentFavoriteImagesBackup.filter(item =>
        item.whatsappFavoriteImageName.toLowerCase().startsWith(this.catalogoNicotinaBuscado.toLowerCase())
      );
    },
    
    getCurrentRespondedConversationsAmount(){
      var amount = 0;
      for (var whatsappConversationID in this.activeConversationsAsJSON){
        if (this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.length - 1].whatsappGeneralMessageOwnerPhoneNumber == null){
          amount = amount + 1;
        }
      }
      return amount;
    },

    getCurrentNotRespondedConversationsAmount(){
      var amount = 0;
      for (var whatsappConversationID in this.activeConversationsAsJSON){
        if (this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.length - 1].whatsappGeneralMessageOwnerPhoneNumber != null){
          amount = amount + 1;
        }
      }
      return amount;
    },

    getAgentColor(agent){
      return 'background-color: ' + agent.agentColor + '; font-color: ' + agent.agentFontColor + '; z-index: 2000; overflow-y: auto;';
    },

    getLocalityOptionsColor(){
      var localityColor = this.localityColors[this.selectedLocality] || '#787878';
      return 'background-color: ' + localityColor + '; padding: 10px;';
    },

    openCommentsModal(openedComments){
      this.openedComments = openedComments;
    }, 

    updateWhatsappConversationCommentSeenDateTime(whatsappConversationCommentID){
      axios.post(constants.routes.backendAPI+'/updateWhatsappConversationCommentSeenDateTime',
      {
        'whatsappConversationCommentID': whatsappConversationCommentID
      })
      .then((response) =>{
        if (response.data.success){
          for (var index in this.conversationComments){
            for (var index2 in this.conversationComments[index]){
              if (this.conversationComments[index][index2].whatsappConversationCommentID == whatsappConversationCommentID){
                Vue.set(this.conversationComments[index][index2], 'whatsappConversationCommentSeenDateTime', 'Recibido');
              }
            }
          }
          for (var index in this.openedComments){
            if (this.openedComments[index].whatsappConversationCommentID == whatsappConversationCommentID){
              Vue.set(this.openedComments[index], 'whatsappConversationCommentSeenDateTime', 'Recibido');
            }
          }
          this.showNotification('success', 'Comentario recibido', 'Se ha recibido el comentario exitosamente.');
        } else {
          this.showNotification('danger', 'Error al recibir el comentario', 'Ha ocurrido un error inesperado al recibir el comentario. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al recibir el comentario', 'Ha ocurrido un error inesperado al recibir el comentario. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
      
    },

    scrollToBottomHistory(){
      let scrollInterval = setInterval(() => {
        if (this.$refs.historyScroll) {
          const scrollableDiv = this.$refs.historyScroll;
          scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
          clearInterval(scrollInterval);
        }
      }, 1);
    },

    scrollDown(){
      let scrollInterval = setInterval(() => {
        if (this.$refs.scrollRef) {
          const psContainer = this.$refs.scrollRef;
          psContainer.scrollTop = psContainer.scrollHeight;
          clearInterval(scrollInterval);
        }
      }, 1);
    },

    saveInvoiceLocation(){
      if (this.invoiceLocationName != ''){
        axios.post(constants.routes.backendAPI+'/insertWhatsappInvoiceLocation',
        {
          whatsappInvoiceLocationName: this.invoiceLocationName,
          whatsappInvoiceLocationLocation: {'latitude': this.invoiceLocationMessage.whatsappLocationMessageLatitude, 'longitude': this.invoiceLocationMessage.whatsappLocationMessageLongitude}
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Ubicación guardada', 'Se ha guardado la ubicación exitosamente.');
          } else {
            this.showNotification('danger', 'Error al guardar la ubicación', 'Ha ocurrido un error inesperado al guardar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al guardar la ubicación', 'Ha ocurrido un error inesperado al guardar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al guardar la ubicación', 'Por favor coloque el nombre de la ubicación e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },

    openSaveInvoiceLocationModal(invoiceLocationMessage){
      this.invoiceLocationMessage = invoiceLocationMessage;
      this.invoiceLocationName = '';
    },


    changeCartagoMap(mvcArray){
      let paths = [];
      for (let i=0; i<mvcArray.getLength(); i++) {
        let path = [];
        for (let j=0; j<mvcArray.getAt(i).getLength(); j++) {
          let point = mvcArray.getAt(i).getAt(j);
          path.push({lat: point.lat(), lng: point.lng()});
        }
        paths.push(path);
        console.log(paths);
      }
    },

    openEndConversationModal(){
      this.selectedCloseLocality = 'Seleccione una localidad';
      this.closeConversationReason = '';
      this.wrongProducts = '';
    },

    fixTotal(){
      this.calcularSubTotal;
      this.calcularDescuento;
      this.calcularTotal;
    },

    receiveWhatsappConversationComment(whatsappConversationComment){
      const whatsappConversationID = whatsappConversationComment.whatsappConversationID;
      if (whatsappConversationID in this.activeConversationsAsJSON){
        if (whatsappConversationID in this.conversationComments){
          this.conversationComments[whatsappConversationID].push(whatsappConversationComment)
        } else {
          this.conversationComments[whatsappConversationID] = [whatsappConversationComment];
        }
        this.playSound('alert');
      }
    },

    manageWebsocketConnection() {
      this.websocketConnection = new WebSocket(this.$store.getters.getWebsocketURL);

      this.websocketConnection.onopen = () => {
        this.websocketIsConnected = true;
        this.startWebsocketPingInterval();
      };

      this.websocketConnection.onmessage = (websocketMessage) => {
        try {
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
          } else if (websocketMessageID == '/agent/update/agentStatus'){
            this.receiveAgentStatusUpdate(websocketMessageContent);
          } else if (websocketMessageID == '/grabPendingConversation') {
            this.receiveGrabPendingConversation(websocketMessageContent);
          } else if (websocketMessageID == '/grabStoreConversation') {
            this.receiveGrabStoreConversation(websocketMessageContent);
          } else if (websocketMessageID == '/requestTransferWhatsappConversation'){
            this.receiveRequestTransferWhatsappConversation(websocketMessageContent);
          } else if (websocketMessageID == '/acceptTransferWhatsappConversation'){
            this.receiveAcceptTransferWhatsappConversation(websocketMessageContent);
          } else if (websocketMessageID == '/receiveWhatsappMessageStatusUpdate'){
            this.receiveWhatsappMessageStatusUpdate(websocketMessageJSON.websocketMessageContent);
          } else if (websocketMessageID == '/dashboardComment'){
            this.receiveWhatsappConversationComment(websocketMessageJSON.websocketMessageContent);
          }
        } catch (error) {
          console.log(error);
        }
      };

      this.websocketConnection.onclose = (event) => {
        if (this.websocketAbort == true) {
          this.websocketIsConnected = false;
          this.websocketConnection = null;
        } else {
          alert('Se ha cerrado el websocket por desconexion. Reconectando...');
          this.websocketIsConnected = false;
          this.websocketConnection = null;
          clearInterval(this.websocketPingInterval);
          setTimeout(() => {
            this.manageWebsocketConnection();
          }, this.websocketReconnectInterval);
        }
      };

      this.websocketConnection.onerror = (error) => {
        alert('Se ha cerrado el websocket por error. Reconectando...');
        this.websocketIsConnected = false;
        this.websocketConnection = null;
        clearInterval(this.websocketPingInterval);
      };
    },

    startWebsocketPingInterval() {
      this.websocketPingInterval = setInterval(() => {
        if (this.websocketIsConnected) {
          this.websocketConnection.send('ping');
          setTimeout(() => {
            if (!this.websocketIsConnected) {
              if (this.websocketConnection != null){
                this.websocketConnection.close();
              }
            } else {
            }
          }, 5000);
        }
      }, 5000);
    },


    selectLocalities(){
      axios.post(constants.routes.backendAPI+'/selectLocalities')
      .then((response) =>{
        if (response.data.success){
          this.localityOptions = [{value: null, text: 'Localidad de envío'}];
          this.closeLocalityOptions = ['Seleccione una localidad', 'King Vape Center'];
          for (var localityIndex in response.data.result){
            const localityID = response.data.result[localityIndex].localityID;
            const localityName = response.data.result[localityIndex].localityName;
            const localityColor = response.data.result[localityIndex].localityColor;
            this.localityOptions.push({value: localityID, text: localityName});
            this.closeLocalityOptions.push({value: localityID, text: localityName});
            this.localityColors[localityID] = localityColor;
          }
        } else {
          this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },
    

    syncTransactionToMessage(){
      var whatsappGeneralMessageID = '';
      for (var whatsappMessage in this.currentActiveConversation.whatsappConversationMessages){
        if (this.currentActiveConversation.whatsappConversationMessages[whatsappMessage]['selected'] == true){
          whatsappGeneralMessageID = this.currentActiveConversation.whatsappConversationMessages[whatsappMessage]['whatsappGeneralMessageID'];
        }
      }
      if (whatsappGeneralMessageID == ''){
        this.showNotification('danger', 'Error al validar la transacción', 'Debe seleccionar un mensaje para asociar la transacción. Seleccione un mensaje e intentelo nuevamente.');
      } else {
        if (this.selectedLocality == ''){
          this.showNotification('danger', 'Error al validar la transacción', 'Debe seleccionar una sucursal para asociar la transacción. Seleccione un mensaje e intentelo nuevamente.');

        } else {
          axios.post(constants.routes.backendAPI+'/syncTransaction',
          {
            transactionID: this.currentTransaction.transactionID,
            transactionRelatedMessageID: whatsappGeneralMessageID,
            transactionApprover: localStorage.getItem('agentID'),
            transactionStore: this.selectedLocality
          })
          .then((response) =>{
            if (response.data.success){
              this.showNotification('success', 'Transacción validada', 'Se ha validado la transacción exitosamente.')
              this.$root.$emit('bv::hide::modal', 'syncTransactionModal');
              this.$root.$emit('bv::hide::modal', 'paymentMethodValidatorModal');
              
            } else {
              this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            }
          })
          .catch(() => {
            this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          })
        }
      }
    },

    selectTransactionMessage(whatsappGeneralMessageID){
      for (var whatsappMessage in this.currentActiveConversation.whatsappConversationMessages){
        if (this.currentActiveConversation.whatsappConversationMessages[whatsappMessage]['whatsappGeneralMessageID'] == whatsappGeneralMessageID){
          if (this.currentActiveConversation.whatsappConversationMessages[whatsappMessage]['selected'] == true){
            Vue.set(this.currentActiveConversation.whatsappConversationMessages[whatsappMessage], 'selected', false);
          } else {
            Vue.set(this.currentActiveConversation.whatsappConversationMessages[whatsappMessage], 'selected', true);
          }
        } else {
          Vue.set(this.currentActiveConversation.whatsappConversationMessages[whatsappMessage], 'selected', false);
        }
      }
    },

    openSyncTransactionModal(currentTransaction){
      this.selectedLocality = '';
      for (var whatsappMessage in this.currentActiveConversation.whatsappConversationMessages){ 
        Vue.set(this.currentActiveConversation.whatsappConversationMessages[whatsappMessage], 'selected', false);
      }
      this.currentTransaction = currentTransaction;
      this.syncTransactionTitle = `Detalle: ${currentTransaction.transactionNote}. Monto: ₡${currentTransaction.transactionAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`;
    },

    deleteStoreConversation(){
      if (this.deleteStoreMessageReason != ''){
        axios.post(constants.routes.backendAPI+'/deleteStoreMessage', 
        {
          storeMessageID: this.deleteStoreMessageID,
          storeMessageStoreMessageID: this.deleteStoreMessageStoreMessageID,
          storeMessageStoreName: this.deleteStoreMessageName,
          storeMessageAssignedAgentID: localStorage.getItem('agentID'),
          storeMessageDeleteReason: this.deleteStoreMessageReason
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Mensaje de la tienda eliminado', 'Se ha eliminado el mensaje de la tienda exitosamente.')
          } else {
            this.showNotification('danger', 'Error al eliminar el mensaje de la tienda', 'Ha ocurrido un error inesperado al eliminar el mensaje de la tienda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) => {
          this.showNotification('danger', 'Error al eliminar el mensaje de la tienda', 'Ha ocurrido un error inesperado al eliminar el mensaje de la tienda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      } else {
        this.showNotification('danger', 'Error al eliminar el mensaje de la tienda', 'Debe colocar un motivo para eliminar el mensaje de la tienda. Agregue un motivo e intentelo nuevamente.')
      }
    },

    openDeleteStoreMessageModal(storeConversation){
      this.deleteStoreMessageID = storeConversation.storeMessageID;
      this.deleteStoreMessageStoreMessageID = storeConversation.storeMessageStoreMessageID;
      this.deleteStoreMessageName = storeConversation.storeMessageStoreName;
      this.deleteStoreMessageReason = 'Duplicado';
      this.$root.$emit('bv::hide::modal', 'escazuConversationsModal');
      this.$root.$emit('bv::hide::modal', 'zapoteConversationsModal');
      this.$root.$emit('bv::hide::modal', 'cartagoConversationsModal');
      this.$root.$emit('bv::hide::modal', 'herediaConversationsModal');
      this.$root.$emit('bv::hide::modal', 'metroPlazaConversationsModal');

      this.$root.$emit('bv::hide::modal', 'planetVapeConversationsModal');
      this.$root.$emit('bv::show::modal', 'deleteStoreConversationModal');
    },

    sendWhatsappStickerMessage(sticker){
      this.loaderSendSticker = true;
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappStickerMessage', 
      {
        stickerID: sticker.stickerID,
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        whatsappGeneralMessageRepliedMessageID: repliedMessageID
      })
      .then((response) =>{
        this.loaderSendSticker = false;
        this.$root.$emit('bv::hide::modal','sendStickerModal');
        if (response.data.success){
          this.repliedMessage = null;
          const whatsappConversationID = response.data.result.whatsappConversationID;
          this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);          
          this.scrollDown();
          this.sortConversations();
        } else {
          this.showNotification('danger', 'Error al enviar el sticker al cliente', 'Ha ocurrido un error inesperado al enviar el sticker al cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.loaderSendSticker = false;
        this.$root.$emit('bv::hide::modal','sendStickerModal');
        this.showNotification('danger', 'Error al enviar el sticker al cliente', 'Ha ocurrido un error inesperado al enviar el sticker al cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    async openSendStickerModal(){
      const stickerCurrentData = await this.readStickerDatabase();
      const stickerCurrentIDS = stickerCurrentData.map(currentSticker => currentSticker.stickerID);
      axios.post(constants.routes.backendAPI+'/selectMissingLocalStickers', {stickerCurrentIDS: stickerCurrentIDS})
      .then(async (response) =>{
        if (response.data.success){
          for (var stickerIndex in response.data.result){
            await this.saveStickerDatabase(response.data.result[stickerIndex]);
          }
          this.currentStickers = await this.readStickerDatabase();
          this.currentMyStickers = this.currentStickers.filter(sticker => sticker.stickerAgentID == localStorage.getItem('agentID'));
        } else {
          this.showNotification('danger', 'Error al buscar los stickers', 'Ha ocurrido un error inesperado al buscar los stickers. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al buscar los stickers', 'Ha ocurrido un error inesperado al buscar los stickers. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })

    },

    changeActiveStickerItem(navItem){
      this.currentStickerItem = navItem;
    },

    getActiveStickerItem(navItem){
      if (this.currentStickerItem == navItem){
        return true;
      }
      return false;
    },

    saveSticker(){
      axios.post(constants.routes.backendAPI+'/insertSticker', 
      {
        stickerAgentID: localStorage.getItem('agentID'),
        stickerName: this.stickerName,
        stickerFile: this.stickerFile,
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Sticker guardado', "Se ha guardado el sticker con el nombre '" + this.stickerName + "'.");
        } else {
          this.showNotification('danger', 'Error al guardar el sticker', 'Ha ocurrido un error inesperado al guardar el sticker. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al guardar el sticker', 'Ha ocurrido un error inesperado al guardar el sticker. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openSaveStickerModal(stickerFile){
      this.stickerFile = stickerFile;
      this.stickerName = '';
    },

    handleEmojiClick(event) {
      this.currentActiveConversation.textoEnviar = this.currentActiveConversation.textoEnviar + event.detail.unicode;
    },

    validatePaymentMethod(){ 
      this.validatePaymentMethodLoader = true;
      this.currentTransactions = null;
      axios.post(constants.routes.backendAPI+'/selectNotUsedTransactions')
      .then((response) =>{
        this.validatePaymentMethodLoader = false;
        if (response.data.success){
          this.currentTransactions = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.validatePaymentMethodLoader = false;
        this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openPaymentMethodValidatorModal(){
      this.currentTransactions = null;
      this.paymentMethodValidatorPhoneNumber = this.currentActiveConversation.whatsappConversationRecipientPhoneNumber;
      this.paymentMethodValidatorAmount = parseInt(this.calcularTotal, 10);
    },

    getWhatsappInvoicePaymentMethodIsSINPE(){
      return this.whatsappInvoicePaymentMethod == 'SINPE';
    },

    getWhatsappInvoicePaymentMethodStyle(){
      return this.whatsappInvoicePaymentMethod == 'SINPE' ? 'margin-bottom: 10px; width: 70%' : 'margin-bottom: 10px; width: 100%';
    },

    getReferenciaSucursal(recipientPhoneNumber){
      const referenciaSucursales = JSON.parse(localStorage.getItem('referenciaSucursales'));
      return referenciaSucursales[recipientPhoneNumber];
    },


    changeLocalStorageWhatsappInvoiceInformation(whatsappInvoiceInformationToChange, whatsappInvoiceNewInformation){
      var datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
      if (datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]) {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][whatsappInvoiceInformationToChange] = whatsappInvoiceNewInformation;
      } else {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = {};
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber][whatsappInvoiceInformationToChange] = whatsappInvoiceNewInformation;
      }
      localStorage.setItem('datosActuales', JSON.stringify(datosActuales));
    },

    changeLocalStorageWhatsappInvoiceLocationInformation(){
      const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
      if (datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName'] = this.whatsappInvoiceClientLocationName;
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLatitude'] = this.currentActiveConversation.whatsappConversationRecipientLocations[this.whatsappInvoiceClientLocationName].latitude;
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLongitude'] = this.currentActiveConversation.whatsappConversationRecipientLocations[this.whatsappInvoiceClientLocationName].longitude;
      } else {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = 
        {
          'whatsappInvoiceClientLocationName': this.whatsappInvoiceClientLocationName,
          'whatsappInvoiceClientLocationLatitude': this.currentActiveConversation.whatsappConversationRecipientLocations[this.whatsappInvoiceClientLocationName].latitude,
          'whatsappInvoiceClientLocationLongitude': this.currentActiveConversation.whatsappConversationRecipientLocations[this.whatsappInvoiceClientLocationName].longitude
        }
      }
      localStorage.setItem('datosActuales', JSON.stringify(datosActuales));
    },


    modificarNotaEnvio(){
      const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
      if (datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['notaEnvio'] = this.currentActiveConversation.whatsappConversationRecipientNote;
      } else {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = 
        {
          'notaEnvio': this.currentActiveConversation.whatsappConversationRecipientNote
        }
      }
      localStorage.setItem('datosActuales', JSON.stringify(datosActuales));
    },

    modificarNotaDireccion(){
      const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
      if (datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['notaDireccion'] = this.currentActiveConversation.whatsappConversationRecipientLocationDetails;
      } else {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = 
        {
          'notaDireccion': this.currentActiveConversation.whatsappConversationRecipientLocationDetails
        }
      }
      localStorage.setItem('datosActuales', JSON.stringify(datosActuales));
    },

  
    getActiveNavItem(navItem){
      if (this.currentNavItem == navItem){
        return true;
      }
      return false;
    },

    getActiveNavItemLiquid(navItem){
      if (this.currentNavItemLiquid == navItem){
        return true;
      }
      return false;
    },

    getActiveNavItemSalt(navItem){
      if (this.currentNavItemSalt == navItem){
        return true;
      }
      return false;
    },

    changeActiveNavItemLiquid(navItem){
      this.currentNavItemLiquid = navItem;
      this.deselectImages();
    },

    changeActiveNavItemSalt(navItem){
      this.currentNavItemSalt = navItem;
      this.deselectImages();
    },

    changeActiveNavItem(navItem){
      this.currentNavItem = navItem;
      this.deselectImages();
    },

    getIncomingMessagesAmount(messages){
      var messageAmount = 0;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].whatsappGeneralMessageOwnerPhoneNumber != null) {
          messageAmount = messageAmount + 1;
        } else {
          break;
        }
      } 
      return messageAmount;
    },

    parsePhone(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    getConversationStyle(whatsappConversationID){
      var comments = this.conversationComments[whatsappConversationID];
      var alert = false;
      for (var index in comments){
        if (comments[index].whatsappConversationCommentSeenDateTime == null){
          var elapsedSeconds = Math.floor((new Date() - new Date(comments[index].whatsappConversationCommentSentDateTime))/1000);
          if (elapsedSeconds >= 60){
            alert = true;
          }
        }        
      }
      if (alert){
        return 'cursor: pointer; animation: commentAnimation 2s infinite;';
      } else if (whatsappConversationID == this.currentActiveConversationID){
        return 'cursor: pointer; background-color: #f7f3a6;';
      }
      return 'cursor: pointer;';
    },

    getHistoryMessage(whatsappGeneralMessageID){
      this.loaders.historyMessage = true;
      axios.post(constants.routes.backendAPI+'/selectWhatsappGeneralMessage', 
      {
        whatsappGeneralMessageID: whatsappGeneralMessageID
      })
      .then((response) => {
        if (response.data.success){
          this.historyMessage = response.data.result;
          this.loaders.historyMessage = false;
        } else {
          this.loaders.historyMessage = false;
          this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    saveContact(){
      const me = this;
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientProfileName) && regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientPhoneNumber) && regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientID) && regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientLocationDetails) && regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientNote)) {
        axios.post(constants.routes.backendAPI+'/insertOrUpdateContact',
        {
          'contactName': this.currentActiveConversation.whatsappConversationRecipientProfileName,
          'contactPhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
          'contactID': this.currentActiveConversation.whatsappConversationRecipientID,
          'contactEmail': this.currentActiveConversation.whatsappConversationRecipientEmail,
          'contactLocations': this.currentActiveConversation.whatsappConversationRecipientLocations,
          'contactLocationDetails': this.currentActiveConversation.whatsappConversationRecipientLocationDetails,
          'contactNote': this.currentActiveConversation.whatsappConversationRecipientNote
        }).then(function (response){
          me.$bvToast.toast("Se ha creado exitosamente el contacto con el número '" + me.currentActiveConversation.whatsappConversationRecipientPhoneNumber + "'.", {
            title: "Contacto creado",
            variant: "success",
            solid: true
          });
        })
      } else {
        this.$bvToast.toast('El contenido de la información del contacto no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el contacto',
          variant: 'danger',
          solid: true
        });
      }
    },

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

    openHistoryConversation(historyConversation){
      this.openHistoryLoader = true;
      this.currentHistoryConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: historyConversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
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
      this.historyLoader = true;
      this.historyConversations = [];
      axios.post(constants.routes.backendAPI+'/selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber', 
      {
        whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          response.data.result.forEach((objeto) => {
            objeto.productos = JSON.parse(objeto.whatsappConversationProducts);
          });
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
              if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'nicotine'){
                this.agentFavoriteImages.push(response.data.result[agentFavoriteImageIndex]);
                this.agentFavoriteImagesBackup.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'zero'){
                this.agentFavoriteImages2.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'message'){
                this.agentFavoriteImages3.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'ice'){
                this.liquids1.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'noIce'){
                this.liquids2.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'saltIce'){
                this.salts1.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'saltNoIce'){
                this.salts2.push(response.data.result[agentFavoriteImageIndex]);
              } else if (response.data.result[agentFavoriteImageIndex].whatsappFavoriteImageCatalog == 'promo'){
                this.promos.push(response.data.result[agentFavoriteImageIndex]);
              }
            }
            for (var agentFavoriteImageIndex in this.agentFavoriteImages){
              this.agentFavoriteImages[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var agentFavoriteImageIndex in this.agentFavoriteImages2){
              this.agentFavoriteImages2[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var agentFavoriteImageIndex in this.liquids1){
              this.liquids1[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var agentFavoriteImageIndex in this.liquids2){
              this.liquids2[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var agentFavoriteImageIndex in this.salts1){
              this.salts1[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var agentFavoriteImageIndex in this.salts2){
              this.salts2[agentFavoriteImageIndex]['selected'] = false;
            }
            for (var promoIndex in this.promos){
              this.promos[promoIndex]['selected'] = false;
            }
          } else {
            this.showNotification('danger', 'Error al consultar las imágenes del catálogo', 'Ha ocurrido un error inesperado al consultar las imágenes del catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch((error) => {
          this.showNotification('danger', 'Error al consultar las imágenes del catálogo', 'Ha ocurrido un error inesperado al consultar las imágenes del catálogo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
    },

    deselectImages(){
      this.catalogoNicotinaBuscado = '';
      this.agentFavoriteImages = this.agentFavoriteImagesBackup;
      for (var agentFavoriteImageIndex in this.agentFavoriteImages){
        this.agentFavoriteImages[agentFavoriteImageIndex]['selected'] = false;
      }
      for (var agentFavoriteImageIndex in this.agentFavoriteImages2){
        this.agentFavoriteImages2[agentFavoriteImageIndex]['selected'] = false;
      }
      for (var agentFavoriteImageIndex in this.liquids1){
        this.liquids1[agentFavoriteImageIndex]['selected'] = false;
      }
      for (var agentFavoriteImageIndex in this.liquids2){
        this.liquids2[agentFavoriteImageIndex]['selected'] = false;
      }
      for (var agentFavoriteImageIndex in this.salts1){
        this.salts1[agentFavoriteImageIndex]['selected'] = false;
      }
      for (var agentFavoriteImageIndex in this.salts2){
        this.salts2[agentFavoriteImageIndex]['selected'] = false;
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
      this.recordedAudioFile = null;
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
        var me = this;
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
          console.log(error);
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
        console.log(error);
        me.$bvToast.toast("Ha ocurrido un error inesperado al consultar el stock. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar stock",
          variant: "danger",
          solid: true
        });
      });
    },
  
    saveLocation(locationName, whatsappGeneralMessage){
      this.currentActiveConversation.whatsappConversationRecipientLocations[locationName] = {latitude: whatsappGeneralMessage.whatsappLocationMessageLatitude, longitude: whatsappGeneralMessage.whatsappLocationMessageLongitude};
      
      const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
      if (datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName'] = locationName;
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLatitude'] = whatsappGeneralMessage.whatsappLocationMessageLatitude;
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLongitude'] = whatsappGeneralMessage.whatsappLocationMessageLongitude;
      } else {
        datosActuales[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = 
        {
          'whatsappInvoiceClientLocationName': locationName,
          'whatsappInvoiceClientLocationLatitude': whatsappGeneralMessage.whatsappLocationMessageLatitude,
          'whatsappInvoiceClientLocationLongitude': whatsappGeneralMessage.whatsappLocationMessageLongitude
        }
      }
      localStorage.setItem('datosActuales', JSON.stringify(datosActuales));

      this.showNotification('success', 'Ubicación registrada', "Ha registrado la ubicación '"+locationName+"' al cliente exitosamente.");
    },

    getLocation(whatsappGeneralMessage){
      return {lat: whatsappGeneralMessage.whatsappLocationMessageLatitude, lng: whatsappGeneralMessage.whatsappLocationMessageLongitude};
    },


    getImageVariant(image){
      if (image.selected == true) {
        return 'success'
      } else {
        return 'default'
      }
    },

    getAllPromoVariant(){
      var variant = 'success';
      for(var imageIndex in this.promos){
        if (this.promos[imageIndex].selected == false){
          return 'default';
        };
      }
      return variant;
    
    },

    getAllFavoriteVariant(){
      var variant = 'success';
      if (this.currentNavItem == 'Nicotina'){
        for(var imageIndex in this.agentFavoriteImages){
          if (this.agentFavoriteImages[imageIndex].selected == false){
            return 'default';
          };
        } 
        return variant;
      } else {
        for(var imageIndex in this.agentFavoriteImages2){
          if (this.agentFavoriteImages2[imageIndex].selected == false){
            return 'default';
          };
        }
        return variant;
      }
    },

    getAllFavoriteVariantLiquid(){
      var variant = 'success';
      if (this.currentNavItemLiquid == 'Ice'){
        for(var imageIndex in this.liquids1){
          if (this.liquids1[imageIndex].selected == false){
            return 'default';
          };
        } 
        return variant;
      } else {
        for(var imageIndex in this.liquids2){
          if (this.liquids2[imageIndex].selected == false){
            return 'default';
          };
        }
        return variant;
      }
    },

    getAllFavoriteVariantSalt(){
      var variant = 'success';
      if (this.currentNavItemSalt == 'saltIce'){
        for(var imageIndex in this.salts1){
          if (this.salts1[imageIndex].selected == false){
            return 'default';
          };
        } 
        return variant;
      } else {
        for(var imageIndex in this.salts2){
          if (this.salts2[imageIndex].selected == false){
            return 'default';
          };
        }
        return variant;
      }
    },

    selectPromo(image){
      this.$set(this.promos, image, { ...this.promos[image], selected: !this.promos[image].selected });
    },

    selectFavoriteImage(image){
      if (this.currentNavItem == 'Nicotina'){
        this.$set(this.agentFavoriteImages, image, { ...this.agentFavoriteImages[image], selected: !this.agentFavoriteImages[image].selected });
      } else {
        this.$set(this.agentFavoriteImages2, image, { ...this.agentFavoriteImages2[image], selected: !this.agentFavoriteImages2[image].selected });
      }
    },

    selectFavoriteImageLiquid(image){
      if (this.currentNavItemLiquid == 'Ice'){
        this.$set(this.liquids1, image, { ...this.liquids1[image], selected: !this.liquids1[image].selected });
      } else {
        this.$set(this.liquids2, image, { ...this.liquids2[image], selected: !this.liquids2[image].selected });
      }
    },

    selectFavoriteImageSalt(image){
      if (this.currentNavItemSalt == 'saltIce'){
        this.$set(this.salts1, image, { ...this.salts1[image], selected: !this.salts1[image].selected });
      } else {
        this.$set(this.salts2, image, { ...this.salts2[image], selected: !this.salts2[image].selected });
      }
    },

    selectAllPromo(){
      if (this.allPromoSelected == false){
        for (var imageIndex in this.promos) {
          this.$set(this.promos, imageIndex, { ...this.promos[imageIndex], selected: true });
        }
      } else {
        for (var imageIndex in this.promos) {
          this.$set(this.promos, imageIndex, { ...this.promos[imageIndex], selected: false });
        }
      }
      this.allPromoSelected = !this.allPromoSelected;
    },

    selectAllFavoriteImage(){
      if (this.currentNavItem == 'Nicotina'){
        if (this.allImageSelected == false){
          for (var imageIndex in this.agentFavoriteImages) {
            this.$set(this.agentFavoriteImages, imageIndex, { ...this.agentFavoriteImages[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.agentFavoriteImages) {
            this.$set(this.agentFavoriteImages, imageIndex, { ...this.agentFavoriteImages[imageIndex], selected: false });
          }
        }
      } else {
        if (this.allImageSelected == false){
          for (var imageIndex in this.agentFavoriteImages2) {
            this.$set(this.agentFavoriteImages2, imageIndex, { ...this.agentFavoriteImages2[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.agentFavoriteImages2) {
            this.$set(this.agentFavoriteImages2, imageIndex, { ...this.agentFavoriteImages2[imageIndex], selected: false });
          }
        }
      }
      this.allImageSelected = !this.allImageSelected;
    },

    selectAllFavoriteImageLiquid(){
      if (this.currentNavItemLiquid == 'Ice'){
        if (this.allImageSelectedLiquid == false){
          for (var imageIndex in this.liquids1) {
            this.$set(this.liquids1, imageIndex, { ...this.liquids1[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.liquids1) {
            this.$set(this.liquids1, imageIndex, { ...this.liquids1[imageIndex], selected: false });
          }
        }
      } else {
        if (this.allImageSelectedLiquid == false){
          for (var imageIndex in this.liquids2) {
            this.$set(this.liquids2, imageIndex, { ...this.liquids2[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.liquids2) {
            this.$set(this.liquids2, imageIndex, { ...this.liquids2[imageIndex], selected: false });
          }
        }
      }
      this.allImageSelectedLiquid = !this.allImageSelectedLiquid;
    },


    selectAllFavoriteImageSalt(){
      if (this.currentNavItemSalt == 'saltIce'){
        if (this.allImageSelectedSalt == false){
          for (var imageIndex in this.salts1) {
            this.$set(this.salts1, imageIndex, { ...this.salts1[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.salts2) {
            this.$set(this.salts2, imageIndex, { ...this.salts2[imageIndex], selected: false });
          }
        }
      } else {
        if (this.allImageSelectedSalt == false){
          for (var imageIndex in this.liquids2) {
            this.$set(this.liquids2, imageIndex, { ...this.liquids2[imageIndex], selected: true });
          }
        } else {
          for (var imageIndex in this.liquids2) {
            this.$set(this.liquids2, imageIndex, { ...this.liquids2[imageIndex], selected: false });
          }
        }
      }
      this.allImageSelectedSalt = !this.allImageSelectedSalt;
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


    validateInvoiceInformation(){
      const regularExpressionChecker = /\S/;

      if (this.currentActiveConversation.whatsappConversationProducts == 0){
        this.showNotification('danger', 'Carrito vacío', 'Por favor, agregue al menos un producto al carrito para generar la orden, e intentelo nuevamente');
        return false;
      } else if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientProfileName) == false){
        this.showNotification('danger', 'Nombre incompleto', 'Por favor, agregue el nombre del cliente para generar la orden, e intentelo nuevamente');
        return false;
      } else if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientPhoneNumber) == false){
        this.showNotification('danger', 'Número de teléfono incompleto', 'Por favor, agregue el número de teléfono del cliente para generar la orden, e intentelo nuevamente');
        return false;
      } else if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientID) == false){
        this.showNotification('danger', 'Cédula incompleta', 'Por favor, agregue la cédula del cliente para generar la orden, e intentelo nuevamente');
        return false;
      } else if (this.selectedLocality == null){
        this.showNotification('danger', 'Localidad de envío incompleta', 'Por favor, seleccione una localidad de envío para generar la orden, e intentelo nuevamente');
        return false;
      } else if (this.whatsappInvoiceShippingMethod == 'Método de envío'){
        this.showNotification('danger', 'Método de envío incompleto', 'Por favor, seleccione un método de envío para generar la orden, e intentelo nuevamente');
        return false;
      } else if (this.whatsappInvoicePaymentMethod == 'Método de pago'){
        this.showNotification('danger', 'Método de pago incompleto', 'Por favor, seleccione un método de pago para generar la orden, e intentelo nuevamente');
        return false;
      } else if (this.whatsappInvoicePaymentState == 'Estado del pago'){
        this.showNotification('danger', 'Estado del pago incompleto', 'Por favor, seleccione un estado del pago para generar la orden, e intentelo nuevamente');
        return false;
      } else if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientLocationDetails) == false){
        this.showNotification('danger', 'Nota de la ubicación incompleta', 'Por favor, seleccione una nota de la ubicación para generar la orden, e intentelo nuevamente');
        return false;
      } else if (regularExpressionChecker.test(this.currentActiveConversation.whatsappConversationRecipientNote) == false){
        this.showNotification('danger', 'Nota del envío incompleta', 'Por favor, seleccione una nota del envío para generar la orden, e intentelo nuevamente');
        return false;
      } 
      return true;
    },
   

    async insertWhatsappInvoice(){
      try {

        if (this.validateInvoiceInformation()){

          this.currentActiveConversation.whatsappConversationRecipientPhoneNumber = (parseInt(this.currentActiveConversation.whatsappConversationRecipientPhoneNumber.replace(/\D/g, ''), 10)).toString();
          this.repliedMessage = null;
          this.producto = '';

          this.loaderOrdenEnviada = true;
          this.loading = true;

          var subTotal = 0.0;
          var descuento = 0.0;
          for (var productIndex in this.currentActiveConversation.whatsappConversationProducts){
            subTotal = subTotal + (this.currentActiveConversation.whatsappConversationProducts[productIndex].cantidad * this.currentActiveConversation.whatsappConversationProducts[productIndex].precio);
            descuento = descuento + ((this.currentActiveConversation.whatsappConversationProducts[productIndex].descuento/100)*((this.currentActiveConversation.whatsappConversationProducts[productIndex].precio)*this.currentActiveConversation.whatsappConversationProducts[productIndex].cantidad));
          }
          var amount = subTotal - descuento;
          amount = Math.round(amount / 5) * 5;

          this.saveContact();

          axios.post(constants.routes.backendAPI+'/insertWhatsappInvoice',
          {
            whatsappInvoiceWhatsappConversationID: this.currentActiveConversationID,
            whatsappInvoiceLocalityID: this.selectedLocality,
            whatsappInvoiceAgentID: localStorage.getItem('agentID'),
            whatsappInvoiceState: 'C',
            whatsappInvoiceClientName: this.currentActiveConversation.whatsappConversationRecipientProfileName,
            whatsappInvoiceClientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
            whatsappInvoiceClientLocation: {'latitude': this.latitud, 'longitude': this.longitud},
            whatsappInvoiceClientLocationURL: this.whatsappInvoiceClientLocationURL,
            whatsappInvoiceAmount: amount,
            whatsappInvoiceShippingMethod: this.whatsappInvoiceShippingMethod,
            whatsappInvoicePaymentMethod: this.whatsappInvoicePaymentMethod,
            whatsappInvoicePaymentState: this.whatsappInvoicePaymentState,
            whatsappInvoiceLocationNote: this.currentActiveConversation.whatsappConversationRecipientLocationDetails,
            whatsappInvoiceShippingNote: this.currentActiveConversation.whatsappConversationRecipientNote,
            whatsappInvoiceProducts: this.currentActiveConversation.whatsappConversationProducts,
            whatsappInvoiceIsForToday: this.currentActiveConversation.whatsappConversationIsForToday
          })
          .then((response) =>{ 
            if (response.data.success){
              
              const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
              if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
                delete ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
              }
              localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
              
              const datosActualesLocalStorage = JSON.parse(localStorage.getItem('datosActuales'));
              if (datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
                delete datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
              }
              localStorage.setItem('datosActuales', JSON.stringify(datosActualesLocalStorage));

              const codigosDescuento = JSON.parse(localStorage.getItem('codigosDescuento'));
              if (codigosDescuento[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
                delete codigosDescuento[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
              }
              localStorage.setItem('codigosDescuento', JSON.stringify(codigosDescuento));

              axios.post(constants.routes.backendAPI+'/closeWhatsappConversation',
              {
                whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
                whatsappConversationCloseComment: 'Venta',
                whatsappConversationAmount: amount,
                whatsappTextMessageBody: localStorage.getItem('agentEndMessage'),
                whatsappConversationProducts: this.currentActiveConversation.whatsappConversationProducts,
                whatsappConversationLocalityName: this.selectedLocality,
                sendAgentEndMessage: true
              })
              .then((response) =>{ 
                if (response.data.success){
                  this.showNotification('success', 'Conversación finalizada', 'Ha finalizado la conversación exitosamente.')
                  
                  delete this.activeConversationsAsJSON[response.data.result];
                  this.sortConversations();
                  this.loading = false;
                  this.loaderOrdenEnviada = false;
                  this.currentActiveConversation = null;
                } else {
                  this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
                }
              })
              .catch((error) =>{
                this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
              })
            } else {
              this.loading = false;
              this.loaderOrdenEnviada = false;
              this.showNotification('danger', 'Error al generar la comanda', 'Ha ocurrido un error inesperado al generar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
            }
          })
          .catch((e) =>{
            console.log(e);
            this.loading = false;
            this.loaderOrdenEnviada = false;
            this.showNotification('danger', 'Error al generar la comanda', 'Ha ocurrido un error inesperado al generar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          })    
        }
      } catch (e) {
        console.log(e);
        this.showNotification('danger', 'Error de tipado', 'Ha ocurrido un error inesperado de tipado. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        this.loaderOrdenEnviada = false;
      }
    },

      EliminarLinea(CodigoP){
        this.currentActiveConversation.whatsappConversationProducts = this.currentActiveConversation.whatsappConversationProducts.filter(e => e.CodigoP != CodigoP);
        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber].filter(e => e.CodigoP != CodigoP);
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
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = 
          [{
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
          descripcion: descripcionVariacion,
          cantidad: 1,
          precio: item.precioVenta,
          id: item.id,
          descuento: 0
        });
        this.$bvToast.toast(descripcionVariacion + " cargado al carrito.", {
          title: `Producto cargado al carrito`,
          variant: variant,
          solid: true
        });

        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber].push({
            CodigoP: codigoVariacion,
            descripcion: descripcionVariacion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          });
        } else {
          ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber] = [{
            CodigoP: codigoVariacion,
            descripcion: descripcionVariacion,
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
                  console.log(me.productos);
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

    getMessageOwnerColorTransaction(selected){
      if(selected == true){
        return "background-color:#b1fac8";
      }
      return "background-color:#dedede";
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
      const whatsappTextMessageBody = this.currentActiveConversation['textoEnviar'];

      if (/\S/.test(whatsappTextMessageBody)){
        const whatsappConversationID = this.currentActiveConversationID;
      const whatsappGeneralMessageRepliedMessageID = this.repliedMessage ? this.repliedMessage.whatsappGeneralMessageID : '';
      const whatsappGeneralMessagePromiseID = Math.floor(Math.random() * 9000000000) + 1000000000;
      
      if (this.activeConversationsAsJSON[whatsappConversationID]){
        
        const newWhatsappTextMessage = 
        {
          'whatsappGeneralMessageCreationDateTime': new Date().toString(),
          'whatsappGeneralMessageDeliveringDateTime': null,
          'whatsappGeneralMessageID': null,
          'whatsappGeneralMessageIndex': this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.length + 1,
          'whatsappGeneralMessageOwnerPhoneNumber': null,
          'whatsappGeneralMessageRepliedMessageID': this.repliedMessage ? this.repliedMessage.whatsappGeneralMessageID : null,
          'whatsappGeneralMessageSendingDateTime': new Date().toString(),
          'whatsappGeneralMessageType': 'text',
          'whatsappTextMessageBody': whatsappTextMessageBody,
          'whatsappGeneralMessagePromiseID': whatsappGeneralMessagePromiseID,
        };
        
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(newWhatsappTextMessage);
        this.currentActiveConversation['textoEnviar'] = '';
        this.scrollDown();
        this.sortConversations();
      } else {

      }

      this.repliedMessage = null;



      axios.post(constants.routes.backendAPI+'/sendWhatsappTextMessage',
      {
        'whatsappConversationRecipientPhoneNumber': this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
        'whatsappGeneralMessageRepliedMessageID': whatsappGeneralMessageRepliedMessageID,
        'whatsappTextMessageBody': whatsappTextMessageBody,
        'whatsappGeneralMessagePromiseID': whatsappGeneralMessagePromiseID
      }) 
      .then((response) =>{ 
        if (response.data.success){
          const whatsappTextMessage = this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.find(whatsappConversationMessage => whatsappConversationMessage.whatsappGeneralMessagePromiseID == whatsappGeneralMessagePromiseID);
          whatsappTextMessage.whatsappGeneralMessageID = response.data.result.whatsappGeneralMessageID;
          this.scrollDown();
          this.sortConversations();
          const intervalId = setInterval(() => {
            if (this.$refs.textoEnviar){
              if (document.activeElement !== this.$refs.textoEnviar) {
                this.$refs.textoEnviar.focus();
                clearInterval(intervalId);
              } else {
                clearInterval(intervalId);
              }
            } else {
              clearInterval(intervalId);
            }
          }, 1);
        } else {
          this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al enviar el mensaje al cliente', 'Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
      }

      
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
        if (this.calcularDescuento != 0.00){
          whatsappTextMessageContent = whatsappTextMessageContent + `%0a*DESCUENTO*: ₡` + this.calcularDescuento;
        }
        whatsappTextMessageContent = whatsappTextMessageContent + `%0a*TOTAL*: ₡` + this.calcularTotal;        
        var repliedMessageID = ''
        if (this.repliedMessage != null){
          repliedMessageID = this.repliedMessage.whatsappGeneralMessageID;
        }
        this.sendingMessageDisable = true;
        whatsappTextMessageContent = whatsappTextMessageContent.replace('#','');
        whatsappTextMessageContent = whatsappTextMessageContent.replace('&',' ');

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
          repliedMessageID = this.repliedMessage.whatsappGeneralMessageID;
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
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID;
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
        this.recordedAudioFile = null;
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al enviar el audio', 'Ha ocurrido un error inesperado al enviar el audio. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    sendWhatsappLocationMessage(locationName){
      var repliedMessageID = '';
      if (this.repliedMessage != null){
        repliedMessageID = this.repliedMessage.whatsappGeneralMessageID
      }
      if (this.currentActiveConversation.whatsappConversationRecipientLocations[locationName]){
        if (this.currentActiveConversation.whatsappConversationRecipientLocations[locationName].latitude != '0'){
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
        var latitud = 9.99168;
        var longitud = -84.135;
      } else if (locationName == 'Metro Plaza'){
        var latitud = 9.94173;
        var longitud = -84.1544995;
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
          this.sendWhatsappFavoriteTextMessage('Nuestro horario de atención es de lunes a domingo de 9:30 am a 7:00 pm')
        } else {
          this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al enviar la ubicación', 'Ha ocurrido un error inesperado al enviar la ubicación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


    async sendPromos(){
      const currentConversation = this.currentActiveConversation;
      
      for (var image in this.promos){
        if (this.promos[image].selected){       
          await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
          {
            whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
            whatsappFavoriteImageMessageContent: this.promos[image],
            whatsappFavoriteImageMessageCaption: null
          })
          .then((response) => {
            if (response.data.success){
              this.promos[image].selected = false;
              this.repliedMessage = null;
              const whatsappConversationID = response.data.result.whatsappConversationID;
              this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(response.data.result);
              this.scrollDown();
            } else {
              this.showNotification('danger', 'Error al enviar la promoción al cliente', 'Ha ocurrido un error inesperado al enviar la promoción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            }
          })
          .catch((error) =>{
            this.showNotification('danger', 'Error al enviar la promoción al cliente', 'Ha ocurrido un error inesperado al enviar la promoción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          })
        }
      }
        
      this.sortConversations();
    },


    async sendWhatsappFavoriteImageMessage(){
      const currentConversation = this.currentActiveConversation;
      
      if (this.currentNavItem == 'Nicotina'){

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
        
      } else {
        for (var image in this.agentFavoriteImages2){
          if (this.agentFavoriteImages2[image].selected){       
            await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
            {
              whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
              whatsappFavoriteImageMessageContent: this.agentFavoriteImages2[image],
              whatsappFavoriteImageMessageCaption: null
            })
            .then((response) => {
              if (response.data.success){
                this.agentFavoriteImages2[image].selected = false;
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
      }
      this.sortConversations();
    },

    async sendWhatsappFavoriteImageMessageLiquid(){
      const currentConversation = this.currentActiveConversation;
      
      if (this.currentNavItemLiquid == 'Ice'){
        for (var image in this.liquids1){
          if (this.liquids1[image].selected){       
            await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
            {
              whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
              whatsappFavoriteImageMessageContent: this.liquids1[image],
              whatsappFavoriteImageMessageCaption: null
            })
            .then((response) => {
              if (response.data.success){
                this.liquids1[image].selected = false;
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
      } else {
        for (var image in this.liquids2){
          if (this.liquids2[image].selected){       
            await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
            {
              whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
              whatsappFavoriteImageMessageContent: this.liquids2[image],
              whatsappFavoriteImageMessageCaption: null
            })
            .then((response) => {
              if (response.data.success){
                this.liquids2[image].selected = false;
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
      }
      this.sortConversations();
    },


    async sendWhatsappFavoriteImageMessageSalt(){
      const currentConversation = this.currentActiveConversation;
      
      if (this.currentNavItemSalt == 'saltIce'){
        for (var image in this.salts1){
          if (this.salts1[image].selected){       
            await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
            {
              whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
              whatsappFavoriteImageMessageContent: this.salts1[image],
              whatsappFavoriteImageMessageCaption: null
            })
            .then((response) => {
              if (response.data.success){
                this.salts1[image].selected = false;
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
      } else {
        for (var image in this.salts2){
          if (this.salts2[image].selected){       
            await axios.post(constants.routes.backendAPI+'/sendWhatsappFavoriteImageMessage', 
            {
              whatsappConversationRecipientPhoneNumber: currentConversation.whatsappConversationRecipientPhoneNumber,
              whatsappFavoriteImageMessageContent: this.salts2[image],
              whatsappFavoriteImageMessageCaption: null
            })
            .then((response) => {
              if (response.data.success){
                this.salts2[image].selected = false;
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
      }
      this.sortConversations();
    },


    sendSelectedWhatsappFavoriteImageMessage(selectedWhatsappFavoriteImage){
      var text = '';
      if (selectedWhatsappFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BAC)'){
        text = 'Te envío por acá nuestras cuentas bancarias del BAC en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata';
      } else if (selectedWhatsappFavoriteImage.whatsappFavoriteImageName == 'Cuentas bancarias (BCR)'){
        text = 'Te envío por acá nuestras cuentas bancarias del BCR en caso de que canceles por transferencia. Si gustas que el pedido te sea entregado el día de hoy, por favor recuerda seleccionar la opción para que la transferencia se refleje en nuestras cuentas de manera inmediata';
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
        this.showNotification('danger', 'Error al aceptar la transferencia', 'Ha ocurrido un error inesperado al aceptar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    toggleMap() {
      this.showMap = false;
      this.$nextTick(() => {
        this.showMap = true;
      });
    },

    changeCurrentActiveConversation(currentActiveConversation, activeConversationID){
      this.toggleMap();
        this.currentActiveConversationID = activeConversationID;


        this.currentActiveConversation = currentActiveConversation;
        this.productos = [];
        this.repliedMessage = null;
        this.sendEndMessage = false;
        this.producto = '';
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

        const codigosDescuento = JSON.parse(localStorage.getItem('codigosDescuento'));
        if (codigosDescuento[currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          this.displayCodigoDescuento = codigosDescuento[currentActiveConversation.whatsappConversationRecipientPhoneNumber];        
        } else {
          this.displayCodigoDescuento = null;
        }


        const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));
        if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceIsForToday'] == false || datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceIsForToday'] == true){
            this.currentActiveConversation.whatsappConversationIsForToday = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceIsForToday'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappConversationPin'] == false || datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappConversationPin'] == true){
            this.currentActiveConversation.whatsappConversationPin = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappConversationPin'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientName']){
            this.currentActiveConversation.whatsappConversationRecipientProfileName = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientName'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientID']){
            this.currentActiveConversation.whatsappConversationRecipientID = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientID'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientEmail']){
            this.currentActiveConversation.whatsappConversationRecipientEmail = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientEmail'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceLocalityName']){
            this.selectedLocality = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceLocalityName'];
          } else {
            this.selectedLocality = null;
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceShippingMethod']){
            this.whatsappInvoiceShippingMethod = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceShippingMethod'];
          } else {
            this.whatsappInvoiceShippingMethod = 'Método de envío';
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoicePaymentMethod']){
            this.whatsappInvoicePaymentMethod = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoicePaymentMethod'];
          } else {
            this.whatsappInvoicePaymentMethod = 'Método de pago';
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoicePaymentState']){
            this.whatsappInvoicePaymentState = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoicePaymentState'];
          } else {
            this.whatsappInvoicePaymentState = 'Estado del pago';
          }
          
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLatitude']){
            this.latitud = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLatitude'];
            this.currentActiveConversation.whatsappConversationRecipientLocations[datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName']].latitude = this.latitud;
          } else {
            this.latitud = 0;
          }

          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLongitude']){
            this.longitud = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationLongitude'];
            this.currentActiveConversation.whatsappConversationRecipientLocations[datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName']].longitude = this.longitud;

          } else {
            this.longitud = 0;
          }

          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName']){
            this.whatsappInvoiceClientLocationName = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationName'];
          } else {
            this.whatsappInvoiceClientLocationName = 'Ubicación de envío';
          }

          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationURL']){
            this.whatsappInvoiceClientLocationURL = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceClientLocationURL'];
          } else {
            this.whatsappInvoiceClientLocationURL = '';
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceShippingNote']){
            currentActiveConversation.whatsappConversationRecipientLocationDetails = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceShippingNote'];
          }
          if (datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceLocationNote']){
            currentActiveConversation.whatsappConversationRecipientNote = datosActuales[currentActiveConversation.whatsappConversationRecipientPhoneNumber]['whatsappInvoiceLocationNote'];
          }
          
        } else {
          this.selectedLocality = null;
          this.whatsappInvoiceShippingMethod = 'Método de envío';
          this.whatsappInvoicePaymentMethod = 'Método de pago';
          this.whatsappInvoicePaymentState = 'Estado del pago';
          this.whatsappInvoiceClientLocationName = 'Ubicación de envío';
          this.latitud = 0;
          this.longitud = 0;
          this.whatsappInvoiceClientLocationURL = '';
          this.whatsappInvoiceIsForToday = true;
          this.currentActiveConversation.whatsappConversationPin = false;
        }
        this.scrollDown();

        const intervalId = setInterval(() => {
          if (this.$refs.textoEnviar){
            if (document.activeElement !== this.$refs.textoEnviar) {
              this.$refs.textoEnviar.focus();
              clearInterval(intervalId);
            } else {
              clearInterval(intervalId);
            }
          } else {
            clearInterval(intervalId);
          }
        }, 1);
    },

    closeWhatsappDuplicateConversation(){
      if (this.currentActiveConversationID){
        axios.post(constants.routes.backendAPI+'/closeWhatsappDuplicateConversation',
        {
          whatsappConversationID: this.currentActiveConversationID
        })
        .then((response) =>{ 
          if (response.data.success){
            this.showNotification('success', 'Conversación cerrada', "Se ha cerrado la conversación asociada al número '" + this.currentActiveConversation.whatsappConversationRecipientPhoneNumber + "'.");
            
            const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
            if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
              delete ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
            }
            localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));

            const datosActualesLocalStorage = JSON.parse(localStorage.getItem('datosActuales'));
            if (datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
              delete datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
            }
            localStorage.setItem('datosActuales', JSON.stringify(datosActualesLocalStorage));

            delete this.activeConversationsAsJSON[this.currentActiveConversationID];
            this.currentActiveConversation = null;
            this.repliedMessage = null;
            this.sortConversations();
          } else {
            this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() =>{
          this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },

    closeWhatsappConversation(){
      if (this.selectedCloseLocality == 'Seleccione una localidad'){
        this.showNotification('danger', 'Error al cerrar la conversación', 'Por favor, complete la sucursal relacionada a la conversación por cerrar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      } else {
        const regularExpressionChecker = /\S/;
        if (regularExpressionChecker.test(this.closeConversationReason)){
          axios.post(constants.routes.backendAPI+'/closeWhatsappConversation',
          {
            whatsappConversationRecipientPhoneNumber: this.currentActiveConversation.whatsappConversationRecipientPhoneNumber,
            whatsappConversationCloseComment: this.closeConversationReason + ' ' + this.wrongProducts,
            whatsappConversationAmount: 0,
            whatsappTextMessageBody: localStorage.getItem('agentEndMessage'),
            whatsappConversationProducts: [],
            whatsappConversationLocalityName: this.selectedCloseLocality,
            sendAgentEndMessage: this.sendEndMessage
          })
          .then((response) =>{ 
            if (response.data.success){
              const whatsappConversationID = response.data.result;
              this.showNotification('success', 'Conversación cerrada', "Se ha cerrado la conversación asociada al número '" + this.currentActiveConversation.whatsappConversationRecipientPhoneNumber + "'.");
              
              const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
              if (ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
                delete ordenesActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
              }
              localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));

              const datosActualesLocalStorage = JSON.parse(localStorage.getItem('datosActuales'));
              if (datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber]){
                delete datosActualesLocalStorage[this.currentActiveConversation.whatsappConversationRecipientPhoneNumber];
              }
              localStorage.setItem('datosActuales', JSON.stringify(datosActualesLocalStorage));

              delete this.activeConversationsAsJSON[whatsappConversationID];
              this.currentActiveConversation = null;
              this.repliedMessage = null;
              this.sortConversations();

            } else {
              this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
            }
          })
          .catch(() =>{
            this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          })
        } else {
          this.showNotification('danger', 'Error al cerrar la conversación', 'Por favor, complete el motivo de cierre de la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      }
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
          const referenciaSucursales = JSON.parse(localStorage.getItem('referenciaSucursales'));

          if (storeMessage.storeMessageStoreName == 'Escazu'){
            this.escazuConversations = this.escazuConversations.filter(escazuConversation => escazuConversation.storeMessageID != storeMessage.storeMessageID);
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'E';
          } else if (storeMessage.storeMessageStoreName == 'Zapote'){
            this.zapoteConversations = this.zapoteConversations.filter(zapoteConversation => zapoteConversation.storeMessageID != storeMessage.storeMessageID);
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'Z';
          } else if (storeMessage.storeMessageStoreName == 'Cartago'){
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'C';
            this.cartagoConversations = this.cartagoConversations.filter(cartagoConversation => cartagoConversation.storeMessageID != storeMessage.storeMessageID);
          } else if (storeMessage.storeMessageStoreName == 'Heredia'){
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'H';
            this.herediaConversations = this.herediaConversations.filter(herediaConversation => herediaConversation.storeMessageID != storeMessage.storeMessageID);
          } else if (storeMessage.storeMessageStoreName == 'Metro Plaza'){
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'MP';
            this.metroPlazaConversations = this.metroPlazaConversations.filter(metroPlazaConversation => metroPlazaConversation.storeMessageID != storeMessage.storeMessageID);
          } else if (storeMessage.storeMessageStoreName == 'Planet Vape'){
            referenciaSucursales[storeMessage.storeMessageRecipientPhoneNumber] = 'P';
            this.planetVapeConversations = this.planetVapeConversations.filter(planetVapeConversation => planetVapeConversation.storeMessageID != storeMessage.storeMessageID);
          }
          localStorage.setItem('referenciaSucursales', JSON.stringify(referenciaSucursales));

          this.hints[storeMessage.storeMessageRecipientPhoneNumber] = storeMessage.storeMessageRecipientOrder;
          var hintsStorage = JSON.parse(localStorage.getItem('hints'));
          hintsStorage[storeMessage.storeMessageRecipientPhoneNumber] = storeMessage.storeMessageRecipientOrder;
          localStorage.setItem('hints', JSON.stringify(hintsStorage));

          this.loaders.grabConversation = false;
          const whatsappConversationID = response.data.result;
          this.playSound('grabConversation');
          this.showNotification('success', 'Conversación asignada', 'Ha tomado la conversación proveniente de la tienda exitosamente. Recuerde esperar a la respuesta del cliente.');
          this.selectAgentConversation(whatsappConversationID);
        } else {
          if (response.data.result == 'Duplicate'){
            this.showNotification('info', 'Conversación duplicada', 'No ha podido tomar esta conversación porque ya se encuentra asignada a otro agente.');
            this.loaders.grabConversation = false;
          } else {
            this.showNotification('danger', 'Error al tomar la conversación', 'Ha ocurrido un error inesperado al tomar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
            this.loaders.grabConversation = false;
          }
        }
      })
      .catch((error) =>{
        this.loaders.grabConversation = false;

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
          const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));

          if (ordenesActualesLocalStorage){
            for (var activeConversationID in respondedActiveConversations){
              var activeConversation = respondedActiveConversations[activeConversationID];
              var activeConversationRecipientPhoneNumber = activeConversation.whatsappConversationRecipientPhoneNumber;
              if (ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber]){
                activeConversation['whatsappConversationProducts'] = ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber];
              }
              if (datosActuales[activeConversationRecipientPhoneNumber]){
                if (datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'] == false || datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'] == true){
                  activeConversation['whatsappConversationPin'] = datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'];
                } else {
                  activeConversation['whatsappConversationPin'] = false;
                }
              } else {
                activeConversation['whatsappConversationPin'] = false;
              }
              respondedActiveConversations[activeConversationID]['textoEnviar'] = '';
              respondedActiveConversations[activeConversationID]['latitude'] = 0;
              respondedActiveConversations[activeConversationID]['longitude'] = 0;
              respondedActiveConversations[activeConversationID]['whatsappConversationIsForToday'] = true;

              console.log(respondedActiveConversations[activeConversationID])
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

    selectAgentComments(){
      this.loaders.activeConversations = true;
      axios.post(constants.routes.backendAPI+'/selectAgentComments',
      {
        whatsappConversationAssignedAgentID: parseInt(localStorage.getItem('agentID')),
        whatsappConversationIsActive: true
      })
      .then((response) =>{
        if (response.data.success){
          this.conversationComments = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar los comentarios', 'Ha ocurrido un error inesperado al consultar los comentarios. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) =>{
        this.showNotification('danger', 'Error al consultar los comentarios', 'Ha ocurrido un error inesperado al consultar los comentarios. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
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
          const datosActuales = JSON.parse(localStorage.getItem('datosActuales'));

          if (ordenesActualesLocalStorage){
            for (var activeConversationID in respondedActiveConversations){
              var activeConversation = respondedActiveConversations[activeConversationID];
              var activeConversationRecipientPhoneNumber = activeConversation.whatsappConversationRecipientPhoneNumber;
              if (ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber]){
                activeConversation['whatsappConversationProducts'] = ordenesActualesLocalStorage[activeConversationRecipientPhoneNumber];
              }
              if (datosActuales[activeConversationRecipientPhoneNumber]){
                if (datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'] == false || datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'] == true){
                  activeConversation['whatsappConversationPin'] = datosActuales[activeConversationRecipientPhoneNumber]['whatsappConversationPin'];
                } else {
                  activeConversation['whatsappConversationPin'] = false;
                }
              } else {
                activeConversation['whatsappConversationPin'] = false;
              }
              activeConversation['textoEnviar'] = '';
              activeConversation['latitude'] = 0;
              activeConversation['longitude'] = 0;
              activeConversation['whatsappConversationIsForToday'] = true;

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
        this.herediaConversations = [];
        this.metroPlazaConversations = [];

        this.planetVapeConversations = [];
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
            } else if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Heredia'){
              this.herediaConversations.push(newStoreMessageInformation);
            } else if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Metro Plaza'){
              this.metroPlazaConversations.push(newStoreMessageInformation);
            } else if (selectAllStoreMessageResult[storeMessageIndex].storeMessageStoreName == 'Planet Vape'){
              this.planetVapeConversations.push(newStoreMessageInformation);
            }
          }
        } else {
          this.showNotification('danger', 'Error al consultar los mensajes de las sucursales', 'Ha ocurrido un error inesperado al consultar los mensajes de las sucursales. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al consultar los mensajes de las sucursales', 'Ha ocurrido un error inesperado al consultar los mensajes de las sucursales. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectAllAgentStatus(){
      axios.get(constants.routes.backendAPI+'/selectAllAgentStatus').then((response) =>{
        if (response.data.success){
          const agentStatusInformation = response.data.result;
          this.agents = [];
          for (var agentIndex in agentStatusInformation){
            if ((agentStatusInformation[agentIndex].agentStatus == 'online') && (agentStatusInformation[agentIndex].agentID != localStorage.getItem('agentID'))){
              const newAgent = {'agentID': agentStatusInformation[agentIndex].agentID, 'agentName': agentStatusInformation[agentIndex].agentName, 'agentColor': agentStatusInformation[agentIndex].agentColor, 'agentFontColor': agentStatusInformation[agentIndex].agentFontColor};
              this.agents.push(newAgent);
            }
          }
        } else {
          this.showNotification('danger', 'Error al consultar el estado de los agentes', 'Ha ocurrido un error inesperado al consultar el estado de los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al consultar el estado de los agentes', 'Ha ocurrido un error inesperado al consultar el estado de los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
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
      } else if (websocketMessageContent.storeMessageStoreName == 'Heredia'){
        var newHerediaConversations = this.herediaConversations;
        this.herediaConversations = [];
        newHerediaConversations.push(newWhatsappStoreMessageInformation);
        this.herediaConversations = newHerediaConversations;
      } else if (websocketMessageContent.storeMessageStoreName == 'Metro Plaza'){
        var newMetroPlazaConversations = this.metroPlazaConversations;
        this.metroPlazaConversations = [];
        newMetroPlazaConversations.push(newWhatsappStoreMessageInformation);
        this.metroPlazaConversations = newMetroPlazaConversations;
      } else if (websocketMessageContent.storeMessageStoreName == 'Planet Vape'){
        var newPlanetVapeConversations = this.planetVapeConversations;
        this.planetVapeConversations = [];
        newPlanetVapeConversations.push(newWhatsappStoreMessageInformation);
        this.planetVapeConversations = newPlanetVapeConversations;
      }
      this.playSound('receiveWhatsappStoreMessage');
    },

    receiveWhatsappMessage(websocketMessageContent){
      const whatsappConversationID = websocketMessageContent.whatsappConversationID;
      if (whatsappConversationID in this.activeConversationsAsJSON){
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages.push(websocketMessageContent);
        if (this.currentActiveConversation != null){
          if (this.currentActiveConversation.whatsappConversationRecipientPhoneNumber == websocketMessageContent.whatsappGeneralMessageOwnerPhoneNumber) {
            this.availableConversation = true;
          } 
        }
        this.playSound('receiveWhatsappMessage');
        this.sortConversations();
      }
    },


    receiveWhatsappConversation(websocketMessageContent){
      const whatsappConversationAssignedAgentID = websocketMessageContent.whatsappConversationAssignedAgentID;
      if (whatsappConversationAssignedAgentID == localStorage.getItem('agentID')){
        const whatsappConversationID = websocketMessageContent.whatsappConversationID;
        this.$set(this.activeConversationsAsJSON, whatsappConversationID, websocketMessageContent);
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationProducts = [];
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationIsForToday = true;
        this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationRecipientLocations = JSON.parse(this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationRecipientLocations);

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
          this.agents.push({'agentID': websocketMessageContent.agentID, 'agentName': websocketMessageContent.agentName, 'agentColor:': websocketMessageContent.agentColor, 'agentFontColor': websocketMessageContent.agentFontColor});
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
      } else if (storeMessageStoreName == 'Heredia'){
        this.herediaConversations = this.herediaConversations.filter(herediaConversation => herediaConversation.storeMessageID != storeMessageID);
      } else if (storeMessageStoreName == 'Metro Plaza'){
        this.metroPlazaConversations = this.metroPlazaConversations.filter(metroPlazaConversation => metroPlazaConversation.storeMessageID != storeMessageID);
      } else if (storeMessageStoreName == 'Planet Vape'){
        this.planetVapeConversations = this.planetVapeConversations.filter(planetVapeConversation => planetVapeConversation.storeMessageID != storeMessageID);
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
        var soundToPlay = new Audio(require('../../../assets/pageAssets/pending.mp3'));
      } else if (soundType == 'receiveWhatsappMessage'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/inbox.mp3'));
      } else if (soundType == 'grabConversation'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/grab.mp3'));
      } else if (soundType == 'alert'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/comment.mp3'));

      }
      soundToPlay.play();
    },

  

    scrollUp(){
      this.$nextTick(() => {
        if (this.$refs.scrollRef) {
          const psContainer = this.$refs.scrollRef;
          psContainer.scrollTop = 0;
        }
      });
    },


    receiveWhatsappMessageStatusUpdate(websocketMessageContent){
      if (websocketMessageContent != undefined){
        const whatsappConversationID = websocketMessageContent.whatsappConversationID;
        const whatsappGeneralMessageID = websocketMessageContent.whatsappGeneralMessageID;
        const whatsappGeneralMessageStatus = websocketMessageContent.whatsappGeneralMessageStatus;
        const whatsappGeneralMessageStatusUpdateDateTime = websocketMessageContent.whatsappGeneralMessageStatusUpdateDateTime;
        if (whatsappConversationID in this.activeConversationsAsJSON){
          for (var whatsappConversationMessageIndex in this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages){
            if (this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[whatsappConversationMessageIndex]['whatsappGeneralMessageID'] == whatsappGeneralMessageID){
              if (whatsappGeneralMessageStatus == 'sent'){
                Vue.set(this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[whatsappConversationMessageIndex], 'whatsappGeneralMessageSendingDateTime', whatsappGeneralMessageStatusUpdateDateTime); 
              } else if (whatsappGeneralMessageStatus == 'delivered'){
                Vue.set(this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[whatsappConversationMessageIndex], 'whatsappGeneralMessageDeliveringDateTime', whatsappGeneralMessageStatusUpdateDateTime); 
              } else if (whatsappGeneralMessageStatus == 'read'){
                Vue.set(this.activeConversationsAsJSON[whatsappConversationID].whatsappConversationMessages[whatsappConversationMessageIndex], 'whatsappGeneralMessageReadingDateTime', whatsappGeneralMessageStatusUpdateDateTime); 
              }
            }
          }
        }
      }
    },

    openIndexedDatabase(){
      return new Promise(async (openIndexedDatabasePromiseResolve) => {
        const request = indexedDB.open('indexedDatabase', 2);
        request.onerror = (event) => {
          console.error('Error opening IndexedDB', event);
        };
        request.onsuccess = (event) => {
          this.db = event.target.result;
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('stickers')) {
            const store = db.createObjectStore('stickers', {autoIncrement: true});
          }
          if (!db.objectStoreNames.contains('stock')) {
            const store = db.createObjectStore('stock', {keyPath: 'whatsappConversationRecipientPhoneNumber'});
          }
          openIndexedDatabasePromiseResolve()
        };
      });
    },



    saveStickerDatabase(stickerData) {
      return new Promise(async (saveStickerDatabasePromiseResolve) => {
        const transaction = this.db.transaction(['stickers'], 'readwrite');
        const objectStore = transaction.objectStore('stickers');
        const request = objectStore.add(stickerData);
        request.onsuccess = (event) => {
          saveStickerDatabasePromiseResolve(event);
        };
        request.onerror = (event) => {
          console.error('Error saving data to IndexedDB', event);
        };
      });
    },

    readStickerDatabase() {
      return new Promise(async (readStickerDatabasePromiseResolve) => {
        const transaction = this.db.transaction(['stickers'], 'readonly');
        const objectStore = transaction.objectStore('stickers');
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
          const data = event.target.result;
          readStickerDatabasePromiseResolve(data);
        };
        request.onerror = (event) => {
          console.error('Error reading data from IndexedDB', event);
        };
      });
    }

    
  },

  computed: {

    calcularDescuento:function(){
			var resultado=0.0; 
				for(var j=0;j<this.currentActiveConversation.whatsappConversationProducts.length;j++)
				  { 
						resultado = resultado + ((this.currentActiveConversation.whatsappConversationProducts[j].descuento/100)*((this.currentActiveConversation.whatsappConversationProducts[j].precio) * this.currentActiveConversation.whatsappConversationProducts[j].cantidad));
          }
      if (resultado.toFixed(2) == 0.00){
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
      const total = this.escazuConversations.length + this.zapoteConversations.length + this.cartagoConversations.length + this.herediaConversations.length + this.metroPlazaConversations.length + this.planetVapeConversations.length + this.pendingConversations.length;
      return this.textoSucursales + '(' + total + ')'
    }


  },

  async created(){

    window.addEventListener('keydown', (keyPressed) => {
      if (keyPressed.key == 'Escape') {
        this.currentActiveConversation = null;
        this.currentActiveConversationID = null;
      }
      else if (keyPressed.key == 'ArrowDown') {
        if (this.currentActiveConversation != null){
          this.scrollDown();
        }
      }
      else if (keyPressed.key == 'ArrowUp') {
        if (this.currentActiveConversation != null){
          this.scrollUp();
        }
      }
    });

    await this.openIndexedDatabase();
  },

  mounted(){    
    this.cartagoMap = constants.routes.cartagoMap;
    this.cartagoMapOptions = constants.routes.cartagoMapOptions;
    this.herediaMap = constants.routes.herediaMap;
    this.herediaMapOptions = constants.routes.herediaMapOptions;
    this.zapoteMap = constants.routes.zapoteMap;
    this.zapoteMapOptions = constants.routes.zapoteMapOptions;
    this.escazuMap = constants.routes.escazuMap;
    this.escazuMapOptions = constants.routes.escazuMapOptions;
    this.redMap = constants.routes.redMap;
    this.redMapOptions = constants.routes.redMapOptions;

    this.iceLogoSRC = constants.routes.iceLogoSRC;
    this.postreLogoSRC = constants.routes.postreLogoSRC;
    this.tabacoLogoSRC = constants.routes.tabacoLogoSRC;
    this.waxLogoSRC = constants.routes.waxLogoSRC;

    this.agentType = localStorage.getItem('agentType');
    this.agentName = localStorage.getItem('agentName');
    this.agentStartMessage = localStorage.getItem('agentStartMessage');

   
    
    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }

    if (localStorage.getItem('ordenesActuales') == null){
      localStorage.setItem('ordenesActuales', JSON.stringify({}))
    }
    if (localStorage.getItem('datosActuales') == null){
      localStorage.setItem('datosActuales', JSON.stringify({}))
    }
    if (localStorage.getItem('referenciaSucursales') == null){
      localStorage.setItem('referenciaSucursales', JSON.stringify({}))
    }
    if (localStorage.getItem('codigosDescuento') == null){
      localStorage.setItem('codigosDescuento', JSON.stringify({}))
    }

    if (localStorage.getItem('hints') == null){
      localStorage.setItem('hints', JSON.stringify({}))
    } else {
      var hintsStorage = JSON.parse(localStorage.getItem('hints'));
      this.hints = hintsStorage;
    }

    this.selectAllAgentStatus();
    this.selectAllStoreMessage();
    this.selectAgentConversations();
    this.selectAgentComments();
    this.selectAllPendingConversation();
    this.selectLocalities();
    this.openImageModal();

    this.manageWebsocketConnection();
  }, 

  beforeDestroy(){
    clearInterval(this.websocketPingInterval);
    this.websocketAbort = true;
    if (this.websocketConnection) {
      this.websocketConnection.close();
    }
  }

};
</script>

<style>

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
    100% {
      transform: scale(1);
    }
  }

  .newMessageAnimation {
    animation: pulse 1.3s infinite;
  }

  .hoverTest {
    transition: background-color 0.5s ease-in-out;
  }

  .hoverTest:hover {
    background-color: #ebebeb;
  }

  .lang-dropdown .dropdown-menu { 
    width: 300px !important;
    min-width: 600px !important;
  }

  .scrollable-container {
    max-height: 80vh;
    overflow-y: auto;
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

  @keyframes commentAnimation {
    0% {
      background-color: white;
    }
    50% {
      background-color: rgb(255, 85, 85);
    }
    100% {
      background-color: white;
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
