export const state = () => ({
    timeWork: [],
    timeDraft: []
})
export const mutations = {
    setTimeWork(state, timeWork) {
        state.timeWork = timeWork
    },
    setTimeDraft(state, timeWork) {
        state.timeDraft = timeWork
    }

}
export const actions = {
    //Lưu bản nháp lịch làm việc
    async saveTimeDraft({ commit }, { timeline }) {
        try {
            let result = await this.$request.post('/api/v2/save-timedraft', { timeline })
            let timeWork = result.data
            commit('setTimeDraft', timeWork)
            return result
        } catch (error) {
            let { message } = error.response.data;

        }
    },
    //Lấy bản nháp lịch làm việc
    async getTimeDraft({ commit }) {
        try {
            let result = await this.$request.post('/api/v2/get-timedraft')
            let timeWork = result.data
            commit('setTimeDraft', timeWork)

        } catch (error) {
            let { message } = error.response.data;

        }
    },
    //Đăng kí lịch chính thức
    async saveTimeWork({ commit }, { timeline }) {
        try {
            let result = await this.$request.post('/api/v2/save-timework', { timeline })
            console
            let timeWork = result.data
            commit('setTimeWork', timeWork)
            return result

        } catch (error) {
            return result

        }
    },
    //Lấy bản nháp lịch làm việc
    async getTimeWork({ commit }, data) {
        try {
            let result = await this.$request.post('/api/v2/get-timework', data)
            let timeWork = result.data
            commit('setTimeWork', timeWork)

        } catch (error) {
            let { message } = error.response.data;

        }
    },
}