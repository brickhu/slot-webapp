<script context="module">
  import 'iconify-icon';
  import Modal from "./modal.svelte"
  let modal
  export {modal as recharger}
</script>

<script>
  import { balance,user } from "../stores/user"
  import { token,processes } from "../stores/global"
  import { connected, connect,sdk,address} from "./arwallet.svelte"
  import { onMount } from 'svelte';
  import {AoChain,findTagItemValues} from '../lib/aochain'
  let depositing = false
  let deposited = false
  let deposited_info = {}
  let price = 0.01
  let plans = [{
    label:"100",
    amount:100,
    discount:1
  },{
    label:"200",
    amount:200,
    discount:0.99
  },{
    label:"500",
    amount:500,
    discount:0.98
  },{
    label:"1000",
    amount:1000,
    discount:0.95
  }]
  let current_plan = plans[0]

  async function handleDeposit(){
    const qty = Math.floor(cost * Math.pow(10, $token?.denomination))
    if($balance >= qty ) {
      depositing = true
      console.log('qty: ', qty);
      new AoChain({wallet:$sdk}).message({
        process: $token?.process || processes.token,
        tags:{
          Action: "Transfer",
          Recipient: processes.slot,
          Quantity: String(qty),
          "X-Transfer-Type": "Recharge"
        }
      })
      .next((msg)=>{
        console.log('msg: ', msg);
        deposited_info.tx = msg
        return msg
      })
      .result()
      .then(({Messages})=>{
        console.log('Transfer: ', Messages);
        if(Messages?.length>=2){
          const [Action,Quantity,Sender] = findTagItemValues(["Action","Quantity","Sender"],Messages[1].Tags)
          if(Action=="Credit-Notice"){
            deposited = true
            deposited_info.quantity = Number(Quantity)
            deposited_info.sender = Sender
            user.pullUserInfo()
          }
        }
      })
      .finally(()=>{
        depositing = false
      })
    }
    
  }

  $: balance_value = $balance / Math.pow(10, $token?.denomination)
  $: cost = current_plan?.amount * price
</script>

<Modal 
  bind:modal 
  class="w-80 p-4" 
  on:close={()=>{
    depositing = false
    deposited = false
    deposited_info = {}
  }} 
  on:cancel={(e)=>{
    if(depositing){e.preventDefault()}
  }}
>
  <div class="flex w-full justify-between pb-2">
    <h2>recharge credits</h2>
    <button on:click={(e)=>{
      e.preventDefault();
      modal.close()
    }} disabled={depositing}>
      <iconify-icon icon="pixelarticons:close"></iconify-icon>
    </button>
  </div>
  <div>
    {#if deposited}
      <div>
        <h2>Sucessfuly Deposited</h2>
        <h2>{deposited_info.quantity}</h2>
        <a href={`https://www.ao.link/#/message/${deposited_info.tx}`}>ao.link</a>
        <button on:click={()=>{
          depositing = false
          deposited = false
          deposited_info = {}
        }}>rechange</button>
      </div>
     
    {:else}
      <div class="">
        {#each plans as plan,i}
        <div>
          <label>
            <input type="radio" bind:group={current_plan} value={plan} />
            {plan.label} credits
            </label>   
        </div>
        {/each}
      </div>
      {#if $connected}
      <div class="flex justify-between items-center border-t border-t-current py-2">
        <p>{balance_value} cost:{cost} wAR</p>

        <button class="bg-primary text-primary-content" on:click={handleDeposit} disabled={depositing}>{depositing?"recharging":"recharge"}</button>
      </div>
      {:else}
        <div>connect first ! <button on:click={()=>{
          modal.close()
          connect()
        }}>connect</button></div>
      {/if}
    {/if}
   
    
  </div>
</Modal>

