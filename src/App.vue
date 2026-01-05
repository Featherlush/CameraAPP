<template>
  <div class="wrap">
    <router-view></router-view>
  </div>
</template>

<script>
import Tabbar from '@/components/TabBar.vue'

export default {
  name: 'App',
  components: {
    Tabbar,
  },
  data() {
    return {}
  },
  created() {
    // const token = localStorage.getItem('token');
    // if (!token || this.tokenExpired(token)) {
    //   this.$router.push('/login');
    // }
  },
  methods: {
    // tokenExpired(token) {
    //   const decodedToken = this.decodeToken(token)
    //   const expirationDate = new Date(decodedToken.exp * 1000) // 将过期时间转为毫秒
    //   return expirationDate < new Date() // 判断是否过期
    // },
    // decodeToken(token) {
    //   const base64Url = token.split('.')[1]
    //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    //   const jsonPayload = decodeURIComponent(
    //     atob(base64)
    //       .split('')
    //       .map(function (c) {
    //         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    //       })
    //       .join(''),
    //   )
    //   return JSON.parse(jsonPayload)
    // },
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;text-align: center;
  color: #2c3e50;
}
</style>
