export type RouteType = {
  route: string,
  title?: string,
  template?: string,
  layout?: string,
  styles?: [string],
  load(): void
};