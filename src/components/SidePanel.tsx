import ConcreteList from './ConcreteList'
import RebarGroupList from './RebarGroupList'

export default function SidePanel() {
  return (
    <aside className="w-72 shrink-0 bg-neutral-950 border-l border-neutral-800 flex flex-col overflow-y-auto">
      <ConcreteList />
      <div className="border-t border-neutral-800" />
      <RebarGroupList />
    </aside>
  )
}
