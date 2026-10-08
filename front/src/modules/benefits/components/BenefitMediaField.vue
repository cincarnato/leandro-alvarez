<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@drax/identity-vue'
import { useCrudStore } from '@drax/crud-vue'
import { MediaField } from '@drax/media-vue'
import { useI18nValidation } from '@drax/common-vue'
const props = defineProps<{ entity: string; field: string; dir: string }>()
const model = defineModel<string>()
const { t } = useI18n()
const { $ta } = useI18nValidation()
const { hasPermission } = useAuth()
const store = useCrudStore(props.entity)
const readonly = computed(() => ['view', 'delete'].includes(store.operation) || !hasPermission('file:upload'))
const errors = computed(() => store.inputErrors?.[props.field] ? [$ta(store.inputErrors[props.field]) || ''] : [])
</script>
<template>
  <MediaField v-model="model" :name="field" :dir="dir" :label="t(`${entity.toLowerCase()}.field.${field}`)" :readonly="readonly" :clearable="!readonly" :error-messages="errors" accept="image/png,image/jpeg,image/webp,image/gif" preview />
  <p v-if="!hasPermission('file:upload') && !['view', 'delete'].includes(store.operation)" class="text-caption mt-2">{{ t('benefitsMvp.uploadPermission') }}</p>
</template>
