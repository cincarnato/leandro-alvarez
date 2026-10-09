<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Crud, useCrud, useCrudStore } from '@drax/crud-vue'
import { UserForm, useAuth } from '@drax/identity-vue'
import UserPasswordDialog from '@drax/identity-vue/src/cruds/user-crud/UserPasswordDialog.vue'
import type { IUser } from '@drax/identity-share'

import CustomUserCrud from '../../cruds/CustomUserCrud'

const entity = CustomUserCrud.instance
const { form, onSubmit, onCancel } = useCrud(entity)
const store = useCrudStore('User')
const { t } = useI18n()

const { hasPermission } = useAuth()
const passwordUser = ref<IUser | null>(null)
const passwordDialog = ref(false)

function changePassword(user: IUser) { passwordUser.value = user; passwordDialog.value = true }
</script>
<template>
  <Crud :entity="entity">
    <template #form>

      <UserForm :key="store.operation" v-model="form" @submit="onSubmit" @cancel="onCancel" />
    </template>
    <template #item.role="{ value }"><v-chip>{{ value?.name }}</v-chip></template>
    <template #item.actions="{ item }"><v-btn v-if="hasPermission('user:changePassword')" variant="text" icon="mdi-lock-reset" :aria-label="t('benefitsMvp.changePassword')" @click="changePassword(item as IUser)" /></template>
  </Crud>
  <UserPasswordDialog v-if="passwordUser && passwordDialog" v-model="passwordDialog" :user="passwordUser" />
</template>
