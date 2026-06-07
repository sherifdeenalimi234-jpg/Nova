import { redirect } from 'next/navigation';

export default async function LegacyBuilderRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/creator/surveys/${id}/build`);
}
