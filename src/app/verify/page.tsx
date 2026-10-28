import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token.trim() : '';
  if (token) {
    redirect(`/s/${encodeURIComponent(token)}`);
  }

  const id =
    typeof params.id === 'string'
      ? params.id.trim()
      : typeof params.certId === 'string'
      ? params.certId.trim()
      : '';

  if (id) {
    redirect(`/?id=${encodeURIComponent(id)}#verify`);
  }

  redirect('/#verify');
}
