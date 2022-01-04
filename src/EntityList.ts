export default interface EntityList<T> {
  items: T[] | undefined;
  count: number;
  cursor?: string | undefined;
}
