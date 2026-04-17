import TopBar from './components/TopBar'
import Viewport from './components/Viewport'
import SidePanel from './components/SidePanel'

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Viewport />
        <SidePanel />
      </div>
    </div>
  )
}
