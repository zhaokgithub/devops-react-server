import axios from 'axios';

axios.interceptors.response.use(function (response) {
    return response
}, function (error) {
    return Promise.reject(error)
})

const requestList = []
const CancelToken = axios.CancelToken
let sources = {}
//避免重复请求
axios.interceptors.request.use((config) => {
  const request = JSON.stringify(config.url) + JSON.stringify(config.data)
  config.cancelToken = new CancelToken((cancel) => {
    sources[request] = cancel
  })
  if(requestList.includes(request)){
    sources[request]('取消重复请求')
  }else{
    requestList.push(request)
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

const request = function (path, method = "get", data = {}) {
    axios.defaults.baseURL = Window.CONFIG ? Window.CONFIG.URL : window.location.origin; 
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    return new Promise((resolve, reject) => {
        axios[method](path)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log(err)
                resolve({
                    status:err.response.status
                })
            })
    })
}

export default request