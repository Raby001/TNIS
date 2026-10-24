import type { Component } from "vue";

export interface MenuItem {
    name: string
    to: string
    icon?: Component
    exact?: boolean
    description?: string
    showSearch?: boolean
    children?: MenuItem[]
    showInSidebar?: boolean
}

