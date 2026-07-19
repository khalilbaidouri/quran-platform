import RecitantForm from '@/components/recitants/RecitantForm'

export default function NouveauRecitantPage() {
  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Ajouter un récitant</h2>
      <RecitantForm mode="create" />
    </div>
  )
}