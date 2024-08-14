<template>
  <b-card style="margin: 30px;" v-if="feedbackSent == false">
    <div >
      <div style="text-align: center;">
        <h1 style="font-size: xx-large;">FEEDBACK <strong>#{{ whatsappConversationID }}</strong></h1>
        <br>
        <p style="font-size: large;">Estimado cliente: su satisfacción es y será siempre nuestra prioridad. Nos encantaría hacerle un par de preguntas para así recibir su opinión y trabajar en mejorar aún más nuestro servicio</p>
      </div>
      <br><br>

      <p style="font-weight: bold; font-size: large;">¿Cómo calificas la calidad de nuestra atención por medio de WhatsApp?</p>
      <b-form-select v-model="questionOne" :options="feedbackScaleOptions"></b-form-select>
      <br><br><br><br>

      <p style="font-weight: bold; font-size: large;">¿Cómo calificas la velocidad de respuesta de nuestra atención por medio de WhatsApp?</p>
      <b-form-select v-model="questionTwo" :options="feedbackScaleOptions"></b-form-select>
      <br><br><br><br>

      <p style="font-weight: bold; font-size: large;">¿Qué te parece la calidad de nuestros productos?</p>
      <b-form-select v-model="questionThree" :options="feedbackScaleOptions"></b-form-select>
      <br><br><br><br>

      <p style="font-weight: bold; font-size: large;">¿Qué tanto recomiendarías King Vape a un familiar o amigo?</p>
      <b-form-select v-model="questionFour" :options="feedbackScaleOptions"></b-form-select>
      <br><br><br><br>

      <p style="font-weight: bold; font-size: large;">¿Cómo te enteraste de nosotros?</p>
      <b-form-select v-model="questionFive" :options="feedbackKnowOptions"></b-form-select>
      <br><br><br><br>

      <p style="font-weight: bold; font-size: large;">¿Te gustaría compartir algún comentario o sugerencia con nosotros?</p>
      <b-form-textarea v-model="questionSix" placeholder="Coloca tu comentario o sugerencia" rows="3"></b-form-textarea>
      <br><br>

      <div style="text-align: center;">
        <div v-if="loading == false">
          <br>
          <button v-if="loading==false" class="btn btn-info" @click="sendFeedback()">Compartir feedback</button>
          <br><br>
          <p style="font-size:xx-small; color: gray;">Al compartir tu feedback, aceptas que el mismo pueda ser utilizado por King Vape de manera anónima con fines de mejora de nuestros servicios y atención</p>
        </div>
        <div v-else>
          <span class="spinner-glow spinner-glow-primary"></span>
        </div>
      </div>


    </div>
  </b-card>

  <b-card style="margin: 30px;" v-else>
    <div style="text-align: center;">
      <h1 style="font-size: xx-large;">FEEDBACK <strong>#{{ whatsappConversationID }}</strong></h1>
      <br>
      <p style="font-size: large;">¡Muchas gracias por tu opinión! Seguiremos trabajando en darte cada día un mejor servicio</p>
    </div>
  </b-card>

</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

export default {
  
  components: {},
  data() {
    return {
      loading: false,
      feedbackSent: false,

      whatsappConversationID: '',

      questionOne: null,
      questionTwo: null,
      questionThree: null,
      questionFour: null,
      questionFive: null,
      questionSix: '',

      feedbackScaleOptions: [
        {value: null, text: 'Por favor selecciona una opción (5 siendo la mejor calificación)'},
        {value: 5, text: '5'},
        {value: 4, text: '4'},
        {value: 3, text: '3'},
        {value: 2, text: '2'},
        {value: 1, text: '1'}
      ],

      feedbackKnowOptions: [
        {value: null, text: 'Por favor selecciona una opción'},
        {value: 'Local físico', text: 'Local físico'},
        {value: 'Amigo o familiar', text: 'Amigo o familiar'},
        {value: 'Redes sociales', text: 'Redes sociales'},
        {value: 'Buscador de Google', text: 'Buscador de Google'},
        {value: 'Google Maps', text: 'Google Maps'},
        {value: 'Influencer', text: 'Influencer'},
        {value: 'Otro', text: 'Otro'}
      ]

    };
  },
  computed: {
  },
  methods: {
    sendFeedback(){
      this.loading = true;
      if (this.questionOne != null && this.questionTwo != null && this.questionThree != null && this.questionFour != null && this.questionFive != null){
        axios.post(constants.routes.backendAPI+'/insertFeedback',
        {
          whatsappConversationID: this.whatsappConversationID,
          answerOne: this.questionOne,
          answerTwo: this.questionTwo,
          answerThree: this.questionThree,
          answerFour: this.questionFour,
          answerFive: this.questionFive,
          answerSix: this.questionSix
        })
        .then((response) =>{ 
          this.loading = false;
          if (response.data.success){
            this.feedbackSent = true;
          } else {
            if (response.data.result == 1){
              this.showNotification('danger', 'Error al enviar el feedback', 'Estimado cliente, ha ocurrido un error en nuestro servicio de envío de feedback. Por favor, intentelo nuevamente ¡Muchas gracias!');
            } else if (response.data.result == 2){
              this.showNotification('danger', 'Conversación no existente', 'Estimado cliente, la conversación que quiere calificar no está en nuestro sistema. Una disculpa por el inconveniente');
            } else if (response.data.result == 3){
              this.showNotification('danger', 'Error al enviar el feedback', 'Estimado cliente, ha ocurrido un error en nuestro servicio de envío de feedback. Por favor, intentelo nuevamente ¡Muchas gracias!');
            } else if (response.data.result == 4){
              this.showNotification('danger', 'Conversación ya calificada', 'Estimado cliente, ya esta conversación ha sido calificada anteriormente. Una disculpa por el inconveniente');
            } else {
              this.showNotification('danger', 'Error al enviar el feedback', 'Estimado cliente, ha ocurrido un error en nuestro servicio de envío de feedback. Por favor, intentelo nuevamente ¡Muchas gracias!');
            }
          }
        })
        .catch(() =>{
          this.loading = false;
          this.showNotification('danger', 'Error al enviar el feedback', 'Estimado cliente, ha ocurrido un error en nuestro servicio de envío de feedback. Por favor, intentelo nuevamente ¡Muchas gracias!');
        })
      } else {
        this.loading = false;
        this.showNotification('info', 'Información incompleta', 'Estimado cliente, por favor completa todas las preguntas antes de enviar el feedback ¡Muchas gracias!')
      }
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },
  },

  mounted(){
    this.whatsappConversationID = this.$route.query.whatsappConversationID;
  }
};
</script>
