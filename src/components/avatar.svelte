<script>
  import mergeClasses from "@robit-dev/tailwindcss-class-combiner"
  import { generateFromString } from "generate-avatar"
  export let username = "777"
  let class_name = ""
  const data_uri = (v) => 'data:image/svg+xml;utf8,' + generateFromString(v||"777")
  $: svg = data_uri(username)
  export { class_name as class }
</script>

<img src={svg} alt={username} class={mergeClasses(`w-8 h-8 rounded-full box-border border border-base border-2 shadow-xs`, `${class_name}`)}/>
