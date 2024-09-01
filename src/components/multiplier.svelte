<script>
  import clsx from "clsx/lite";
  import mergeClasses from "@robit-dev/tailwindcss-class-combiner";
  let custom_class
  export let item_class = null
  export let multiplers = [1,2,5,10,20,50,100]
  export let max = 100
  export let value = 1;
  export { custom_class as class }
</script>

<div class={mergeClasses(clsx(`flex gap-4`,custom_class))}>
  {#each multiplers as v}
    <button 
      on:click={()=>{value = v}}
      disabled = {v>max}
      class={mergeClasses(clsx(`p-1 text-xs border rounded-md disabled:border-current/40 disabled:text-current/60 ${value===v&&'bg-base-content text-base'}`,item_class))}
    >
      {v}x
    </button>
  {/each}
</div>