const state = {
  backendURL: 'https://kingvapebackend2.onrender.com',
  websocketURL: 'wss:kingvapebackend2.onrender.com',
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
