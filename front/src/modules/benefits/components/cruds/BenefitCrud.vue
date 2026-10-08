
<script setup lang="ts">
import BenefitCrud from '../../cruds/BenefitCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import BenefitMediaField from '../BenefitMediaField.vue'

</script>

<template>
  <crud :entity="BenefitCrud.instance">
      <template #field.image="{ form }"><BenefitMediaField v-model="form.image" entity="Benefit" field="image" dir="benefits" /></template>
    <template v-slot:item.company="{value}">{{value?.name}}</template>
    <template v-slot:item.category="{value}">{{value?.name}}</template>
    <template v-slot:item.image="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
    <template v-slot:item.startDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.endDate="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

