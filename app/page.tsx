import { AppProvider } from '@/lib/store'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
