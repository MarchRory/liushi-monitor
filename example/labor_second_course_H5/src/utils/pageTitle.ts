const defaultTitle: string = "柚二课";

export default function getPageTitle(
  pageTitle: string | undefined | null
): string {
  if (pageTitle) {
    return `${pageTitle}`;
  } 
  return defaultTitle;
}
