import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

import LoginPage from '../pages/LoginPage.vue'
import { useSitesStore } from '../stores/sites'

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the total number of sites from the site store', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })

    const siteStore = useSitesStore()
    siteStore.pagination.total = 2874

    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })

    await nextTick()

    expect(wrapper.text()).toContain('2,874')
    expect(wrapper.text()).toContain('Sites mapped')
  })
})
