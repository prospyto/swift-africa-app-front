import { MainApp } from '@/components/main-app'
import { AppProvider } from '@/lib/store'

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  )
}
