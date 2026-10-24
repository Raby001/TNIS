import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useMapPermissions = () => {
    const authStore = useAuthStore()

    const canCreate = computed(() =>
        authStore.hasRole('ADMIN', 'TESTER'),
    )

    const canEdit = computed(() =>
        authStore.hasRole('ADMIN', 'TESTER'),
    )

    const canDelete = computed(() =>
        authStore.hasRole('ADMIN', 'TESTER'),
    )

    const canManage = computed(() =>
        canCreate.value ||
        canEdit.value ||
        canDelete.value,
    )

    return {
        canCreate,
        canEdit,
        canDelete,
        canManage,
    }
}