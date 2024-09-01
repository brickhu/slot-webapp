<script>
    import {addMessages,_ } from 'svelte-i18n';
    import {connect} from "../components/arwallet.svelte"
    addMessages('en', {"about":"home"});
    addMessages('zh', {"about":"关于"});
</script>

<div>
    {$_('about')}
    <button on:click={()=>connect()}>connect</button>
</div>