<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCrudStore } from '@drax/crud-vue'
import { useAuth } from '@drax/identity-vue'
import type { IUser } from '@drax/identity-share'
import CompanyUserCreateDialog from './CompanyUserCreateDialog.vue'
import CompanyProvider from '../providers/CompanyProvider'
import type { ICompany } from '../interfaces/ICompany'

const props = defineProps<{ modelValue?: string[]; companyId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const { t } = useI18n()
const store = useCrudStore('Company')
const readonly = computed(() => ['view', 'delete'].includes(store.operation ?? ''))
const { hasPermission } = useAuth()
const canCreate = computed(() => !readonly.value && (hasPermission('user:create') || hasPermission('user:manage')))
const createDialog = ref(false)
const options = ref<ICompany['users']>([])
const selectedOptions = ref<ICompany['users']>([])
const search = ref('')
const loading = ref(false)
const loadError = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let request = 0
let disposed = false

const items = computed(() => {
  const users = new Map([...selectedOptions.value, ...options.value].map(user => [user._id, user]))
  for (const id of props.modelValue ?? []) {
    if (!users.has(id)) users.set(id, { _id: id, name: '', username: id })
  }
  return [...users.values()]
})
const errors = computed(() => [
  ...store.getFieldInputErrors('users').map((error: string) => t(error)),
  ...(loadError.value ? [t('companyUsers.loadError')] : []),
])

function select(value: string[] | null) {
  const ids = value ?? []
  selectedOptions.value = items.value.filter(user => ids.includes(user._id))
  emit('update:modelValue', ids)
}

function onUserCreated(user: IUser) {
  const option = { _id: user._id, name: user.name, username: user.username }
  selectedOptions.value = [...items.value.filter(item => (props.modelValue ?? []).includes(item._id)), option]
  emit('update:modelValue', [...new Set([...(props.modelValue ?? []), option._id])])
  createDialog.value = false
}

async function loadOptions(query: string, version: number) {
  loading.value = true
  loadError.value = false
  try {
    const users = await CompanyProvider.instance.userOptions(query)
    if (!disposed && version === request) options.value = users
  } catch {
    if (!disposed && version === request) loadError.value = true
  } finally {
    if (!disposed && version === request) loading.value = false
  }
}

watch(search, query => {
  clearTimeout(timer)
  const version = ++request
  if (!readonly.value) timer = setTimeout(() => loadOptions(query, version), 300)
})

onMounted(async () => {
  if (props.companyId) {
    const company = store.items.find((item: ICompany) => item._id === props.companyId) as ICompany | undefined
    selectedOptions.value = company?.users ?? []
    // Deep-linked forms may not have a table row; hydrate from Company, never identity.
    if ((props.modelValue ?? []).some(id => !selectedOptions.value.some(user => user._id === id))) {
      try {
        const company = await CompanyProvider.instance.findById(props.companyId)
        if (!disposed) selectedOptions.value = company.users
      } catch {
        if (!disposed) loadError.value = true
      }
    }
  }
  if (!disposed && !readonly.value) await loadOptions(search.value, ++request)
})

onBeforeUnmount(() => {
  disposed = true
  ++request
  clearTimeout(timer)
})
</script>

<template>
  <v-row>
    <v-col cols="12" :sm="canCreate ? 9 : 12">
      <v-autocomplete
        :model-value="modelValue ?? []"
        v-model:search="search"
        :items="items"
        item-value="_id"
        :item-title="user => user.name || user.username"
        :label="t('company.field.users')"
        :loading="loading"
        :readonly="readonly"
        :error-messages="errors"
        multiple
        chips
        :closable-chips="!readonly"
        :clearable="!readonly"
        no-filter
        @update:model-value="select"
      >
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps" :subtitle="item.raw.username" />
        </template>
      </v-autocomplete>
    </v-col>
    <v-col v-if="canCreate" cols="12" sm="3" class="d-flex align-start">
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-account-plus" class="mt-sm-2" @click="createDialog = true">
        {{ t('companyUsers.create') }}
      </v-btn>
    </v-col>
  </v-row>
  <CompanyUserCreateDialog v-if="createDialog" v-model="createDialog" @created="onUserCreated" />
</template>
