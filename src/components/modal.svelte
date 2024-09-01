<script>
  import mergeClasses from "@robit-dev/tailwindcss-class-combiner"
  import clsx from "clsx/lite";

  let class_name
  export let modal
  export {class_name as class}
</script>

<dialog bind:this={modal} on:close on:cancel class={clsx(mergeClasses("bg-base-200 backdrop:bg-black/50 fixed top-1/2 left-1/2 fixed -translate-1/2 transition-all opacity-0 open:opacity-100 rounded-2xl p-8",class_name))}>
  <slot/>
</dialog> 
 
