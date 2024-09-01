import { writable,derived,get } from "svelte/store";
import { processes } from "./global";
import { address } from "../components/arwallet.svelte";
import { AoChain,findTagItemValues } from "../lib/aochain";


function createUser(){
  let current_uid = null
  let { subscribe, update, set} = writable(null,()=>{
    const id = get(address)
    if(id){
      localStorage.getItem(`player-${id}`)
    }
  })
  function fetchPlayerInfo(id){
    new AoChain().dryrun({
      process: processes.slot || import.meta.env.VITE_SLOT_PROCESS,
      tags: {Action: "Get-PlayerInfo", Player:id }
    }).then(({Messages})=>{
      if(Messages?.length>=1){
        const data = JSON.parse(Messages[0].Data)
        console.log('data: ', data);
        
        if(data!==null){
          set(data)
          localStorage.setItem(`player-${id}`,Messages[0].Data)
        }
      }
    })
    current_uid = id
  }
  address.subscribe((uid)=>{
    if(uid&&uid!=current_uid){
      fetchPlayerInfo(uid)
    }
  })
  return ({
    subscribe,
    updateUserCredits(n){
      update( player =>({...player, balance: n}))
    },
    increaseUserBet(n){
      update( player =>({...player, total_bet: (player.total_bet||0)+n, count_spins: (player.count_spinso||0) + 1, balance:(player.balance||0) - n}))
    },
    increaseUserPayout(n){
      update( player =>({...player, total_payout: (player.total_payout||0)+n,count_win: (player.count_win||0) + 1}))
    },
    increaseUserDeposits(n){
      update( player =>({...player, deposits: (player.deposits||0)+n,balance: (player.balance||0) + n, count_deposited:(player.count_deposited||0) + 1}))
    },
    pullUserInfo(){
      const id = get(address)
      if(id){
        fetchPlayerInfo(id)
      }
    }
  })
}



export const userinfo = derived(address,($address,set,update)=>{
  if($address){
    new AoChain().dryrun({
      process: processes.slot || import.meta.env.VITE_SLOT_PROCESS,
      tags: {Action: "Get-PlayerInfo",Player:$address}
    }).then(({Messages})=>{
      console.log('Messages: ', Messages);
      if(Messages?.length>=1){
        const data = JSON.parse(Messages[0].Data)
        console.log('data: ', data);
        if(data!==null){
          sessionStorage.setItem(`player-${$address}`,Messages[0].Data)
          set(data)
        }else{
          console.log("设置为空")
          set(null)
        }
      }else{
        set(null)
      }
    })
  }else{
    set(null)
  }
},null)



function createBalance(){
  let current_id = null
  let { subscribe, update, set} = writable(null)
  address.subscribe((id)=>{
    if(!id){
      set(0) 
      return
    }
    if(id&&id!=current_id){
      fetchBalance(id)
    }
    current_id = id
  })
  function fetchBalance(id){
    if(id){
      new AoChain().dryrun({
        process: processes.token,
        tags: {Action:"Balance",Target:id}
      }).then(({Messages})=>{
        console.log('Balance: ', Messages);
        if(Messages&&Messages.length>0){
          const [Balance] = findTagItemValues(["Balance"],Messages[0].Tags)
          set(Balance)
        }
      })
    }
  }
  return{
    subscribe,
    increase: (v) => update((n)=>n+v),
    decrease: (v) => update((n)=>n-v),
    pull: (id) => fetchBalance(id)
  }
}

export let user = createUser()
export let balance = createBalance()


