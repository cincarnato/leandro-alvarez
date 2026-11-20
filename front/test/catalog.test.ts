import {it} from 'node:test'
import assert from 'node:assert/strict'
import {displayName, filterBenefits} from '../src/modules/benefits/utils/catalog.ts'
import type {PublicBenefit} from '../src/modules/benefits/interfaces/PublicBenefit.ts'
const benefit = (id: string, overrides: Partial<PublicBenefit> = {}): PublicBenefit => ({
  _id: id, title: '15% en lámparas', description: 'Luz para leer', featured: false,
  company: {_id: 'company', name: 'Trazo'}, category: {_id: 'deco', name: 'Decoración'},
  startDate: '2026-01-01', endDate: '2027-01-01', conditions: 'No acumulable', ...overrides,
})
it('searches business, category and description without accents, combines category and preserves source order', () => {
  const items = [benefit('one'), benefit('two', {company: null, category: null})]
  assert.deepEqual(filterBenefits(items, 'TRAZO decoracion leer', 'deco', '').map(x => x._id), ['one'])
  assert.deepEqual(filterBenefits(items, 'inexistente', '', ''), [])
  assert.deepEqual(filterBenefits(items, '', 'other', ''), [])
  assert.equal(filterBenefits(items, 'lamparas', '', '').length, 2)
})
it('puts featured benefits first without mutating data; supports business and expiry sorting', () => {
  const items = [benefit('one', {company: {_id: 'z', name: 'Zeta'}}), benefit('two', {featured: true, endDate: '2026-12-01'})]
  for (const order of ['', 'featured', 'name', 'ending']) assert.deepEqual(filterBenefits(items, '', '', order).map(x => x._id), ['two', 'one'])
  assert.deepEqual(items.map(x => x._id), ['one', 'two'])
})
it('hides only the seed prefix in public presentation', () => {
  assert.equal(displayName('Demo · Casa Nativa'), 'Casa Nativa')
  assert.equal(displayName('Mi Demo · Comercio'), 'Mi Demo · Comercio')
  assert.equal(displayName(), '')
})
