import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isNewMatter: false,
  },
  mutations: {
    setIsNewMatter(state, isNewMatter) {
      state.isNewMatter = isNewMatter;
    },
  },
  actions: {

  }
})
