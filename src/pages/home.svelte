<svelte:window on:keydown={handleKeydown}/>
<script>
  import { address,sdk,connect } from "../components/arwallet.svelte"
  import { user } from "../stores/user"
  import { processes } from "../stores/global";
  import Reel from "../components/reel.svelte";
  import { AoChain, findTagItemValues } from "../lib/aochain";
  import { onMount } from "svelte";
  import {recharger} from '../components/recharger.svelte'
  import Multiplier from "../components/multiplier.svelte";

 
  let symbols = ["c","f","c"]
  let win = 0
  let spinning = false
  let multiple = 1
  let max_multiple = 50

  function handleKeydown(e){
    let {
      keyCode,
      ctrlKey,
    } = e
    if(ctrlKey && keyCode == 13){
      if(!spinning&&enable_spin){
        HandleSpin()
        e.preventDefault()
      }
    }

  }

  function HandleSpin(){
    if(enable_spin){
      spinning = true
      user.increaseUserBet(1*multiple)
      win = 0
      new AoChain({wallet:$sdk}).message({
        process:processes.slot,
        tags: {
          Action: "Spin",
          Multiples: String(1*multiple)
        }
      })
      .result()
      .then(({Messages})=>{
        if(Messages&&Messages.length>0){
          symbols = JSON.parse(Messages[0].Data)
          const [Bet,Credits,Win] = findTagItemValues(["Bet","Current-Balance","Payout"],Messages[0].Tags)
          console.log('Credits: ', Credits);
          user.updateUserCredits(Number(Credits))
          if(Number(Win)){
            user.increaseUserPayout(Number(Win))
          }
          win = Number(Win)
        }
        spinning = false
      })
      .catch(e=>{
        spinning = false
      })
    }
  }

  $: enable_spin = $address&&credits>=1
  $: bet = $user?.total_bet || 0
  $: credits = $user?.balance || 0
  $: payout = $user?.total_payout || 0
</script>

<div class="w-full h-full flex flex-col justify-center items-center bg-base-200 container fixed top-0 left-0">
  <div class=" p-8 flex gap-8 items-center">
    <div class="flex flex-col items-stretch">
      <p>bet: {bet}</p>
      <p class=" border-t">payout: {payout}</p>
    </div>
    <div class="flex flex-col items-center ">
      <i>creditds</i>
      <p class="text-2xl">{credits}</p>
    </div>
    <div class="flex flex-col items-center ">
      <i>win</i>
      <p class={`text-2xl ${win>0&&'text-secondary'}`}>+{win}</p>
    </div>

    
  </div>
  <Reel class={`border-y ${win>0&&'bg-secondary'}`} symbols={symbols}/>
  {#if $address}
  
  <div class="flex justify-between flex-col items-center w-64 m-12">
    <Multiplier bind:value={multiple} multiplers={[1,2,5,10,20,50,100]} max={max_multiple} class="pb-10"/>
    <div>
      {#if credits>=1}
        <div class="flex flex-col">
          <button class="bg-base-content px-4 py-2 text-base cursor-pointer" disabled={!enable_spin||spinning} on:click={HandleSpin}>
            {spinning?"Spining":`Spin * ${multiple}`}
          </button>
          <i>ctrl+enter</i>
        </div>
        
      {:else}
        <button class="bg-base-content px-4 py-2 text-base cursor-pointer" on:click={()=>recharger.showModal()}>
          deposit
        </button>
      {/if}
      
    </div>
  </div>
  {:else}
  <div class="flex justify-between items-center w-64 m-12">
    <button class="bg-base-content px-4 py-2 text-base cursor-pointer" on:click={()=>connect()}>
      connect wallet
    </button>
  </div>
  {/if}
  
</div>
