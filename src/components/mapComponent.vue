<template>
  <div>
    <b-modal scrollable size="lg" centered id="modalMapaConversacion" hide-footer hide-header>
      <div v-if="openedConversation" style="padding: 10px;">
        <h4><strong>ID: </strong>{{ openedConversation.whatsappConversationID }}</h4>
        <h4><strong>Nombre: </strong>{{ openedConversation.whatsappConversationRecipientProfileName }}</h4>
        <h4><strong>Número: </strong>{{ openedConversation.whatsappConversationRecipientPhoneNumber }}</h4>
        <h4><strong>Monto: </strong>₡{{ openedConversation.amount }}</h4>
      </div>
    </b-modal>

    <div :id = "mapId" :style="getMapDimensions()">
    </div> 
  </div>
</template>

<script>
import axios from 'axios';

import { Feature, Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';

import { fromLonLat } from "ol/proj";
import { Point, Polygon } from "ol/geom";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import {FullScreen, defaults as defaultControls} from 'ol/control.js';

const constants = require('@../../../src/constants.js'); 


export default {
  name: 'mapComponent',
  
  data() {
    return {};
  },
  methods: {},

  data() {
    return {
      mapModal: null,
      mapId: `map-${Math.random().toString(36).substr(2, 9)}`,
      openedConversation: null,
      currentConversation: null,
      openConversationLoader: false,
      openedName: '',
      openedNumber: ''
    }
  },

  props: {
    mapWidth: String,
    mapHeight: String,
    clientLongitude: Number,
    clientLatitude: Number,
    multipleClients: Array
  },

  methods: {
    getMapDimensions(){
      return 'width: ' + this.mapWidth + '; height: ' + this.mapHeight;
    },

    getMessageOwnerStyle(messageOwner){
      if(messageOwner != null){
        return 'user';
      } 
    },

    getMessageOwnerColor(messageOwner){
      if(messageOwner == null){
        return "background-color:#ceefff";
      } 
      return "background-color:#dedede";
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

    parseNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    openConversation(conversation){
      this.openConversationLoader = true;
      this.openedName = conversation.whatsappConversationRecipientProfileName;
      this.openedNumber = conversation.whatsappConversationRecipientPhoneNumber;
      this.currentConversation = null;
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        'whatsappConversationID': conversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentConversation = response.data.result[conversation.whatsappConversationID];
          this.openConversationLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        console.log(error);
        this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }
  },

  mounted(){
    const mapCenter = fromLonLat([this.clientLongitude || -84.0585289, this.clientLatitude || 9.9242503]);


    this.mapModal = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      target: this.mapId,
      layers: [new TileLayer({source: new OSM()})],
      view: new View({center: mapCenter, zoom: this.clientLatitude? 13 : 10}),
    });


    let iconImage = new Icon({
      anchor: [0.5, 1],
      src: 'https://i.postimg.cc/SK7tjgLB/2.png'
    });
    let iconStyle = new Style({image: iconImage});

    let zapoteStoreFeature = new Feature({
      geometry: new Point(fromLonLat([-84.051987, 9.920173])),
    });
    let zapoteStoreVectorSource = new VectorSource({features: [zapoteStoreFeature]});
    let zapoteStoreVectorLayer = new VectorLayer({source: zapoteStoreVectorSource, style: iconStyle})
    this.mapModal.addLayer(zapoteStoreVectorLayer);
    
    let escazuStoreFeature = new Feature({
      geometry: new Point(fromLonLat([-84.163117, 9.949093])),
    });
    let escazuStoreVectorSource = new VectorSource({features: [escazuStoreFeature]});
    let escazuStoreVectorLayer = new VectorLayer({source: escazuStoreVectorSource, style: iconStyle})
    this.mapModal.addLayer(escazuStoreVectorLayer);
    
    let cartagoStoreFeature = new Feature({
      geometry: new Point(fromLonLat([-83.925354, 9.864751])),
    });
    let cartagoStoreVectorSource = new VectorSource({features: [cartagoStoreFeature]});
    let cartagoStoreVectorLayer = new VectorLayer({source: cartagoStoreVectorSource, style: iconStyle})
    this.mapModal.addLayer(cartagoStoreVectorLayer);


    let herediaStoreFeature = new Feature({
      geometry: new Point(fromLonLat([-84.135, 9.99168])),
    });
    let herediaStoreVectorSource = new VectorSource({features: [herediaStoreFeature]});
    let herediaStoreVectorLayer = new VectorLayer({source: herediaStoreVectorSource, style: iconStyle})
    this.mapModal.addLayer(herediaStoreVectorLayer);

    this.cartagoMap = constants.routes.cartagoMap;
    let cartagoMapFormatted = [];
    for (var cartagoMapIndex in this.cartagoMap[0]){
      const cartagoPoint = this.cartagoMap[0][cartagoMapIndex];
      const point = fromLonLat([cartagoPoint['lng'], cartagoPoint['lat']]);
      cartagoMapFormatted.push(point);
    }
    let cartagoLineStyle = new Stroke({
      color: 'rgba(38, 166, 153, 0.4)',
      width: 3
    })
    let cartagoFillStyle = new Fill({
      color: 'rgba(38, 166, 153, 0.4)'
    })
    let cartagoStyle = new Style({
      stroke: cartagoLineStyle,
      fill: cartagoFillStyle
    })
    let cartagoPolygon = new Polygon([cartagoMapFormatted]);
    let cartagoFeature = new Feature(cartagoPolygon);
    let cartagoVectorSource = new VectorSource();
    cartagoVectorSource.addFeature(cartagoFeature);
    let cartagoVectorLayer = new VectorLayer({source: cartagoVectorSource, style: cartagoStyle});
    this.mapModal.addLayer(cartagoVectorLayer);


    this.herediaMap = constants.routes.herediaMap;
    let herediaMapFormatted = [];
    for (var herediaMapIndex in this.herediaMap[0]){
      const herediaPoint = this.herediaMap[0][herediaMapIndex];
      const point = fromLonLat([herediaPoint['lng'], herediaPoint['lat']]);
      herediaMapFormatted.push(point);
    }
    let herediaLineStyle = new Stroke({
      color: 'rgba(159, 124, 208, 0.5)',
      width: 3
    })
    let herediaFillStyle = new Fill({
      color: 'rgba(159, 124, 208, 0.5)'
    })
    let herediaStyle = new Style({
      stroke: herediaLineStyle,
      fill: herediaFillStyle
    })
    let herediaPolygon = new Polygon([herediaMapFormatted]);
    let herediaFeature = new Feature(herediaPolygon);
    let herediaVectorSource = new VectorSource();
    herediaVectorSource.addFeature(herediaFeature);
    let herediaVectorLayer = new VectorLayer({source: herediaVectorSource, style: herediaStyle});
    this.mapModal.addLayer(herediaVectorLayer);


    this.zapoteMap = constants.routes.zapoteMap;
    let zapoteMapFormatted = [];
    for (var zapoteMapIndex in this.zapoteMap[0]){
      const zapotePoint = this.zapoteMap[0][zapoteMapIndex];
      const point = fromLonLat([zapotePoint['lng'], zapotePoint['lat']]);
      zapoteMapFormatted.push(point);
    }
    let zapoteLineStyle = new Stroke({
      color: 'rgba(254, 211, 48, 0.5)',
      width: 3
    })
    let zapoteFillStyle = new Fill({
      color: 'rgba(254, 211, 48, 0.5)'
    })
    let zapoteStyle = new Style({
      stroke: zapoteLineStyle,
      fill: zapoteFillStyle
    })
    let zapotePolygon = new Polygon([zapoteMapFormatted]);
    let zapoteFeature = new Feature(zapotePolygon);
    let zapoteVectorSource = new VectorSource();
    zapoteVectorSource.addFeature(zapoteFeature);
    let zapoteVectorLayer = new VectorLayer({source: zapoteVectorSource, style: zapoteStyle});
    this.mapModal.addLayer(zapoteVectorLayer);


    this.escazuMap = constants.routes.escazuMap;
    let escazuMapFormatted = [];
    for (var escazuMapIndex in this.escazuMap[0]){
      const escazuPoint = this.escazuMap[0][escazuMapIndex];
      const point = fromLonLat([escazuPoint['lng'], escazuPoint['lat']]);
      escazuMapFormatted.push(point);
    }
    let escazuLineStyle = new Stroke({
      color: 'rgba(228, 79, 156, 0.5)',
      width: 3
    })
    let escazuFillStyle = new Fill({
      color: 'rgba(228, 79, 156, 0.5)'
    })
    let escazuStyle = new Style({
      stroke: escazuLineStyle,
      fill: escazuFillStyle
    })
    let escazuPolygon = new Polygon([escazuMapFormatted]);
    let escazuFeature = new Feature(escazuPolygon);
    let escazuVectorSource = new VectorSource();
    escazuVectorSource.addFeature(escazuFeature);
    let escazuVectorLayer = new VectorLayer({source: escazuVectorSource, style: escazuStyle});
    this.mapModal.addLayer(escazuVectorLayer);

  
    this.redMap = constants.routes.redMap;
    let redLineStyle = new Stroke({
      color: 'rgba(171, 0, 0, 0.5)',
      width: 3
    })
    let redFillStyle = new Fill({
      color: 'rgba(171, 0, 0, 0.5)'
    })
    let redStyle = new Style({
      stroke: redLineStyle,
      fill: redFillStyle
    })
    for (var redMapIndex in this.redMap){
      let redMapFormatted = [];
      for (var redMapSubindex in this.redMap[redMapIndex]){
        const redPoint = this.redMap[redMapIndex][redMapSubindex];
        const point = fromLonLat([redPoint['lng'], redPoint['lat']]);
        redMapFormatted.push(point);
      }
      let redPolygon = new Polygon([redMapFormatted]);
      let redFeature = new Feature(redPolygon);
      let redVectorSource = new VectorSource();
      redVectorSource.addFeature(redFeature);
      let redVectorLayer = new VectorLayer({source: redVectorSource, style: redStyle});
      this.mapModal.addLayer(redVectorLayer);
    }


    if (this.clientLatitude){
      let clientLocationImage = new Icon({
        anchor: [0.5, 1],
        src: 'https://i.postimg.cc/ncgWWjcP/1.webp'
      });
      let clientLocationStyle = new Style({image: clientLocationImage});
      let clientLocationStoreFeature = new Feature({
        geometry: new Point(fromLonLat([this.clientLongitude, this.clientLatitude])),
      });
      let clientLocationStoreVectorSource = new VectorSource({features: [clientLocationStoreFeature]});
      let clientLocationStoreVectorLayer = new VectorLayer({source: clientLocationStoreVectorSource, style: clientLocationStyle})
      this.mapModal.addLayer(clientLocationStoreVectorLayer);
    }

    if (this.multipleClients){
      let clientLocationImage = new Icon({
        anchor: [0.5, 1],
        src: 'https://i.postimg.cc/ncgWWjcP/1.webp'
      });

      for (var clientIndex in this.multipleClients){
        const client = this.multipleClients[clientIndex];

        let clientLocationStyle = new Style({image: clientLocationImage});

        let clientLocationStoreFeature = new Feature({
          geometry: new Point(fromLonLat([client.longitude, client.latitude]))
        });
        clientLocationStoreFeature.setId(client);
        let clientLocationStoreVectorSource = new VectorSource({features: [clientLocationStoreFeature]});
        let clientLocationStoreVectorLayer = new VectorLayer({source: clientLocationStoreVectorSource, style: clientLocationStyle})
        this.mapModal.addLayer(clientLocationStoreVectorLayer);
      }
    }


    this.mapModal.on('singleclick', (evt) => {
      const feature = this.mapModal.forEachFeatureAtPixel(evt.pixel,
        (feature) => {
          return feature;
        });

      if (feature) {
        if(feature.id_){
          this.openedConversation = feature.id_;
          this.$root.$emit('bv::show::modal', 'modalMapaConversacion');
        }
      }
    });



  }
};
</script>
