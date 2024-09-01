<script>
  import mergeClasses from "@robit-dev/tailwindcss-class-combiner"

  export let symbols = ["a","c","b"]
  let class_name
  export {class_name as class}
</script>

<div class={mergeClasses(`flex gap-20`,class_name)}>
  <div class="flex gap-10 p-8">
    {#each symbols as symbol }
      <div class=" text-8xl">{symbol}</div>
    {/each}
  </div>
</div>
