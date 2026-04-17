import { useModelStore } from '../store/modelStore'
import ConcreteList from './ConcreteList'
import ConcreteEditor from './ConcreteEditor'
import RebarGroupList from './RebarGroupList'

export default function SidePanel() {
  const { model, selectedId } = useModelStore()
  const isConcreteSelected = model.concrete.some((el) => el.id === selectedId)

  return (
    <aside className="w-72 shrink-0 bg-neutral-950 border-l border-neutral-800 flex flex-col overflow-y-auto">
      <ConcreteList />
      {isConcreteSelected && <ConcreteEditor />}
      <div className="border-t border-neutral-800" />
      <RebarGroupList />
    </aside>
  )
}
