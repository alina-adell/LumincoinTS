export class MenuLinkUtils {
  public static activeLink(details: NodeListOf<HTMLElement>, links: NodeListOf<HTMLElement>, url: string): void {

    links.forEach((link: HTMLElement) => {
      const href: string | null = link.getAttribute('href');

      if (href === url) {
        link.classList.add('active-link');

        // Открываем только тот details, который содержит активную ссылку используя метод closest
        const parentDetails: HTMLDetailsElement | null = link.closest('details');
        if (parentDetails) {
          parentDetails.setAttribute('open', 'open');
        }
      } else {
        link.classList.remove('active-link');
      }
    });
  }
}