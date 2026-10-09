<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCrud, useCrudStore } from '@drax/crud-vue'
import { UserForm, useIdentityCrudStore } from '@drax/identity-vue'
import type { IUser } from '@drax/identity-share'
import CompanyCrud from '../cruds/CompanyCrud'

const dialog = defineModel<boolean>({ required: true })
const emit = defineEmits<{ created: [user: IUser] }>()
const { t } = useI18n()
const entity = useIdentityCrudStore().userCrud
const store = useCrudStore(entity.name)
const { form, onCreate } = useCrud(entity)

onCreate()
form.value.password = ''

function cancel() {
  if (!store.loading) dialog.value = false
}

async function submit() {
  if (store.loading) return
  store.resetErrors()
  store.setLoading(true)
  try {
    // Do not paginate users here: creation does not require user:view.
    if (!entity.provider.create) throw new Error('companyUsers.createError')
        const user = await entity.provider.create({ ...form.value }) as IUser
    emit('created', user)
    dialog.value = false
  } catch (error: any) {
    if (error.inputErrors) store.setInputErrors(error.inputErrors)
    store.setError(error.message || 'companyUsers.createError')
  } finally {
    store.setLoading(false)
  }
}

onBeforeUnmount(() => {
  store.setDialog(false)
  store.setForm(entity.form)
  store.resetErrors()
})
</script>

<template>
  <v-dialog
    v-model="dialog"
    :z-index="CompanyCrud.instance.dialogZindex + 10"
    :persistent="store.loading"
    max-width="720"
    scrollable
  >
    <v-card :loading="store.loading">
      <v-toolbar>
        <v-toolbar-title>{{ t('companyUsers.create') }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" :aria-label="t('action.cancel')" :disabled="store.loading" @click="cancel" />
      </v-toolbar>
      <v-card-text>
        <UserForm v-model="form" :disabled="store.loading" @submit="submit" @cancel="cancel" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
