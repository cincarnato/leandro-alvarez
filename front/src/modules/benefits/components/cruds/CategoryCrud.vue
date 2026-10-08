
<script setup lang="ts">
import CategoryCrud from '../../cruds/CategoryCrud'
import {Crud} from "@drax/crud-vue";


</script>

<template>
  <crud :entity="CategoryCrud.instance">

  </crud>
</template>

<style scoped>

</style>

