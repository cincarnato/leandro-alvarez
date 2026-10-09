
<script setup lang="ts">
import CompanyCrud from '../../cruds/CompanyCrud'
import {Crud} from "@drax/crud-vue";
import BenefitMediaField from '../BenefitMediaField.vue'
import CompanyUsersField from '../CompanyUsersField.vue'


</script>

<template>
  <crud :entity="CompanyCrud.instance">
    <template #field.users="{ modelValue, setValue, form }">
      <CompanyUsersField :key="form._id ?? 'new'" :model-value="modelValue" :company-id="form._id" @update:model-value="setValue" />
    </template>
      <template #field.logo="{ form }"><BenefitMediaField v-model="form.logo" entity="Company" field="logo" dir="companies" /></template>
    <template v-slot:item.logo="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
    <template #item.users="{ value }">
      <div class="d-flex flex-wrap ga-1">
        <v-chip v-for="user in value" :key="user._id" size="small">{{ user.name || user.username }}</v-chip>
      </div>
    </template>
  </crud>
</template>

<style scoped>

</style>

