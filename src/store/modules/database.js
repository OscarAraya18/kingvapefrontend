const state = {
  backendURL: 'https://0f47-186-5-163-74.ngrok-free.app',
  websocketURL: 'wss:0f47-186-5-163-74.ngrok-free.app',
};

const getters = {
  getBackendURL: state => state.backendURL,
  getWebsocketURL: state => state.websocketURL
};

const actions = {
  changeBackendURL({commit}, backendURL) {
    commit('updateBackendURL', backendURL);
  },
  changeWebsocketURL({commit}, websocketURL) {
    commit('updateWebsocketURL', websocketURL);
  }
};

const mutations = {
  updateBackendURL(state, backendURL) {
    state.backendURL = backendURL;
  },

  updateWebsocketURL(state, websocketURL) {
    state.backendURL = websocketURL;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
