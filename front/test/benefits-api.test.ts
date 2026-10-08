import {it} from 'node:test'
import assert from 'node:assert/strict'
import type {HttpRestClient as RestClient} from '@drax/common-front'
import {createServer} from 'vite'
import {fileURLToPath} from 'node:url'

it('bodyless benefit requests omit JSON content-type without changing shared Drax headers or protected auth', async context => {
  const vite = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: {middlewareMode: true, watch: null},
    optimizeDeps: {noDiscovery: true, include: []},
    ssr: {noExternal: ['@drax/common-front']},
  })
  context.after(() => vite.close())
  // Drax reads import.meta.env: load the actual modules through the existing Vite runtime.
  const {HttpRestClient, HttpRestClientFactory} = await vite.ssrLoadModule('@drax/common-front')
  const {benefitsApi} = await vite.ssrLoadModule('/src/modules/benefits/providers/BenefitsApi.ts')
  let client: RestClient
  const requests: Array<{url: string; init: RequestInit}> = []
  context.mock.method(HttpRestClientFactory, 'getInstance', () => client)
  context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    requests.push({url, init})
    return new Response('{}', {status: 200, headers: {'content-type': 'application/json'}})
  })

  for (const contentType of ['content-type', 'Content-Type', 'CONTENT-TYPE']) {
    const baseHeaders = {[contentType]: 'application/json', Authorization: 'Bearer test-operator', Accept: 'application/json'}
    client = new HttpRestClient('https://api.example.test', baseHeaders)
    await benefitsApi.claim('benefit-id')
    await benefitsApi.redeem('coupon-token')
    await benefitsApi.coupon('coupon-token')
    await benefitsApi.inspect('coupon-token')
    await benefitsApi.statistics()
    const current = requests.splice(0)
    assert.deepEqual(current.map(request => request.init.method), ['POST', 'POST', 'GET', 'GET', 'GET'])
    assert.equal(current[0].url, 'https://api.example.test/api/benefits/benefit-id/claim')
    for (const {init} of current) {
      const headers = new Headers(init.headers)
      assert.equal(headers.has('content-type'), false)
      assert.equal(headers.get('accept'), 'application/json')
      assert.equal(init.body, undefined)
      assert.equal(init.cache, 'no-store')
      assert.equal(init.referrerPolicy, 'no-referrer')
    }
    assert.equal(new Headers(current[0].init.headers).has('authorization'), false)
    assert.equal(new Headers(current[2].init.headers).has('authorization'), false)
    for (const index of [1, 3, 4]) {
      assert.equal(new Headers(current[index].init.headers).get('authorization'), 'Bearer test-operator')
    }
    assert.deepEqual(client.getBaseHeaders(), baseHeaders)
    assert.equal(client.getBaseHeaders()[contentType], 'application/json')
    assert.equal(client.getBaseHeaders().Authorization, 'Bearer test-operator')
  }
})
