export const asset = (path: string) => {
  console.log(process.env.NEXT_PUBLIC_BASE_PATH, "here----");
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
}

