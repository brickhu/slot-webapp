<script>
  import { AoChain } from './lib/aochain'
  import { init, getLocaleFromNavigator, addMessages,_ } from 'svelte-i18n';
  import Router from 'svelte-spa-router'
  import Home from './pages/home.svelte';
  import About from "./pages/about.svelte";
  import Notfound from "./pages/404.svelte";
  import Header from './components/header.svelte';
  import Me from './pages/me.svelte';
  import Depositor from './components/recharger.svelte';
  import ArwalletConnector from "./components/arwallet.svelte"

  // i18n init
  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  });



  new AoChain()
    .dryrun({
      process: "S52vf-N_OJSEy7eeL-KoYgM01HGXb7WQNUcR07mMfwg",
      tags: {
        Action: "Info"
      }
    }).then(({Messages})=>{
      // console.log("ddddddd")
      if(Messages?.[0]?.Data){
        return JSON.parse(Messages?.[0]?.Data)
      }else{
        return null
      }
    })

   
</script>

<Header/>
<main>
  <Router routes = {{
    '/': Home,
    '/about': About,
    '/me': Me,
    '*': Notfound,
  }}/>
</main>
<footer>
</footer>
<ArwalletConnector config={{
  permissions:["ACCESS_ADDRESS","SIGN_TRANSACTION"],
  ensurePermissions: true,
  appInfo: {name: "aoslot"}
}}/>
<Depositor/>