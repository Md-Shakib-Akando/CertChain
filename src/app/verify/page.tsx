import { redirect } from 'next/navigation';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : '';
  if (id) {
    redirect(`/?id=${encodeURIComponent(id)}#verify`);
  }
  redirect('/#verify');
}
