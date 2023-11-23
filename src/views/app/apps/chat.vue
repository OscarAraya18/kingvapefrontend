<template>
  <div class="no-gutters">

    <button class="btn btn-primary mr-2" style="display: none;" type="button" v-b-modal.transferConversationModal ref="buttonTransfer">Finalizar</button>
    <b-modal scrollable size="m" centered id="transferConversationModal" title="Solicitud de transferencia" @ok="transferConversationRequestAccepted()">
      <div style="text-align: center;">
        <p class="m-0" style="font-size: medium;">{{transferRequestName}} ha solicitado transferir una conversación</p>
      </div>
    </b-modal>

    <div class="row no-gutters">
      <div class="col-md-9" style="padding-right: 25px;">
        <div class="card chat-sidebar-container sidebar-container" style="z-index: 1000;">
          <!-- Columna de contactos y conversaciones activas o entrantes -->
          <div class="chat-sidebar-wrap sidebar" :class="{ 'ml-0': isMobile }" style="overflow-y: scroll; height: 100%;">
            <div class="border-right" style="height: 100%;">
              
              

              <vue-perfect-scrollbar
                :settings="{ suppressScrollX: true}"
                class="contacts-scrollable perfect-scrollbar rtl-ps-none ps scroll"
                
              >   
                <div>
                  
                  <div v-if="loaderConversations == true" style="text-align: center;">
                    <br><br><br>
                    <span class="spinner-glow spinner-glow-primary"></span>
                  </div>

                  <div
                    v-else
                    style="cursor: pointer;"
                    class="p-3 d-flex border-bottom align-items-center"
                    v-for="activeConversation in activeConversations"
                    :key="activeConversation"
                    @click="changeCurrentActiveConversation(activeConversation.activeConversationID)"
                  >
                    <h6 style="padding-top: 10px;">{{ activeConversation.recipientProfileName }} {{activeConversation.recipientPhoneNumber}}</h6>
                    <div class="flex-grow-1"></div>
                    
                    <div style="top: -12px; position: relative;">
                      <b-form-checkbox v-model="activeConversation.selected">
                      </b-form-checkbox>
                    </div>

                    <div v-if="activeConversation.messages[(Object.keys(activeConversation.messages).length).toString()].owner == 'client'" style="height: 15px; width: 15px; background-color: red; border-radius: 100px;">
                    </div>

                    <div v-else style="height: 15px; width: 15px; background-color: green; border-radius: 100px;">
                    </div>
                  </div>
                  
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
            <div>
              <b-list-group v-if="loaderGrabPendingConversation == false">
                <b-list-group-item v-if="escazuConversations.length == 0">
                  No hay conversaciones pendientes
                </b-list-group-item>
                <b-list-group-item 
                style="cursor: pointer"
                v-for="escazuConversation in escazuConversations"
                button
                @click="grabStoreConversation(escazuConversation)">
                <strong>Nombre:</strong> {{escazuConversation.recipientProfileName}}
                <br>
                <strong>Número:</strong> {{escazuConversation.recipientPhoneNumber}}
                <br>
                <strong>Pedido:</strong> {{ escazuConversation.clientOrder }}
                <br>
                <strong>Cédula:</strong> {{ escazuConversation.clientID }}
                <br>
                <strong>Fecha:</strong> {{escazuConversation.startDate}} a las {{escazuConversation.startHour}}
              </b-list-group-item>
              </b-list-group>
              <div v-else style="text-align: center;">
                <br>
                <span class="spinner-glow spinner-glow-primary"></span>
              </div>
            </div>
          </b-modal>

          <b-modal scrollable size="m" centered hide-footer id="zapoteConversationsModal" title="Conversaciones pendientes de Zapote">
            <div>
              <b-list-group v-if="loaderGrabPendingConversation == false">
                <b-list-group-item v-if="zapoteConversations.length == 0">
                  No hay conversaciones pendientes
                </b-list-group-item>

                <b-list-group-item 
                style="cursor: pointer"
                v-for="zapoteConversation in zapoteConversations"
                button
                @click="grabStoreConversation(zapoteConversation)">
                <strong>Nombre:</strong> {{zapoteConversation.recipientProfileName}}
                <br>
                <strong>Número:</strong> {{zapoteConversation.recipientPhoneNumber}}
                <br>
                <strong>Pedido:</strong> {{ zapoteConversation.clientOrder }}
                <br>
                <strong>Cédula:</strong> {{ zapoteConversation.clientID }}
                <br>
                <strong>Fecha:</strong> {{zapoteConversation.startDate}} a las {{zapoteConversation.startHour}}  
              </b-list-group-item>
              </b-list-group>
              <div v-else style="text-align: center;">
                <br>
                <span class="spinner-glow spinner-glow-primary"></span>
              </div>
            </div>
          </b-modal>

          <b-modal scrollable size="m" centered hide-footer id="cartagoConversationsModal" title="Conversaciones pendientes de Cartago">
            <div>
              <b-list-group v-if="loaderGrabPendingConversation == false">
                <b-list-group-item v-if="cartagoConversations.length == 0">
                  No hay conversaciones pendientes
                </b-list-group-item>
                <b-list-group-item 
                style="cursor: pointer"
                v-for="cartagoConversation in cartagoConversations"
                button
                @click="grabStoreConversation(cartagoConversation)">
                <strong>Nombre:</strong> {{cartagoConversation.recipientProfileName}}
                <br>
                <strong>Número:</strong> {{cartagoConversation.recipientPhoneNumber}}
                <br>
                <strong>Pedido:</strong> {{ cartagoConversation.clientOrder }}
                <br>
                <strong>Cédula:</strong> {{ cartagoConversation.clientID }}
                <br>
                <strong>Fecha:</strong> {{cartagoConversation.startDate}} a las {{cartagoConversation.startHour}}  
              
              </b-list-group-item>
              </b-list-group>
              <div v-else style="text-align: center;">
                <br>
                <span class="spinner-glow spinner-glow-primary"></span>
              </div>
            </div>
          </b-modal>

          <b-modal scrollable size="m" centered hide-footer id="pendingConversationsModal" title="Conversaciones pendientes">
            <div>
              <b-list-group v-if="loader2 == false">
                <b-list-group-item v-if="pendingConversations.length == 0">
                  No hay conversaciones pendientes
                </b-list-group-item>
                <b-list-group-item 
                style="cursor: pointer"
                v-for="pendingConversation in pendingConversations"
                button
                @click="grabPendingConversation(pendingConversation)">
                {{pendingConversation.recipientPhoneNumber}} ({{pendingConversation.startDate}} a las {{pendingConversation.startHour}})</b-list-group-item>
              </b-list-group>
              <div v-else style="text-align: center;">
                <br>
                <span class="spinner-glow spinner-glow-primary"></span>
              </div>
            </div>
          </b-modal>


          <!-- Barra Superior -->
          <div class="chat-content-wrap sidebar-content" v-if="temp != ''">
            <div
              class="d-flex pl-3 pr-3 pt-3 pb-3 o-hidden box-shadow-1 chat-topbar"
            >
              <a class="link-icon d-md-none" @click="isMobile = !isMobile">
                <i class="icon-regular i-Right ml-0 mr-3"></i>
              </a>

              <div class="d-flex align-items-center" style="width: 100%;">
                
                <input type="checkbox" v-if="verifiedUser" :checked="true" style="accent-color: #FFD733; margin-right: 10px;" onclick="return false;">
                

                <p class="m-0 text-title text-16">
                  {{ currentActiveConversation.recipientProfileName }} {{currentActiveConversation.recipientPhoneNumber}}
                </p>

                <div class="flex-grow-1"></div>


                <button @click="vistaItems = 'Productos'" class="btn btn-icon btn-primary mr-2">
                  <i class="i-Shopping-Cart"></i>
                  Buscar productos
                </button>
                <button @click="vistaItems = 'Orden'" class="btn btn-icon btn-primary">
                  <i class="i-Check"></i>
                  Resumen de la orden
                </button>

              </div>

            </div>



            <vue-perfect-scrollbar ref="scrollRef"
              :settings="{ suppressScrollX: true, wheelPropagation: false }"
              class="chat-content perfect-scrollbar rtl-ps-none ps scroll"
              style="padding-bottom: 30px;"
            >
              <div v-for="cuurentActiveConversationMessage in currentActiveConversation.messages" :key="cuurentActiveConversationMessage">
                <div class="d-flex mb-30" :class="GetOwner(cuurentActiveConversationMessage.owner)" >
                  <div :style="getColorChat(cuurentActiveConversationMessage.owner)" class="message flex-grow-1">
                    <div class="d-flex">
                      
                      <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="cuurentActiveConversationMessage.owner != 'agent'">
                        
                        <p class="m-0" style="white-space: pre-line; font-size: large;" v-if="cuurentActiveConversationMessage.messageType == 'text'">{{cuurentActiveConversationMessage.messageContent}}</p>
                        
                        <img
                          v-if="cuurentActiveConversationMessage.messageType=='image'"
                          style="width: 250px;"
                          :src="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`"
                        >
                        
                        <div v-if="cuurentActiveConversationMessage.messageType=='location'" class="m-0">
                          <GmapMap
                          :center="getLocation(cuurentActiveConversationMessage.messageContent)"
                          :zoom="zoom"
                          style="width: 1000px; height: 450px"
                          >
                            <GmapMarker
                              :position="getLocation(cuurentActiveConversationMessage.messageContent)"
                              :draggable="false"
                            />
                          </GmapMap>
                          <br>
                          <p class="m-0" style="font-size: large;"><strong>Latitude:</strong> {{cuurentActiveConversationMessage.messageContent.locationLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitude:</strong> {{cuurentActiveConversationMessage.messageContent.locationLongitude}}</p>
                          <br>

                          <b-dropdown variant="primary" text="Save location" style="margin-right: 10px;">
                            <b-dropdown-item @click="saveLocation('Casa' ,cuurentActiveConversationMessage.messageContent)" style="z-index: 1000;">Casa</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('Trabajo', cuurentActiveConversationMessage.messageContent)" style="z-index: 1000;">Trabajo</b-dropdown-item>
                            <b-dropdown-item @click="saveLocation('Otro',cuurentActiveConversationMessage.messageContent)" style="z-index: 1000;">Otro</b-dropdown-item>
                          </b-dropdown>

                        </div>

                        <div v-if="cuurentActiveConversationMessage.messageType=='document'" class="m-0">
                          <a :href="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`" :download="cuurentActiveConversationMessage.messageContent.mediaName">
                            <p style="size: 10%;">Archivo: <strong>{{cuurentActiveConversationMessage.messageContent.mediaName}}</strong></p>
                          </a>
                        </div>

                        <audio controls v-if="cuurentActiveConversationMessage.messageType=='audio'" :src="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`">
                        </audio>

                        

                      </div>
                      <span v-if="cuurentActiveConversationMessage.owner == 'agent'" style="margin-left: 0; margin-right:auto;" class="text-small text-muted">{{cuurentActiveConversationMessage.messageSentHour}}</span>
                      <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{cuurentActiveConversationMessage.messageReceivedHour}}</span>
                      
                      <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="cuurentActiveConversationMessage.owner == 'agent'">
                        
                        <div v-if="cuurentActiveConversationMessage.messageType == 'text'">
                          <p class="m-0" style="white-space: pre-line; font-size: large;" v-if="cuurentActiveConversationMessage.sendedProduct != '1'">{{cuurentActiveConversationMessage.messageContent}}</p>
                          
                          <p class="m-0" style="white-space: pre-line; font-size: large;" v-if="cuurentActiveConversationMessage.sendedProduct == '1'"><strong>Nombre: </strong>{{cuurentActiveConversationMessage.messageContent.productName}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: large;" v-if="cuurentActiveConversationMessage.sendedProduct == '1'"><strong>Precio: </strong>{{cuurentActiveConversationMessage.messageContent.productPrice}}</p>
                          <p class="m-0" style="white-space: pre-line; font-size: large;" v-if="cuurentActiveConversationMessage.sendedProduct == '1'"><strong>Descripción: </strong>{{cuurentActiveConversationMessage.messageContent.productDescription}}</p>
                        </div>

                        <div v-if="cuurentActiveConversationMessage.messageType=='image' || cuurentActiveConversationMessage.messageType=='sticker'">

                          <img
                            v-if="cuurentActiveConversationMessage.messageContent.isBase64=='1'"
                            style="width: 250px;"
                            :src="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`"
                          >

                          <img
                            v-else
                            style="width: 250px;"
                            :src="cuurentActiveConversationMessage.messageContent.mediaContent"
                          >

                        </div>
                        
                        <div v-if="cuurentActiveConversationMessage.messageType=='location'" class="m-0">
                          <GmapMap
                          :center="getLocation(cuurentActiveConversationMessage.messageContent)"
                          :zoom="zoom"
                          style="width: 1000px; height: 450px"
                          >
                            <GmapMarker
                              :position="getLocation(cuurentActiveConversationMessage.messageContent)"
                              :draggable="false"
                            />
                          </GmapMap>
                          <br>
                          <p class="m-0" style="font-size: large;"><strong>Latitude:</strong> {{cuurentActiveConversationMessage.messageContent.locationLatitude}}</p>
                          <p class="m-0" style="font-size: large;"><strong>Longitude:</strong> {{cuurentActiveConversationMessage.messageContent.locationLongitude}}</p>
                          <br>
                        </div>

                        

                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </vue-perfect-scrollbar>
            
            

            <div v-if="availabeConversation == true" class="pl-3 pr-3 pt-4 pb-3 box-shadow-1 chat-input-area" style="position: absolute; bottom: 0; width: 100%; z-index: 1000; background-color:white">
              <div v-if="fileSharingLoader == true" style="text-align: center;">
                <br><br>
                <span class="spinner-glow spinner-glow-primary"></span>
              </div>
              
                <div v-else>
                  <div class="form-group">
                    <b-form-textarea
                      class="form-control"
                      placeholder="Escribe un mensaje"
                      @keyup.enter="sendNewTextMessage()"
                      v-model="newTextMessageContent"
                      style="margin-bottom: 20px;"
                      no-resize
                      rows="3"
                    />
                  </div>
                                  
                  <div class="d-flex">

                    
                    <button class="btn btn-primary mr-2" type="button" v-b-modal.endConversationModal>Finalizar</button>

                    <b-modal scrollable size="m" centered id="endConversationModal" title="Finalizar conversación" @ok="endConversation()">
                      <div>
                        <b-dropdown variant="primary" text="Motivos frecuentes" style="width: 100%">
                          <b-dropdown-item @click="addCloseConversationReason('Consulta sobre producto sin venta')">Consulta sobre producto sin venta</b-dropdown-item>
                          <b-dropdown-item @click="addCloseConversationReason('Consulta sobre horarios')">Consulta sobre horarios</b-dropdown-item>
                          <b-dropdown-item @click="addCloseConversationReason('Consulta sobre sucursales')">Consulta sobre sucursales</b-dropdown-item>
                          <b-dropdown-item @click="addCloseConversationReason('Número equivocado')">Número equivocado</b-dropdown-item>
                          <b-dropdown-item @click="addCloseConversationReason('Cliente no deseado')">Cliente no deseado</b-dropdown-item>

                        </b-dropdown>
                        <br><br>
                        <b-form-textarea
                          no-resize
                          rows="5"
                          class="form-control"
                          placeholder="Motivo de la finalización de la conversación"
                          v-model="closeConversationReason"
                        />

                        
                      </div>
                    </b-modal>


                    <b-dropdown dropup variant="primary" text="Transferir" style="margin-right: 10px;">
                      <template v-for="agent in agents">
                        <b-dropdown-item style="z-index: 1000;" @click="transferConversation(agent)">{{agent.agentName}}</b-dropdown-item>
                      </template>
                      <b-dropdown-item style="z-index: 1000;" v-if="agents.length == 0">No agents available</b-dropdown-item>
                    </b-dropdown>

                    <div class="flex-grow-1"></div>
                    
                    <b-dropdown dropup variant="primary" text="Tiendas" style="margin-right: 10px;">
                      <b-dropdown-item style="z-index: 1000;" @click="sendStoreLocationToClient('Zapote')">Zapote</b-dropdown-item>
                      <b-dropdown-item style="z-index: 1000;" @click="sendStoreLocationToClient('Escazu')">Escazu</b-dropdown-item>
                      <b-dropdown-item style="z-index: 1000;" @click="sendStoreLocationToClient('Cartago')">Cartago</b-dropdown-item>
                    </b-dropdown>
                  

                    <b-dropdown dropup variant="primary" text="Ubicaciones" style="margin-right: 10px;">
                      <b-dropdown-item style="z-index: 1000;" @click="sendLocationToClient('Casa')">Casa</b-dropdown-item>
                      <b-dropdown-item style="z-index: 1000;" @click="sendLocationToClient('Trabajo')">Trabajo</b-dropdown-item>
                      <b-dropdown-item style="z-index: 1000;" @click="sendLocationToClient('Otro')">Otro</b-dropdown-item>
                    </b-dropdown>

                    

                    <button
                      class="btn btn-icon btn-rounded btn-primary mr-2"
                      type="button"
                      @click="uploadImage()"
                    >
                      <i class="i-Folder-With-Document"></i>
                    </button>
                    <input type="file" accept="image/png, image/jpeg" @change="uploadFile('image/png')" ref="imageFile" style="display: none;" id="imageUploader">


                    <button class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.imageModal>
                      <i class="i-File-Video"></i>
                    </button>
                    <b-modal @ok="sendFavoriteImages()" scrollable title="Imágenes favoritas" size="m" centered id="imageModal">
                      <div>
                        <b-list-group>
                          <b-list-group-item :variant="getAllFavoriteVariant()" style="cursor: pointer;" @click="selectAllFavoriteImage()"
                          >Seleccionar todas las imágenes favoritas</b-list-group-item>
                          
                          <b-list-group-item :style="getImageStyle(agentFavoriteImage)"
                            v-for="(agentFavoriteImage, index) in agentFavoriteImages"
                            :variant="getImageVariant(agentFavoriteImage)"
                            button
                            @click="selectFavoriteImage(index)"
                            >
                            <div style="display:flex; ">
                              <img :src="agentFavoriteImage.content" style="width: 80px; height: auto;"/>
                              <div style="margin: 0; left: 35%; position: absolute; top: 50%; transform: translate(-50%, -50%);">
                                <h6>{{agentFavoriteImage.title}}</h6>
                              </div>
                              

                            </div>

                          </b-list-group-item>
                        </b-list-group>
                      </div>
                    </b-modal>

                    <button class="btn btn-icon btn-rounded btn-primary mr-2" v-b-modal.favoriteModal @click="openAgentFavoriteMessagesModal()">
                      <i class="i-Love"></i>
                    </button>
                    <b-modal scrollable title="Mensajes favoritos" size="m" centered hide-footer id="favoriteModal">
                      <div>
                        <b-list-group>
                          <b-list-group-item style="cursor: pointer;"
                            v-for="agentFavoriteMessage in agentFavoriteMessages"
                            button
                            @click="sendFavoriteMessage(agentFavoriteMessage.content)"
                            >
                            <h6><strong>{{agentFavoriteMessage.title}}</strong></h6>
                            {{agentFavoriteMessage.content}}
                          </b-list-group-item>
                        </b-list-group>
                      </div>
                    </b-modal>


                    <button
                      class="btn btn-icon btn-rounded btn-primary mr-2"
                      type="button"
                      @click="startRecording()"
                      v-b-modal.recordAudioModal
                      style='display: none;'
                    >
                      <i class="i-Microphone-3"></i>
                    </button>

                    <b-modal id="recordAudioModal" hide-footer hide-header size="sm" centered>
                      <div v-if="!isRecording">
                        <audio controls :src="recordedAudioFile" style="width:270px;"></audio>
                        <br>
                      </div>

                      <div v-if="isRecording" style="text-align: center;">
                        <h2>{{recordedTime}}</h2>
                      </div>

                      <div style="text-align: center;">
                        <button
                          v-if="isRecording"
                          class="btn btn-icon btn-primary"
                          type="button"
                          @click="pauseAudioRecording()"
                        >
                        <i class="i-Pause"></i>
                        </button>
                        
                        <button
                          class="btn btn-icon btn-primary"
                          type="button"
                          @click="sendRecordedAudio()"
                          v-if="!isRecording"
                        >
                        <i class="i-Paper-Plane"></i>
                        </button>

                      </div>

                    </b-modal>

                    <button class="btn btn-icon btn-rounded btn-primary mr-2" @click="sendNewTextMessage()">
                      <i class="i-Paper-Plane"></i>
                    </button>
                  
                  </div>
                </div>

            </div>
          </div>


        </div>
      </div>

      <div class="col-md-3 scrollable-container" v-if="temp != ''">
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
                      
                      <button class="btn btn-icon btn-success mr-2" @click="sendProductToClient(producto)">
                        Enviar
                      </button>
                      <button v-if="producto.productosAsociados.length == 0" class="btn btn-icon btn-warning mr-2" @click="cargarExistencia(producto.codigoProducto)">
                        Stock
                      </button>

                      <button v-else="producto.productosAsociados.length == 0" class="btn btn-icon btn-warning mr-2" @click="cargarExistenciaNicotina(producto.productosAsociados)">
                        Stock
                      </button>
                    </div> 
                   

                  </div>
                </div>
              </div>
            </div> 
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
                                v-model="name"
                                type="text"
                                required
                                placeholder="Nombre del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="phone"
                                placeholder="Número de teléfono del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="cedula"
                                placeholder="Cédula del cliente"
                                style="margin-bottom: 10px;"
                              ></b-form-input>

                              <b-form-input
                                type="text"
                                v-model="email"
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
                                v-model="address"
                                style="margin-bottom: 10px;"
                                placeholder="Nota de la dirección"
                              ></b-form-textarea>

                              <b-form-textarea
                                rows="3"
                                type="text"
                                style="margin-bottom: 10px;"
                                placeholder="Nota del envío"
                                v-model="nota"
                              ></b-form-textarea>
                            </b-form-group>

                            <div style="text-align: center;">
                              <br>
                              <b-button :class="{'loading-effect': loading}" @click="OrdenExpress()" variant="primary"
                                >Enviar orden a la central</b-button
                              >
                              <br><br>
                              <b-button @click="sendOrderToClient()" variant="warning"
                                >Compartir orden con el cliente</b-button
                              >
                              <br><br>
                              <b-button type="reset" variant="danger">Limpiar orden</b-button>
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
                                  :rows="orden"
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
        this.latitud = this.locations[newLocation].latitude;
        this.longitud = this.locations[newLocation].longitude;
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
      availableConversation: true,
      iceLogoSRC: `data:image/png;base64,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`,
      postreLogoSRC: `data:image/png;base64,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`,
      tabacoLogoSRC: `data:image/png;base64,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`,
      waxLogoSRC: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAwCAYAAABqkJjhAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMLSURBVGhD7Zg/kAtxFMe/d7nj5s5xc8gkjAIFlU6loqIwVCoVnYYGDZVKp6JBRXMVGjRGo9LpzBgKkiGXy925/JNkE9+fezuTWZG835/E3Ew+M5l9e7ez89m37/f27U50CLYQk7LdMoyFh81YeNiE7xLLz4FKDth+Hsjukz+GI6xw8TF/92VnG7DwFshwG5CwJVF+KIGhAVTfSxyOcMLRB6BOyW4a74BfEgcinPDyKwm6WWKJbEgchkDClCpTrhfVlxKEIYxwiVItiZNET5hliQMQQJh1u3ZP4l7k+f9e5eKGv3CRGWwkFluSFltdYcAxSvyEI2ZvNe67/TDH8cIi2fXAT/gHZbUSHR6bp7gn7sI19tiflrVZuQusS+yIozDbWP66xDbwIs2s4VEabsLfbgFNx0XUugN85VPREXthM+CUmSkf6pR27Bp2wtFHYEXTFQbxZbO71GTXAjvhHBdNqGG0wzZXYAIs0QubrlB1r72e1B6xvCRWohcu8uTBecMSs8uyUpg1Vwuc3Zg675xFm9MJr1O2LXFoOs+4ACVWoBOuM8NDg4/rhn7I1wk3k8IngMUXwK4Lsu9JW9+T9Yuum9QpIM1X+Oxp+cPo0AlPyDYmykmwH5iScETohKePSBDDVvRn6toNzLA8fJnmeZTohOeOShBjRkuZbbNX/r4DVvCCZyVUoBQ+zixIHFPhLGCeUilm/8ADnsnxC49ZD/MSK1AuOp5xLtkROLx/56u9GWBmeUGHX7Nr3GBN8wImD24eMhBe5PwZiXVYfFtbAT6d5TybaEGTF4HMNWCn7MfkKL/BR28/UreBQ+e4lX0FygwbuDD23pS4izanrvxJPr35JrHGB0D8fSIa9DGCtZu2kzVYZFgosHZLHOK9YMksPqWwfd1bZFhIsyvs4c+ZY7xZvGAHWYN9hmPMbJy7yltv8bEvxQvNXLLqCknchWNW2ZNLnJWb/xo/aTfFWl24zDvjYSr4C8dE7B51ZrvyWV6j2DZ2cN6YoaTlwupHOOERYb/o/jNj4WEzFh4uwG9BieBgJKlt7QAAAABJRU5ErkJggg==`,
      hierbaLogoSRC: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAqCAYAAAAj6gIfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ9SURBVGhD7ZhfSFt3FMe/iSZqNNHMjKHbJHMP+lAflkkHzhep0OEg3YNlD4KwkYeBD5XSQqllYw/tU9lfBnnoKghSxgajwgIjDxksDaykHSx7MC/WpW10602MXk3ivdHsl/Q4Y3L/1dxrEfZ5yTnnJd977jnnd37XVGTgmGKm32OJoeJXnszjxt9xZMnXG+PEZ37A19mvcDfvw7dPBArqi0HieYQ2vwRXtgXEcvNYLJQdXTFEvJiaxe2dimwXbyKY0T/7BojnEWaZPljnLPvZBSTI0wv9xW9GcGeH7EqK8/hljWyd0F38RvaOTIaTuJ+Pk60POovncU/4mexaskIEi2Trgb7i8zH8KVUy/xFCLEOmDugrfiuKGJnSxBHfTpFdP/LiCzwSqRiWeAEihdRYEqNkyZMoPCBLHXFzGTEuDk7mjJBdzDb++RgXcnv160aPZQJjbe/A47BSrBp2MD0axS3FsmGYLuJSzzh6ya2mJPg3/iZus95Zp5ir+Udce6mbvH1kM++wvAYb2cAyEuJV+NdOYerhLMIZnuKVpMDtkqlEMSmZSZGP4tYjH6ZT72OuQniJLrOLrIPIl419CB4y92EltOvH3Ppo+SHuHngGHilNy/UDcBUnmMjH8P3jSUylpxDaiUmU6GmcsEm/bXnxjX14w1r7qvYoPcSN9Cg+SUbBlU7+LQ7PNEhYTy2uXsJ02odgQWH+N4zgzVayq1CcNgO2CUi/sD14rIhTuLx6FYFsEjmKKhNBIh+BPzmGz7ZDKsPAioHmt+EgrxqVm1SpCcdYExqz0qrCmvsKa+4ecqtRzDwrfIy0fljRuEcJy3qLV1Z4CRXxDOc4zjTIjUcDMZ3Du07l/1UXX8p+2zmV2tebbnhavehtJFcGDeIZHeOYtLrJOQIaL2KyU/1taxPP6HdewUkTOYbCEvXCkKY+0ywezQPwdcwoNlD9uOFhJTrcQq4K2sQXBKykIwhsxTUvaYejCZntBQRTy+DyFFJAcc6Xju4gW5J+EiMGi5bCjvaGD3DWcRYnZZZBefFrs5je8Bv2wUg7VvTbAjj/op38fbTX/HOjiX5rUV4PtpYR3ji4Wx8dneiyfIQzdi88tUkvo7LbEKxhuc04fs+HcI/dllZ3jfj+6Ea7uQ+vNw7iRNMg3nJ0w6JySGkTr4iA8ONTmGMP+EyYZ/Dpq150kXsY6q/59QUEJIRb2B7+VFg3XCyjNezOIpgm+5DULX4pt0AfVPcYxHBrAF+8MkHi3Rhun8N1xwz6TZUjL4lwLlrXCK4/88Xt8o/FdBojtu9w/eVvMOnqhKUc3cfh9OJ8z6+41jYDj7nzabDIa7zASKNDzQPZrABbzT0zBv9fPtzHEN5zfo6xquuQmGMXYItdtSmV0GXO1wpXx9JSn/ASumReGgGJ1B9YLdrR29EHV51CpTBQvPEcg/VAnv/FPx+AfwHCw33sgBcIGAAAAABJRU5ErkJggg==`,

      loaderGrabPendingConversation: false,
      loader2: false,
      fileSharingLoader: false,
      loaderConversations: false,
      enviandoProductoLoader: false,
      textoSucursales: 'Sucursales ',

      closeConversationReason: '', 
      transferRequestName: '',
      transferFromAgentID: '',
      transferConversationID: '',
      transferConversationProducts: '',
      

      status: 'accepted',
      verifiedUser: true,
			zoom: 15,

      agentName: '',
      pendingConversations: [],


      zapoteConversations: [],
      escazuConversations: [],
      cartagoConversations: [],
      herediaConversations: [],

      // Variables del chat -------
      activeConversation: '',
      activeConversations: [],
      activeConversationsAsJSON: {},
      currentActiveConversation: {},
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
      ubicaciones: ["Ubicación de envío", "Casa", "Trabajo", "Otro"],

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

      recordAudioDialog: false,
      isRecording: false,
      mediaRecorder: null,
      recordedAudioFile: null,
      startTime: '',
      chunks: [],

    };
  },

  methods: {
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

    sendRecordedAudio(){
      const httpBodyToSendRecordedAudio = 
      {
        'audioFile': this.recordedAudioFile,
        'agentID': localStorage.getItem('agentID'),
        'recipientPhoneNumber': this.currentActiveConversation.recipientPhoneNumber
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappAudio', httpBodyToSendRecordedAudio)
        .then(() =>{
          this.$set(this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]= {
            owner:'agent',
            audioFile: this.recordedAudioFile,
            messageType: 'audio',
            messageSentHour: Date().toString().slice(16,24)
          });
          var messages = this.currentActiveConversation.messages;
          this.currentActiveConversation.messages = {};
          this.currentActiveConversation.messages = messages;
          this.$nextTick(() => {
          if (this.$refs.scrollRef) {
              const psContainer = this.$refs.scrollRef.$el;
              psContainer.scrollTop = psContainer.scrollHeight;
            }
          });
        })
        .catch(() => {
          me.$bvToast.toast("Ha ocurrido un error inesperado al enviar el audio. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al consultar enviar el audio",
            variant: "danger",
            solid: true
          });
        })
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


    sendFavoriteImages(){
      for (var image in this.agentFavoriteImages){
        if (this.agentFavoriteImages[image].selected){
          const httpBodyToSendRecordedAudio = 
        {
          'mediaContent':this.agentFavoriteImages[image].src,
          'mediaType': 'image/png',
          'mediaName': 'media',
          'agentID': localStorage.getItem('agentID'),
          'recipientPhoneNumber': this.currentActiveConversation.recipientPhoneNumber
        }
          
        axios.post(constants.routes.backendAPI+'/sendWhatsappMedia', httpBodyToSendRecordedAudio)
        .then(() =>{
          this.$set(this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]= {
            owner:'agent',
            messageContent:{'mediaExtension':'image/png', 'mediaContent':this.agentFavoriteImages[image].src.split(',')[1], 'mediaName':'media', isBase64: '1'},
            messageType: 'image',
            messageSentHour: Date().toString().slice(16,24)
          });
          
          var messages = this.currentActiveConversation.messages;
          this.currentActiveConversation.messages = {};
          this.currentActiveConversation.messages = messages;
          
          this.$nextTick(() => {
          if (this.$refs.scrollRef) {
              const psContainer = this.$refs.scrollRef.$el;
              psContainer.scrollTop = psContainer.scrollHeight;
            }
          });

          this.agentFavoriteImages[image].selected = false;

        });

        }
      }
    },

    sendFavoriteMessage(favoriteMessage){
      axios.get(constants.routes.backendAPI
            +'/sendWhatsappMessage?'
            +'type=text'
            +'&agentID='+localStorage.getItem('agentID')
            +'&recipientPhoneNumber='+this.currentActiveConversation.recipientPhoneNumber
            +'&messageContent='+favoriteMessage
            +'&sendedProduct=0')
      .then(() =>{ 
        this.$set(this.currentActiveConversation.messages, (Object.keys(this.currentActiveConversation.messages).length+1).toString(), {sendedProduct: '0', owner:'agent',messageContent:favoriteMessage,messageType:'text',messageSentHour: Date().toString().slice(16,24)});

        this.$nextTick(() => {
        if (this.$refs.scrollRef) {
            const psContainer = this.$refs.scrollRef.$el;
            psContainer.scrollTop = psContainer.scrollHeight;
          }
        });

        this.$root.$emit('bv::hide::modal','favoriteModal')
        
      })
      
      .catch(error =>{
        console.log(error);
      })

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
      var texto = '';
      for (var indiceProducto in productosPorNicotina){
        var codigoProducto = productosPorNicotina[indiceProducto].codigoAsoiado;
        var a = await this.cargarTesting(codigoProducto);
        texto = texto + productosPorNicotina[indiceProducto].nicotina + 'MG:\n' + a;
      }
      this.$bvToast.toast(texto, {
        title: "Stock",
        variant: "info",
        solid: true
      });
    },

    cargarExistencia(codigoProducto){
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
        me.$bvToast.toast(textoExistencia, {
          title: "Stock",
          variant: "info",
          solid: true
        });
        
      }).catch(function(error){
        me.$bvToast.toast("Ha ocurrido un error inesperado al consultar el stock. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar stock",
          variant: "danger",
          solid: true
        });
      });
    },

    sendOrderToClient(){
      var newMessage = '';
      var total = 0;
      for (var productIndex in this.orden){
        if (newMessage != ''){
          newMessage = newMessage + `%0a%0a*Nombre*: ` + this.orden[productIndex]['descripcion'] + `%0a*Precio*: ₡` + this.orden[productIndex]['precio'] + `%0a*Cantidad*: ` + this.orden[productIndex]['cantidad'] + `%0a*Subtotal*: ₡` + this.orden[productIndex]['cantidad']*this.orden[productIndex]['precio'];
        } else {
          newMessage = `*Nombre*: ` + this.orden[productIndex]['descripcion'] + `%0a*Precio*: ₡` + this.orden[productIndex]['precio'] + `%0a*Cantidad*: ` + this.orden[productIndex]['cantidad'] + `%0a*Subtotal*: ₡` + this.orden[productIndex]['cantidad']*this.orden[productIndex]['precio'];
        }
      }

      newMessage = newMessage + `%0a%0a*SUBTOTAL*: ₡` + this.calcularSubTotal;
      newMessage = newMessage + `%0a*DESCUENTO*: ₡` + this.calcularDescuento;
      newMessage = newMessage + `%0a*TOTAL*: ₡` + this.calcularTotal;
      axios.get(constants.routes.backendAPI
            +'/sendWhatsappMessage?'
            +'type=text'
            +'&agentID='+localStorage.getItem('agentID')
            +'&recipientPhoneNumber='+this.currentActiveConversation.recipientPhoneNumber
            +'&messageContent='+newMessage
            +'&sendedProduct=0')
      .then(() =>{ 
        this.$set(this.currentActiveConversation.messages, (Object.keys(this.currentActiveConversation.messages).length+1).toString(), {sendedProduct: '0', owner:'agent',messageContent:'Se ha compartido el carrito con el cliente',messageType:'text',messageSentHour: Date().toString().slice(16,24)});

        this.$nextTick(() => {
        if (this.$refs.scrollRef) {
            const psContainer = this.$refs.scrollRef.$el;
            psContainer.scrollTop = psContainer.scrollHeight;
          }
        });
      })
      
      .catch(error =>{
        console.log(error);
      })

      
    },

    grabPendingConversation(pendingConversation){
      this.loader2 = true;
      axios.post(constants.routes.backendAPI+'/grabPendingConversation',{
        agentID: localStorage.getItem('agentID'),
        conversationID: pendingConversation.pendingConversationID
      })
      .then(() =>{
        this.getAgentActiveConversations();
        this.getPendingConversations();
      })
      
      .catch(error =>{
        console.log(error);
      })
    },

    grabStoreConversation(storeConversation){
      this.loaderGrabPendingConversation = true;

      axios.post(constants.routes.backendAPI+'/grabStoreConversation',{
        agentID: localStorage.getItem('agentID'),
        recipientPhoneNumber: storeConversation.recipientPhoneNumber,
        storeName: storeConversation.storeName,
        messageID: storeConversation.messageID
      })
      .then(() =>{
        this.getAgentActiveConversations();
        this.getStoreConversations();
      })
      
      .catch(error =>{
        console.log(error);
      })
    },

    sendLocationToClient(locationName){
      console.log(this.locations)
      if (this.locations[locationName]){
        axios.post(constants.routes.backendAPI+'/sendWhatsappLocation',{
          agentID: localStorage.getItem('agentID'),
          recipientPhoneNumber: this.currentActiveConversation.recipientPhoneNumber,
          latitude: this.locations[locationName].latitude,
          longitude: this.locations[locationName].longitude,
        })
        .then(() =>{ 
          this.$set(this.currentActiveConversation.messages, (Object.keys(this.currentActiveConversation.messages).length+1).toString(), {owner:'agent',messageContent:{locationLatitude:this.locations[locationName].latitude, locationLongitude:this.locations[locationName].longitude},messageType:'location',messageSentHour: Date().toString().slice(16,24)});
        })
        .catch(error =>{
          console.log(error);
        })
      } else {
        this.$bvToast.toast('El cliente no cuenta con una ubicación asignada a "' + locationName + '." Por favor, agregue la dirección correctamente, e intentelo nuevamente.', {
          title: 'Error al enviar la ubicación',
          variant: 'danger',
          solid: true
        });
      }
    },

    sendStoreLocationToClient(locationName){
      var latitud = 0;
      var longitud = 0;
      if (locationName == 'Zapote'){
        var latitud = 9.920173;
        var longitud = -84.051987;
      } else if (locationName == 'Escazu'){
        var latitud = 9.949093;
        var longitud = -84.163117;
      } else {
        var latitud = 9.864751;
        var longitud = -83.925354;
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappLocation',{
        agentID: localStorage.getItem('agentID'),
        recipientPhoneNumber: this.currentActiveConversation.recipientPhoneNumber,
        latitude: latitud,
        longitude: longitud,
      })
      .then(() =>{ 
        this.$set(this.currentActiveConversation.messages, (Object.keys(this.currentActiveConversation.messages).length+1).toString(), {owner:'agent',messageContent:{locationLatitude:latitud, locationLongitude:longitud},messageType:'location',messageSentHour: Date().toString().slice(16,24)});
      })
      .catch(error =>{
        console.log(error);
      })
    },

    saveLocation(locationName, location){
      this.locations[locationName] = {latitude: location.locationLatitude, longitude: location.locationLongitude};
      
    },
    getLocation(location){
      return {lat: location.locationLatitude, lng: location.locationLongitude}
    },
    sendMassMessage(){
      var recipientPhoneNumbers = [];
      for (var contactIndex in this.contactsList){
        if (this.contactsList[contactIndex].selected){
          recipientPhoneNumbers.push(this.contactsList[contactIndex].contactPhoneNumber);
        }
      }
      axios.post(constants.routes.backendAPI+'/sendWhatsappMassMessage',{
        messageContent: this.massTextMessageContent,
        recipientPhoneNumbers: recipientPhoneNumbers
      })
      .then(() =>{ 
        this.allContactSelected = false;
        for (var contactIndex in this.contactsList){
          this.contactsList[contactIndex].selected = false;
        }
      })
      
      .catch(error =>{
        console.log(error);
      })
    },
    selectAllContacts(){
      this.allContactSelected = !this.allContactSelected;
      for (var contactIndex in this.contactsList){
        this.contactsList[contactIndex].selected = this.allContactSelected
      }
    },
    getAllContactsVariant(){
      if (this.allContactSelected){
        return 'success'
      } else {
        return ''
      }
    },
    selectContact(contact){
      contact.selected = !contact.selected;
      if (contact.selected == false){
        this.allContactSelected = false;
      }
    },
    getContactVariant(contact){
      if (contact.selected) {
        return 'success'
      } else {
        return ''
      }
    },

    getImageVariant(image){
      if (image.selected == true) {
        return 'success'
      } else {
        return ''
      }
    },

    getImageStyle(image){
      if (image.selected){
        return 'cursor: pointer';
      }
    },

    getAllFavoriteVariant(){
      var variant = 'success';
      for(var imageIndex in this.agentFavoriteImages){
        if (this.agentFavoriteImages[imageIndex].selected == false){
          variant = '';
        };
      } 
      return variant;
    },

    selectFavoriteImage(image){
      this.agentFavoriteImages[image].selected = true;
    },

    selectAllFavoriteImage(){
      for(var imageIndex in this.agentFavoriteImages){
        this.agentFavoriteImages[imageIndex].selected = true;
      }
    },

    getAllContacts(){
      axios.get(constants.routes.backendAPI+'/getAllContacts')
        .then(response =>{ 
          for (var contactPhoneNumber in response.data){
            this.contactsList.push(
              {
                'contactPhoneNumber': contactPhoneNumber,
                'contactName': response.data[contactPhoneNumber].contactName,
                'selected': false
              }
            )
          }
          this.contactsList.sort((a, b) => {
            const nameA = a.contactName.toLowerCase();
            const nameB = b.contactName.toLowerCase();
            return nameA.localeCompare(nameB);
          });
        })
        
        .catch(error =>{
          console.log(error);
        })
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
      this.orden[row.originalIndex].cantidad = value;

      const codigoProducto = row.CodigoP;
      const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
      if (ordenesActualesLocalStorage[this.phone]){
        for (var productoIndex in ordenesActualesLocalStorage[this.phone]){
          if (ordenesActualesLocalStorage[this.phone][productoIndex]['CodigoP'] == codigoProducto){
            ordenesActualesLocalStorage[this.phone][productoIndex]['cantidad'] = value;
          }
        }
      }
      localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
    },


    updateFieldDesc(field, value, row) {
      this.orden[row.originalIndex].descuento = value;

      const codigoProducto = row.CodigoP;
      const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
      if (ordenesActualesLocalStorage[this.phone]){
        for (var productoIndex in ordenesActualesLocalStorage[this.phone]){
          if (ordenesActualesLocalStorage[this.phone][productoIndex]['CodigoP'] == codigoProducto){
            ordenesActualesLocalStorage[this.phone][productoIndex]['descuento'] = value;

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
      
      
      } else if(this.address === ""){
        this.$bvToast.toast('Por favor, agregue una nota de la dirección para generar la orden, e intentelo nuevamente.', {
          title: 'Error al generar la orden',
          variant: 'danger',
          solid: true
        });
        Valido = 0;
        
      
      } else if(this.nota == ""){
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
        if(this.ValidarData() == 1){
          var me = this;
          this.loading = true;
          var momentoActual = new Date(); 
          var hora = momentoActual.getHours(); 
          var minuto = momentoActual.getMinutes(); 
          var segundo = momentoActual.getSeconds();
          var time = hora + ":" + minuto + ":" + segundo;
          let header={"Authorization" : "Bearer "};
          let configuracion= {headers : header};
          axios.post('https://noah.cr/BackendKingVape/api/ordenexpress/CrearMesaTotal',{
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
            'tipoCompra' :this.MetodoEnvio,
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
              },configuracion).then(function (response) {
                me.$swal({
                title: "Orden Enviada con éxito!",
                text: "Quieres cerrar la conversación?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then(result => {
                axios.post(constants.routes.backendAPI+'/createContact',
                {
                  'contactName': me.name,
                  'contactPhoneNumber': me.phone,
                  'contactID': me.cedula,
                  'contactEmail': me.email,
                  'contactLocations':
                  {
                      'latitude': me.latitud,
                      'longitude': me.longitud
                  },
                  'contactLocationDetails': me.address,
                  'contactNote': me.nota
                }).then(function (){
                })
                if (result.value) {
                  me.$swal("Archivada!", "La conversación ha sido archivada.", "success");
                  var total = 0;
                  for (var productIndex in me.activeConversationsAsJSON[me.temp].products){
                    total = total + (me.activeConversationsAsJSON[me.temp].products[productIndex].cantidad * me.activeConversationsAsJSON[me.temp].products[productIndex].precio)
                  }
                  axios.get(constants.routes.backendAPI+
                  '/closeConversation?conversationID='+me.temp+
                  '&conversationStatus=converted'+
                  '&amount='+total).then(function (){
                    me.getAgentActiveConversations();
                    me.temp = '';
                  })

                  const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
                  if (ordenesActualesLocalStorage[me.phone]){
                    delete ordenesActualesLocalStorage[me.phone];
                  }
                    localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
                  }

                me.CleanData();
                me.loading = false;
              });
        })
          .catch(function (error) {
            me.$bvToast.toast('Ha ocurrido un error inesperado al general la orden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico."', {
              title: 'Error al generar la orden',
              variant: 'danger',
              solid: true
            });
            me.loading = false; 
          });
        }
      },

      EliminarLinea(id){
        this.orden = this.orden.filter(e => e.id != id)
        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
        if (ordenesActualesLocalStorage[this.phone]){
          ordenesActualesLocalStorage[this.phone] = ordenesActualesLocalStorage[this.phone].filter(e => e.id != id);
        }
        localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
      },
      AgregarItem(item,variant = null){
        this.orden.push({
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
        if (ordenesActualesLocalStorage[this.phone]){
          ordenesActualesLocalStorage[this.phone].push({
            CodigoP: item.codigoProducto,
            descripcion: item.descripcion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          });
        } else {
          ordenesActualesLocalStorage[this.phone] = [{
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
        this.orden.push({
          CodigoP: codigoVariacion,
          descripcion: item.descripcion + ' ' + descripcionVariacion,
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
        if (ordenesActualesLocalStorage[this.phone]){
          ordenesActualesLocalStorage[this.phone].push({
            CodigoP: codigoVariacion,
            descripcion: item.descripcion + ' ' + descripcionVariacion,
            cantidad: 1,
            precio: item.precioVenta,
            id: item.id,
            descuento: 0
          });
        } else {
          ordenesActualesLocalStorage[this.phone] = [{
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

    endConversation(type){
      const me = this;
      axios.get(constants.routes.backendAPI
                  +'/closeConversation?'
                  +'&conversationID='+this.temp
                  +'&conversationStatus='+type)
        .then(() =>{ 
          this.getAgentActiveConversations();
          me.$bvToast.toast("Se ha cerrado la conversación asociada al número '" + this.phone + "'.", {
            title: "Conversación cerrada",
            variant: "success",
            solid: true
          });

          const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));
          if (ordenesActualesLocalStorage[this.phone]){
            delete ordenesActualesLocalStorage[this.phone];
          }
          localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));

          this.getAgentActiveConversations();
          this.temp = '';

        })
        
        .catch(error =>{
          me.$bvToast.toast("Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al cerrar la conversación",
            variant: "danger",
            solid: true
          });
        })
    },

    generateOrder() {
      var total = 0;
      for (var product of this.orden){
        total = total + product.precioVenta*product.cantidad
      }
    },

    startNewConversation(){
      if ((this.newConversationTextMessage.trim().length != 0) && (this.newConversationPhoneNumber.trim().length != 0)){
        axios.get(constants.routes.backendAPI
                  +'/sendWhatsappMessage?'
                  +'type=text'
                  +'&agentID='+localStorage.getItem('agentID')
                  +'&recipientPhoneNumber='+this.newConversationPhoneNumber
                  +'&messageContent='+this.newConversationTextMessage
                  +'&agentID='+localStorage.getItem('agentID'))
        .then(() =>{ 
          this.getAgentActiveConversations();
          this.temp = '';

        })
        
        .catch(error =>{
          console.log(error);
        })
      }
    },

    addEmojiToTextMessage(emoji){
      this.newTextMessageContent = this.newTextMessageContent + emoji;
    },

    noAgentsAvailable(){
      if (this.agents.length == 0){
        return true;
      }
      return false;
    },

    transferConversationRequestAccepted(){
      axios.post(constants.routes.backendAPI+'/updateAssignedAgentToConversation',{
        previousAgentID: this.transferFromAgentID,
        activeConversationID: this.transferConversationID,
        newAgentID: localStorage.getItem('agentID'),
        products: this.transferConversationProducts
      })
      .then(() =>{ 
        axios.post(constants.routes.backendAPI+'/acceptTransfer',{
        agentToNotify: this.transferFromAgentID
        })
        .then(() =>{ 
          
        })
        
        .catch(error =>{
          console.log(error);
        })
      })
      
      .catch(error =>{
        console.log(error);
      })
    },

    transferConversation(newAgent){
      axios.post(constants.routes.backendAPI+'/requestTransfer',{
        previousAgentID: localStorage.getItem('agentID'),
        activeConversationID: this.temp,
        newAgentID: newAgent.agentID,
        products: this.orden
      })
      .then(() =>{ 
        
      })
      
      .catch(error =>{
        console.log(error);
      })
      
    },


    async sendProductToClient(product){

      
      this.enviandoProductoLoader = true;
      var httpBodyToSendRecordedAudio = 
        {
          'mediaURL':product.localizacion,
          'mediaType': 'image/png',
          'mediaName': 'media',
          'agentID': localStorage.getItem('agentID'),
          'recipientPhoneNumber': this.currentActiveConversation.recipientPhoneNumber
        }
      

      axios.post(constants.routes.backendAPI+'/sendWhatsappMediaURL', httpBodyToSendRecordedAudio)
        .then(() =>{
          this.enviandoProductoLoader = false;
          this.$set(this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]= {
            owner:'agent',
            messageContent:{'mediaExtension':'image/png', 'mediaContent':product.localizacion, 'mediaName':'media'},
            messageType: 'image',
            messageSentHour: Date().toString().slice(16,24)
          });
          
          var messages = this.currentActiveConversation.messages;
          this.currentActiveConversation.messages = {};
          this.currentActiveConversation.messages = messages;

          this.newTextMessageContent = `*Nombre*: ` + product.descripcion + `%0a*Precio*: ₡` + product.precioVenta + `%0a*Descripción*: ` + product.datosAdicionales;

          axios.get(constants.routes.backendAPI
                +'/sendWhatsappMessage?'
                +'type=text'
                +'&agentID='+localStorage.getItem('agentID')
                +'&recipientPhoneNumber='+this.currentActiveConversation.recipientPhoneNumber
                +'&messageContent='+this.newTextMessageContent
                +'&sendedProduct=1')
          .then(() =>{ 

            this.newTextMessageContent = this.newTextMessageContent.split('*').join('');

            this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]={sendedProduct: '1', owner:'agent',messageContent:{productName:this.newTextMessageContent.split('%0a')[0].split(': ')[1], productPrice:this.newTextMessageContent.split('%0a')[1].split(': ')[1],productDescription:this.newTextMessageContent.split('%0a')[2].split(': ')[1]},messageType:'text',messageSentHour: Date().toString().slice(16,24)};
            this.newTextMessageContent = '';


            this.$bvToast.toast("Product sended to client", {
              title: `${product.descripcion || "Product sended to client"}`,
              variant: 'info',
              solid: true
            });

            this.$nextTick(() => {
            if (this.$refs.scrollRef) {
                const psContainer = this.$refs.scrollRef.$el;
                psContainer.scrollTop = psContainer.scrollHeight;
              }
            });
          })
          
          .catch(error =>{
            console.log(error);
          })

          this.$nextTick(() => {
          if (this.$refs.scrollRef) {
              const psContainer = this.$refs.scrollRef.$el;
              psContainer.scrollTop = psContainer.scrollHeight;
            }

          });
        });


    },



    uploadImage(){
      document.getElementById('imageUploader').click();
    },

    uploadFavoriteImage(){
      document.getElementById('favoriteImageUploader').click();
    },

    uploadFile(type){

      var fileTypeDisplay = ''
      if (type == 'image/png'){
        this.file = this.$refs.imageFile.files[0];
        fileTypeDisplay = 'image';
      } else if (type == 'application/pdf'){
        this.file = this.$refs.documentFile.files[0];
        fileTypeDisplay = 'document';
      }
      var reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        const httpBodyToSendRecordedAudio = 
        {
          'mediaContent':reader.result,
          'mediaType': type,
          'mediaName': 'media',
          'agentID': localStorage.getItem('agentID'),
          'recipientPhoneNumber': this.currentActiveConversation.recipientPhoneNumber
        }
        
        this.fileSharingLoader = true;

        axios.post(constants.routes.backendAPI+'/sendWhatsappMedia', httpBodyToSendRecordedAudio)
        .then(() =>{
          this.fileSharingLoader = false;

          this.$set(this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]= {
            owner:'agent',
            messageContent:{'mediaExtension':type, 'mediaContent':reader.result.split(',')[1], 'mediaName':'media', isBase64: '1'},
            messageType: fileTypeDisplay,
            messageSentHour: Date().toString().slice(16,24)
          });
          
          var messages = this.currentActiveConversation.messages;
          this.currentActiveConversation.messages = {};
          this.currentActiveConversation.messages = messages;
          
          this.$nextTick(() => {
          if (this.$refs.scrollRef) {
              const psContainer = this.$refs.scrollRef.$el;
              psContainer.scrollTop = psContainer.scrollHeight;
            }
          });

          this.file = null;

        });
        
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    },

    getColorChat(item){
      if(item == 'agent'){
        return "background-color:#ceefff";
      } else
      {
        return "background-color:#dedede";
      }

    },
    GetOwner(item){
      if(item != 'agent'){
        return "user";
      } 
    },
    sendNewTextMessage(){
      if (this.newTextMessageContent.trim().length != 0){
        axios.get(constants.routes.backendAPI
                  +'/sendWhatsappMessage?'
                  +'type=text'
                  +'&agentID='+localStorage.getItem('agentID')
                  +'&recipientPhoneNumber='+this.currentActiveConversation.recipientPhoneNumber
                  +'&messageContent='+this.newTextMessageContent)
        .then(() =>{ 
          this.currentActiveConversation.messages[(Object.keys(this.currentActiveConversation.messages).length+1).toString()]={owner:'agent',messageContent:this.newTextMessageContent,messageType:'text',messageSentHour: Date().toString().slice(16,24)};
          this.newTextMessageContent = '';
          this.$nextTick(() => {
          if (this.$refs.scrollRef) {
              const psContainer = this.$refs.scrollRef.$el;
              psContainer.scrollTop = psContainer.scrollHeight;
            }
          });
        })
        
        .catch(error =>{
          console.log(error);
        })
      } else {
        this.$bvToast.toast("Debe colocar texto en el mensaje a enviar al cliente. Intentelo nuevamente.", {
          title: 'Error al enviar el mensaje al cliente',
          variant: 'danger',
          solid: true
        });
      }
    },
    getAgentActiveConversations(){
      this.loaderConversations = true;
      axios.get(constants.routes.backendAPI+'/getAgentActiveConversations?agentID='+localStorage.getItem('agentID'))
      .then(response =>{
        const ordenesActualesLocalStorage = JSON.parse(localStorage.getItem('ordenesActuales'));

        this.activeConversations = [];
        this.activeConversationsAsJSON = {};
        for (var activeConversationID in response.data){
          var activeConversation = response.data[activeConversationID];
          activeConversation['activeConversationID'] = activeConversationID;
          if (ordenesActualesLocalStorage[response.data[activeConversationID]['recipientPhoneNumber']]){
            activeConversation['products'] = ordenesActualesLocalStorage[response.data[activeConversationID]['recipientPhoneNumber']];
          }
          this.activeConversations.push(activeConversation);
          this.activeConversation = this.activeConversations[0].activeConversationID;
        }
        this.activeConversationsAsJSON = response.data;
        if (this.updatedActiveConversationID != ''){
          this.changeCurrentActiveConversation(this.updatedActiveConversationID);
        }

        localStorage.setItem('ordenesActuales', JSON.stringify(ordenesActualesLocalStorage));
        this.loaderConversations = false;

      })
      .catch(error =>{
        console.log(error);
      })
    },

    changeCurrentActiveConversation (clickedActiveConversationID){
      this.producto = '';
      this.temp = clickedActiveConversationID;
      this.currentActiveConversation = this.activeConversationsAsJSON[clickedActiveConversationID];
      this.orden = this.activeConversationsAsJSON[clickedActiveConversationID].products;
      this.phone = this.activeConversationsAsJSON[clickedActiveConversationID].recipientPhoneNumber;
      
      this.name = '';
      this.cedula = '';
      this.email = '';
      this.latitud = '';
      this.longitud = '';
      this.address = '';
      this.nota = '';
      this.locations = [];

      var temp = false;
      for (var activeConversationMessage in this.activeConversationsAsJSON[clickedActiveConversationID].messages){
        if (this.activeConversationsAsJSON[clickedActiveConversationID].messages[activeConversationMessage].owner != 'agent'){
          temp = true;
        }
      }
      this.availableConversation = temp;

      axios.get(constants.routes.backendAPI+'/getContact?contactPhoneNumber='+this.currentActiveConversation.recipientPhoneNumber)
      .then(response =>{
        if (response.data['contactInformation'] != null){
          this.name = response.data['contactInformation'].contactName;
          this.phone = response.data['contactInformation'].contactPhoneNumber;
          this.cedula = response.data['contactInformation'].contactID;
          this.email = response.data['contactInformation'].contactEmail;
          this.locations = response.data['contactInformation'].contactLocations;
          this.address = response.data['contactInformation'].contactLocationDetails;
          this.nota = response.data['contactInformation'].contactNote;
          if ((this.cedula != '') && (this.cedula != undefined)){
            this.verifiedUser = true;
          } else {
            this.verifiedUser = false;
          }
        } else {
          this.verifiedUser = false;
        }
        
      })
      .catch(error =>{
        console.log(error);
      })
    
      this.$nextTick(() => {
        if (this.$refs.scrollRef) {
            const psContainer = this.$refs.scrollRef.$el;
            psContainer.scrollTop = psContainer.scrollHeight;
          }
        });
      
    },
    ...mapActions(["changeSelectedUser"]),
    

    getAllAgents(){
      axios.get(constants.routes.backendAPI+'/getAllAgents')
      .then(response =>{
        this.agents = [];
        for (var agentID in response.data){
          if ((response.data[agentID].agentStatus == 'online') && (agentID != localStorage.getItem('agentID'))){
            const newAgent = {'agentID': agentID, 'agentName': response.data[agentID].agentName};
            this.agents.push(newAgent);
          }


        }
      })
      .catch(error =>{
        console.log(error);
      })
    },

    getPendingConversations(){
      axios.get(constants.routes.backendAPI+'/getAllPendingConversations')
      .then(response =>{
        this.pendingConversations = [];
        for (var pendingConversationID in response.data){
          this.pendingConversations.push(
            {
              pendingConversationID: pendingConversationID,
              recipientPhoneNumber: response.data[pendingConversationID].recipientPhoneNumber,
              startDate: response.data[pendingConversationID].startDate,
              startHour: response.data[pendingConversationID].startHour
            }
          )
        }
      })
      .catch(error =>{
        console.log(error);
      })
    },

    getStoreConversations(){
      axios.get(constants.routes.backendAPI+'/getAllStoreConversations')
      .then(response =>{
        this.zapoteConversations = [];
        this.escazuConversations = [];
        this.cartagoConversations = [];

        for (var storeConversationRecipientPhoneNumber in response.data){
          if (response.data[storeConversationRecipientPhoneNumber].storeName == 'Zapote'){
            this.zapoteConversations.push(
            {
              recipientPhoneNumber: response.data[storeConversationRecipientPhoneNumber].recipientPhoneNumber,
              recipientProfileName: response.data[storeConversationRecipientPhoneNumber].recipientProfileName,
              storeName: 'Zapote',
              startDate: response.data[storeConversationRecipientPhoneNumber].startDate,
              startHour: response.data[storeConversationRecipientPhoneNumber].startHour,
              messageID: response.data[storeConversationRecipientPhoneNumber].messageID
            })
          } else if (response.data[storeConversationRecipientPhoneNumber].storeName == 'Escazu'){
            this.escazuConversations.push(
            {
              recipientPhoneNumber: response.data[storeConversationRecipientPhoneNumber].recipientPhoneNumber,
              recipientProfileName: response.data[storeConversationRecipientPhoneNumber].recipientProfileName,
              storeName: 'Escazu',
              startDate: response.data[storeConversationRecipientPhoneNumber].startDate,
              startHour: response.data[storeConversationRecipientPhoneNumber].startHour,
              messageID: response.data[storeConversationRecipientPhoneNumber].messageID
            })
          } else {
            this.cartagoConversations.push(
            {
              recipientPhoneNumber: response.data[storeConversationRecipientPhoneNumber].recipientPhoneNumber,
              recipientProfileName: response.data[storeConversationRecipientPhoneNumber].recipientProfileName,
              storeName: 'Cartago',
              startDate: response.data[storeConversationRecipientPhoneNumber].startDate,
              startHour: response.data[storeConversationRecipientPhoneNumber].startHour,
              messageID: response.data[storeConversationRecipientPhoneNumber].messageID
            })
          }
        }
      })
      .catch(error =>{
        console.log(error);
      })
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
				for(var j=0;j<this.orden.length;j++)
				  { 
						resultado = resultado + ((this.orden[j].descuento/100)*((this.orden[j].precio) * this.orden[j].cantidad));
          }
			
			return resultado.toFixed(2);
		},

    calcularSubTotal:function(){
			var resultado=0.0; 
				for(var j=0;j<this.orden.length;j++)
				  { 
						resultado = resultado + this.orden[j].cantidad * this.orden[j].precio ;
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

    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }
    if (localStorage.getItem('ordenesActuales') == null){
      localStorage.setItem('ordenesActuales', JSON.stringify({}))
    }
    this.$notification.requestPermission().then();

    this.agentName = localStorage.getItem('agentName');
    this.agentFavoriteMessages = JSON.parse(localStorage.getItem('agentFavoriteMessages'));
    this.agentFavoriteImages = JSON.parse(localStorage.getItem('agentFavoriteImages'));

    for (var agentFavoriteImageIndex in this.agentFavoriteImages){
      this.agentFavoriteImages[agentFavoriteImageIndex]['selected'] = false;

    }

    this.getAgentActiveConversations();
    this.getPendingConversations();
    this.getAllAgents();
    //this.getAllContacts();
    this.getStoreConversations();

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);

        if (websocketMessageJSON['websocketMessageID'] == 'updateAgentStatus'){
          this.getAllAgents();

        } else if (websocketMessageJSON['websocketMessageID'] == 'receiveWhatsappMessage'){
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentID']) {
            if (this.activeConversationsAsJSON[websocketMessageJSON['conversationID']]){
              this.$set(this.activeConversationsAsJSON[websocketMessageJSON['conversationID']].messages, websocketMessageJSON['messageID'], websocketMessageJSON['messageInformation']);
              this.$nextTick(() => {
              if (this.$refs.scrollRef) {
                const psContainer = this.$refs.scrollRef.$el;
                psContainer.scrollTop = psContainer.scrollHeight;
                }
              });
              var inboxAudio = new Audio(require('../../../assets/pageAssets/inbox.mp3'));
              inboxAudio.play();
            }
          }

        } else if (websocketMessageJSON['websocketMessageID'] == 'startNewConversation'){
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentID']) {
            this.$set(this.activeConversationsAsJSON, websocketMessageJSON['conversationID'], websocketMessageJSON['conversationInformation']);
            var activeConversation = websocketMessageJSON['conversationInformation'];
            activeConversation['activeConversationID'] = websocketMessageJSON['conversationID'];
            this.activeConversations.push(activeConversation);
            var inboxAudio = new Audio(require('../../../assets/pageAssets/inbox.mp3'));
            inboxAudio.play();
          }

        } else if (websocketMessageJSON['websocketMessageID'] == 'receivePendingConversation'){
          var aux = this.pendingConversations;
          this.pendingConversations = [];
          aux.push(
            {
              pendingConversationID: websocketMessageJSON['pendingConversationID'],
              recipientPhoneNumber: websocketMessageJSON['recipientPhoneNumber'],
              startDate: websocketMessageJSON['startDate'],
              startHour: websocketMessageJSON['startHour']
            }
          );
          this.pendingConversations = aux;
          var inboxAudio = new Audio(require('../../../assets/pageAssets/pending.wav'));
          inboxAudio.play();

        } else if (websocketMessageJSON['websocketMessageID'] == 'transferConversation') {
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentID']) {
            this.$bvToast.toast("Se le ha transferido una nueva conversación asociada al número '" + websocketMessageJSON['conversationInformation']['recipientPhoneNumber'] + "'.", {
              title: 'Conversación transferida',
              variant: 'success',
              solid: true
            });
            this.$set(this.activeConversationsAsJSON, websocketMessageJSON['conversationID'], websocketMessageJSON['conversationInformation']);
            var activeConversation = websocketMessageJSON['conversationInformation'];
            activeConversation['activeConversationID'] = websocketMessageJSON['conversationID'];
            this.activeConversations.push(activeConversation);
            var inboxAudio = new Audio(require('../../../assets/pageAssets/transfer.wav'));
            inboxAudio.play();
          }

        } else if (websocketMessageJSON['websocketMessageID'] == 'grabPendingConversation') {
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentID']) {
            this.loader2 = false;
            this.$bvToast.toast("Ha tomado la conversación pendiente asociada al número '" + websocketMessageJSON['conversationInformation']['recipientPhoneNumber'] + "'.", {
              title: 'Conversación pendiente tomada',
              variant: 'success',
              solid: true
            });
            this.$set(this.activeConversationsAsJSON, websocketMessageJSON['conversationID'], websocketMessageJSON['conversationInformation']);
            var activeConversation = websocketMessageJSON['conversationInformation'];
            activeConversation['activeConversationID'] = websocketMessageJSON['conversationID'];
            this.activeConversations.push(activeConversation);
            var inboxAudio = new Audio(require('../../../assets/pageAssets/transfer.wav'));
            inboxAudio.play();
          } 
          this.getPendingConversations();
        
        } else if (websocketMessageJSON['websocketMessageID'] == 'grabStoreConversation') {
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentID']) {
            this.loaderGrabPendingConversation = false;
            this.$bvToast.toast("Ha tomado la conversación pendiente asociada al número '" + websocketMessageJSON['conversationInformation']['recipientPhoneNumber'] + "'.", {
              title: 'Conversación pendiente tomada',
              variant: 'success',
              solid: true
            });
            this.$set(this.activeConversationsAsJSON, websocketMessageJSON['conversationID'], websocketMessageJSON['conversationInformation']);
            var activeConversation = websocketMessageJSON['conversationInformation'];
            activeConversation['activeConversationID'] = websocketMessageJSON['conversationID'];
            this.activeConversations.push(activeConversation);
            var inboxAudio = new Audio(require('../../../assets/pageAssets/transfer.wav'));
            inboxAudio.play();
          }
          this.getStoreConversations();
        } else if (websocketMessageJSON['websocketMessageID'] == 'receiveStoreMessage'){
          if (websocketMessageJSON['storeName'] == 'Zapote'){
            var aux = this.zapoteConversations;
            this.zapoteConversations = [];
            aux.push(
              {
                storeName: websocketMessageJSON['storeName'],
                recipientPhoneNumber: websocketMessageJSON['recipientPhoneNumber'],
                recipientProfileName: websocketMessageJSON['recipientProfileName'],
                startDate: websocketMessageJSON['startDate'],
                startHour: websocketMessageJSON['startHour'],
                messageID: websocketMessageJSON['messageID'],
                clientID: websocketMessageJSON['clientID'],
                clientOrder: websocketMessageJSON['clientOrder']
              }
            );
            this.zapoteConversations = aux;
          } else if (websocketMessageJSON['storeName'] == 'Escazu'){
            var aux = this.escazuConversations;
            this.escazuConversations = [];
            aux.push(
              {
                storeName: websocketMessageJSON['storeName'],
                recipientPhoneNumber: websocketMessageJSON['recipientPhoneNumber'],
                recipientProfileName: websocketMessageJSON['recipientProfileName'],
                startDate: websocketMessageJSON['startDate'],
                startHour: websocketMessageJSON['startHour'],
                messageID: websocketMessageJSON['messageID'],
                clientID: websocketMessageJSON['clientID'],
                clientOrder: websocketMessageJSON['clientOrder']
              }
            );
            this.escazuConversations = aux;
          } else {
            var aux = this.cartagoConversations;
            this.cartagoConversations = [];
            aux.push(
              {
                storeName: websocketMessageJSON['storeName'],
                recipientPhoneNumber: websocketMessageJSON['recipientPhoneNumber'],
                recipientProfileName: websocketMessageJSON['recipientProfileName'],
                startDate: websocketMessageJSON['startDate'],
                startHour: websocketMessageJSON['startHour'],
                messageID: websocketMessageJSON['messageID'],
                clientID: websocketMessageJSON['clientID'],
                clientOrder: websocketMessageJSON['clientOrder']
              }
            );
            this.cartagoConversations = aux;
          }
          var inboxAudio = new Audio(require('../../../assets/pageAssets/pending.wav'));
          inboxAudio.play();
        } else if (websocketMessageJSON['websocketMessageID'] == 'requestTransfer') {
          if (localStorage.getItem('agentID') == websocketMessageJSON['newAgentID']) {
            this.transferRequestName = websocketMessageJSON['previousAgentName'];
            this.transferFromAgentID = websocketMessageJSON['previousAgentID'];
            this.transferConversationID = websocketMessageJSON['activeConversationID'];
            this.transferConversationProducts = websocketMessageJSON['products'];
            this.$refs.buttonTransfer.click();
          }
        } else if (websocketMessageJSON['websocketMessageID'] == 'acceptTransfer') {
          if (localStorage.getItem('agentID') == websocketMessageJSON['agentToNotify']) {
            this.temp = '';
            this.getAgentActiveConversations();
          }
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
