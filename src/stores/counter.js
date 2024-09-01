import { writable } from 'svelte/store';
 
export let counter = writable(0);

export let setCounter = (n)=>{
  counter.update((v)=>v+n)
}