import { redirect } from "next/navigation";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/developers/applications/${id}/information`);
}
