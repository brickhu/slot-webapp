import { writable,readable } from 'svelte/store';
import { AoChain,findTagItemValues } from '../lib/aochain';

export const hi = (n)=>{return "hello " + n}

export const processes = {
  slot: import.meta.env.VITE_SLOT_PROCESS,
  token: import.meta.env.VITE_TOKEN_PROCESS
}

export const token = readable(null,(set,update)=>{
  let token_info = JSON.parse(localStorage.getItem("TOKEN_INFO_"+processes.token))
  if(token_info){
    set(token_info)
  }else{
    new AoChain().dryrun({
      process: processes.token,
      tags: {Action:"Info"}
    }).then(({Messages})=>{
      console.log('Token Info: ', Messages);
      if(Messages&&Messages.length>0){
        const [Ticker,Denomination,Logo] = findTagItemValues(["Ticker","Denomination","Logo"],Messages[0].Tags)
        token_info = {
          process: processes.token,
          denomination: Denomination,
          ticker: Ticker,
          logo: Logo
        }
        set(token_info)
        localStorage.setItem("TOKEN_INFO_"+processes.token,JSON.stringify(token_info))
      }
      return
    })
  }
})