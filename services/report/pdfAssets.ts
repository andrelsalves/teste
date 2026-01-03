const imageCache = new Map<string, string>();

export async function loadImageAsBase64(url: string): Promise<string> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  const res = await fetch(url);
  const blob = await res.blob();

  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  imageCache.set(url, base64);
  return base64;
}
