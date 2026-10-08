
<script setup lang="ts">
import CompanyCrud from '../../cruds/CompanyCrud'
import {Crud} from "@drax/crud-vue";
import BenefitMediaField from '../BenefitMediaField.vue'


</script>

<template>
  <crud :entity="CompanyCrud.instance">
      <template #field.logo="{ form }"><BenefitMediaField v-model="form.logo" entity="Company" field="logo" dir="companies" /></template>
    <template v-slot:item.logo="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
  </crud>
</template>

<style scoped>

</style>

